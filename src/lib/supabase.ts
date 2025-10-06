import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типы для базы данных
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          telegram_id: number
          username: string | null
          first_name: string
          last_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          telegram_id: number
          username?: string | null
          first_name: string
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          telegram_id?: number
          username?: string | null
          first_name?: string
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          user_id: string
          card_number: string
          holder_name: string
          expiry_date: string
          cvv: string
          balance: number
          status: 'active' | 'blocked' | 'pending'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_number: string
          holder_name: string
          expiry_date: string
          cvv: string
          balance?: number
          status?: 'active' | 'blocked' | 'pending'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_number?: string
          holder_name?: string
          expiry_date?: string
          cvv?: string
          balance?: number
          status?: 'active' | 'blocked' | 'pending'
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          card_id: string
          user_id: string
          type: 'topup' | 'payment' | 'card_creation' | 'withdrawal'
          amount: number
          description: string
          status: 'pending' | 'completed' | 'failed'
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          card_id: string
          user_id: string
          type: 'topup' | 'payment' | 'card_creation' | 'withdrawal'
          amount: number
          description: string
          status?: 'pending' | 'completed' | 'failed'
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          user_id?: string
          type?: 'topup' | 'payment' | 'card_creation' | 'withdrawal'
          amount?: number
          description?: string
          status?: 'pending' | 'completed' | 'failed'
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
