'use client'

import { useEffect, useRef, memo } from 'react'
import Image from 'next/image'
import { STATUS_COLORS } from '@/lib/constants'
import { CloseIcon, UserIcon, GlobeIcon, LocationIcon, FilmIcon, HeartIcon } from '@/components'
import type { Character } from '@/types/character'

interface CharacterModalProps {
  character: Character | null
  isOpen: boolean
  onClose: () => void
  isFavorite?: boolean
  onToggleFavorite?: (character: Character) => void
}

export const CharacterModal = memo(function CharacterModal({ 
  character, 
  isOpen, 
  onClose, 
  isFavorite,
  onToggleFavorite 
}: CharacterModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
    
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTab)
      document.body.style.overflow = 'hidden'
      
      setTimeout(() => {
        modalRef.current?.focus()
      }, 0)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
      document.body.style.overflow = 'unset'
      
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen || !character) return null

  const statusColor = STATUS_COLORS[character.status] || STATUS_COLORS.unknown

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const episodeCount = character.episode?.length || 0
  const gender = character.gender || 'Unknown'
  const originName = character.origin?.name || 'Unknown'
  const locationName = character.location?.name || 'Unknown'

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" aria-hidden="true" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-900/50 hover:bg-gray-900 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        {/* Header with image */}
        <div className="relative h-64 sm:h-80">
          <Image
            src={character.image}
            alt={character.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/50 to-transparent" />
          
          {/* Character name overlay */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`status-dot-lg ${statusColor}`} aria-hidden="true" />
              <span className="text-sm text-gray-300">
                {character.status} - {character.species}
              </span>
            </div>
            <h2 id="modal-title" className="text-3xl sm:text-4xl font-bold text-white">
              {character.name}
            </h2>
            {character.type && (
              <p className="text-gray-400 mt-1">{character.type}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-20rem)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Gender */}
            <div className="info-card">
              <div className="flex items-center gap-3">
                <div className="info-card-icon-purple">
                  <UserIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Gender</p>
                  <p className="text-white font-medium">{gender}</p>
                </div>
              </div>
            </div>

            {/* Origin */}
            <div className="info-card">
              <div className="flex items-center gap-3">
                <div className="info-card-icon-blue">
                  <GlobeIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Origin</p>
                  <p className="text-white font-medium truncate">{originName}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="info-card">
              <div className="flex items-center gap-3">
                <div className="info-card-icon-green">
                  <LocationIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Last Known Location</p>
                  <p className="text-white font-medium truncate">{locationName}</p>
                </div>
              </div>
            </div>

            {/* Episodes */}
            <div className="info-card">
              <div className="flex items-center gap-3">
                <div className="info-card-icon-yellow">
                  <FilmIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Episodes</p>
                  <p className="text-white font-medium">{episodeCount} episode{episodeCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Created date */}
          {character.created && (
            <p className="text-center text-gray-500 text-sm mt-6">
              Created: {formatDate(character.created)}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(character)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all
                  ${isFavorite 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                    : 'bg-green-500 text-white hover:bg-green-600'}
                `}
                aria-pressed={isFavorite}
              >
                <HeartIcon className="h-5 w-5" />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
