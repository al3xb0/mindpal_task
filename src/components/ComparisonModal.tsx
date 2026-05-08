'use client'

import { useEffect, useRef, memo } from 'react'
import Image from 'next/image'
import { STATUS_COLORS } from '@/lib/constants'
import { CloseIcon, HeartIcon, HeartOutlineIcon } from '@/components'
import type { Character } from '@/types/character'

interface ComparisonModalProps {
  characters: Character[]
  isOpen: boolean
  onClose: () => void
  isFavorite: (id: number) => boolean
  onToggleFavorite: (character: Character) => Promise<void>
}

const ROW_LABELS = [
  { key: 'image', label: '' },
  { key: 'status', label: 'Status' },
  { key: 'species', label: 'Species' },
  { key: 'gender', label: 'Gender' },
  { key: 'origin', label: 'Origin' },
  { key: 'location', label: 'Location' },
  { key: 'episodes', label: 'Episodes' },
]

function getFieldValue(character: Character, key: string): string {
  switch (key) {
    case 'status': return character.status
    case 'species': return character.species || 'Unknown'
    case 'gender': return character.gender || 'Unknown'
    case 'origin': return character.origin.name || 'Unknown'
    case 'location': return character.location.name || 'Unknown'
    case 'episodes': return String(character.episode.length)
    default: return ''
  }
}

export const ComparisonModal = memo(function ComparisonModal({
  characters,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}: ComparisonModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveEl = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      previousActiveEl.current = document.activeElement as HTMLElement
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      setTimeout(() => modalRef.current?.focus(), 0)
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
      previousActiveEl.current?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen || characters.length === 0) return null

  const gridCols = characters.length === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80" aria-hidden="true" />

      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <h2 id="compare-modal-title" className="text-xl font-bold text-white">
            Character Comparison
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            aria-label="Close comparison"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison grid */}
        <div className="p-6">
          {/* Character names row */}
          <div className={`grid ${gridCols} gap-4 mb-6`}>
            {characters.map((c) => (
              <div key={c.id} className="text-center">
                <h3 className="text-lg font-semibold text-white truncate">{c.name}</h3>
                <button
                  onClick={() => void onToggleFavorite(c)}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {isFavorite(parseInt(c.id)) ? (
                    <HeartIcon className="w-4 h-4 text-red-400" />
                  ) : (
                    <HeartOutlineIcon className="w-4 h-4" />
                  )}
                  {isFavorite(parseInt(c.id)) ? 'Favorited' : 'Add favorite'}
                </button>
              </div>
            ))}
          </div>

          {/* Images */}
          <div className={`grid ${gridCols} gap-4 mb-6`}>
            {characters.map((c) => (
              <div key={c.id} className="rounded-xl overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.name}
                  width={300}
                  height={300}
                  className="w-full h-40 object-cover"
                />
              </div>
            ))}
          </div>

          {/* Comparison rows */}
          {ROW_LABELS.filter((r) => r.key !== 'image').map((row) => (
            <div key={row.key} className="mb-2">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{row.label}</p>
              <div className={`grid ${gridCols} gap-4`}>
                {characters.map((c) => {
                  const value = getFieldValue(c, row.key)
                  const statusColor = row.key === 'status' ? (STATUS_COLORS[c.status] ?? STATUS_COLORS['unknown']) : null
                  return (
                    <div
                      key={c.id}
                      className="bg-gray-800 rounded-lg px-4 py-3 text-sm text-white flex items-center gap-2"
                    >
                      {statusColor && <span className={`status-dot ${statusColor} shrink-0`} />}
                      {value}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
