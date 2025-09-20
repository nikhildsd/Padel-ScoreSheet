'use server';

import { revalidatePath } from 'next/cache';
import {
  getCourts,
  getCourt,
  updateCourt,
  resetAllCourts,
  CourtData,
  checkDataIntegrity,
  checkCourtIntegrity,
  exportTournamentData
} from './db-kv';

export async function getCourtData(): Promise<CourtData[]> {
  try {
    const courts = await getCourts();
    return courts;
  } catch (error) {
    console.error('Error getting court data:', error);
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
    const court = await getCourt(courtNumber);
    return { success: true, data: court };
  } catch (error) {
    console.error(`Error getting court ${courtNumber} data:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateCourtData(courtData: CourtData): Promise<{ success: boolean; error?: string }> {
  try {
    await updateCourt(courtData);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating court data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function incrementScore(courtNumber: number, side: 'left' | 'right'): Promise<{ success: boolean; error?: string }> {
  try {
    const court = await getCourt(courtNumber);

    if (side === 'left') {
      court.leftTeam.score = Math.min(99, court.leftTeam.score + 1); // Max score limit
    } else {
      court.rightTeam.score = Math.min(99, court.rightTeam.score + 1);
    }

    await updateCourt(court);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error incrementing score:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update score' };
  }
}

export async function decrementScore(courtNumber: number, side: 'left' | 'right'): Promise<{ success: boolean; error?: string }> {
  try {
    const court = await getCourt(courtNumber);

    if (side === 'left') {
      court.leftTeam.score = Math.max(0, court.leftTeam.score - 1);
    } else {
      court.rightTeam.score = Math.max(0, court.rightTeam.score - 1);
    }

    await updateCourt(court);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error decrementing score:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update score' };
  }
}

export async function resetCourtScores(courtNumber: number): Promise<{ success: boolean; error?: string }> {
  try {
    const court = await getCourt(courtNumber);

    court.leftTeam.score = 0;
    court.rightTeam.score = 0;

    await updateCourt(court);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error resetting scores:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reset scores' };
  }
}

export async function updateTeamName(courtNumber: number, side: 'left' | 'right', name: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    if (!name.trim() || name.length > 20) {
      return { success: false, error: 'Team name must be 1-20 characters' };
    }

    const court = await getCourt(courtNumber);

    if (side === 'left') {
      court.leftTeam.name = name.trim();
    } else {
      court.rightTeam.name = name.trim();
    }

    await updateCourt(court);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating team name:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update team name' };
  }
}

export async function updateUpcomingTeam(courtNumber: number, side: 'left' | 'right', name: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    if (name.length > 15) {
      return { success: false, error: 'Upcoming team name must be under 15 characters' };
    }

    const court = await getCourt(courtNumber);

    if (side === 'left') {
      court.upcomingLeft = name.trim();
    } else {
      court.upcomingRight = name.trim();
    }

    await updateCourt(court);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating upcoming team:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update upcoming team' };
  }
}

export async function resetAllCourtScores(): Promise<{ success: boolean; error?: string }> {
  try {
    await resetAllCourts();
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error resetting all scores:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reset all scores' };
  }
}

// Tournament management functions
export async function exportData(): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const data = await exportTournamentData();
    return { success: true, data };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to export data' };
  }
}

export async function healthCheck(): Promise<{ success: boolean; message: string }> {
  try {
    const isHealthy = await checkDataIntegrity();
    return {
      success: isHealthy,
      message: isHealthy ? 'All systems operational' : 'Data integrity issues detected'
    };
  } catch (error) {
    return {
      success: false,
      message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function healthCheckCourt(courtNumber: number): Promise<{ success: boolean; message: string }> {
  try {
    const isHealthy = await checkCourtIntegrity(courtNumber);
    return {
      success: isHealthy,
      message: isHealthy ? `Court ${courtNumber} operational` : `Court ${courtNumber} has issues`
    };
  } catch (error) {
    return {
      success: false,
      message: `Court ${courtNumber} health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}