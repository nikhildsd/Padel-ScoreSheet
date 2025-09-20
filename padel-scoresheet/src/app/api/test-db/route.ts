import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  try {
    console.log('TEST-DB: Starting database test...')

    // First, let's see what's currently in the database
    const { data: beforeData, error: beforeError } = await supabaseServer
      .from('courts')
      .select('*')
      .eq('court_number', 1)
      .single()

    console.log('TEST-DB: Before update:', { beforeData, beforeError })

    // Try a simple update
    const { data: updateData, error: updateError } = await supabaseServer
      .from('courts')
      .update({
        right_team_name: 'TEST-' + Date.now(),
        last_updated: new Date().toISOString()
      })
      .eq('court_number', 1)
      .select()

    console.log('TEST-DB: Update result:', { updateData, updateError })

    // Check what's in the database after the update
    const { data: afterData, error: afterError } = await supabaseServer
      .from('courts')
      .select('*')
      .eq('court_number', 1)
      .single()

    console.log('TEST-DB: After update:', { afterData, afterError })

    return NextResponse.json({
      success: true,
      before: beforeData,
      updateResult: updateData,
      after: afterData,
      errors: {
        beforeError,
        updateError,
        afterError
      }
    })
  } catch (error) {
    console.error('TEST-DB: Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}