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
  console.log('Initialized court data store');
}

// Get a single court's data
export async function getCourt(courtNumber: number): Promise<CourtData> {
  initializeStore();

  const court = courtsStore.get(courtNumber);
  if (!court) {
    // This shouldn't happen with our initialization, but just in case
    const defaultCourt = {
      courtNumber,
      leftTeam: { name: 'Team A', score: 0 },
      rightTeam: { name: 'Team B', score: 0 },
      upcomingLeft: '',
      upcomingRight: '',
      lastUpdated: new Date().toISOString()
    };
    courtsStore.set(courtNumber, defaultCourt);
    return defaultCourt;
  }

  return court;
}

// Get all courts' data
export async function getCourts(): Promise<CourtData[]> {
  initializeStore();

  const courts: CourtData[] = [];
  for (let i = 1; i <= 6; i++) {
    const court = courtsStore.get(i);
    if (court) {
      courts.push(court);
    }
  }
  return courts;
}

// Update a court's data
export async function updateCourt(courtData: CourtData): Promise<void> {
  initializeStore();

  const timestampedData = {
    ...courtData,
    lastUpdated: new Date().toISOString()
  };

  courtsStore.set(courtData.courtNumber, timestampedData);
}

// Reset all courts' scores
export async function resetAllCourts(): Promise<void> {
  initializeStore();

  for (let i = 1; i <= 6; i++) {
    const court = courtsStore.get(i);
    if (court) {
      const resetCourt = {
        ...court,
        leftTeam: { ...court.leftTeam, score: 0 },
        rightTeam: { ...court.rightTeam, score: 0 },
        lastUpdated: new Date().toISOString()
      };
      courtsStore.set(i, resetCourt);
    }
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

// Clear all data
export async function clearAllData(): Promise<void> {
  courtsStore.clear();
}