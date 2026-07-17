/* Auto-generated shape — update bằng: pnpm supabase gen types typescript */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string           // = auth.users.id
          email: string
          display_name: string | null
          avatar_url: string | null
          plan: 'free' | 'trial' | 'basic' | 'pro' | 'lifetime'
          plan_expires_at: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      decks: {
        Row: {
          id: string; user_id: string; group_name: string | null
          name: string; book: string | null; unit: string | null
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['decks']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['decks']['Insert']>
        Relationships: []
      }
      cards: {
        Row: {
          id: string; user_id: string; deck_id: string
          phrase: string; meaning: string; example: string | null
          ipa_us: string | null; ipa_uk: string | null; pos: string | null
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['cards']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cards']['Insert']>
        Relationships: []
      }
      srs: {
        Row: {
          card_id: string; user_id: string
          ease: number; interval_days: number; reps: number; lapses: number
          due_at: string; last_reviewed_at: string | null
          state: 'new' | 'learning' | 'review'
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['srs']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['srs']['Insert']>
        Relationships: []
      }
      writing_docs: {
        Row: {
          id: string; user_id: string
          type: 'ielts' | 'master'; prompt: string; text: string
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['writing_docs']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['writing_docs']['Insert']>
        Relationships: []
      }
      ai_usage: {
        Row: {
          id: number; user_id: string
          day: string; feature: string; count: number; tokens: number
        }
        Insert: Omit<Database['public']['Tables']['ai_usage']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['ai_usage']['Insert']>
        Relationships: []
      }
      reading_exam_images: {
        Row: {
          id: string
          exam_id: string
          part_number: number
          slot: string
          item_index: number | null
          storage_path: string
          public_url: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          exam_id: string
          part_number: number
          slot: string
          item_index?: number | null
          storage_path: string
          public_url: string
          created_by?: string | null
        }
        Update: {
          exam_id?: string
          part_number?: number
          slot?: string
          item_index?: number | null
          storage_path?: string
          public_url?: string
          created_by?: string | null
        }
        Relationships: []
      }
      reading_exam_published: {
        Row: {
          id: string
          title: string
          duration_minutes: number
          band_hint: string | null
          parts: Record<string, unknown>[]
          exam_track: string | null
          cambridge_level: string | null
          source: string
          source_filename: string | null
          published_by: string | null
          published_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          duration_minutes: number
          band_hint?: string | null
          parts: Record<string, unknown>[]
          exam_track?: string | null
          cambridge_level?: string | null
          source?: string
          source_filename?: string | null
          published_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          duration_minutes?: number
          band_hint?: string | null
          parts?: Record<string, unknown>[]
          exam_track?: string | null
          cambridge_level?: string | null
          source?: string
          source_filename?: string | null
          published_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      listening_exam_published: {
        Row: {
          id: string
          title: string
          duration_minutes: number
          band_hint: string | null
          exam_type: string
          exam_mode: string
          parts: Record<string, unknown>[]
          source: string
          source_filename: string | null
          published_by: string | null
          published_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          duration_minutes: number
          band_hint?: string | null
          exam_type: string
          exam_mode?: string
          parts: Record<string, unknown>[]
          source?: string
          source_filename?: string | null
          published_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          duration_minutes?: number
          band_hint?: string | null
          exam_type?: string
          exam_mode?: string
          parts?: Record<string, unknown>[]
          source?: string
          source_filename?: string | null
          published_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_published_modules: {
        Row: {
          module: string
          payload: Record<string, unknown>
          item_count: number
          published_by: string | null
          updated_at: string
        }
        Insert: {
          module: string
          payload?: Record<string, unknown>
          item_count?: number
          published_by?: string | null
          updated_at?: string
        }
        Update: {
          module?: string
          payload?: Record<string, unknown>
          item_count?: number
          published_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_publish_meta: {
        Row: {
          id: string
          version: number
          modules: string[]
          published_by: string | null
          published_at: string
        }
        Insert: {
          id?: string
          version?: number
          modules?: string[]
          published_by?: string | null
          published_at?: string
        }
        Update: {
          id?: string
          version?: number
          modules?: string[]
          published_by?: string | null
          published_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      accept_legal_terms: {
        Args: { version: string }
        Returns: string
      }
    }
  }
}
