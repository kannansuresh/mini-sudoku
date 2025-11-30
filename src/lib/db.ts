import Dexie, { type EntityTable } from 'dexie';

export const GameStatus = {
  NotStarted: "Not Started",
  InProgress: "In Progress",
  Completed: "Completed",
  Abandoned: "Abandoned"
} as const;
export type GameStatus = typeof GameStatus[keyof typeof GameStatus];

export const DefaultGameMode = {
  Standard: "Standard",
  Daily: "Daily"
} as const;
export type DefaultGameMode = typeof DefaultGameMode[keyof typeof DefaultGameMode];

export const Difficulty = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard"
} as const;
export type Difficulty = typeof Difficulty[keyof typeof Difficulty];

export const GameType = {
  Daily: "Daily",
  Standard: "Standard",
  Custom: "Custom"
} as const;
export type GameType = typeof GameType[keyof typeof GameType];

export const AutocheckModes = {
  Off: "Off",
  Conflicts: "Conflicts",
  Mistakes: "Mistakes"
} as const;
export type AutocheckModes = typeof AutocheckModes[keyof typeof AutocheckModes];

export interface Player {
  id: number;
  userName: string;
  displayName: string;
}

export interface Settings {
  id?: number;
  player: number; // ref to Player.id
  showTimer: boolean;
  defaultMode: DefaultGameMode;
  defaultDifficulty: Difficulty;
  autoCheck: AutocheckModes;
  highlightSections: boolean;
  remainingCount: boolean;
  showAvailablePlacements: boolean;
  hideFilledNumbers: boolean;
  skipStartBanner: boolean;
  notesMode: boolean; // Preserving this from old settings
  theme: 'dark' | 'light' | 'system';
}

export interface GameSession {
  id?: number;
  player: number; // ref to Player.id
  type: GameType;
  name?: string; // Nullable, used for Custom games

  // Game State
  status: GameStatus;
  difficulty: Difficulty;
  elapsedTime: number;

  // Grid Data: JSON stringified Grid (number[][])
  initialState: string;
  currentProgress: string;
  notes: string; // JSON stringified Record<string, number[]>

  // Metrics
  mistakes: number;
  score: number;

  // Dates
  targetDate?: Date; // Used for Daily Challenges
  startedAt: Date;
  completedOn?: Date;
}

const db = new Dexie('MiniSudokuDB') as Dexie & {
  players: EntityTable<Player, 'id'>;
  settings: EntityTable<Settings, 'id'>;
  gameSessions: EntityTable<GameSession, 'id'>;
};

// Schema definition
db.version(1).stores({
  players: '++id, &userName',
  settings: '++id, player',
  gameSessions: '++id, player, type, targetDate, status'
});

export const initDB = async () => {
  try {
    return await db.transaction('rw', db.players, db.settings, async () => {
      // Check if Guest player exists
      let guest = await db.players.where('userName').equals('guest').first();

      if (!guest) {
        const guestId = await db.players.add({
          userName: 'guest',
          displayName: 'Guest'
        });
        guest = { id: guestId, userName: 'guest', displayName: 'Guest' };

        // Create default settings for guest
        await db.settings.add({
          player: guestId,
          showTimer: true,
          defaultMode: DefaultGameMode.Daily,
          defaultDifficulty: Difficulty.Medium,
          autoCheck: AutocheckModes.Conflicts,
          highlightSections: true,
          remainingCount: false,
          showAvailablePlacements: false,
          hideFilledNumbers: false,
          skipStartBanner: false,
          notesMode: false,
          theme: 'system'
        });
      }
      return guest;
    });
  } catch (error) {
    console.error("Failed to initialize DB:", error);
    throw error;
  }
};

// Helper functions
export const getSettings = async (playerId: number) => {
  return await db.settings.where('player').equals(playerId).first();
};

export const updateSettings = async (playerId: number, newSettings: Partial<Settings>) => {
  const settings = await db.settings.where('player').equals(playerId).first();
  if (settings && settings.id) {
    await db.settings.update(settings.id, newSettings);
  }
};

export const createGameSession = async (session: GameSession) => {
  return await db.gameSessions.add(session);
};

export const updateGameProgress = async (
  id: number,
  updates: Partial<GameSession>
) => {
  await db.gameSessions.update(id, updates);
};

export const getDailyChallengeSession = async (playerId: number, date: Date) => {
  // Dexie doesn't support complex querying on dates easily without a compound index or filtering
  // We have 'targetDate' indexed.
  // However, JS Date objects in IndexedDB can be tricky.
  // Let's rely on the fact that we store them as Date objects.
  // We need to match the date part.
  // A safer way is to store date string YYYY-MM-DD for querying.
  // But the schema says 'date'.
  // Let's filter in memory for now or use a range if needed.
  // Actually, let's just use the start of the day for storage to be consistent.

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // We might need to iterate or use a compound index if we had one.
  // For now, let's just find by type and filter.
  const sessions = await db.gameSessions
    .where('type')
    .equals(GameType.Daily)
    .filter(session => {
      if (!session.targetDate || session.player !== playerId) return false;
      const sDate = new Date(session.targetDate);
      sDate.setHours(0,0,0,0);
      return sDate.getTime() === startOfDay.getTime();
    })
    .toArray();

  return sessions[0];
};

export const getAllDailySessions = async (playerId: number) => {
  return await db.gameSessions
    .where('player')
    .equals(playerId)
    .filter(s => s.type === GameType.Daily)
    .toArray();
};

export const getActiveGameSession = async (playerId: number) => {
    return await db.gameSessions
        .where('player')
        .equals(playerId)
        .filter(s => s.status === GameStatus.InProgress)
        .last();
}

export { db };
