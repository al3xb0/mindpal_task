import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { Character } from '@/types/character'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const { CharacterModal } = await import('../CharacterModal')

const mockCharacter: Character = {
  id: '42',
  name: 'Morty Smith',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)' },
  location: { name: 'Earth (Replacement Dimension)' },
  image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
  episode: [{ id: '1' }, { id: '2' }, { id: '3' }],
  created: '2017-11-04T18:50:21.651Z',
}

describe('CharacterModal', () => {
  beforeEach(() => { vi.clearAllMocks() })
  afterEach(() => { cleanup() })

  it('does not render when isOpen is false', () => {
    render(
      <CharacterModal character={mockCharacter} isOpen={false} onClose={vi.fn()} />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders character name when open', () => {
    render(
      <CharacterModal character={mockCharacter} isOpen={true} onClose={vi.fn()} />,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Morty Smith')).toBeInTheDocument()
  })

  it('shows status', () => {
    render(
      <CharacterModal character={mockCharacter} isOpen={true} onClose={vi.fn()} />,
    )
    expect(screen.getAllByText(/Alive/).length).toBeGreaterThan(0)
  })

  it('shows species', () => {
    render(
      <CharacterModal character={mockCharacter} isOpen={true} onClose={vi.fn()} />,
    )
    expect(screen.getAllByText(/Human/).length).toBeGreaterThan(0)
  })

  it('shows episode count', () => {
    render(
      <CharacterModal character={mockCharacter} isOpen={true} onClose={vi.fn()} />,
    )
    expect(screen.getAllByText(/3/).length).toBeGreaterThan(0)
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(
      <CharacterModal character={mockCharacter} isOpen={true} onClose={onClose} />,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = render(
      <CharacterModal character={mockCharacter} isOpen={true} onClose={onClose} />,
    )
    // Click the outermost dialog overlay (not the modal content)
    const dialog = container.querySelector('[role="dialog"]')
    if (dialog) {
      await user.click(dialog)
    }
    expect(onClose).toHaveBeenCalled()
  })

  it('shows favorite button when onToggleFavorite provided', () => {
    render(
      <CharacterModal
        character={mockCharacter}
        isOpen={true}
        onClose={vi.fn()}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /favorites/i })).toBeInTheDocument()
  })

  it('renders null when character is null and isOpen is true', () => {
    render(<CharacterModal character={null} isOpen={true} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
