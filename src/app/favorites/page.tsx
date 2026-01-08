import { createClient } from '@/lib/supabase/server'
import { FavoritesClient } from './FavoritesClient'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <FavoritesClient userEmail={user?.email} />
}
