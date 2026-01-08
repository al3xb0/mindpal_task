'use client'

import { useState, useEffect, useRef, memo } from 'react'
import { useDebounce } from '@/lib/hooks'
import { CHARACTER_STATUS, CHARACTER_SPECIES, DEBOUNCE_DELAY } from '@/lib/constants'
import { FilterIcon, ChevronDownIcon } from '@/components'

interface CharacterFiltersProps {
  onFilterChange: (filters: FilterValues) => void
  disabled?: boolean
}

export interface FilterValues {
  name: string
  status: string
  species: string
}

export const CharacterFilters = memo(function CharacterFilters({ onFilterChange, disabled }: CharacterFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({
    name: '',
    status: '',
    species: '',
  })
  
  const debouncedName = useDebounce(filters.name, DEBOUNCE_DELAY)
  
  const isInitialMount = useRef(true)
  const isClearingRef = useRef(false)

  const onFilterChangeRef = useRef(onFilterChange)
  
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange
  }, [onFilterChange])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    
    if (isClearingRef.current) {
      isClearingRef.current = false
      onFilterChangeRef.current({ name: '', status: '', species: '' })
      return
    }
    
    onFilterChangeRef.current({
      name: debouncedName,
      status: filters.status,
      species: filters.species,
    })
  }, [debouncedName, filters.status, filters.species])

  const handleChange = (key: keyof FilterValues, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleClear = () => {
    isClearingRef.current = true
    setFilters({ name: '', status: '', species: '' })
  }

  const hasActiveFilters = filters.name || filters.status || filters.species

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
      >
        <FilterIcon className="h-5 w-5" />
        Filters
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 text-xs bg-green-500 rounded-full">Active</span>
        )}
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="filter-panel">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Search by name..."
                disabled={disabled}
                className="input-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={disabled}
                className="select-base"
              >
                <option value="">All statuses</option>
                <option value={CHARACTER_STATUS.ALIVE}>Alive</option>
                <option value={CHARACTER_STATUS.DEAD}>Dead</option>
                <option value={CHARACTER_STATUS.UNKNOWN}>Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Species
              </label>
              <select
                value={filters.species}
                onChange={(e) => handleChange('species', e.target.value)}
                disabled={disabled}
                className="select-base"
              >
                <option value="">All species</option>
                <option value={CHARACTER_SPECIES.HUMAN}>Human</option>
                <option value={CHARACTER_SPECIES.ALIEN}>Alien</option>
                <option value={CHARACTER_SPECIES.HUMANOID}>Humanoid</option>
                <option value={CHARACTER_SPECIES.ROBOT}>Robot</option>
                <option value={CHARACTER_SPECIES.ANIMAL}>Animal</option>
                <option value={CHARACTER_SPECIES.CRONENBERG}>Cronenberg</option>
                <option value={CHARACTER_SPECIES.MYTHOLOGICAL}>Mythological Creature</option>
                <option value={CHARACTER_SPECIES.POOPYBUTTHOLE}>Poopybutthole</option>
                <option value={CHARACTER_SPECIES.UNKNOWN}>Unknown</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleClear}
              disabled={disabled || !hasActiveFilters}
              className="btn-secondary px-4 py-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
})
