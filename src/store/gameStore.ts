import { create } from 'zustand';
import { generateSudoku, solveSudoku, createEmptyGrid, setSeed, getDailyDifficulty, getDailySeed, getHint } from '@/lib/sudoku';
import type { Grid, CellValue } from '@/lib/sudoku';
import {
  initDB,
  getSettings,
  updateSettings as updateDBSettings,
  createGameSession,
  updateGameProgress,
  getDailyChallengeSession,
  getAllDailySessions,
  GameStatus,
  DefaultGameMode,
  Difficulty,
  GameType,
  AutocheckModes,
  type Player,
  type Settings,
  type GameSession
} from '@/lib/db';

interface GameState {
  grid: Grid;
  solution: Grid;
  initialGrid: Grid;
  notes: Record<string, number[]>; // key: "r-c", value: array of numbers
  selectedCell: { row: number; col: number } | null;
  history: Grid[];
  historyPointer: number;
  difficulty: Difficulty;
  status: GameStatus | 'creating'; // 'creating' is UI state, not DB state
  timer: number;
  settings: Settings;
  activeHint: { row: number; col: number; value: number; reason: string } | null;
  tempNotesMode: boolean;
  hasMadeMoves: boolean;
  dailyDate: Date | null;

  // New DB related state
  player: Player | null;
  sessionId: number | null;
  gameType: GameType;
  mistakes: number;
  dailyHistory: GameSession[];
  initialized: boolean;
  isInitializing: boolean;
  animatingCells: string[]; // "r-c" strings

  // Actions
  initializeStore: () => Promise<void>;
  loadDailyHistory: () => Promise<void>;
  startGame: (difficulty: Difficulty, customGrid?: Grid) => Promise<void>;
  startDailyGame: (date?: Date) => Promise<void>;
  confirmStartGame: () => Promise<void>;
  enterCreateMode: () => void;
  importGrid: (scannedGrid: (number | null)[][]) => void;
  validateAndStartCustomGame: () => { success: boolean; error?: string };
  selectCell: (row: number, col: number) => void;
  showHint: () => void;
  clearHint: () => void;
  setCellValue: (value: CellValue) => void;
  toggleNote: (value: number) => void;
  undo: () => void;
  resetGame: () => void;
  clearCell: () => void;
  toggleSettings: (setting: keyof Settings) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setNotesMode: (enabled: boolean) => void;
  setTempNotesMode: (enabled: boolean) => void;
  tickTimer: () => void;
  checkWin: () => void;
}

const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'player'> = {
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
};

