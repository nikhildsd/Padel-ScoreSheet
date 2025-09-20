import { supabaseServer, CourtRow } from './supabase-server'
import { CourtData } from './db-simple'

// Convert database row to frontend format
function rowToCourtData(row: CourtRow): CourtData {
  return {
    courtNumber: row.court_number,
    leftTeam: {
      name: row.left_team_name,
      score: row.left_team_score
    },
    rightTeam: {
      name: row.right_team_name,
      score: row.right_team_score
    },
    upcomingLeft: row.upcoming_left,
    upcomingRight: row.upcoming_right,
    lastUpdated: row.last_updated
  }
}


export async function getAllCourts(): Promise<CourtData[]> {
  const { data, error } = await supabaseServer
    .from('courts')
    .select('*')
    .order('court_number', { ascending: true })

  if (error) {
    console.error('Error fetching courts:', error)
    throw error
  }

  return data.map(rowToCourtData)
}

export async function getCourt(courtNumber: number): Promise<CourtData | null> {
  const { data, error } = await supabaseServer
    .from('courts')
    .select('*')
    .eq('court_number', courtNumber)
    .single()

  if (error) {
    console.error('Error fetching court:', error)
    return null
  }

  return rowToCourtData(data)
}

export async function updateCourtScore(courtNumber: number, side: 'left' | 'right', increment: boolean): Promise<boolean> {
  // First get current score
  const court = await getCourt(courtNumber)
  if (!court) return false

  const currentScore = side === 'left' ? court.leftTeam.score : court.rightTeam.score
  const newScore = increment
    ? Math.min(99, currentScore + 1)
    : Math.max(0, currentScore - 1)

  const updateField = side === 'left' ? 'left_team_score' : 'right_team_score'

  const { error } = await supabaseServer
    .from('courts')
    .update({
      [updateField]: newScore,
      last_updated: new Date().toISOString()
    })
    .eq('court_number', courtNumber)

  if (error) {
    console.error('Error updating score:', error)
    return false
  }

  return true
}

export async function resetCourtScores(courtNumber: number): Promise<boolean> {
  const { error } = await supabaseServer
    .from('courts')
    .update({
      left_team_score: 0,
      right_team_score: 0,
      last_updated: new Date().toISOString()
    })
    .eq('court_number', courtNumber)

  if (error) {
    console.error('Error resetting scores:', error)
    return false
  }

  return true
}

export async function updateTeamName(courtNumber: number, side: 'left' | 'right', name: string): Promise<boolean> {
  const updateField = side === 'left' ? 'left_team_name' : 'right_team_name'

  const { error } = await supabaseServer
    .from('courts')
    .update({
      [updateField]: name.trim(),
      last_updated: new Date().toISOString()
    })
    .eq('court_number', courtNumber)

  if (error) {
    console.error('Error updating team name:', error)
    return false
  }

  return true
}

export async function updateUpcomingTeam(courtNumber: number, side: 'left' | 'right', name: string): Promise<boolean> {
  const updateField = side === 'left' ? 'upcoming_left' : 'upcoming_right'

  const { error } = await supabaseServer
    .from('courts')
    .update({
      [updateField]: name.trim(),
      last_updated: new Date().toISOString()
    })
    .eq('court_number', courtNumber)

  if (error) {
    console.error('Error updating upcoming team:', error)
    return false
  }

  return true
}

export async function resetAllCourts(): Promise<boolean> {
  const { error } = await supabaseServer
    .from('courts')
    .update({
      left_team_score: 0,
      right_team_score: 0,
      last_updated: new Date().toISOString()
    })
    .neq('court_number', 0) // Update all courts

  if (error) {
    console.error('Error resetting all courts:', error)
    return false
  }

  return true
}