import { promises as fs } from 'fs';
import path from 'path';

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

const DATA_DIR = path.join(process.cwd(), 'data');

// Get file paths for a specific court
function getCourtPaths(courtNumber: number) {
  return {
    main: path.join(DATA_DIR, `court-${courtNumber}.json`),
    backup: path.join(DATA_DIR, `court-${courtNumber}-backup.json`),
    lock: path.join(DATA_DIR, `court-${courtNumber}.lock`)
  };
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Simple file locking mechanism per court
async function acquireLock(lockFile: string): Promise<boolean> {
  try {
    await fs.writeFile(lockFile, process.pid.toString(), { flag: 'wx' });
    return true;
  } catch {
    return false;
  }
}

async function releaseLock(lockFile: string): Promise<void> {
  try {
    await fs.unlink(lockFile);
  } catch {
    // Lock file already removed
  }
}

async function withCourtLock<T>(courtNumber: number, operation: () => Promise<T>): Promise<T> {
  const { lock } = getCourtPaths(courtNumber);
  let attempts = 0;
  const maxAttempts = 20; // 1 second max wait
  
  while (attempts < maxAttempts) {
    if (await acquireLock(lock)) {
      try {
        return await operation();
      } finally {
        await releaseLock(lock);
      }
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  throw new Error(`Could not acquire lock for court ${courtNumber} after 1 second`);
}

async function readCourtData(courtNumber: number): Promise<CourtData> {
  const { main, backup } = getCourtPaths(courtNumber);
  
  try {
    await ensureDataDir();
    const data = await fs.readFile(main, 'utf-8');
    const court = JSON.parse(data);
    
    // Validate data structure
    if (!court || court.courtNumber !== courtNumber) {
      throw new Error(`Invalid court data structure for court ${courtNumber}`);
    }
    
    return court;
  } catch (error) {
    console.error(`Error reading court ${courtNumber} data:`, error);
    
    // Try to read from backup
    try {
      const backupData = await fs.readFile(backup, 'utf-8');
      const court = JSON.parse(backupData);
      console.log(`Restored court ${courtNumber} from backup`);
      
      // Restore main file from backup
      await fs.writeFile(main, backupData);
      return court;
    } catch (backupError) {
      console.error(`Backup also failed for court ${courtNumber}, creating new data:`, backupError);
      
      // Initialize with default data
      const defaultData: CourtData = {
        courtNumber,
        leftTeam: { name: 'Team A', score: 0 },
        rightTeam: { name: 'Team B', score: 0 },
        upcomingLeft: '',
        upcomingRight: ''
      };
      
      await writeCourtData(defaultData);
      return defaultData;
    }
  }
}

async function writeCourtData(court: CourtData): Promise<void> {
  const { main, backup } = getCourtPaths(court.courtNumber);
  await ensureDataDir();
  
  // Add timestamp
  const timestampedCourt = {
    ...court,
    lastUpdated: new Date().toISOString()
  };
  
  const dataString = JSON.stringify(timestampedCourt, null, 2);
  
  // Write to both main and backup files
  await Promise.all([
    fs.writeFile(main, dataString),
    fs.writeFile(backup, dataString)
  ]);
}

// Public API functions
export async function getCourt(courtNumber: number): Promise<CourtData> {
  return await withCourtLock(courtNumber, () => readCourtData(courtNumber));
}

export async function getCourts(): Promise<CourtData[]> {
  // Read all courts in parallel - no need for global lock since each court has its own file
  const courtPromises = Array.from({ length: 6 }, (_, i) => getCourt(i + 1));
  return await Promise.all(courtPromises);
}

export async function updateCourt(courtData: CourtData): Promise<void> {
  await withCourtLock(courtData.courtNumber, async () => {
    await writeCourtData(courtData);
  });
}

export async function resetAllCourts(): Promise<void> {
  // Reset all courts in parallel
  const resetPromises = Array.from({ length: 6 }, async (_, i) => {
    const courtNumber = i + 1;
    return await withCourtLock(courtNumber, async () => {
      const court = await readCourtData(courtNumber);
      const resetCourt = {
        ...court,
        leftTeam: { ...court.leftTeam, score: 0 },
        rightTeam: { ...court.rightTeam, score: 0 }
      };
      await writeCourtData(resetCourt);
    });
  });
  
  await Promise.all(resetPromises);
}

// Health check function for a specific court
export async function checkCourtIntegrity(courtNumber: number): Promise<boolean> {
  try {
    const court = await getCourt(courtNumber);
    return court.courtNumber === courtNumber &&
           typeof court.leftTeam.score === 'number' &&
           typeof court.rightTeam.score === 'number';
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
  const courts = await getCourts();
  return JSON.stringify({
    exported: new Date().toISOString(),
    courts
  }, null, 2);
}