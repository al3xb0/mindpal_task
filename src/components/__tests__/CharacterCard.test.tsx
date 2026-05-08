import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { Character } from '@/types/character'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const { CharacterCard } = await import('../CharacterCard')

const mockCharacter: Character = {
  id: '1',
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)' },
  location: { name: 'Citadel of Ricks' },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: [{ id: '1' }, { id: '2' }],
  created: '2017-11-04T18:48:46.250Z',
}

describe('CharacterCard', () => {
  beforeEach(() => { vi.clearAllMocks() })
  afterEach(() => { cleanup() })

  it('renders character name', () => {
    render(<CharacterCard character={mockCharacter} isFavorite={false} onToggleFavorite={vi.fn()} />)
    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
  })

  it('renders status', () => {
    render(<CharacterCard character={mockCharacter} isFavorite={false} onToggleFavorite={vi.fn()} />)
    expect(screen.getAllByText(/Alive/).length).toBeGreaterThan(0)
  })

  it('renders species', () => {
    render(<CharacterCard character={mockCharacter} isFavorite={false} onToggleFavorite={vi.fn()} />)
    expect(screen.getAllByText(/Human/).length).toBeGreaterThan(0)
  })

  it('shows "Add to favorites" aria-label when not favorite', () => {
    render(<CharacterCard character={mockCharacter} isFavorite={false} onToggleFavorite={vi.fn()} />)
    expect(screen.getAllByRole('button', { name: /add to favorites/i }).length).toBeGreaterThan(0)
  })

  it('shows "Remove from favorites" aria-label when favorite', () => {
    render(<CharacterCard character={mockCharacter} isFavorite={true} onToggleFavorite={vi.fn()} />)
    expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument()
  })

  it('calls onToggleFavorite with character when heart button clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn().mockResolvedValue(undefined)
    render(<CharacterCard character={mockCharacter} isFavorite={false} onToggleFavorite={onToggle} />)
    const btn = screen.getAllByRole('button', { name: /add to favorites/i })[0]
    if (btn) await user.click(btn)
    expect(onToggle).toHaveBeenCalledWith(mockCharacter)
  })

  it('calls onCardClick when card is clicked', async () => {
    const user = userEvent.setup()
    const onCardClick = vi.fn()
    const { container } = render(
      <CharacterCard
        character={mockCharacter}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onCardClick={onCardClick}
      />,
    )
    // Click the card div (not the button)
    await user.click(container.firstChild as HTMLElement)
    expect(onCardClick).toHaveBeenCalledWith(mockCharacter)
  })

  it('does not call onCardClick when heart button is clicked', async () => {
    const user = userEvent.setup()
    const onCardClick = vi.fn()
    const onToggle = vi.fn().mockResolvedValue(undefined)
    render(
      <CharacterCard
        character={mockCharacter}
        isFavorite={false}
        onToggleFavorite={onToggle}
        onCardClick={onCardClick}
      />,
    )
    const heartBtn = screen.getAllByRole('button', { name: /add to favorites/i })[0]
    if (heartBtn) await user.click(heartBtn)
    expect(onCardClick).not.toHaveBeenCalled()
  })

  it('shows compare button when onToggleComparison provided', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onToggleComparison={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /comparison/i })).toBeInTheDocument()
  })

  it('calls onToggleComparison when compare button clicked', async () => {
    const user = userEvent.setup()
    const onToggleComparison = vi.fn()
    render(
      <CharacterCard
        character={mockCharacter}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onToggleComparison={onToggleComparison}
      />,
    )
    const compareBtn = screen.getAllByRole('button', { name: /comparison/i })[0]
    if (compareBtn) await user.click(compareBtn)
    expect(onToggleComparison).toHaveBeenCalledWith(mockCharacter)
  })
})
