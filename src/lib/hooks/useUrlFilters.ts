'use client'

import { useCallback, useTransition } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { FilterValues } from '@/components'

/**
 * Syncs character filter state with URL search params.
 * Empty values are removed from the URL (clean URLs).
 * Changing filters also resets the page param.
 */
export function useUrlFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const filters: FilterValues = {
    name: searchParams.get('name') ?? '',
    status: searchParams.get('status') ?? '',
    species: searchParams.get('species') ?? '',
  }

  const setFilters = useCallback(
    (newFilters: FilterValues) => {
      const params = new URLSearchParams(searchParams.toString())
      const keys = ['name', 'status', 'species'] as const
      for (const key of keys) {
        const val = newFilters[key]
        if (val) {
          params.set(key, val)
        } else {
          params.delete(key)
        }
      }
      // Reset pagination when filters change
      params.delete('page')
      const qs = params.toString()
      startTransition(() => {
        router.push(`${pathname}${qs ? `?${qs}` : ''}`)
      })
    },
    [router, pathname, searchParams],
  )

  return { filters, setFilters }
}
