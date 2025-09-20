import { get } from '@vercel/edge-config';

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
    const key = `court_${courtNumber}`;
    const data = await get<CourtData>(key);

    if (!data) {
      // Return default data if court doesn't exist in Edge Config
      return getDefaultCourtData(courtNumber);
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

// Note: Edge Config is read-only from the application side
// Updates need to be done through the Vercel API or dashboard
// For now, we'll provide placeholder functions that log the attempts

export async function updateCourt(courtData: CourtData): Promise<void> {
  console.log('Update request for court:', courtData.courtNumber, courtData);

  // Edge Config updates need to be done via Vercel API
  // For development, you can manually update via Vercel dashboard
  // In production, you'd need to implement API calls to update Edge Config

  throw new Error('Edge Config updates require Vercel API integration');
}

export async function resetAllCourts(): Promise<void> {
  console.log('Reset all courts requested');
  throw new Error('Edge Config updates require Vercel API integration');
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