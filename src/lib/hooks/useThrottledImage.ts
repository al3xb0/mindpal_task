'use client'

import { useEffect, useRef, useState } from 'react'
import { acquireImageSlot, type ImageSlot } from '@/lib/imageLoadQueue'

const FALLBACK_IMAGE = '/placeholder.svg'
const MAX_RETRIES = 2

interface ThrottledImage<T extends HTMLElement> {
  /** Attach to the element whose viewport proximity triggers the load. */
  ref: React.RefObject<T | null>
  /** Source to render; null until the image is near the viewport and a slot is free. */
  src: string | null
  onLoad: () => void
  onError: () => void
}

/**
 * Lazily loads an image only when it nears the viewport, gated behind a global
 * rate limiter so request bursts stay under the CDN rate limit. Eager images
 * load immediately (bypassing the queue) for LCP. Failed loads retry with
 * backoff, then fall back to a placeholder.
 */
export function useThrottledImage<T extends HTMLElement = HTMLDivElement>(
  realSrc: string,
  eager = false,
): ThrottledImage<T> {
  const [src, setSrc] = useState<string | null>(eager ? realSrc : null)
  const ref = useRef<T | null>(null)
  const slotRef = useRef<ImageSlot | null>(null)
  const stateRef = useRef({ retries: 0, cancelled: false, started: false })

  useEffect(() => {
    const st = stateRef.current
    st.cancelled = false

    if (eager) {
      return () => {
        st.cancelled = true
        slotRef.current?.release()
      }
    }

    const start = () => {
      if (st.started) return
      st.started = true
      const slot = acquireImageSlot()
      slotRef.current = slot
      void slot.promise.then(() => {
        if (!st.cancelled) setSrc(realSrc)
      })
    }

    // jsdom / older environments: skip viewport gating, load straight away.
    if (typeof IntersectionObserver === 'undefined') {
      start()
      return () => {
        st.cancelled = true
        slotRef.current?.release()
      }
    }

    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect()
          start()
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(el)

    return () => {
      st.cancelled = true
      st.started = false
      observer.disconnect()
      slotRef.current?.release()
    }
  }, [realSrc, eager])

  const onLoad = () => {
    slotRef.current?.release()
  }

  const onError = () => {
    const st = stateRef.current
    slotRef.current?.release()

    if (st.retries >= MAX_RETRIES) {
      setSrc(FALLBACK_IMAGE)
      return
    }
    st.retries += 1
    // Unmount the <img> so the next mount re-fetches (using the browser cache if
    // a good copy landed); the retry itself goes back through the rate limiter.
    setSrc(null)
    window.setTimeout(() => {
      if (st.cancelled) return
      const slot = acquireImageSlot()
      slotRef.current = slot
      void slot.promise.then(() => {
        if (st.cancelled) {
          slot.release()
          return
        }
        setSrc(realSrc)
      })
    }, 600 * st.retries)
  }

  return { ref, src, onLoad, onError }
}
