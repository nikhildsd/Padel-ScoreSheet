import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Jamie', 'Avery',
  'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jesse', 'Kai',
  'Logan', 'Micah', 'Noah', 'Parker', 'Quinn', 'Reese', 'Sage', 'Skyler',
  'Tanner', 'Val', 'Wren', 'Zion', 'Aria', 'Brook', 'Charlie', 'Dana',
  'Ellis', 'Frankie', 'Gray', 'Harper', 'Indigo', 'Jules', 'Kendall', 'Lane',
  'Max', 'Nico', 'Ocean', 'Phoenix', 'River', 'Storm', 'True', 'Winter'
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell'
]

const UPCOMING_NAMES = [
  'Next Player', 'Waiting', 'Queue A', 'Queue B', 'Standby', 'Reserve',
  'Next Up', 'On Deck', 'Ready', 'Pending', 'Listed', 'Scheduled'
]

function getRandomName(names: string[]): string {
  return names[Math.floor(Math.random() * names.length)]
}

function getRandomPersonName(): string {
  const firstName = getRandomName(FIRST_NAMES)
  const lastName = getRandomName(LAST_NAMES)
  return `${firstName} ${lastName}`
}

function getRandomScore(): number {
  return Math.floor(Math.random() * 11) // 0-10
}

export async function POST() {
  try {
    console.log('POPULATE-TEST-DATA: Starting random data population...')

    // Update all 6 courts with random data
    for (let courtNumber = 1; courtNumber <= 6; courtNumber++) {
      const leftTeamName = getRandomPersonName()
      const rightTeamName = getRandomPersonName()
      const leftScore = getRandomScore()
      const rightScore = getRandomScore()
      const upcomingLeft = getRandomPersonName()
      const upcomingRight = getRandomPersonName()

      const { data, error } = await supabaseServer
        .from('courts')
        .update({
          left_team_name: leftTeamName,
          right_team_name: rightTeamName,
          left_team_score: leftScore,
          right_team_score: rightScore,
          upcoming_left: upcomingLeft,
          upcoming_right: upcomingRight,
          last_updated: new Date().toISOString()
        })
        .eq('court_number', courtNumber)
        .select()

      if (error) {
        console.error(`POPULATE-TEST-DATA: Error updating court ${courtNumber}:`, error)
        return NextResponse.json({
          success: false,
          error: `Failed to update court ${courtNumber}: ${error.message}`
        }, { status: 500 })
      }

      console.log(`POPULATE-TEST-DATA: Updated court ${courtNumber}:`, {
        leftTeam: `${leftTeamName} (${leftScore})`,
        rightTeam: `${rightTeamName} (${rightScore})`,
        upcoming: `${upcomingLeft} vs ${upcomingRight}`
      })
    }

    return NextResponse.json({
      success: true,
      message: 'All courts populated with random test data!',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('POPULATE-TEST-DATA: Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}