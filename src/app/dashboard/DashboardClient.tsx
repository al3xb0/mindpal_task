'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useFavorites, useUrlFilters, useInfiniteCharactersQuery } from '@/lib/hooks'
import { useSupabase } from '@/lib/supabase/hooks'
import { queryKeys } from '@/lib/queryKeys'
import {
  Navbar, CharacterCard, CharacterModal, ComparisonModal,
  LoadingGrid, LoadingSpinner, ErrorMessage, CharacterFilters, SadFaceIcon, ChevronDownIcon,
} from '@/components'
import type { FilterValues } from '@/components'
import type { Character } from '@/types/character'
import type { FavoriteCharacter } from '@/types/database'

interface DashboardClientProps {
  userEmail?: string | undefined
  userId?: string | undefined
}

const MAX_COMPARISON = 3

export function DashboardClient({ userEmail, userId }: DashboardClientProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [comparisonList, setComparisonList] = useState<Character[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const queryClient = useQueryClient()
  const supabase = useSupabase()

  // Eagerly warm the favorites cache using the userId from SSR,
  // so useFavorites() finds data already there once the auth query resolves.
  useEffect(() => {
    if (!userId) return
    void queryClient.prefetchQuery({
      queryKey: queryKeys.favorites.byUser(userId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('favorite_characters')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        if (error) throw new Error(error.message)
        return (data ?? []) as FavoriteCharacter[]
      },
      staleTime: 30 * 1000,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Filters synced to URL (clean URLs: empty params removed)
  const { filters: urlFilters, setFilters: syncFiltersToUrl } = useUrlFilters()

  const { toggleFavorite, isFavorite } = useFavorites()
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteCharactersQuery(urlFilters)

  const characters = data?.pages.flatMap((p) => p.characters.results) ?? []
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Show scroll-to-top button after scrolling 500px
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleFilterChange = useCallback(
    (newFilters: FilterValues) => {
      syncFiltersToUrl(newFilters)
    },
    [syncFiltersToUrl],
  )

  const handleToggleComparison = useCallback((character: Character) => {
    setComparisonList((prev) => {
      const isSelected = prev.some((c) => c.id === character.id)
      if (isSelected) return prev.filter((c) => c.id !== character.id)
      if (prev.length >= MAX_COMPARISON) return prev
      return [...prev, character]
    })
  }, [])

  return (
    <div className="page-container">
      <Navbar userEmail={userEmail} />

      <main className="content-container">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Characters</h1>
          <p className="text-gray-400 mt-2">
            Explore Rick and Morty characters and add them to your favorites
          </p>
        </div>

        <CharacterFilters onFilterChange={handleFilterChange} defaultValues={urlFilters} />

        {isLoading ? (
          <LoadingGrid />
        ) : error ? (
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Failed to fetch characters'}
            onRetry={() => void refetch()}
          />
        ) : characters.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <SadFaceIcon className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-white">No characters found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">
              {characters.length} character{characters.length !== 1 ? 's' : ''} loaded
              {comparisonList.length > 0 &&
                ` · ${comparisonList.length}/${MAX_COMPARISON} selected for comparison`}
            </p>
            <p className="text-gray-500 text-xs mb-4">Click on a card to see more details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {characters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  isFavorite={isFavorite(parseInt(character.id))}
                  onToggleFavorite={toggleFavorite}
                  onCardClick={setSelectedCharacter}
                  isSelectedForComparison={comparisonList.some((c) => c.id === character.id)}
                  onToggleComparison={
                    comparisonList.length < MAX_COMPARISON ||
                    comparisonList.some((c) => c.id === character.id)
                      ? handleToggleComparison
                      : undefined
                  }
                />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            )}

            {!hasNextPage && characters.length > 0 && (
              <p className="text-center text-gray-500 text-sm py-8">
                All {characters.length} characters loaded
              </p>
            )}
          </>
        )}
      </main>

      {/* Floating comparison bar */}
      {comparisonList.length >= 2 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-gray-800 border border-gray-700 rounded-xl px-6 py-3 shadow-xl">
          <span className="text-white text-sm font-medium">
            {comparisonList.length} selected
          </span>
          <button
            onClick={() => setShowComparison(true)}
            className="btn-primary text-sm px-4 py-2"
          >
            Compare
          </button>
          <button
            onClick={() => setComparisonList([])}
            className="text-gray-400 hover:text-white text-sm"
          >
            Clear
          </button>
        </div>
      )}

      <CharacterModal
        character={selectedCharacter}
        isOpen={!!selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        isFavorite={selectedCharacter ? isFavorite(parseInt(selectedCharacter.id)) : false}
        onToggleFavorite={toggleFavorite}
      />

      <ComparisonModal
        characters={comparisonList}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />

      {/* Scroll-to-top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 border border-gray-600 shadow-lg transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronDownIcon className="w-5 h-5 text-white rotate-180" />
        </button>
      )}
    </div>
  )
}

