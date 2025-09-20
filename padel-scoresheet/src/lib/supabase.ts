import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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