import { NextRequest, NextResponse } from 'next/server';
import { CourtData } from '@/lib/db-simple';

// Global in-memory storage - this will persist within this API route's instance
interface GlobalStore {
  courtsStore?: Map<number, CourtData>;
  isInitialized?: boolean;
}

const globalStore = globalThis as unknown as GlobalStore;

if (!globalStore.courtsStore) {
  globalStore.courtsStore = new Map<number, CourtData>();
  globalStore.isInitialized = false;
}

const courtsStore: Map<number, CourtData> = globalStore.courtsStore;

// Initialize store with default data (only once per serverless instance)
function initializeStore() {
  if (globalStore.isInitialized) return;

  // Initialize with default data
  for (let i = 1; i <= 6; i++) {
    courtsStore.set(i, {
      courtNumber: i,
      leftTeam: { name: 'Team A', score: 0 },
      rightTeam: { name: 'Team B', score: 0 },
      upcomingLeft: '',
      upcomingRight: '',
      lastUpdated: new Date().toISOString()
    });
  }

  globalStore.isInitialized = true;
  console.log('Initialized court data store via API');
}

// GET /api/courts - Get all courts or specific court
export async function GET(request: NextRequest) {
  try {
    initializeStore();

    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get('courtId');

    if (courtId) {
      // Get specific court
      const id = parseInt(courtId);
      const court = courtsStore.get(id);

      if (!court) {
        return NextResponse.json({ success: false, error: 'Court not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: court });
    } else {
      // Get all courts
      const courts: CourtData[] = [];
      for (let i = 1; i <= 6; i++) {
        const court = courtsStore.get(i);
        if (court) {
          courts.push(court);
        }
      }

      return NextResponse.json({ success: true, data: courts });
    }
  } catch (error) {
    console.error('Error in GET /api/courts:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/courts - Update court data or perform actions
export async function POST(request: NextRequest) {
  try {
    initializeStore();

    const body = await request.json();
    const { action, courtNumber, side, name, courtData } = body;

    switch (action) {
      case 'incrementScore': {
        const court = courtsStore.get(courtNumber);
        if (!court) {
          return NextResponse.json({ success: false, error: 'Court not found' }, { status: 404 });
        }

        if (side === 'left') {
          court.leftTeam.score = Math.min(99, court.leftTeam.score + 1);
        } else if (side === 'right') {
          court.rightTeam.score = Math.min(99, court.rightTeam.score + 1);
        }

        court.lastUpdated = new Date().toISOString();
        courtsStore.set(courtNumber, court);

        return NextResponse.json({ success: true, data: court });
      }

      case 'decrementScore': {
        const court = courtsStore.get(courtNumber);
        if (!court) {
          return NextResponse.json({ success: false, error: 'Court not found' }, { status: 404 });
        }

        if (side === 'left') {
          court.leftTeam.score = Math.max(0, court.leftTeam.score - 1);
        } else if (side === 'right') {
          court.rightTeam.score = Math.max(0, court.rightTeam.score - 1);
        }

        court.lastUpdated = new Date().toISOString();
        courtsStore.set(courtNumber, court);

        return NextResponse.json({ success: true, data: court });
      }

      case 'resetScores': {
        const court = courtsStore.get(courtNumber);
        if (!court) {
          return NextResponse.json({ success: false, error: 'Court not found' }, { status: 404 });
        }

        court.leftTeam.score = 0;
        court.rightTeam.score = 0;
        court.lastUpdated = new Date().toISOString();
        courtsStore.set(courtNumber, court);

        return NextResponse.json({ success: true, data: court });
      }

      case 'updateTeamName': {
        const court = courtsStore.get(courtNumber);
        if (!court) {
          return NextResponse.json({ success: false, error: 'Court not found' }, { status: 404 });
        }

        if (!name || name.length > 20) {
          return NextResponse.json({ success: false, error: 'Team name must be 1-20 characters' }, { status: 400 });
        }

        if (side === 'left') {
          court.leftTeam.name = name.trim();
        } else if (side === 'right') {
          court.rightTeam.name = name.trim();
        }

        court.lastUpdated = new Date().toISOString();
        courtsStore.set(courtNumber, court);

        return NextResponse.json({ success: true, data: court });
      }

      case 'updateUpcomingTeam': {
        const court = courtsStore.get(courtNumber);
        if (!court) {
          return NextResponse.json({ success: false, error: 'Court not found' }, { status: 404 });
        }

        if (name && name.length > 15) {
          return NextResponse.json({ success: false, error: 'Upcoming team name must be under 15 characters' }, { status: 400 });
        }

        if (side === 'left') {
          court.upcomingLeft = name ? name.trim() : '';
        } else if (side === 'right') {
          court.upcomingRight = name ? name.trim() : '';
        }

        court.lastUpdated = new Date().toISOString();
        courtsStore.set(courtNumber, court);

        return NextResponse.json({ success: true, data: court });
      }

      case 'updateCourt': {
        if (!courtData) {
          return NextResponse.json({ success: false, error: 'Court data required' }, { status: 400 });
        }

        const timestampedData = {
          ...courtData,
          lastUpdated: new Date().toISOString()
        };

        courtsStore.set(courtData.courtNumber, timestampedData);

        return NextResponse.json({ success: true, data: timestampedData });
      }

      case 'resetAllCourts': {
        for (let i = 1; i <= 6; i++) {
          const court = courtsStore.get(i);
          if (court) {
            court.leftTeam.score = 0;
            court.rightTeam.score = 0;
            court.lastUpdated = new Date().toISOString();
            courtsStore.set(i, court);
          }
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