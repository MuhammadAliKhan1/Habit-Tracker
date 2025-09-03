export interface Database {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          streak?: number
          created_at?: string
          updated_at?: string
        }
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_at: string
          date: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completed_at?: string
          date: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          completed_at?: string
          date?: string
        }
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
