import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { SudokuGrid } from "@/components/SudokuGrid";
import { Keyboard } from "@/components/Keyboard";
import { Controls } from "@/components/Controls";
import { GameHeader } from "@/components/GameHeader";
import { isValid } from "@/lib/sudoku";
import confetti from "canvas-confetti";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
function GameContent() {
  const { status, initializeStore, setCellValue, undo, clearCell, selectedCell, selectCell, toggleNote, settings } = useGameStore();
  const { setTheme } = useTheme();

  useEffect(() => {
    // Initialize game based on settings (default mode)
    initializeStore();
  }, [initializeStore]);

  // Sync theme from store to ThemeProvider
  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'In Progress' && status !== 'creating') return;

      // Shift key for temp notes mode
      if (e.key === 'Shift') {
        useGameStore.getState().setTempNotesMode(true);
      }

      // Numbers 1-6
      if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const num = parseInt(e.key) as 1|2|3|4|5|6;
        const { settings, tempNotesMode } = useGameStore.getState();

        if (settings.notesMode || tempNotesMode) {
          toggleNote(num);
        } else {
           // Validation logic
           if (settings.showAvailablePlacements && selectedCell) {
             const { grid } = useGameStore.getState();
             if (!isValid(grid, selectedCell.row, selectedCell.col, num)) {
               return; // Block input
             }
           }

          setCellValue(num);
        }
      }

      // Backspace/Delete -> Clear
      if (e.key === 'Backspace' || e.key === 'Delete') {
        clearCell();
      }

      // Undo (Ctrl+Z or Cmd+Z)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      // Arrow keys navigation
      if (selectedCell) {
        const { row, col } = selectedCell;
        if (e.key === 'ArrowUp') selectCell(Math.max(0, row - 1), col);
        if (e.key === 'ArrowDown') selectCell(Math.min(5, row + 1), col);
        if (e.key === 'ArrowLeft') selectCell(row, Math.max(0, col - 1));
        if (e.key === 'ArrowRight') selectCell(row, Math.min(5, col + 1));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (status !== 'In Progress' && status !== 'creating') return;
      if (e.key === 'Shift') {
        useGameStore.getState().setTempNotesMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, selectedCell, setCellValue, undo, clearCell, selectCell, toggleNote]);

  useEffect(() => {
    if (status === 'Completed') {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }
  }, [status]);

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-fit p-2 sm:p-4">
        <GameHeader />

        <main className="relative flex w-fit flex-col items-center gap-4 rounded-xl bg-white p-3 shadow-xl ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800 sm:p-8">
          <div className="relative z-10">
            <SudokuGrid />
          </div>

          <div className="w-[18.5rem] sm:w-[26rem]">
            <Controls />
          </div>

          <div className="w-full max-w-md">
            <Keyboard />
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <GameContent />
      <Toaster />
      {/* Preload font to prevent layout shift/delay on first use */}
      <span className="font-['Patrick_Hand'] opacity-0 absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none">Preload</span>
    </ThemeProvider>
  );
}

export default App;
