'use client'

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/lib/supabase/hooks'
import { queryKeys } from '@/lib/queryKeys'
import type { User } from '@supabase/supabase-js'

export function useCurrentUser() {
  const supabase = useSupabase()
  return useQuery<User | null>({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) throw error
      return user
    },
    staleTime: 5 * 60 * 1000,
  })
}
