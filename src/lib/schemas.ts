import { z } from 'zod'
import { CHARACTER_STATUS, CHARACTER_SPECIES } from '@/lib/constants'

const statusValues = [
  '',
  CHARACTER_STATUS.ALIVE,
  CHARACTER_STATUS.DEAD,
  CHARACTER_STATUS.UNKNOWN,
] as const

const speciesValues = [
  '',
  CHARACTER_SPECIES.HUMAN,
  CHARACTER_SPECIES.ALIEN,
  CHARACTER_SPECIES.HUMANOID,
  CHARACTER_SPECIES.ROBOT,
  CHARACTER_SPECIES.ANIMAL,
  CHARACTER_SPECIES.CRONENBERG,
  CHARACTER_SPECIES.MYTHOLOGICAL,
  CHARACTER_SPECIES.POOPYBUTTHOLE,
  CHARACTER_SPECIES.UNKNOWN,
] as const

export const filterSchema = z.object({
  name: z
    .string()
    .max(100, 'Name must be at most 100 characters')
    .default(''),
  status: z.enum(statusValues).default(''),
  species: z.enum(speciesValues).default(''),
})

export const pageSchema = z.number().int().min(1).max(1000)
