import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCourts,
  getCourt,
  updateCourtScore,
  resetCourtScores,
  updateTeamName,
  updateUpcomingTeam,
  resetAllCourts
} from '@/lib/supabase-client';

// GET /api/courts - Get all courts or specific court
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get('courtId');

    if (courtId) {
      // Get specific court
      const id = parseInt(courtId);
      const court = await getCourt(id);

      if (!court) {
        return NextResponse.json({ success: false, error: 'Court not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: court
      });
    } else {
      // Get all courts
      const courts = await getAllCourts();

      return NextResponse.json({
        success: true,
        data: courts
      });
    }
  } catch (error) {
    console.error('Error in GET /api/courts:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/courts - Update court data or perform actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, courtNumber, side, name } = body;

    switch (action) {
      case 'incrementScore': {
        const success = await updateCourtScore(courtNumber, side, true);
        if (!success) {
          return NextResponse.json({ success: false, error: 'Failed to update score' }, { status: 500 });
        }

        const court = await getCourt(courtNumber);
        return NextResponse.json({ success: true, data: court });
      }

      case 'decrementScore': {
        const success = await updateCourtScore(courtNumber, side, false);
        if (!success) {
          return NextResponse.json({ success: false, error: 'Failed to update score' }, { status: 500 });
        }

        const court = await getCourt(courtNumber);
        return NextResponse.json({ success: true, data: court });
      }

      case 'resetScores': {
        const success = await resetCourtScores(courtNumber);
        if (!success) {
          return NextResponse.json({ success: false, error: 'Failed to reset scores' }, { status: 500 });
        }

        const court = await getCourt(courtNumber);
        return NextResponse.json({ success: true, data: court });
      }

      case 'updateTeamName': {
        if (!name || name.length > 20) {
          return NextResponse.json({ success: false, error: 'Team name must be 1-20 characters' }, { status: 400 });
        }

        const success = await updateTeamName(courtNumber, side, name);
        if (!success) {
          return NextResponse.json({ success: false, error: 'Failed to update team name' }, { status: 500 });
        }

        const court = await getCourt(courtNumber);
        return NextResponse.json({ success: true, data: court });
      }

      case 'updateUpcomingTeam': {
        if (name && name.length > 15) {
          return NextResponse.json({ success: false, error: 'Upcoming team name must be under 15 characters' }, { status: 400 });
        }

        const success = await updateUpcomingTeam(courtNumber, side, name || '');
        if (!success) {
          return NextResponse.json({ success: false, error: 'Failed to update upcoming team' }, { status: 500 });
        }

        const court = await getCourt(courtNumber);
        return NextResponse.json({ success: true, data: court });
      }

      case 'resetAllCourts': {
        const success = await resetAllCourts();
        if (!success) {
          return NextResponse.json({ success: false, error: 'Failed to reset all courts' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/courts:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}