// Character status constants
export const CHARACTER_STATUS = {
  ALIVE: 'Alive',
  DEAD: 'Dead',
  UNKNOWN: 'unknown',
} as const

export type CharacterStatusType = (typeof CHARACTER_STATUS)[keyof typeof CHARACTER_STATUS]

// Character species constants
export const CHARACTER_SPECIES = {
  HUMAN: 'Human',
  ALIEN: 'Alien',
  HUMANOID: 'Humanoid',
  ROBOT: 'Robot',
  ANIMAL: 'Animal',
  CRONENBERG: 'Cronenberg',
  MYTHOLOGICAL: 'Mythological Creature',
  POOPYBUTTHOLE: 'Poopybutthole',
  UNKNOWN: 'unknown',
} as const

export type CharacterSpeciesType = (typeof CHARACTER_SPECIES)[keyof typeof CHARACTER_SPECIES]

// Pagination constants
export const PAGINATION = {
  ITEMS_PER_PAGE: 20,
  MAX_VISIBLE_PAGES: 5,
} as const

// Toast types
export const TOAST_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
} as const

export type ToastType = (typeof TOAST_TYPE)[keyof typeof TOAST_TYPE]

// Status color mapping for UI
export const STATUS_COLORS: Record<string, string> = {
  [CHARACTER_STATUS.ALIVE]: 'bg-green-500',
  [CHARACTER_STATUS.DEAD]: 'bg-red-500',
  [CHARACTER_STATUS.UNKNOWN]: 'bg-gray-500',
} as const

// Debounce delay in milliseconds
export const DEBOUNCE_DELAY = 500

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PAGE_NUMBER: 1000,
} as const

// Filter allowed values for Edge Function validation
export const ALLOWED_STATUS_VALUES = [
  CHARACTER_STATUS.ALIVE,
  CHARACTER_STATUS.DEAD,
  CHARACTER_STATUS.UNKNOWN,
] as const

export const ALLOWED_SPECIES_VALUES = [
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

export const ALLOWED_GENDER_VALUES = ['Male', 'Female', 'Genderless', 'unknown'] as const
