/**
 * Vitest tests for the get-characters Edge Function logic.
 * We duplicate the pure validation logic here since the Edge Function
 * uses Deno-only `https://` imports that Node/Vitest cannot resolve.
 */
import { describe, it, expect } from 'vitest'

// ── Inline the pure logic from index.ts (no Deno deps) ───────────────────────

const ALLOWED_STATUS_VALUES = ['Alive', 'Dead', 'unknown'] as const
const ALLOWED_SPECIES_VALUES = [
  'Human', 'Alien', 'Humanoid', 'Robot', 'Animal',
  'Cronenberg', 'Mythological Creature', 'Poopybutthole', 'unknown',
] as const
const MAX_NAME_LENGTH = 100

interface FilterCharacter {
  name?: string
  status?: string
  species?: string
  type?: string
  gender?: string
}
interface ValidationError { field: string; message: string }

function validateFilter(filter: unknown): { valid: FilterCharacter | null; errors: ValidationError[] } {
  const errors: ValidationError[] = []
  if (filter === null || filter === undefined) return { valid: null, errors: [] }
  if (typeof filter !== 'object') {
    errors.push({ field: 'filter', message: 'Filter must be an object' })
    return { valid: null, errors }
  }
  const f = filter as Record<string, unknown>
  const valid: FilterCharacter = {}

  if (f['name'] !== undefined) {
    if (typeof f['name'] !== 'string') {
      errors.push({ field: 'filter.name', message: 'Name must be a string' })
    } else if (f['name'].length > MAX_NAME_LENGTH) {
      errors.push({ field: 'filter.name', message: `Name must be at most ${MAX_NAME_LENGTH} characters` })
    } else if (f['name'].trim()) {
      valid.name = f['name'].trim().replace(/[<>]/g, '')
    }
  }

  if (f['status'] !== undefined) {
    if (typeof f['status'] !== 'string') {
      errors.push({ field: 'filter.status', message: 'Status must be a string' })
    } else if (f['status'] && !ALLOWED_STATUS_VALUES.includes(f['status'] as typeof ALLOWED_STATUS_VALUES[number])) {
      errors.push({ field: 'filter.status', message: `Status must be one of: ${ALLOWED_STATUS_VALUES.join(', ')}` })
    } else if (f['status']) {
      valid.status = f['status']
    }
  }

  if (f['species'] !== undefined) {
    if (typeof f['species'] !== 'string') {
      errors.push({ field: 'filter.species', message: 'Species must be a string' })
    } else if (f['species'] && !ALLOWED_SPECIES_VALUES.includes(f['species'] as typeof ALLOWED_SPECIES_VALUES[number])) {
      errors.push({ field: 'filter.species', message: `Species must be one of: ${ALLOWED_SPECIES_VALUES.join(', ')}` })
    } else if (f['species']) {
      valid.species = f['species']
    }
  }

  return { valid: Object.keys(valid).length > 0 ? valid : null, errors }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('validateFilter', () => {
  it('null input returns null valid with no errors', () => {
    const { valid, errors } = validateFilter(null)
    expect(valid).toBeNull()
    expect(errors).toHaveLength(0)
  })

  it('undefined input returns null valid with no errors', () => {
    const { valid, errors } = validateFilter(undefined)
    expect(valid).toBeNull()
    expect(errors).toHaveLength(0)
  })

  it('non-object returns error', () => {
    const { errors } = validateFilter('not-an-object')
    expect(errors).toHaveLength(1)
  })

  it('valid name passes through', () => {
    const { valid, errors } = validateFilter({ name: 'Rick' })
    expect(errors).toHaveLength(0)
    expect(valid?.name).toBe('Rick')
  })

  it('name is trimmed', () => {
    const { valid } = validateFilter({ name: '  Morty  ' })
    expect(valid?.name).toBe('Morty')
  })

  it('XSS chars are stripped from name', () => {
    const { valid } = validateFilter({ name: '<script>Rick</script>' })
    expect(valid?.name).toBe('scriptRick/script')
  })

  it('name over 100 chars returns error', () => {
    const { errors } = validateFilter({ name: 'a'.repeat(101) })
    expect(errors).toHaveLength(1)
    expect(errors[0]?.field).toBe('filter.name')
  })

  it('valid status Alive passes through', () => {
    const { valid, errors } = validateFilter({ status: 'Alive' })
    expect(errors).toHaveLength(0)
    expect(valid?.status).toBe('Alive')
  })

  it('invalid status returns error', () => {
    const { errors } = validateFilter({ status: 'Zombie' })
    expect(errors).toHaveLength(1)
    expect(errors[0]?.field).toBe('filter.status')
  })

  it('valid species Human passes through', () => {
    const { valid, errors } = validateFilter({ species: 'Human' })
    expect(errors).toHaveLength(0)
    expect(valid?.species).toBe('Human')
  })

  it('invalid species returns error', () => {
    const { errors } = validateFilter({ species: 'Dragon' })
    expect(errors).toHaveLength(1)
  })

  it('combined valid filter', () => {
    const { valid, errors } = validateFilter({ name: 'Rick', status: 'Alive', species: 'Human' })
    expect(errors).toHaveLength(0)
    expect(valid?.name).toBe('Rick')
    expect(valid?.status).toBe('Alive')
    expect(valid?.species).toBe('Human')
  })
})
