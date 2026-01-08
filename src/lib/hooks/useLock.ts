'use client'

import { useState, useCallback, useRef } from 'react'

/**
 * Hook that provides a simple lock mechanism to prevent concurrent operations
 */
export function useLock() {
  const [isLocked, setIsLocked] = useState(false)
  const lockRef = useRef(false)

  const withLock = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    if (lockRef.current) {
      return undefined
    }

    lockRef.current = true
    setIsLocked(true)

    try {
      return await fn()
    } finally {
      lockRef.current = false
      setIsLocked(false)
    }
  }, [])

  return { isLocked, withLock }
}
