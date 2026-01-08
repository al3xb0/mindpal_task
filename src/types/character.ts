export interface CharacterLocation {
  name: string
}

export interface Episode {
  id: string
}

export interface Character {
  id: string
  name: string
  status: 'Alive' | 'Dead' | 'unknown'
  species: string
  type: string
  gender: string
  origin: CharacterLocation
  location: CharacterLocation
  image: string
  episode: Episode[]
  created: string
}

export interface CharactersInfo {
  count: number
  pages: number
  next: number | null
  prev: number | null
}

export interface CharactersResponse {
  characters: {
    info: CharactersInfo
    results: Character[]
  }
}

export interface CharacterFilter {
  name?: string
  status?: string
  species?: string
}
