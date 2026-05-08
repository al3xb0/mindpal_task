'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useFavorites, useUrlPagination, useCharactersQuery } from '@/lib/hooks'
import { Navbar, CharacterCard, CharacterModal, Pagination, LoadingGrid, ErrorMessage, CharacterFilters, SadFaceIcon } from '@/components'
import type { FilterValues } from '@/components'
import type { Character } from '@/types/character'

interface DashboardClientProps {
  userEmail?: string | undefined
}

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const [filters, setFilters] = useState<FilterValues>({ name: '', status: '', species: '' })
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  const { currentPage, handlePageChange } = useUrlPagination(1)
  const { toggleFavorite, isFavorite } = useFavorites()
  const { data, isLoading, isFetching, error, refetch } = useCharactersQuery(currentPage, filters)

  const characters = data?.characters?.results ?? []
  const totalPages = data?.characters?.info?.pages ?? 1

  const prevFiltersRef = useRef(filters)
  useEffect(() => {
    const changed =
      prevFiltersRef.current.name !== filters.name ||
      prevFiltersRef.current.status !== filters.status ||
      prevFiltersRef.current.species !== filters.species
    if (changed && currentPage !== 1) {
      handlePageChange(1)
    }
    prevFiltersRef.current = filters
  }, [filters, currentPage, handlePageChange])

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters)
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

        <CharacterFilters onFilterChange={handleFilterChange} />

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
            {isFetching && !isLoading && (
              <p className="text-gray-500 text-xs mb-2">UpdatingвЂ¦</p>
            )}
            <p className="text-gray-500 text-sm mb-4">Click on a card to see more details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {characters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  isFavorite={isFavorite(parseInt(character.id))}
                  onToggleFavorite={toggleFavorite}
                  onCardClick={setSelectedCharacter}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      <CharacterModal
        character={selectedCharacter}
        isOpen={!!selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        isFavorite={selectedCharacter ? isFavorite(parseInt(selectedCharacter.id)) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  )
}

