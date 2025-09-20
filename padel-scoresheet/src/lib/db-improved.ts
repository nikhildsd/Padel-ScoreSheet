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

const DB_FILE = path.join(process.cwd(), 'data', 'courts.json');
const BACKUP_FILE = path.join(process.cwd(), 'data', 'courts-backup.json');
const LOCK_FILE = path.join(process.cwd(), 'data', 'courts.lock');

async function ensureDataDir() {
  const dataDir = path.dirname(DB_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Simple file locking mechanism
async function acquireLock(): Promise<boolean> {
  try {
    await fs.writeFile(LOCK_FILE, process.pid.toString(), { flag: 'wx' });
    return true;
  } catch {
    // Lock exists, wait and retry
    await new Promise(resolve => setTimeout(resolve, 50));
    return false;
  }
}

async function releaseLock(): Promise<void> {
  try {
    await fs.unlink(LOCK_FILE);
  } catch {
    // Lock file already removed
  }
}

async function withLock<T>(operation: () => Promise<T>): Promise<T> {
  let attempts = 0;
  const maxAttempts = 20; // 1 second max wait
  
  while (attempts < maxAttempts) {
    if (await acquireLock()) {
      try {
        return await operation();
      } finally {
        await releaseLock();
      }
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  throw new Error('Could not acquire file lock after 1 second');
}

async function readCourtsData(): Promise<CourtData[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DB_FILE, 'utf-8');
    const courts = JSON.parse(data);
    
    // Validate data structure
    if (!Array.isArray(courts) || courts.length !== 6) {
      throw new Error('Invalid courts data structure');
    }
    
    return courts;
  } catch (error) {
    console.error('Error reading courts data:', error);
    
    // Try to read from backup
    try {
      const backupData = await fs.readFile(BACKUP_FILE, 'utf-8');
      const courts = JSON.parse(backupData);
      console.log('Restored from backup');
      
      // Restore main file from backup
      await fs.writeFile(DB_FILE, backupData);
      return courts;
    } catch (backupError) {
      console.error('Backup also failed, creating new data:', backupError);
      
      // Initialize with default data
      const defaultData: CourtData[] = Array.from({ length: 6 }, (_, i) => ({
        courtNumber: i + 1,
        leftTeam: { name: 'Team A', score: 0 },
        rightTeam: { name: 'Team B', score: 0 },
        upcomingLeft: '',
        upcomingRight: ''
      }));
      
      await writeCourtsData(defaultData);
      return defaultData;
    }
  }
}

async function writeCourtsData(courts: CourtData[]): Promise<void> {
  await ensureDataDir();
  
  // Add timestamp to all courts
  const timestampedCourts = courts.map(court => ({
    ...court,
    lastUpdated: new Date().toISOString()
  }));
  
  const dataString = JSON.stringify(timestampedCourts, null, 2);
  
  // Write to both main and backup files
  await Promise.all([
    fs.writeFile(DB_FILE, dataString),
    fs.writeFile(BACKUP_FILE, dataString)
  ]);
}

export async function getCourts(): Promise<CourtData[]> {
  return await withLock(readCourtsData);
}

export async function getCourt(courtNumber: number): Promise<CourtData> {
  const courts = await getCourts();
  const court = courts.find(c => c.courtNumber === courtNumber);

  if (!court) {
    throw new Error(`Court ${courtNumber} not found`);
  }

  return court;
}

export async function updateCourt(courtData: CourtData): Promise<void> {
  await withLock(async () => {
    const courts = await readCourtsData();
    const index = courts.findIndex(c => c.courtNumber === courtData.courtNumber);
    
    if (index !== -1) {
      courts[index] = {
        ...courtData,
        lastUpdated: new Date().toISOString()
      };
      await writeCourtsData(courts);
    }
  });
}

export async function resetAllCourts(): Promise<void> {
  await withLock(async () => {
    const courts = await readCourtsData();
    const resetCourts = courts.map(court => ({
      ...court,
      leftTeam: { ...court.leftTeam, score: 0 },
      rightTeam: { ...court.rightTeam, score: 0 },
      lastUpdated: new Date().toISOString()
    }));
    await writeCourtsData(resetCourts);
  });
}

// Health check function
export async function checkDataIntegrity(): Promise<boolean> {
  try {
    const courts = await getCourts();
    return courts.length === 6 && courts.every(court =>
      court.courtNumber >= 1 &&
      court.courtNumber <= 6 &&
      typeof court.leftTeam.score === 'number' &&
      typeof court.rightTeam.score === 'number'
    );
  } catch {
    return false;
  }
}

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

// Export data for tournament backup
export async function exportTournamentData(): Promise<string> {
  const courts = await getCourts();
  return JSON.stringify({
    exported: new Date().toISOString(),
    courts
  }, null, 2);
}