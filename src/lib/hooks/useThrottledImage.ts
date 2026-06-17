'use client'

import { useEffect, useRef, useState } from 'react'
import { loadImage, type ImageLoadHandle } from '@/lib/imageLoadQueue'

interface ThrottledImage<T extends HTMLElement> {
  /** Attach to the element whose viewport proximity triggers the load. */
  ref: React.RefObject<T | null>
  /** Source to render; null until the bytes are cached, then set once. */
  src: string | null
  onLoad: () => void
  onError: () => void
}

/**
 * Lazily loads an image while it is near the viewport, gated behind a global
 * concurrency limiter so a page's avatars load together (in waves) without
 * tripping the CDN burst limit. The real bytes are prefetched off-DOM; the
 * visible <img> is only handed an already-cached URL, so it paints instantly and
 * never flickers, and 429 retries happen invisibly in the limiter. A card
 * scrolled away before it loads releases its slot to the cards still on screen.
 */
export function useThrottledImage<T extends HTMLElement = HTMLDivElement>(
  realSrc: string,
  eager = false,
): ThrottledImage<T> {
  const [src, setSrc] = useState<string | null>(null)
  const ref = useRef<T | null>(null)
  const handleRef = useRef<ImageLoadHandle | null>(null)
  const st = useRef({ cancelled: false, loaded: false })
  const beginRef = useRef<() => void>(() => {})

  useEffect(() => {
    const s = st.current
    s.cancelled = false

    const begin = () => {
      if (s.cancelled || s.loaded || handleRef.current) return
      const handle = loadImage(realSrc, eager)
      handleRef.current = handle
      void handle.promise.then(() => {
        handleRef.current = null
        if (s.cancelled) return
        s.loaded = true
        setSrc(realSrc) // already cached → instant paint, no flicker
      })
    }
    beginRef.current = begin

    // Drop a card that is still loading (nothing painted yet) so a fast scroll
    // stops spending the budget on avatars it flew past.
    const stop = () => {
      if (s.loaded) return
      handleRef.current?.cancel()
      handleRef.current = null
    }

    if (eager || typeof IntersectionObserver === 'undefined') {
      begin()
      return () => {
        s.cancelled = true
        handleRef.current?.cancel()
        handleRef.current = null
      }
    }

    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false
        if (s.loaded) return
        if (visible) begin()
        else stop()
      },
      { rootMargin: '400px' },
    )
    observer.observe(el)

    return () => {
      s.cancelled = true
      observer.disconnect()
      handleRef.current?.cancel()
      handleRef.current = null
    }
  }, [realSrc, eager])

  const onLoad = () => {}

  // The src is set from cache, so this fires only if that cache entry was evicted
  // before the <img> painted. Re-run the preload to self-heal (rare).
  const onError = () => {
    const s = st.current
    if (s.cancelled) return
    s.loaded = false
    setSrc(null)
    beginRef.current()
  }

  return { ref, src, onLoad, onError }
}
