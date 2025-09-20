import { NextRequest, NextResponse } from 'next/server'
import { saveMatch } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { courtNumber } = await request.json()

    if (!courtNumber || typeof courtNumber !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Court number is required' },
        { status: 400 }
      )
    }

    const success = await saveMatch(courtNumber)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save match' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in save match API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}