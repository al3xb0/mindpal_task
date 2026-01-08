export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      favorite_characters: {
        Row: {
          id: string
          user_id: string
          character_id: number
          character_name: string
          character_image: string | null
          character_status: string | null
          character_species: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          character_id: number
          character_name: string
          character_image?: string | null
          character_status?: string | null
          character_species?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          character_id?: number
          character_name?: string
          character_image?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_characters_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type FavoriteCharacter = Database['public']['Tables']['favorite_characters']['Row']
export type InsertFavoriteCharacter = Database['public']['Tables']['favorite_characters']['Insert']
