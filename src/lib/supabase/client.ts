import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '⚠️ Supabase configuration is missing!\n' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in your .env.local file.\n' +
      'See .env.example for reference.'
    )
  }

  return {
    url: supabaseUrl || '',
    anonKey: supabaseAnonKey || ''
  }
}

export function createClient() {
  const { url, anonKey } = getSupabaseConfig()
  
  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY environment variables.'
    )
  }

  return createBrowserClient<Database>(url, anonKey)
}
