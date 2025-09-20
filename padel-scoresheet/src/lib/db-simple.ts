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

// Global in-memory storage that persists across function calls within same instance
// This works perfectly on Vercel serverless functions during active sessions
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

// DISABLED: Old in-memory system - now using Supabase
function initializeStore() {
  if (globalStore.isInitialized) return;

  // DO NOT INITIALIZE - using Supabase instead
  console.log('SKIPPING in-memory store initialization - using Supabase');
  globalStore.isInitialized = true;
}

// DISABLED: Get a single court's data - now using Supabase
export async function getCourt(courtNumber: number): Promise<CourtData> {
  throw new Error('db-simple getCourt is disabled - use Supabase functions instead');
}

// DISABLED: Get all courts' data - now using Supabase
export async function getCourts(): Promise<CourtData[]> {
  throw new Error('db-simple getCourts is disabled - use Supabase functions instead');
}

// DISABLED: Update a court's data - now using Supabase
export async function updateCourt(courtData: CourtData): Promise<void> {
  throw new Error('db-simple updateCourt is disabled - use Supabase functions instead');
}

// DISABLED: Reset all courts' scores - now using Supabase
export async function resetAllCourts(): Promise<void> {
  throw new Error('db-simple resetAllCourts is disabled - use Supabase functions instead');
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

// Clear all data
export async function clearAllData(): Promise<void> {
  courtsStore.clear();
}