export const useGameStore = create<GameState>((set, get) => ({
  grid: createEmptyGrid(),
  solution: createEmptyGrid(),
  initialGrid: createEmptyGrid(),
  notes: {},
  selectedCell: null,
  history: [],
  historyPointer: -1,
  difficulty: Difficulty.Easy,
  status: GameStatus.NotStarted,
  timer: 0,
  settings: { ...DEFAULT_SETTINGS, id: 0, player: 0 } as Settings, // Placeholder
  activeHint: null,
  tempNotesMode: false,
  hasMadeMoves: false,
  dailyDate: null,
  player: null,
  sessionId: null,
  gameType: GameType.Standard,
  mistakes: 0,
  dailyHistory: [],
  initialized: false,
  isInitializing: false,
  animatingCells: [],

  loadDailyHistory: async () => {
    const { player } = get();
    if (!player) return;
    const history = await getAllDailySessions(player.id);
    set({ dailyHistory: history });
  },

  initializeStore: async () => {
    const { initialized, isInitializing } = get();
    if (initialized || isInitializing) return;

    set({ isInitializing: true });

    try {
      const player = await initDB();
      const dbSettings = await getSettings(player.id);

      set({ player });

      if (dbSettings) {
        set({ settings: dbSettings });
      } else {
        // Should have been created by initDB, but fallback just in case
        set({ settings: { ...DEFAULT_SETTINGS, player: player.id } as Settings });
      }

      // Check for active session logic could go here if we wanted to resume last played game automatically
      // For now, we follow the default mode logic
      const { settings } = get();

      // We don't auto-start games here anymore, we just set up the UI state
      // The UI (App.tsx) calls initializeGame which we can map to this or separate logic
      // Let's implement the default mode logic here

      const today = new Date();

      if (settings.defaultMode === DefaultGameMode.Daily) {
        // Check if today's daily is done
        const dailySession = await getDailyChallengeSession(player.id, today);
        if (dailySession && dailySession.status === GameStatus.Completed) {
           // Fallback to Medium
           await get().startGame(Difficulty.Medium);
        } else {
           await get().startDailyGame(today);
        }
      } else {
        // Start Standard game
        await get().startGame(settings.defaultDifficulty);
      }

      set({ initialized: true, isInitializing: false });

    } catch (error) {
      console.error("Failed to initialize store:", error);
      set({ isInitializing: false });
    }
  },

  startGame: async (difficulty, customGrid) => {
    const { player, settings } = get();
    if (!player) return;

    setSeed(Date.now());

    let puzzle: Grid;
    let solution: Grid;

    if (customGrid) {
      puzzle = customGrid.map(row => [...row]);
      solution = customGrid.map(row => [...row]);
      solveSudoku(solution);
    } else {
      puzzle = generateSudoku(difficulty);
      solution = puzzle.map(row => [...row]);
      solveSudoku(solution);
    }

    const initial = puzzle.map(row => [...row]);
    const initialStateStr = JSON.stringify(initial);
    const gameType = customGrid ? GameType.Custom : GameType.Standard;

    let sessionId: number | null = null;

    if (settings.skipStartBanner) {
      // Create new session immediately
      const session: GameSession = {
        player: player.id,
        type: gameType,
        status: GameStatus.InProgress,
        difficulty,
        elapsedTime: 0,
        initialState: initialStateStr,
        currentProgress: initialStateStr,
        notes: JSON.stringify({}),
        mistakes: 0,
        score: 0,
        startedAt: new Date(),
      };

      const id = await createGameSession(session);
      sessionId = id ?? null;
    }

    set({
      grid: puzzle,
      solution: solution,
      initialGrid: initial,
      notes: {},
      selectedCell: null,
      history: [puzzle.map(row => [...row])],
      historyPointer: 0,
      difficulty,
      status: settings.skipStartBanner ? GameStatus.InProgress : GameStatus.NotStarted,
      timer: 0,
      hasMadeMoves: false,
      dailyDate: null,
      sessionId,
      gameType,
      mistakes: 0
    });
  },

  startDailyGame: async (date?: Date) => {
    const { player, settings } = get();
    if (!player) return;

    const targetDate = date || new Date();
    const seed = getDailySeed(targetDate);
    const difficulty = getDailyDifficulty(targetDate);
    setSeed(seed);

    const puzzle = generateSudoku(difficulty);
    const solution = puzzle.map(row => [...row]);
    solveSudoku(solution);
    const initial = puzzle.map(row => [...row]);

    // Check for existing session
    const existingSession = await getDailyChallengeSession(player.id, targetDate);

    if (existingSession) {
      set({
        grid: JSON.parse(existingSession.currentProgress),
        solution: solution,
        initialGrid: initial,
        notes: JSON.parse(existingSession.notes),
        selectedCell: null,
        history: [JSON.parse(existingSession.currentProgress)], // History not fully persisted in schema, just current state
        historyPointer: 0,
        difficulty,
        status: existingSession.status === GameStatus.Completed ? GameStatus.Completed : GameStatus.NotStarted, // Always show banner for daily unless completed
        timer: existingSession.elapsedTime,
        hasMadeMoves: existingSession.status !== GameStatus.NotStarted,
        dailyDate: targetDate,
        sessionId: existingSession.id!,
        gameType: GameType.Daily,
        mistakes: existingSession.mistakes
      });
    } else {
      const initialStateStr = JSON.stringify(initial);
      let sessionId: number | null = null;

      if (settings.skipStartBanner) {
        const session: GameSession = {
          player: player.id,
          type: GameType.Daily,
          status: GameStatus.NotStarted,
          difficulty,
          elapsedTime: 0,
          initialState: initialStateStr,
          currentProgress: initialStateStr,
          notes: JSON.stringify({}),
          mistakes: 0,
          score: 0,
          targetDate: targetDate,
          startedAt: new Date(),
        };

        const id = await createGameSession(session);
        sessionId = id ?? null;
      }

      set({
        grid: puzzle,
        solution: solution,
        initialGrid: initial,
        notes: {},
        selectedCell: null,
        history: [puzzle.map(row => [...row])],
        historyPointer: 0,
        difficulty,
        status: GameStatus.NotStarted,
        timer: 0,
        hasMadeMoves: false,
        dailyDate: targetDate,
        sessionId,
        gameType: GameType.Daily,
        mistakes: 0
      });
    }
  },

  confirmStartGame: async () => {
    set({ status: GameStatus.InProgress });
    const { sessionId, grid, notes, timer, mistakes, player, gameType, difficulty, dailyDate, initialGrid } = get();

    if (!player) return;

    if (!sessionId) {
      // Create session now
      const initialStateStr = JSON.stringify(initialGrid);
      const session: GameSession = {
        player: player.id,
        type: gameType,
        status: GameStatus.InProgress,
        difficulty,
        elapsedTime: timer,
        initialState: initialStateStr,
        currentProgress: JSON.stringify(grid),
        notes: JSON.stringify(notes),
        mistakes,
        score: 0,
        startedAt: new Date(),
        targetDate: dailyDate || undefined
      };

      const newSessionId = await createGameSession(session);
      set({ sessionId: newSessionId });
    } else {
      // Save status change
      updateGameProgress(sessionId, {
        status: GameStatus.InProgress,
        currentProgress: JSON.stringify(grid),
        notes: JSON.stringify(notes),
        elapsedTime: timer,
        mistakes
      });
    }
  },

  enterCreateMode: () => {
    const empty = createEmptyGrid();
    set({
      grid: empty,
      solution: empty,
      initialGrid: empty,
      notes: {},
      selectedCell: null,
      history: [empty.map(row => [...row])],
      historyPointer: 0,
      status: 'creating',
      timer: 0,
      activeHint: null,
      hasMadeMoves: false,
      dailyDate: null,
      sessionId: null,
      mistakes: 0
    });
  },

  importGrid: (scannedGrid: (number | null)[][]) => {
    const { status } = get();
    if (status !== 'creating') return;

    const empty = createEmptyGrid();
    const newGrid = empty.map((row, r) =>
      row.map((_, c) => scannedGrid[r][c] as CellValue)
    );

    set({
      grid: newGrid,
      history: [newGrid.map(row => [...row])],
      historyPointer: 0,
      hasMadeMoves: true,
    });
  },

  validateAndStartCustomGame: () => {
    const { grid, player, settings } = get();
    if (!player) return { success: false, error: "Player not initialized" };

    const tempGrid = grid.map(row => [...row]);
    const solvable = solveSudoku(tempGrid);

    if (!solvable) {
      return { success: false, error: "This puzzle is unsolvable or violates Sudoku rules!" };
    }

    const initial = grid.map(row => [...row]);
    const solution = tempGrid;

    const initialStateStr = JSON.stringify(initial);

    if (settings.skipStartBanner) {
      const session: GameSession = {
        player: player.id,
        type: GameType.Custom,
        status: GameStatus.InProgress,
        difficulty: Difficulty.Medium, // Custom doesn't really have difficulty
        elapsedTime: 0,
        initialState: initialStateStr,
        currentProgress: initialStateStr,
        notes: JSON.stringify({}),
        mistakes: 0,
        score: 0,
        startedAt: new Date(),
      };

      // We need to handle this async properly or fire-and-forget but update store later.
      // Since validateAndStartCustomGame returns sync result, we can't await here easily without changing signature.
      // But we can update store with sessionId when promise resolves.
      createGameSession(session).then(id => {
        set({ sessionId: id });
      });
      // For now, sessionId is null in store until promise resolves.
    }

    set({
      solution: solution,
      initialGrid: initial,
      history: [grid.map(row => [...row])],
      historyPointer: 0,
      status: settings.skipStartBanner ? GameStatus.InProgress : GameStatus.NotStarted,
      timer: 0,
      activeHint: null,
      hasMadeMoves: false,
      dailyDate: null,
      sessionId: null, // Will be updated if skipStartBanner is true
      gameType: GameType.Custom,
      mistakes: 0
    });

    return { success: true };
  },

  selectCell: (row, col) => {
    set({ selectedCell: { row, col }, activeHint: null });
  },

  showHint: () => {
    const { grid, solution, status } = get();
    if (status !== GameStatus.InProgress) return;

    const hint = getHint(grid, solution);
    if (hint) {
      set({ activeHint: hint, selectedCell: { row: hint.row, col: hint.col } });
    }
  },

  clearHint: () => {
    set({ activeHint: null });
  },

  setCellValue: (value) => {
    const { grid, selectedCell, initialGrid, history, historyPointer, status, solution, sessionId, mistakes, timer, notes } = get();
    if (!selectedCell) return;
    if (status !== GameStatus.InProgress && status !== 'creating') return;

    const { row, col } = selectedCell;

    set({ activeHint: null });

    if (initialGrid[row][col] !== null) return;
    if (grid[row][col] === value) return;

    // Check for mistake
    let newMistakes = mistakes;
    if (status === GameStatus.InProgress && value !== solution[row][col]) {
      newMistakes++;
    }

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = value;

    const newHistory = history.slice(0, historyPointer + 1);
    newHistory.push(newGrid.map(r => [...r]));

    const newNotes = { ...notes };
    delete newNotes[`${row}-${col}`];

    set({
      grid: newGrid,
      history: newHistory,
      historyPointer: newHistory.length - 1,
      notes: newNotes,
      hasMadeMoves: true,
      mistakes: newMistakes
    });

    // Save progress
    if (sessionId && status === GameStatus.InProgress) {
      updateGameProgress(sessionId, {
        currentProgress: JSON.stringify(newGrid),
        notes: JSON.stringify(newNotes),
        mistakes: newMistakes,
        elapsedTime: timer,
        status: GameStatus.InProgress
      });
    }

    if (status === GameStatus.InProgress) {
      // Check for completed units (Row, Col, Region) to trigger animation
      const newAnimatingCells: string[] = [];
      const { grid: currentGrid, solution: currentSolution } = get(); // Get latest grid

      // Check Row
      let rowComplete = true;
      for (let c = 0; c < 6; c++) {
        if (currentGrid[row][c] !== currentSolution[row][c]) {
          rowComplete = false;
          break;
        }
      }
      if (rowComplete) {
        for (let c = 0; c < 6; c++) newAnimatingCells.push(`${row}-${c}`);
      }

      // Check Column
      let colComplete = true;
      for (let r = 0; r < 6; r++) {
        if (currentGrid[r][col] !== currentSolution[r][col]) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) {
        for (let r = 0; r < 6; r++) newAnimatingCells.push(`${r}-${col}`);
      }

      // Check Region
      const boxHeight = 2;
      const boxWidth = 3;
      const startRow = Math.floor(row / boxHeight) * boxHeight;
      const startCol = Math.floor(col / boxWidth) * boxWidth;
      let regionComplete = true;
      for (let r = 0; r < boxHeight; r++) {
        for (let c = 0; c < boxWidth; c++) {
          if (currentGrid[startRow + r][startCol + c] !== currentSolution[startRow + r][startCol + c]) {
            regionComplete = false;
            break;
          }
        }
      }
      if (regionComplete) {
        for (let r = 0; r < boxHeight; r++) {
          for (let c = 0; c < boxWidth; c++) {
            newAnimatingCells.push(`${startRow + r}-${startCol + c}`);
          }
        }
      }

      if (newAnimatingCells.length > 0) {
        set({ animatingCells: newAnimatingCells });
        setTimeout(() => {
          set({ animatingCells: [] });
        }, 1000); // 1 second animation
      }

      get().checkWin();
    }
  },

  toggleNote: (value) => {
    const { selectedCell, initialGrid, notes, status, sessionId, timer } = get();
    if (!selectedCell) return;
    if (status !== GameStatus.InProgress && status !== 'creating') return;

    set({ activeHint: null });

    const { row, col } = selectedCell;

    if (initialGrid[row][col] !== null) return;

    const key = `${row}-${col}`;
    const currentNotes = notes[key] || [];
    let newNotesList;

    if (currentNotes.includes(value)) {
      newNotesList = currentNotes.filter(n => n !== value);
    } else {
      newNotesList = [...currentNotes, value].sort();
    }

    const newNotes = { ...notes };
    if (newNotesList.length === 0) {
      delete newNotes[key];
    } else {
      newNotes[key] = newNotesList;
    }

    set({ notes: newNotes, hasMadeMoves: true });

    // Save progress
    if (sessionId && status === GameStatus.InProgress) {
      updateGameProgress(sessionId, {
        notes: JSON.stringify(newNotes),
        elapsedTime: timer
      });
    }
  },

  undo: () => {
    const { history, historyPointer, sessionId, timer } = get();
    if (historyPointer > 0) {
      const newPointer = historyPointer - 1;
      const newGrid = history[newPointer].map(r => [...r]);
      set({
        grid: newGrid,
        historyPointer: newPointer,
        hasMadeMoves: true,
      });

      // Save progress
      if (sessionId) {
        updateGameProgress(sessionId, {
          currentProgress: JSON.stringify(newGrid),
          elapsedTime: timer
        });
      }
    }
  },

  clearCell: () => {
    const { selectedCell, initialGrid, grid, history, historyPointer, notes, sessionId, timer, status } = get();
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    if (initialGrid[row][col] !== null) return;

    const hasValue = grid[row][col] !== null;
    const hasNotes = notes[`${row}-${col}`] && notes[`${row}-${col}`].length > 0;

    if (!hasValue && !hasNotes) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = null;

    const newHistory = history.slice(0, historyPointer + 1);
    newHistory.push(newGrid.map(r => [...r]));

    const newNotes = { ...notes };
    if (hasNotes) {
      delete newNotes[`${row}-${col}`];
    }

    set({
      grid: newGrid,
      history: newHistory,
      historyPointer: newHistory.length - 1,
      notes: newNotes,
      hasMadeMoves: true,
    });

    // Save progress
    if (sessionId && status === GameStatus.InProgress) {
      updateGameProgress(sessionId, {
        currentProgress: JSON.stringify(newGrid),
        notes: JSON.stringify(newNotes),
        elapsedTime: timer
      });
    }
  },

  resetGame: () => {
    const { initialGrid, status, sessionId, mistakes } = get();
    if (status !== GameStatus.InProgress) return;

    const emptyNotes = {};
    const initialGridStr = JSON.stringify(initialGrid);

    set({
      grid: initialGrid.map(row => [...row]),
      history: [initialGrid.map(row => [...row])],
      historyPointer: 0,
      notes: emptyNotes,
      selectedCell: null,
      activeHint: null,
      // timer: 0, // Timer should not reset
      hasMadeMoves: false,
    });

    if (sessionId) {
      updateGameProgress(sessionId, {
        currentProgress: initialGridStr,
        notes: JSON.stringify(emptyNotes),
        // elapsedTime: 0, // Timer should not reset
        mistakes: mistakes
      });
      // Actually, if we reset, we probably shouldn't reset mistakes if it's a strict mode, but for now let's keep mistakes?
      // User didn't specify. Standard reset usually resets everything.
      // Let's reset mistakes too.
      set({ mistakes: 0 });
      updateGameProgress(sessionId, { mistakes: 0 });
    }
  },

  toggleSettings: (setting) => {
    const { settings, player } = get();
    if (!player) return;

    const newSettings = { ...settings, [setting]: !settings[setting] };
    set({ settings: newSettings });
    updateDBSettings(player.id, { [setting]: newSettings[setting] });
  },

  updateSettings: (newSettings) => {
    const { settings, player } = get();
    if (!player) return;

    const merged = { ...settings, ...newSettings };
    set({ settings: merged });
    updateDBSettings(player.id, newSettings);
  },

  setNotesMode: (enabled) => {
    const { player } = get();
    if (!player) return;

    set(state => ({
      settings: { ...state.settings, notesMode: enabled }
    }));
    updateDBSettings(player.id, { notesMode: enabled });
  },

  setTempNotesMode: (enabled) => {
    set({ tempNotesMode: enabled });
  },

  tickTimer: () => {
    const { status, sessionId, timer } = get();
    if (status === GameStatus.InProgress) {
      const newTime = timer + 1;
      set({ timer: newTime });

      // Sync timer to DB periodically or on every tick?
      // User asked for "progress saved up until now including elapsed time" on navigation.
      // Saving every second might be too much IO.
      // But IndexedDB is fast. Let's do it every 5 seconds or just rely on the fact that we save on moves and navigation?
      // The user specifically asked for "including elapsed time" when navigating away.
      // We can save on navigation (unmount) or just save every X seconds.
      // Let's save every 5 seconds to be safe.
      if (newTime % 5 === 0 && sessionId) {
        updateGameProgress(sessionId, { elapsedTime: newTime });
      }
    }
  },

  checkWin: () => {
    const { grid, solution, sessionId, timer } = get();
    let isFull = true;
    let isCorrect = true;

    for(let r=0; r<6; r++) {
      for(let c=0; c<6; c++) {
        if (grid[r][c] === null) {
          isFull = false;
          break;
        }
        if (grid[r][c] !== solution[r][c]) {
          isCorrect = false;
        }
      }
    }

    if (isFull && isCorrect) {
      set({ status: GameStatus.Completed });

      if (sessionId) {
        updateGameProgress(sessionId, {
          status: GameStatus.Completed,
          completedOn: new Date(),
          elapsedTime: timer
        });
      }
    }
  }
}));
