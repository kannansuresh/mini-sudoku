import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { SudokuGrid } from "@/components/SudokuGrid";
import { Keyboard } from "@/components/Keyboard";
import { Controls } from "@/components/Controls";
import { GameHeader } from "@/components/GameHeader";
import { HintMessage } from "@/components/HintMessage";
import { isValid } from "@/lib/sudoku";
import confetti from "canvas-confetti";
import { ThemeProvider } from "@/components/theme-provider";
function App() {
  const { status, startGame, setCellValue, undo, clearCell, selectedCell, selectCell, toggleNote } = useGameStore();

  useEffect(() => {
    // Start a game on load if not playing
    if (status === 'idle') {
      startGame('Easy');
    }
  }, [status, startGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift key for temp notes mode
      if (e.key === 'Shift') {
        useGameStore.getState().setTempNotesMode(true);
      }

      if (status !== 'playing') return;

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
    if (status === 'won') {
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
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex min-h-screen w-full items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
        <div className="w-fit">
          <GameHeader />

          <main className="relative flex w-fit flex-col items-center gap-6 rounded-xl bg-white p-4 shadow-xl ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800 sm:p-8">
            <div className="relative z-10">
              <SudokuGrid />
              <HintMessage />
            </div>

            <div className="w-full max-w-md">
              <Controls />
            </div>

            <div className="w-full max-w-md">
              <Keyboard />
            </div>
          </main>

          <footer className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            <p>
              Built by <a href="https://github.com/kannansuresh" className="font-medium underline underline-offset-4 hover:text-neutral-900 dark:hover:text-neutral-100">Kannan Suresh</a>
            </p>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
