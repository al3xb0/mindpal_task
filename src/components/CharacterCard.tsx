'use client'

import Image from 'next/image'
import { useState } from 'react'
import { STATUS_COLORS } from '@/lib/constants'
import { HeartIcon, HeartOutlineIcon } from '@/components'
import type { Character } from '@/types/character'

interface CharacterCardProps {
  character: Character
  isFavorite: boolean
  onToggleFavorite: (character: Character) => Promise<void>
  onCardClick?: ((character: Character) => void) | undefined
  isSelectedForComparison?: boolean | undefined
  onToggleComparison?: ((character: Character) => void) | undefined
}

export function CharacterCard({
  character,
  isFavorite,
  onToggleFavorite,
  onCardClick,
  isSelectedForComparison,
  onToggleComparison,
}: CharacterCardProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      await onToggleFavorite(character)
    } finally {
      setLoading(false)
    }
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleComparison?.(character)
  }

  const handleCardClick = () => {
    onCardClick?.(character)
  }

  const statusColor = STATUS_COLORS[character.status] ?? STATUS_COLORS['unknown']

  return (
    <div
      className={`card-hover ${onCardClick ? 'cursor-pointer' : ''} ${isSelectedForComparison ? 'ring-2 ring-blue-500' : ''}`}
      onClick={handleCardClick}
    >
      <div className="relative">
        <Image
          src={character.image}
          alt={character.name}
          width={300}
          height={300}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        {/* Favorites button */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`absolute top-3 right-3 btn-icon ${
            isFavorite ? 'btn-icon-favorite-active' : 'btn-icon-favorite'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? (
            <HeartIcon className="w-5 h-5 text-white" />
          ) : (
            <HeartOutlineIcon className="w-5 h-5 text-white" />
          )}
        </button>
        {/* Compare toggle */}
        {onToggleComparison !== undefined && (
          <button
            onClick={handleCompare}
            className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors text-xs font-bold ${
              isSelectedForComparison
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-gray-900/70 border-gray-400 text-gray-300 hover:border-blue-400'
            }`}
            aria-label={
              isSelectedForComparison ? 'Remove from comparison' : 'Add to comparison'
            }
          >
            {isSelectedForComparison ? '✓' : '+'}
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">{character.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className={`status-dot ${statusColor}`} />
          <span className="text-gray-400 text-sm">
            {character.status} - {character.species}
          </span>
        </div>
      </div>
    </div>
  )
}
