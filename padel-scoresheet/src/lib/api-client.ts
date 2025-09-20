import { CourtData } from './db-simple';

const API_BASE = '/api/courts';

export async function checkGlobalLock(): Promise<{ isLocked: boolean; lockTimestamp: number }> {
  try {
    const response = await fetch(`${API_BASE}?checkLock=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!result.success) {
      return { isLocked: false, lockTimestamp: 0 };
    }

    return result.data;
  } catch (error) {
    console.error('Error checking global lock:', error);
    return { isLocked: false, lockTimestamp: 0 };
  }
}

export async function getCourtData(): Promise<CourtData[]> {
  try {
    const response = await fetch(API_BASE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch courts');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching court data:', error);
    // Return default data as fallback
    return Array.from({ length: 6 }, (_, i) => ({
      courtNumber: i + 1,
      leftTeam: { name: 'Team A', score: 0 },
      rightTeam: { name: 'Team B', score: 0 },
      upcomingLeft: '',
      upcomingRight: ''
    }));
  }
}

export async function getSingleCourtData(courtNumber: number): Promise<{ success: boolean; data?: CourtData; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}?courtId=${courtNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to fetch court' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error fetching court ${courtNumber} data:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

interface ApiResponse {
  success: boolean;
  error?: string;
  isLocked?: boolean;
}

async function handleApiResponse(response: Response): Promise<ApiResponse> {
  const result = await response.json();

  if (response.status === 423) {
    return { success: false, error: result.error || 'System is locked', isLocked: true };
  }

  return { success: result.success, error: result.error, isLocked: result.isLocked };
}

export async function incrementScore(courtNumber: number, side: 'left' | 'right'): Promise<ApiResponse> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'incrementScore',
        courtNumber,
        side
      }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error incrementing score:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update score' };
  }
}

export async function decrementScore(courtNumber: number, side: 'left' | 'right'): Promise<ApiResponse> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'decrementScore',
        courtNumber,
        side
      }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error decrementing score:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update score' };
  }
}

export async function resetCourtScores(courtNumber: number): Promise<ApiResponse> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'resetScores',
        courtNumber
      }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error resetting scores:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reset scores' };
  }
}

export async function updateTeamName(courtNumber: number, side: 'left' | 'right', name: string): Promise<ApiResponse> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateTeamName',
        courtNumber,
        side,
        name
      }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error updating team name:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update team name' };
  }
}

export async function updateUpcomingTeam(courtNumber: number, side: 'left' | 'right', name: string): Promise<ApiResponse> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateUpcomingTeam',
        courtNumber,
        side,
        name
      }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error updating upcoming team:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update upcoming team' };
  }
}

export async function resetAllCourtScores(): Promise<ApiResponse> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'resetAllCourts'
      }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error resetting all scores:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reset all scores' };
  }
}