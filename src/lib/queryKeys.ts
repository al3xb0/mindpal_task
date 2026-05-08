/**
 * Centralised query key factory.
 * Using a factory means:
 * - Key shapes are defined in one place — easy to invalidate / prefetch.
 * - TypeScript infers narrow `as const` tuple types throughout.
 */
import type { FilterValues } from '@/components'

export const queryKeys = {
  auth: {
    all: () => ['auth'] as const,
    user: () => ['auth', 'user'] as const,
  },
  favorites: {
    all: () => ['favorites'] as const,
    byUser: (userId: string | undefined) => ['favorites', userId] as const,
  },
  characters: {
    all: () => ['characters'] as const,
    infinite: (filters: FilterValues) => ['characters', 'infinite', filters] as const,
    paginated: (page: number, filters: FilterValues) =>
      ['characters', 'paginated', page, filters] as const,
  },
} as const
