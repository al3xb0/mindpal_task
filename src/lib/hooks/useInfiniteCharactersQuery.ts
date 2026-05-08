'use client'

import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { useSupabase } from '@/lib/supabase/hooks'
import { filterSchema } from '@/lib/schemas'
import { logger } from '@/lib/logger'
import type { FilterValues } from '@/components'
import type { Character, CharactersInfo } from '@/types/character'

interface CharactersPage {
  characters: {
    results: Character[]
    info: CharactersInfo
  }
}

export function useInfiniteCharactersQuery(filters: FilterValues) {
  const supabase = useSupabase()

  return useInfiniteQuery<CharactersPage, Error, InfiniteData<CharactersPage>, readonly unknown[], number>({
    queryKey: ['characters', 'infinite', filters] as const,
    queryFn: async ({ pageParam }) => {
      const parsed = filterSchema.safeParse(filters)
      if (!parsed.success) throw new Error('Invalid filter parameters')

      const { name, status, species } = parsed.data
      const filter: Record<string, string> = {}
      if (name) filter['name'] = name
      if (status) filter['status'] = status
      if (species) filter['species'] = species

      const { data, error } = await supabase.functions.invoke('get-characters', {
        body: {
          page: pageParam,
          filter: Object.keys(filter).length > 0 ? filter : null,
        },
      })

      if (error) {
        logger.error('Failed to fetch characters', {
          page: pageParam,
          filters,
          error: error.message,
        })
        throw new Error(error.message)
      }

      return data as CharactersPage
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.characters.info.next ?? undefined,
    staleTime: 5 * 60 * 1000,
  })
}
