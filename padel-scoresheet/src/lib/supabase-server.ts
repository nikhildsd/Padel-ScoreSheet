import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey)

export type CourtRow = {
  id: number
  court_number: number
  left_team_name: string
  left_team_score: number
  right_team_name: string
  right_team_score: number
  upcoming_left: string
  upcoming_right: string
  last_updated: string
  created_at: string
}

export type SavedMatchRow = {
  id: number
  court_number: number
  left_team_name: string
  left_team_score: number
  right_team_name: string
  right_team_score: number
  upcoming_left: string
  upcoming_right: string
  notes: string | null
  saved_at: string
  created_at: string
}