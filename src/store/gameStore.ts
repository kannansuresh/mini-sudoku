import { create } from 'zustand';
import { generateSudoku, solveSudoku, createEmptyGrid, setSeed, getDailyDifficulty, getDailySeed, getHint } from '@/lib/sudoku';
import type { Grid, CellValue, Difficulty } from '@/lib/sudoku';

interface GameSettings {
  showClock: boolean;
  autocheck: boolean;
  highlightSections: boolean;
  countRemaining: boolean;
  showAvailablePlacements: boolean;
  hideFinishedNumber: boolean;
  notesMode: boolean;
  skipStartOverlay: boolean;
}

interface GameState {
  grid: Grid;
  solution: Grid;
  initialGrid: Grid;
  notes: Record<string, number[]>; // key: "r-c", value: array of numbers
  selectedCell: { row: number; col: number } | null;
  history: Grid[];
  historyPointer: number; // Current position in history
  difficulty: Difficulty;
  status: 'idle' | 'ready' | 'playing' | 'won' | 'creating';
  timer: number;
  settings: GameSettings;
  activeHint: { row: number; col: number; value: number; reason: string } | null;
  tempNotesMode: boolean;
  hasMadeMoves: boolean;

  // Actions
  startGame: (difficulty: Difficulty, customGrid?: Grid) => void;
  startDailyGame: () => void;
  confirmStartGame: () => void;
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
  toggleSettings: (setting: keyof GameSettings) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setNotesMode: (enabled: boolean) => void;
  setTempNotesMode: (enabled: boolean) => void;
  tickTimer: () => void;
  checkWin: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  showClock: true,
  autocheck: false,
  highlightSections: true,
  countRemaining: true,
  showAvailablePlacements: false,
  hideFinishedNumber: false,
  notesMode: false,
  skipStartOverlay: false,
};

