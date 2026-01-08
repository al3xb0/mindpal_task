// @ts-expect-error: Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RICK_AND_MORTY_GRAPHQL_URL = "https://rickandmortyapi.com/graphql"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_STATUS_VALUES = ['Alive', 'Dead', 'unknown'] as const
const ALLOWED_SPECIES_VALUES = [
  'Human', 'Alien', 'Humanoid', 'Robot', 'Animal', 
  'Cronenberg', 'Mythological Creature', 'Poopybutthole', 'unknown'
] as const
const ALLOWED_GENDER_VALUES = ['Male', 'Female', 'Genderless', 'unknown'] as const

const MAX_PAGE_NUMBER = 1000
const MAX_NAME_LENGTH = 100

interface CharacterResponse {
  data?: {
    characters: {
      info: {
        count: number
        pages: number
        next: number | null
        prev: number | null
      }
      results: Array<{
        id: string
        name: string
        status: string
        species: string
        type: string
        gender: string
        origin: { name: string }
        location: { name: string }
        image: string
        episode: Array<{ id: string }>
        created: string
      }>
    }
  }
  errors?: Array<{ message: string }>
}

interface FilterCharacter {
  name?: string
  status?: string
  species?: string
  type?: string
  gender?: string
}

interface RequestBody {
  page?: number | string
  filter?: FilterCharacter
}

interface ValidationError {
  field: string
  message: string
}

function validateFilter(filter: unknown): { valid: FilterCharacter | null; errors: ValidationError[] } {
  const errors: ValidationError[] = []
  
  if (filter === null || filter === undefined) {
    return { valid: null, errors: [] }
  }

  if (typeof filter !== 'object') {
    errors.push({ field: 'filter', message: 'Filter must be an object' })
    return { valid: null, errors }
  }

  const filterObj = filter as Record<string, unknown>
  const validFilter: FilterCharacter = {}

  if (filterObj.name !== undefined) {
    if (typeof filterObj.name !== 'string') {
      errors.push({ field: 'filter.name', message: 'Name must be a string' })
    } else if (filterObj.name.length > MAX_NAME_LENGTH) {
      errors.push({ field: 'filter.name', message: `Name must be at most ${MAX_NAME_LENGTH} characters` })
    } else if (filterObj.name.trim()) {
      validFilter.name = filterObj.name.trim().replace(/[<>]/g, '')
    }
  }

  if (filterObj.status !== undefined) {
    if (typeof filterObj.status !== 'string') {
      errors.push({ field: 'filter.status', message: 'Status must be a string' })
    } else if (filterObj.status && !ALLOWED_STATUS_VALUES.includes(filterObj.status as typeof ALLOWED_STATUS_VALUES[number])) {
      errors.push({ 
        field: 'filter.status', 
        message: `Status must be one of: ${ALLOWED_STATUS_VALUES.join(', ')}` 
      })
    } else if (filterObj.status) {
      validFilter.status = filterObj.status
    }
  }

  if (filterObj.species !== undefined) {
    if (typeof filterObj.species !== 'string') {
      errors.push({ field: 'filter.species', message: 'Species must be a string' })
    } else if (filterObj.species && !ALLOWED_SPECIES_VALUES.includes(filterObj.species as typeof ALLOWED_SPECIES_VALUES[number])) {
      errors.push({ 
        field: 'filter.species', 
        message: `Species must be one of: ${ALLOWED_SPECIES_VALUES.join(', ')}` 
      })
    } else if (filterObj.species) {
      validFilter.species = filterObj.species
    }
  }

  if (filterObj.gender !== undefined) {
    if (typeof filterObj.gender !== 'string') {
      errors.push({ field: 'filter.gender', message: 'Gender must be a string' })
    } else if (filterObj.gender && !ALLOWED_GENDER_VALUES.includes(filterObj.gender as typeof ALLOWED_GENDER_VALUES[number])) {
      errors.push({ 
        field: 'filter.gender', 
        message: `Gender must be one of: ${ALLOWED_GENDER_VALUES.join(', ')}` 
      })
    } else if (filterObj.gender) {
      validFilter.gender = filterObj.gender
    }
  }

  if (filterObj.type !== undefined) {
    if (typeof filterObj.type !== 'string') {
      errors.push({ field: 'filter.type', message: 'Type must be a string' })
    } else if (filterObj.type.length > MAX_NAME_LENGTH) {
      errors.push({ field: 'filter.type', message: `Type must be at most ${MAX_NAME_LENGTH} characters` })
    } else if (filterObj.type.trim()) {
      validFilter.type = filterObj.type.trim().replace(/[<>]/g, '')
    }
  }

  return { 
    valid: Object.keys(validFilter).length > 0 ? validFilter : null, 
    errors 
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as RequestBody
    const { page = 1, filter } = body

    const pageNum: number = parseInt(String(page), 10)
    if (isNaN(pageNum) || pageNum < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid page parameter. Must be a positive integer.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    if (pageNum > MAX_PAGE_NUMBER) {
      return new Response(
        JSON.stringify({ error: `Page number must be at most ${MAX_PAGE_NUMBER}.` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { valid: validFilter, errors: filterErrors } = validateFilter(filter)
    
    if (filterErrors.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid filter parameters', 
          details: filterErrors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GraphQL query
    const query: string = `
      query GetCharacters($page: Int!, $filter: FilterCharacter) {
        characters(page: $page, filter: $filter) {
          info {
            count
            pages
            next
            prev
          }
          results {
            id
            name
            status
            species
            type
            gender
            origin {
              name
            }
            location {
              name
            }
            image
            episode {
              id
            }
            created
          }
        }
      }
    `

    const response: Response = await fetch(RICK_AND_MORTY_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          page: pageNum,
          filter: validFilter
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`GraphQL API returned status: ${response.status}`)
    }

    const data: CharacterResponse = await response.json()

    if (data.errors && data.errors.length > 0) {
      return new Response(
        JSON.stringify({ error: data.errors[0].message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify(data.data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: unknown) {
    console.error('Error in get-characters function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
