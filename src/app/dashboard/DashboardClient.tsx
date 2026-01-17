'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/lib/supabase/hooks'
import { useFavorites } from '@/lib/hooks'
import { Navbar, CharacterCard, CharacterModal, Pagination, LoadingGrid, ErrorMessage, CharacterFilters, SadFaceIcon } from '@/components'
import type { FilterValues } from '@/components'
import type { Character } from '@/types/character'

interface DashboardClientProps {
  userEmail?: string
}

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterValues>({ name: '', status: '', species: '' })
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  
  const supabase = useSupabase()
  const { toggleFavorite, isFavorite } = useFavorites()

  const fetchCharacters = useCallback(async (page: number, currentFilters: FilterValues) => {
    setLoading(true)
    setError(null)

    try {
      const filter: Record<string, string> = {}
      if (currentFilters.name) filter.name = currentFilters.name
      if (currentFilters.status) filter.status = currentFilters.status
      if (currentFilters.species) filter.species = currentFilters.species

      const { data, error: fnError } = await supabase.functions.invoke(
        'get-characters',
        { body: { page, filter: Object.keys(filter).length > 0 ? filter : null } }
      )

      if (fnError) {
        throw new Error(fnError.message)
      }

      if (data?.characters) {
        setCharacters(data.characters.results)
        setTotalPages(data.characters.info.pages)
      } else {
        setCharacters([])
        setTotalPages(1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch characters')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCharacters(currentPage, filters)
  }, [currentPage, filters, fetchCharacters])

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(prevFilters => {
      if (newFilters.name !== prevFilters.name || newFilters.status !== prevFilters.status || newFilters.species !== prevFilters.species) {
        setCurrentPage(1)
      }
      return newFilters
    })
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={() => fetchCharacters(currentPage, filters)}
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
