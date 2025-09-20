import { NextResponse } from 'next/server'
import { getAllSavedMatches } from '@/lib/supabase-client'

export async function GET() {
  try {
    const savedMatches = await getAllSavedMatches()

    return NextResponse.json({
      success: true,
      data: savedMatches
    })
  } catch (error) {
    console.error('Error in history API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}