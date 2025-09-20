import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('UPDATE-NAMES API: Request body:', body)

    const { courtNumber, leftName, rightName } = body

    // Direct database update - no complex logic
    const { data, error } = await supabaseServer
      .from('courts')
      .update({
        left_team_name: leftName,
        right_team_name: rightName,
        last_updated: new Date().toISOString()
      })
      .eq('court_number', courtNumber)
      .select()

    console.log('UPDATE-NAMES API: Database result:', { data, error })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error('UPDATE-NAMES API: Error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}