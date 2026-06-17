const MAX_CONCURRENT = 6
const BASE_COOLDOWN_MS = 1500
const MAX_COOLDOWN_MS = 8000
// Safety net: if a preload fires neither load nor error it would pin a slot
// forever and eventually starve the queue. Auto-release it.
const MAX_HOLD_MS = 15000

interface Task {
  src: string
  eager: boolean
  cancelled: boolean
  resolve: () => void
  /** Aborts the in-flight off-DOM load (set while running, cleared when done). */
  abort: (() => void) | null
}

let active = 0
const queue: Task[] = []
let pausedUntil = 0
let cooldownMs = BASE_COOLDOWN_MS
// Live concurrency ceiling: drops to 1 after a 429 and ramps back to MAX_CONCURRENT
// as loads succeed, so we tiptoe out of the ban instead of re-tripping it.
let limit = MAX_CONCURRENT
let resumeTimer: ReturnType<typeof setTimeout> | null = null

function scheduleResume(): void {
  if (resumeTimer) return
  resumeTimer = setTimeout(() => {
    resumeTimer = null
    pump()
  }, Math.max(0, pausedUntil - Date.now()))
}

function pump(): void {
  if (Date.now() < pausedUntil) {
    scheduleResume()
    return
  }
  while (active < limit && queue.length > 0) {
    const next = queue.shift()
    if (next) start(next)
  }
}

// Open the breaker: pause every fetch for the current cooldown. A whole wave of
// simultaneous 429s shares one pause window (and grows the cooldown only once).
function trip(): void {
  const now = Date.now()
  limit = 1 // choke to single-file until a load proves the ban has cleared
  if (now < pausedUntil) return
  pausedUntil = now + cooldownMs
  cooldownMs = Math.min(MAX_COOLDOWN_MS, cooldownMs * 2)
}

function enqueue(task: Task): void {
  // Eager (LCP) images jump the queue so they paint first.
  if (task.eager) queue.unshift(task)
  else queue.push(task)
  pump()
}

function start(task: Task): void {
  active += 1
  const img = new Image()
  let watchdog: ReturnType<typeof setTimeout> | null = null
  let settled = false

  const finish = (ok: boolean) => {
    if (settled) return
    settled = true
    img.onload = null
    img.onerror = null
    img.src = '' // detach/abort the off-DOM download so the slot is truly free
    task.abort = null
    if (watchdog) {
      clearTimeout(watchdog)
      watchdog = null
    }
    active = Math.max(0, active - 1)
    if (ok) {
      cooldownMs = BASE_COOLDOWN_MS // ban cleared, reset the backoff
      limit = Math.min(MAX_CONCURRENT, limit + 1) // ramp concurrency back up
      task.resolve()
    } else if (!task.cancelled) {
      trip()
      if (task.eager) queue.unshift(task)
      else queue.push(task)
    }
    pump()
  }

  task.abort = () => finish(false)
  watchdog = setTimeout(() => finish(false), MAX_HOLD_MS)
  img.onload = () => finish(true)
  img.onerror = () => finish(false)
  img.src = task.src
}

export interface ImageLoadHandle {
  /** Resolves once the image bytes are cached (the <img> can paint instantly). */
  promise: Promise<void>
  /** Cancels the load if still pending/in-flight. Idempotent. */
  cancel: () => void
}

export function loadImage(src: string, eager = false): ImageLoadHandle {
  let resolve!: () => void
  const promise = new Promise<void>((res) => {
    resolve = res
  })

  const task: Task = { src, eager, cancelled: false, resolve, abort: null }
  enqueue(task)

  return {
    promise,
    cancel: () => {
      if (task.cancelled) return
      task.cancelled = true
      const idx = queue.indexOf(task)
      if (idx !== -1) queue.splice(idx, 1) // still queued: just drop it
      else task.abort?.() // in-flight: abort the download and free the slot
    },
  }
}