import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      grid: createEmptyGrid(),
      solution: createEmptyGrid(),
      initialGrid: createEmptyGrid(),
      notes: {},
      selectedCell: null,
      history: [],
      historyPointer: -1,
      difficulty: 'Easy',
      status: 'idle',
      timer: 0,
      settings: DEFAULT_SETTINGS,
      activeHint: null,
      tempNotesMode: false,
      hasMadeMoves: false,

      startGame: (difficulty, customGrid) => {
        // Reset seed to random for normal games
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

        // Deep copy for initial state
        const initial = puzzle.map(row => [...row]);

        const { settings } = get();

        set({
          grid: puzzle,
          solution: solution,
          initialGrid: initial,
          notes: {},
          selectedCell: null,
          history: [puzzle.map(row => [...row])],
          historyPointer: 0,
          difficulty,
          status: settings.skipStartOverlay ? 'playing' : 'ready',
          timer: 0,
          hasMadeMoves: false,
        });
      },

      startDailyGame: () => {
        const seed = getDailySeed();
        const difficulty = getDailyDifficulty();

        setSeed(seed);

        const puzzle = generateSudoku(difficulty);
        const solution = puzzle.map(row => [...row]);
        solveSudoku(solution);

        const initial = puzzle.map(row => [...row]);

        const { settings } = get();

        set({
          grid: puzzle,
          solution: solution,
          initialGrid: initial,
          notes: {},
          selectedCell: null,
          history: [puzzle.map(row => [...row])],
          historyPointer: 0,
          difficulty,
          status: settings.skipStartOverlay ? 'playing' : 'ready',
          timer: 0,
          hasMadeMoves: false,
        });
      },

      confirmStartGame: () => {
        set({ status: 'playing' });
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
        });
      },

      importGrid: (scannedGrid: (number | null)[][]) => {
        const { status } = get();
        if (status !== 'creating') return;

        const empty = createEmptyGrid();
        // Merge scanned grid with empty grid structure (just in case)
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
        const { grid } = get();
        // Validate if grid is valid so far
        // And check if solvable

        // 1. Check basic rules
        // We can use solveSudoku to check if solvable
        const tempGrid = grid.map(row => [...row]);
        const solvable = solveSudoku(tempGrid);

        if (!solvable) {
          return { success: false, error: "This puzzle is unsolvable or violates Sudoku rules!" };
        }

        // If solvable, start game
        // The current grid becomes the initial grid
        const initial = grid.map(row => [...row]);
        const solution = tempGrid; // solveSudoku fills it in place

        set({
          solution: solution,
          initialGrid: initial,
          history: [grid.map(row => [...row])],
          historyPointer: 0,
          status: 'ready', // Start in ready state
          timer: 0,
          activeHint: null,
          hasMadeMoves: false,
        });

        return { success: true };
      },

      resetGame: () => {
        const { initialGrid, status } = get();
        if (status !== 'playing') return;

        set({
          grid: initialGrid.map(row => [...row]),
          history: [initialGrid.map(row => [...row])],
          historyPointer: 0,
          notes: {},
          selectedCell: null,
          activeHint: null,
          timer: 0,
          hasMadeMoves: false,
        });
      },

      checkWin: () => {
        const { grid, solution } = get();
        // Check if grid matches solution
        // Or just check if valid and full
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
          set({ status: 'won' });
        }
      },

      selectCell: (row, col) => {
        set({ selectedCell: { row, col }, activeHint: null });
      },

      showHint: () => {
        const { grid, solution, status } = get();
        if (status !== 'playing') return;

        const hint = getHint(grid, solution);
        if (hint) {
          set({ activeHint: hint, selectedCell: { row: hint.row, col: hint.col } });
        }
      },

      clearHint: () => {
        set({ activeHint: null });
      },

      setCellValue: (value) => {
        const { grid, selectedCell, initialGrid, history, historyPointer, status } = get();
        if (!selectedCell) return;

        // Allow in playing or creating
        if (status !== 'playing' && status !== 'creating') return;

        const { row, col } = selectedCell;

        set({ activeHint: null });

        if (initialGrid[row][col] !== null) return;
        if (grid[row][col] === value) return;

        const newGrid = grid.map(r => [...r]);
        newGrid[row][col] = value;

        const newHistory = history.slice(0, historyPointer + 1);
        newHistory.push(newGrid.map(r => [...r]));

        const newNotes = { ...get().notes };
        delete newNotes[`${row}-${col}`];

        set({
          grid: newGrid,
          history: newHistory,
          historyPointer: newHistory.length - 1,
          notes: newNotes,
          hasMadeMoves: true,
        });

        if (status === 'playing') {
          get().checkWin();
        }
      },

      toggleNote: (value) => {
        const { selectedCell, initialGrid, notes, status } = get();
        if (!selectedCell) return;

        // Allow in playing or creating
        if (status !== 'playing' && status !== 'creating') return;

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
      },

      undo: () => {
        const { history, historyPointer } = get();
        if (historyPointer > 0) {
          const newPointer = historyPointer - 1;
          set({
            grid: history[newPointer].map(r => [...r]),
            historyPointer: newPointer,
            hasMadeMoves: true, // Undo counts as a move/interaction
          });
        }
      },

      clearCell: () => {
        const { selectedCell, initialGrid, grid, history, historyPointer, notes } = get();
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
      },

      toggleSettings: (setting) => {
        set(state => ({
          settings: { ...state.settings, [setting]: !state.settings[setting] }
        }));
      },

      updateSettings: (newSettings: Partial<GameSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      setNotesMode: (enabled) => {
        set(state => ({
          settings: { ...state.settings, notesMode: enabled }
        }));
      },

      setTempNotesMode: (enabled: boolean) => {
        set({ tempNotesMode: enabled });
      },

      tickTimer: () => {
        if (get().status === 'playing') {
          set(state => ({ timer: state.timer + 1 }));
        }
      }
    }),
    {
      name: 'mini-sudoku-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
