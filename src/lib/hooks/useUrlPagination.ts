'use client'

import { useCallback, useTransition } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

/**
 * Hook that syncs pagination state with URL query parameters
 * Enables deep linking and state sharing through URLs
 */
export function useUrlPagination(initialPage: number = 1) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentPage = parseInt(searchParams.get('page') || String(initialPage), 10)

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams)
      
      // Only set page if it's not the initial page (cleaner URLs)
      if (page === initialPage) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }

      const newUrl = params.toString()
      startTransition(() => {
        router.push(`${pathname}${newUrl ? `?${newUrl}` : ''}`)
      })
      
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [router, pathname, searchParams, initialPage]
  )

  return { currentPage, handlePageChange, isPending }
}
