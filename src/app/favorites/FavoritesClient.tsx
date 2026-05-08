'use client'

import { useState, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useDebounce, useFavorites } from '@/lib/hooks'
import { DEBOUNCE_DELAY, CHARACTER_STATUS } from '@/lib/constants'
import {
  Navbar, CharacterCard, ErrorMessage, LoadingGrid, HeartOutlineIcon,
  SearchIcon, ArrowRightIcon, DownloadIcon,
} from '@/components'
import type { Character } from '@/types/character'
import type { FavoriteCharacter } from '@/types/database'
import Link from 'next/link'

interface FavoritesClientProps {
  userEmail?: string | undefined
}

const GRID_COLUMNS = 4
const CARD_ROW_HEIGHT = 344
const VIRTUAL_THRESHOLD = 50

function favoriteToCharacter(fav: FavoriteCharacter): Character {
  return {
    id: String(fav.character_id),
    name: fav.character_name,
    image: fav.character_image ?? '/placeholder.svg',
    status: (fav.character_status as Character['status']) ?? 'unknown',
    species: fav.character_species ?? 'Unknown',
    type: '',
    gender: 'unknown',
    origin: { name: 'Unknown' },
    location: { name: 'Unknown' },
    episode: [],
    created: '',
  }
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function exportToJson(favs: FavoriteCharacter[]): void {
  const data = favs.map((f) => ({
    id: f.character_id,
    name: f.character_name,
    status: f.character_status,
    species: f.character_species,
    image: f.character_image,
    savedAt: f.created_at,
  }))
  downloadFile(
    JSON.stringify(data, null, 2),
    `favorites-${new Date().toISOString().split('T')[0]}.json`,
    'application/json',
  )
}

function exportToCsv(favs: FavoriteCharacter[]): void {
  const headers = ['ID', 'Name', 'Status', 'Species', 'Image URL', 'Saved At']
  const rows = favs.map((f) => [
    String(f.character_id),
    f.character_name,
    f.character_status ?? '',
    f.character_species ?? '',
    f.character_image ?? '',
    f.created_at,
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(','))
    .join('\n')
  downloadFile(
    csv,
    `favorites-${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv;charset=utf-8;',
  )
}

export function FavoritesClient({ userEmail }: FavoritesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY)
  const { favoritesList: favorites, loading, error, removeFavorite, refetch } = useFavorites()

  const filteredFavorites = useMemo(() => {
    let filtered = favorites
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter((f) => f.character_name.toLowerCase().includes(q))
    }
    if (statusFilter) {
      filtered = filtered.filter((f) => f.character_status === statusFilter)
    }
    return filtered
  }, [favorites, debouncedSearchQuery, statusFilter])

  const useVirtual = filteredFavorites.length > VIRTUAL_THRESHOLD
  const rowCount = Math.ceil(filteredFavorites.length / GRID_COLUMNS)
  const parentRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: useVirtual ? rowCount : 0,
    getScrollElement: () => (useVirtual ? parentRef.current : null),
    estimateSize: () => CARD_ROW_HEIGHT,
    overscan: 3,
  })

  return (
    <div className="page-container">
      <Navbar userEmail={userEmail} />

      <main className="content-container">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Your Favorites</h1>
            <p className="text-gray-400 mt-2">
              {favorites.length} character{favorites.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>

          {favorites.length > 0 && (
            <div className="relative shrink-0">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-2 btn-secondary"
                aria-label="Export favorites"
                aria-expanded={showExportMenu}
                aria-haspopup="true"
              >
                <DownloadIcon className="w-4 h-4" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-t-lg"
                    onClick={() => {
                      exportToJson(favorites)
                      setShowExportMenu(false)
                    }}
                  >
                    Export as JSON
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-b-lg"
                    onClick={() => {
                      exportToCsv(favorites)
                      setShowExportMenu(false)
                    }}
                  >
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {favorites.length > 0 && (
          <div className="filter-panel mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="input-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
          <ErrorMessage message={error} onRetry={refetch} />
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-6">
              <HeartOutlineIcon className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No favorites yet</h3>
            <p className="text-gray-400 mb-6">
              Start exploring and add characters to your collection!
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 btn-primary">
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
        ) : useVirtual ? (
          <div ref={parentRef} className="overflow-auto" style={{ height: '75vh' }}>
            <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const from = virtualRow.index * GRID_COLUMNS
                const rowItems = filteredFavorites.slice(from, from + GRID_COLUMNS)
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{ position: 'absolute', top: virtualRow.start, left: 0, width: '100%' }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-6"
                  >
                    {rowItems.map((fav) => (
                      <CharacterCard
                        key={fav.id}
                        character={favoriteToCharacter(fav)}
                        isFavorite={true}
                        onToggleFavorite={removeFavorite}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFavorites.map((fav) => (
              <CharacterCard
                key={fav.id}
                character={favoriteToCharacter(fav)}
                isFavorite={true}
                onToggleFavorite={removeFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
