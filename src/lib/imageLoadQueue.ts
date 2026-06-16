// The Rick and Morty CDN rate-limits by REQUEST RATE per IP, not by the number
// of concurrent connections: a burst trips 429 (a fast scroll easily fires
// 30+/s), while a steady ~5 req/s loads every avatar fine. So we pace image
// loads with a token bucket (5 tokens/s, small burst) and keep a concurrency
// cap purely as a safety net.
const MAX_CONCURRENT = 6
const REFILL_PER_SEC = 5
const BURST = 10
const REFILL_MS = 1000 / REFILL_PER_SEC

let active = 0
let tokens = BURST
let lastRefill = Date.now()
let timer: ReturnType<typeof setTimeout> | null = null

interface Waiter {
  grant: () => void
}
const waiters: Waiter[] = []

function refill(): void {
  const elapsed = Date.now() - lastRefill
  if (elapsed >= REFILL_MS) {
    const add = Math.floor(elapsed / REFILL_MS)
    tokens = Math.min(BURST, tokens + add)
    lastRefill += add * REFILL_MS
  }
}

function pump(): void {
  refill()
  while (waiters.length > 0 && active < MAX_CONCURRENT && tokens > 0) {
    tokens -= 1
    active += 1
    waiters.shift()?.grant()
  }
  if (timer === null && waiters.length > 0) {
    timer = setTimeout(() => {
      timer = null
      pump()
    }, REFILL_MS)
  }
}

export interface ImageSlot {
  /** Resolves once a rate-limit token and a concurrency slot are granted. */
  promise: Promise<void>
  /** Releases the slot (or cancels the request if still queued). Idempotent. */
  release: () => void
}

export function acquireImageSlot(): ImageSlot {
  let granted = false
  let released = false

  let grant!: () => void
  const promise = new Promise<void>((resolve) => {
    grant = () => {
      granted = true
      resolve()
    }
  })

  const waiter: Waiter = { grant }
  waiters.push(waiter)
  pump()

  const release = (): void => {
    if (released) return
    released = true
    if (granted) {
      active = Math.max(0, active - 1)
      pump()
    } else {
      const idx = waiters.indexOf(waiter)
      if (idx !== -1) waiters.splice(idx, 1)
    }
  }

  return { promise, release }
}
