'use client'

import { useMemo } from 'react'
import { createClient } from './client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

let browserClient: SupabaseClient<Database> | null = null

function getOrCreateBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}

/**
 * Hook to get a memoized Supabase client instance.
 * Uses singleton pattern to avoid creating multiple clients.
 */
export function useSupabase(): SupabaseClient<Database> {
  return useMemo(() => getOrCreateBrowserClient(), [])
}
