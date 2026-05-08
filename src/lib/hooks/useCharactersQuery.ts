'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useSupabase } from '@/lib/supabase/hooks'
import { filterSchema } from '@/lib/schemas'
import { logger } from '@/lib/logger'
import type { FilterValues } from '@/components'
import type { Character, CharactersInfo } from '@/types/character'

interface CharactersQueryData {
  characters: {
    results: Character[]
    info: CharactersInfo
  }
}

export function useCharactersQuery(page: number, filters: FilterValues) {
  const supabase = useSupabase()

  return useQuery<CharactersQueryData>({
    queryKey: ['characters', page, filters],
    queryFn: async () => {
      const parsed = filterSchema.safeParse(filters)
      if (!parsed.success) {
        throw new Error('Invalid filter parameters')
      }

      const { name, status, species } = parsed.data
      const filter: Record<string, string> = {}
      if (name) filter['name'] = name
      if (status) filter['status'] = status
      if (species) filter['species'] = species

      const { data, error } = await supabase.functions.invoke('get-characters', {
        body: {
          page,
          filter: Object.keys(filter).length > 0 ? filter : null,
        },
      })

      if (error) {
        logger.error('Failed to fetch characters', {
          page,
          filters,
          error: error.message,
        })
        throw new Error(error.message)
      }

      return data as CharactersQueryData
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}
