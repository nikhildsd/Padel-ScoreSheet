import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  try {
    console.log('DEBUG: Fetching raw court data from Supabase');

    const { data, error } = await supabaseServer
      .from('courts')
      .select('*')
      .order('court_number', { ascending: true })

    console.log('DEBUG: Raw Supabase response:', { data, error });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('DEBUG: Error in debug API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}