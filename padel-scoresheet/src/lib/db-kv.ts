import { kv } from '@vercel/kv';

export interface CourtData {
  courtNumber: number;
  leftTeam: {
    name: string;
    score: number;
  };
  rightTeam: {
    name: string;
    score: number;
  };
  upcomingLeft: string;
  upcomingRight: string;
  lastUpdated?: string;
}

// Get the key for a specific court
function getCourtKey(courtNumber: number): string {
  return `court:${courtNumber}`;
}

// Initialize default data for a court
function getDefaultCourtData(courtNumber: number): CourtData {
  return {
    courtNumber,
    leftTeam: { name: 'Team A', score: 0 },
    rightTeam: { name: 'Team B', score: 0 },
    upcomingLeft: '',
    upcomingRight: '',
    lastUpdated: new Date().toISOString()
  };
}

// Get a single court's data
export async function getCourt(courtNumber: number): Promise<CourtData> {
  try {
    const key = getCourtKey(courtNumber);
    const data = await kv.get<CourtData>(key);

    if (!data) {
      // Initialize with default data if court doesn't exist
      const defaultData = getDefaultCourtData(courtNumber);
      await updateCourt(defaultData);
      return defaultData;
    }

    return data;
  } catch (error) {
    console.error(`Error getting court ${courtNumber}:`, error);
    // Return default data as fallback
    return getDefaultCourtData(courtNumber);
  }
}

// Get all courts' data
export async function getCourts(): Promise<CourtData[]> {
  try {
    // Get all courts in parallel
    const courtPromises = Array.from({ length: 6 }, (_, i) => getCourt(i + 1));
    return await Promise.all(courtPromises);
  } catch (error) {
    console.error('Error getting all courts:', error);
    // Return default data for all courts as fallback
    return Array.from({ length: 6 }, (_, i) => getDefaultCourtData(i + 1));
  }
}

// Update a court's data
export async function updateCourt(courtData: CourtData): Promise<void> {
  try {
    const key = getCourtKey(courtData.courtNumber);
    const timestampedData = {
      ...courtData,
      lastUpdated: new Date().toISOString()
    };

    await kv.set(key, timestampedData);
  } catch (error) {
    console.error(`Error updating court ${courtData.courtNumber}:`, error);
    throw new Error(`Failed to update court ${courtData.courtNumber}`);
  }
}

// Reset all courts' scores
export async function resetAllCourts(): Promise<void> {
  try {
    const resetPromises = Array.from({ length: 6 }, async (_, i) => {
      const courtNumber = i + 1;
      const court = await getCourt(courtNumber);
      const resetCourt = {
        ...court,
        leftTeam: { ...court.leftTeam, score: 0 },
        rightTeam: { ...court.rightTeam, score: 0 }
      };
      await updateCourt(resetCourt);
    });

    await Promise.all(resetPromises);
  } catch (error) {
    console.error('Error resetting all courts:', error);
    throw new Error('Failed to reset all courts');
  }
}

// Health check for a specific court
export async function checkCourtIntegrity(courtNumber: number): Promise<boolean> {
  try {
    const court = await getCourt(courtNumber);
    return court.courtNumber === courtNumber &&
           typeof court.leftTeam.score === 'number' &&
           typeof court.rightTeam.score === 'number' &&
           court.leftTeam.score >= 0 &&
           court.rightTeam.score >= 0;
  } catch {
    return false;
  }
}

// Health check for all courts
export async function checkDataIntegrity(): Promise<boolean> {
  try {
    const healthChecks = Array.from({ length: 6 }, (_, i) => checkCourtIntegrity(i + 1));
    const results = await Promise.all(healthChecks);
    return results.every(result => result);
  } catch {
    return false;
  }
}

// Export data for tournament backup
export async function exportTournamentData(): Promise<string> {
  try {
    const courts = await getCourts();
    return JSON.stringify({
      exported: new Date().toISOString(),
      courts
    }, null, 2);
  } catch (error) {
    console.error('Error exporting tournament data:', error);
    throw new Error('Failed to export tournament data');
  }
}

// Clear all data (useful for development/testing)
export async function clearAllData(): Promise<void> {
  try {
    const deletePromises = Array.from({ length: 6 }, (_, i) => {
      const key = getCourtKey(i + 1);
      return kv.del(key);
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw new Error('Failed to clear all data');
  }
}