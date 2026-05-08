'use client'

import { useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'
import { useSupabase } from '@/lib/supabase/hooks'
import { useToast } from '@/components/Toast'
import { useCurrentUser } from './useCurrentUser'
import { logger } from '@/lib/logger'
import type { Character } from '@/types/character'
import type { FavoriteCharacter } from '@/types/database'

const RATE_LIMIT_MS = 1000

interface ToggleVars {
  character: Character
  userId: string
}

type FavoritesList = FavoriteCharacter[]

export function useFavorites() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { data: user } = useCurrentUser()
  const lastOperationTime = useRef<Map<number, number>>(new Map())

  const userId = user?.id
  const queryKey = ['favorites', userId] as const

  const {
    data: favoritesList = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<FavoritesList>({
    queryKey,
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('favorite_characters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) {
        logger.error('Failed to fetch favorites', { userId, error: error.message })
        throw new Error(error.message)
      }
      return data ?? []
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ character, userId: uid }: ToggleVars) => {
      const characterId = parseInt(character.id)
      const isFav = favoritesList.some(f => f.character_id === characterId)
      if (isFav) {
        const { error } = await supabase
          .from('favorite_characters')
          .delete()
          .eq('user_id', uid)
          .eq('character_id', characterId)
        if (error) throw new Error(error.message)
        return { action: 'removed' as const, character }
      } else {
        const { error } = await supabase
          .from('favorite_characters')
          .insert({
            user_id: uid,
            character_id: characterId,
            character_name: character.name,
            character_image: character.image,
            character_status: character.status,
            character_species: character.species,
          })
        if (error) throw new Error(error.message)
        return { action: 'added' as const, character }
      }
    },
    onMutate: async ({ character, userId: uid }: ToggleVars) => {
      const snapshotKey = ['favorites', uid] as const
      await queryClient.cancelQueries({ queryKey: snapshotKey })
      const previous = queryClient.getQueryData<FavoritesList>(snapshotKey) ?? []
      const characterId = parseInt(character.id)
      const isFav = previous.some(f => f.character_id === characterId)

      if (isFav) {
        queryClient.setQueryData<FavoritesList>(snapshotKey, prev =>
          (prev ?? []).filter(f => f.character_id !== characterId),
        )
      } else {
        const optimistic: FavoriteCharacter = {
          id: uuidv4(),
          user_id: uid,
          character_id: characterId,
          character_name: character.name,
          character_image: character.image,
          character_status: character.status,
          character_species: character.species,
          created_at: new Date().toISOString(),
        }
        queryClient.setQueryData<FavoritesList>(snapshotKey, prev => [
          optimistic,
          ...(prev ?? []),
        ])
      }
      return { previous, snapshotKey }
    },
    onError: (err: Error, _vars: ToggleVars, context) => {
      if (context) {
        queryClient.setQueryData<FavoritesList>(context.snapshotKey, context.previous)
      }
      logger.error('toggleFavorite failed', { error: err.message })
      showToast('Failed to update favorites', 'error')
    },
    onSuccess: ({ action, character }: { action: 'added' | 'removed'; character: Character }) => {
      showToast(
        action === 'added'
          ? `${character.name} added to favorites!`
          : `${character.name} removed from favorites`,
        action === 'added' ? 'success' : 'info',
      )
    },
  })

  const removeMutation = useMutation({
    mutationFn: async ({ character, userId: uid }: ToggleVars) => {
      const characterId = parseInt(character.id)
      const { error } = await supabase
        .from('favorite_characters')
        .delete()
        .eq('user_id', uid)
        .eq('character_id', characterId)
      if (error) throw new Error(error.message)
      return character
    },
    onMutate: async ({ character, userId: uid }: ToggleVars) => {
      const snapshotKey = ['favorites', uid] as const
      await queryClient.cancelQueries({ queryKey: snapshotKey })
      const previous = queryClient.getQueryData<FavoritesList>(snapshotKey) ?? []
      const characterId = parseInt(character.id)
      queryClient.setQueryData<FavoritesList>(snapshotKey, prev =>
        (prev ?? []).filter(f => f.character_id !== characterId),
      )
      return { previous, snapshotKey }
    },
    onError: (err: Error, _vars: ToggleVars, context) => {
      if (context) {
        queryClient.setQueryData<FavoritesList>(context.snapshotKey, context.previous)
      }
      logger.error('removeFavorite failed', { error: err.message })
      showToast('Failed to remove from favorites', 'error')
    },
    onSuccess: (character: Character) => {
      showToast(`${character.name} removed from favorites`, 'info')
    },
  })

  const toggleFavorite = useCallback(
    async (character: Character) => {
      if (!userId) {
        showToast('You must be logged in to manage favorites', 'error')
        return
      }
      const characterId = parseInt(character.id)
      const lastTime = lastOperationTime.current.get(characterId)
      if (lastTime !== undefined && Date.now() - lastTime < RATE_LIMIT_MS) {
        showToast('Please wait before trying again', 'info')
        return
      }
      lastOperationTime.current.set(characterId, Date.now())
      await toggleMutation.mutateAsync({ character, userId })
    },
    [toggleMutation, userId, showToast],
  )

  const removeFavorite = useCallback(
    async (character: Character) => {
      if (!userId) {
        showToast('You must be logged in to manage favorites', 'error')
        return
      }
      const characterId = parseInt(character.id)
      const lastTime = lastOperationTime.current.get(characterId)
      if (lastTime !== undefined && Date.now() - lastTime < RATE_LIMIT_MS) {
        showToast('Please wait before trying again', 'info')
        return
      }
      lastOperationTime.current.set(characterId, Date.now())
      await removeMutation.mutateAsync({ character, userId })
    },
    [removeMutation, userId, showToast],
  )

  const isFavorite = useCallback(
    (characterId: number) => favoritesList.some(f => f.character_id === characterId),
    [favoritesList],
  )

  return {
    favoritesList,
    loading,
    error: queryError instanceof Error ? queryError.message : null,
    toggleFavorite,
    removeFavorite,
    isFavorite,
    refetch: () => { void refetch() },
  }
}

