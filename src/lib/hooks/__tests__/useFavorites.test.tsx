import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import type { FavoriteCharacter } from '@/types/database'
import type { Character } from '@/types/character'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockShowToast = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/hooks', () => ({
  useSupabase: () => ({ from: mockFrom }),
}))

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}))

vi.mock('uuid', () => ({ v4: () => 'mock-uuid-1234' }))

// Mocked user
const MOCK_USER = { id: 'user-abc', email: 'test@example.com' }

vi.mock('../useCurrentUser', () => ({
  useCurrentUser: () => ({ data: MOCK_USER }),
}))

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockFavorite: FavoriteCharacter = {
  id: 'fav-1',
  user_id: 'user-abc',
  character_id: 1,
  character_name: 'Rick Sanchez',
  character_image: 'https://example.com/rick.jpg',
  character_status: 'Alive',
  character_species: 'Human',
  created_at: '2024-01-01T00:00:00.000Z',
}

const mockCharacter: Character = {
  id: '1',
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth' },
  location: { name: 'Earth' },
  image: 'https://example.com/rick.jpg',
  episode: [],
  created: '',
}

// ─── Wrapper ─────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

const { useFavorites } = await import('../useFavorites')

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty favorites list initially while loading', () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => new Promise(() => undefined), // never resolves
        }),
      }),
    })
    const { result } = renderHook(() => useFavorites(), { wrapper: makeWrapper() })
    expect(result.current.favoritesList).toEqual([])
    expect(result.current.loading).toBe(true)
  })

  it('populates favoritesList after query resolves', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [mockFavorite], error: null }),
        }),
      }),
    })
    const { result } = renderHook(() => useFavorites(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.favoritesList).toHaveLength(1)
    expect(result.current.favoritesList[0]?.character_name).toBe('Rick Sanchez')
  })

  it('isFavorite returns true for a favorited character', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [mockFavorite], error: null }),
        }),
      }),
    })
    const { result } = renderHook(() => useFavorites(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isFavorite(1)).toBe(true)
    expect(result.current.isFavorite(99)).toBe(false)
  })

  it('sets error message when query fails', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    })
    const { result } = renderHook(() => useFavorites(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.error).toBe('DB error'))
  })

  it('toggleFavorite adds a character (optimistic update)', async () => {
    // Initial fetch returns empty list
    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue({
      select: () => ({ eq: () => ({ order: orderMock }) }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })
    const { result } = renderHook(() => useFavorites(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))

    mockFrom.mockReturnValue({
      select: () => ({ eq: () => ({ order: orderMock }) }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    await act(async () => {
      await result.current.toggleFavorite(mockCharacter)
    })

    expect(mockShowToast).toHaveBeenCalledWith(
      'Rick Sanchez added to favorites!',
      'success',
    )
  })
})
