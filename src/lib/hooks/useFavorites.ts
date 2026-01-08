'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useSupabase } from '@/lib/supabase/hooks'
import { useToast } from '@/components/Toast'
import type { Character } from '@/types/character'
import type { FavoriteCharacter } from '@/types/database'

const RATE_LIMIT_MS = 1000

interface UseFavoritesOptions {
  fetchOnMount?: boolean
}

interface UseFavoritesReturn {
  favoritesList: FavoriteCharacter[]
  loading: boolean
  error: string | null
  toggleFavorite: (character: Character) => Promise<void>
  removeFavorite: (character: Character) => Promise<void>
  isFavorite: (characterId: number) => boolean
  refetch: () => Promise<void>
}

/**
 * Hook for managing user's favorite characters
 * Handles add/remove operations with rate limiting and optimistic updates
 */
export function useFavorites(options: UseFavoritesOptions = {}): UseFavoritesReturn {
  const { fetchOnMount = true } = options
  
  const [favoritesList, setFavoritesList] = useState<FavoriteCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const operationsInProgress = useRef<Set<number>>(new Set())
  const lastOperationTime = useRef<Map<number, number>>(new Map())
  
  const supabase = useSupabase()
  const { showToast } = useToast()

  /**
   * Fetch all favorites for the current user
   */
  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error('Failed to get user: ' + userError.message)
      }
      
      if (!user) {
        setFavoritesList([])
        return
      }

      const { data, error: fetchError } = await supabase
        .from('favorite_characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new Error('Failed to fetch favorites: ' + fetchError.message)
      }

      setFavoritesList(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch favorites'
      setError(message)
      console.error('useFavorites error:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  /**
   * Check if operation is rate limited
   */
  const isRateLimited = (characterId: number): boolean => {
    const lastTime = lastOperationTime.current.get(characterId)
    if (!lastTime) return false
    return Date.now() - lastTime < RATE_LIMIT_MS
  }

  /**
   * Add a character to favorites
   */
  const addFavorite = useCallback(async (character: Character, userId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('favorite_characters')
      .insert({
        user_id: userId,
        character_id: parseInt(character.id),
        character_name: character.name,
        character_image: character.image,
        character_status: character.status,
        character_species: character.species,
      })

    if (error) {
      console.error('Failed to add favorite:', error)
      return false
    }
    return true
  }, [supabase])

  /**
   * Remove a character from favorites
   */
  const deleteFavorite = useCallback(async (characterId: number, userId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('favorite_characters')
      .delete()
      .eq('user_id', userId)
      .eq('character_id', characterId)

    if (error) {
      console.error('Failed to remove favorite:', error)
      return false
    }
    return true
  }, [supabase])

  /**
   * Helper function to handle removal logic
   */
  const handleRemove = useCallback(async (characterId: number, characterName: string, userId: string): Promise<boolean> => {
    operationsInProgress.current.add(characterId)
    lastOperationTime.current.set(characterId, Date.now())
    
    try {
      const success = await deleteFavorite(characterId, userId)
      
      if (success) {
        setFavoritesList(prev => prev.filter(f => f.character_id !== characterId))
        showToast(`${characterName} removed from favorites`, 'info')
        return true
      } else {
        showToast('Failed to remove from favorites', 'error')
        return false
      }
    } finally {
      operationsInProgress.current.delete(characterId)
    }
  }, [deleteFavorite, showToast])

  /**
   * Toggle favorite status for a character
   */
  const toggleFavorite = useCallback(async (character: Character) => {
    const characterId = parseInt(character.id)
    
    if (operationsInProgress.current.has(characterId)) {
      return
    }
    
    if (isRateLimited(characterId)) {
      showToast('Please wait before trying again', 'info')
      return
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        showToast('Authentication error. Please try logging in again.', 'error')
        console.error('Auth error:', userError)
        return
      }
      
      if (!user) {
        showToast('You must be logged in to manage favorites', 'error')
        return
      }

      const isFav = favoritesList.some(f => f.character_id === characterId)

      if (isFav) {
        await handleRemove(characterId, character.name, user.id)
      } else {
        operationsInProgress.current.add(characterId)
        lastOperationTime.current.set(characterId, Date.now())
        
        try {
          const success = await addFavorite(character, user.id)
          
          if (success) {
            setFavoritesList(prev => [{
              id: uuidv4(),
              user_id: user.id,
              character_id: characterId,
              character_name: character.name,
              character_image: character.image,
              character_status: character.status,
              character_species: character.species,
              created_at: new Date().toISOString(),
            }, ...prev])
            showToast(`${character.name} added to favorites!`, 'success')
          } else {
            showToast('Failed to add to favorites', 'error')
          }
        } finally {
          operationsInProgress.current.delete(characterId)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      showToast(message, 'error')
      console.error('toggleFavorite error:', err)
    }
  }, [favoritesList, supabase, showToast, addFavorite, handleRemove])

  /**
   * Remove a character from favorites (explicit remove, not toggle)
   */
  const removeFavorite = useCallback(async (character: Character) => {
    const characterId = parseInt(character.id)
    
    if (!favoritesList.some(f => f.character_id === characterId)) {
      return
    }
    
    if (operationsInProgress.current.has(characterId)) {
      return
    }
    
    if (isRateLimited(characterId)) {
      showToast('Please wait before trying again', 'info')
      return
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        showToast('Authentication error. Please try logging in again.', 'error')
        console.error('Auth error:', userError)
        return
      }
      
      if (!user) {
        showToast('You must be logged in to manage favorites', 'error')
        return
      }

      await handleRemove(characterId, character.name, user.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      showToast(message, 'error')
      console.error('removeFavorite error:', err)
    }
  }, [favoritesList, supabase, showToast, handleRemove])

  /**
   * Check if a character is in favorites
   */
  const isFavorite = useCallback((characterId: number): boolean => {
    return favoritesList.some(f => f.character_id === characterId)
  }, [favoritesList])

  useEffect(() => {
    if (fetchOnMount) {
      fetchFavorites()
    }
  }, [fetchOnMount, fetchFavorites])

  return {
    favoritesList,
    loading,
    error,
    toggleFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites,
  }
}
