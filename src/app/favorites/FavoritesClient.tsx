'use client'

import { useState, useMemo } from 'react'
import { useDebounce, useFavorites } from '@/lib/hooks'
import { PAGINATION, CHARACTER_STATUS, DEBOUNCE_DELAY } from '@/lib/constants'
import { Navbar, CharacterCard, Pagination, LoadingGrid, ErrorMessage, HeartOutlineIcon, SearchIcon, ArrowRightIcon } from '@/components'
import type { Character } from '@/types/character'
import type { FavoriteCharacter } from '@/types/database'
import Link from 'next/link'

interface FavoritesClientProps {
  userEmail?: string
}

export function FavoritesClient({ userEmail }: FavoritesClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY)
  
  const { 
    favoritesList: favorites, 
    loading, 
    error, 
    removeFavorite,
    refetch 
  } = useFavorites()

  const { filteredFavorites, totalPages } = useMemo(() => {
    let filtered = favorites

    if (debouncedSearchQuery) {
      filtered = filtered.filter(f => 
        f.character_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(f => f.character_status === statusFilter)
    }

    const total = Math.ceil(filtered.length / PAGINATION.ITEMS_PER_PAGE) || 1
    
    const safePage = currentPage > total ? 1 : currentPage
    
    const from = (safePage - 1) * PAGINATION.ITEMS_PER_PAGE
    const to = from + PAGINATION.ITEMS_PER_PAGE
    
    return {
      filteredFavorites: filtered.slice(from, to),
      totalPages: total,
    }
  }, [favorites, debouncedSearchQuery, statusFilter, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const favoriteToCharacter = (fav: FavoriteCharacter): Character => ({
    id: String(fav.character_id),
    name: fav.character_name,
    image: fav.character_image || '/placeholder.png',
    status: (fav.character_status as Character['status']) || 'unknown',
    species: fav.character_species || 'Unknown',
    type: '',
    gender: 'unknown',
    origin: { name: 'Unknown' },
    location: { name: 'Unknown' },
    episode: [],
    created: '',
  })

  const totalFavorites = favorites.length

  return (
    <div className="page-container">
      <Navbar userEmail={userEmail} />
      
      <main className="content-container">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Your Favorites</h1>
              <p className="text-gray-400 mt-2">
                {totalFavorites} character{totalFavorites !== 1 ? 's' : ''} in your collection
              </p>
            </div>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="filter-panel mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Search by name..."
                  className="input-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="select-base"
                >
                  <option value="">All statuses</option>
                  <option value={CHARACTER_STATUS.ALIVE}>Alive</option>
                  <option value={CHARACTER_STATUS.DEAD}>Dead</option>
                  <option value={CHARACTER_STATUS.UNKNOWN}>Unknown</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={refetch}
          />
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-6">
              <HeartOutlineIcon className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No favorites yet</h3>
            <p className="text-gray-400 mb-6">
              Start exploring and add characters to your collection!
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 btn-primary"
            >
              <ArrowRightIcon className="h-5 w-5" />
              Explore Characters
            </Link>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <SearchIcon className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-white">No matches found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFavorites.map((favorite) => (
                <CharacterCard
                  key={favorite.id}
                  character={favoriteToCharacter(favorite)}
                  isFavorite={true}
                  onToggleFavorite={removeFavorite}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
