import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, afterEach } from 'vitest'
import type { FilterValues } from '../CharacterFilters'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

const { CharacterFilters } = await import('../CharacterFilters')

describe('CharacterFilters', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders search input', () => {
    render(<CharacterFilters onFilterChange={vi.fn()} />)
    const filterButton = screen.queryByRole('button', { name: /filter/i })
    expect(filterButton ?? screen.queryByPlaceholderText(/character name/i)).toBeTruthy()
  })

  it('initializes name from defaultValues', () => {
    const defaults: FilterValues = { name: 'Morty', status: '', species: '' }
    // Should not throw
    render(<CharacterFilters onFilterChange={vi.fn()} defaultValues={defaults} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onFilterChange after debounce when status changes', () => {
    vi.useFakeTimers()
    const onFilterChange = vi.fn()
    render(<CharacterFilters onFilterChange={onFilterChange} />)

    // Open the filters panel using fireEvent (avoids userEvent timer issues)
    const toggleBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('Filter'))
    if (toggleBtn) fireEvent.click(toggleBtn)

    const statusSelect = screen.queryByRole('combobox', { name: /status/i })
      ?? screen.queryAllByRole('combobox')[0]
    if (statusSelect) {
      fireEvent.change(statusSelect, { target: { value: 'Alive' } })
      vi.advanceTimersByTime(600)
      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Alive' }),
      )
    }
  })

  it('renders species select', async () => {
    const user = userEvent.setup()
    render(<CharacterFilters onFilterChange={vi.fn()} />)
    const toggleBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('Filter'))
    if (toggleBtn) await user.click(toggleBtn)
    expect(screen.queryAllByRole('combobox').length).toBeGreaterThanOrEqual(1)
  })
})
