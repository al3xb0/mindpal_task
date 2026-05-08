import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockPush = vi.fn()
let mockSearchParamsString = ''

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(mockSearchParamsString),
  useTransition: () => [false, (fn: () => void) => fn()],
}))

// Import after mock setup so the mock is applied
const { useUrlPagination } = await import('../useUrlPagination')

describe('useUrlPagination', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockSearchParamsString = ''
  })

  it('returns page 1 when no URL param', () => {
    const { result } = renderHook(() => useUrlPagination())
    expect(result.current.currentPage).toBe(1)
  })

  it('reads page number from URL search params', () => {
    mockSearchParamsString = 'page=5'
    const { result } = renderHook(() => useUrlPagination())
    expect(result.current.currentPage).toBe(5)
  })

  it('calls router.push with page param when changing page', () => {
    const { result } = renderHook(() => useUrlPagination())
    act(() => { result.current.handlePageChange(3) })
    expect(mockPush).toHaveBeenCalledWith('/dashboard?page=3')
  })

  it('removes page param when navigating to initial page', () => {
    mockSearchParamsString = 'page=4'
    const { result } = renderHook(() => useUrlPagination())
    act(() => { result.current.handlePageChange(1) })
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('preserves other URL params when changing page', () => {
    mockSearchParamsString = 'name=rick&status=Alive'
    const { result } = renderHook(() => useUrlPagination())
    act(() => { result.current.handlePageChange(2) })
    const calledUrl = mockPush.mock.calls[0]?.[0] as string
    expect(calledUrl).toContain('page=2')
    expect(calledUrl).toContain('name=rick')
    expect(calledUrl).toContain('status=Alive')
  })

  it('uses custom initial page', () => {
    const { result } = renderHook(() => useUrlPagination(3))
    expect(result.current.currentPage).toBe(3)
  })
})
