import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { courtNumber, leftTeamName, rightTeamName } = await request.json()

    console.log('TEAMS API: Updating court', courtNumber, 'with names:', { leftTeamName, rightTeamName })

    const { data, error } = await supabaseServer
      .from('courts')
      .update({
        left_team_name: leftTeamName,
        right_team_name: rightTeamName,
        last_updated: new Date().toISOString()
      })
      .eq('court_number', courtNumber)
      .select()

    console.log('TEAMS API: Database response:', { data, error })

    if (error) {
      console.error('TEAMS API: Database error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    })
  } catch (error) {
    console.error('TEAMS API: Server error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}