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
  const { status, startGame, setCellValue, undo, clearCell, selectedCell, selectCell, settings, toggleNote } = useGameStore();

  useEffect(() => {
    // Start a game on load if not playing
    if (status === 'idle') {
      startGame('Easy');
    }
  }, [status, startGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') return;

      // Numbers 1-6
      if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const num = parseInt(e.key) as 1|2|3|4|5|6;

        // Check if placement is allowed if setting is enabled


        if (settings.notesMode) {
          toggleNote(num);
        } else {
           // Validation logic
           if (settings.showAvailablePlacements && selectedCell) {
             const { grid } = useGameStore.getState();
             // We need to check if it's valid
             // Since we can't easily import isValid here without potential circular deps or just messiness,
             // let's just use a simple check or assume the user is correct if they are using physical keyboard
             // OR better, let's just skip validation for now as it's complex to wire up here without refactoring.
             // Wait, the user explicitly asked for this.
             // "When aviailable placemnts is enabled, uesr is still able to enter non available number using the physical keyboard or laptop keyboard"

             // I MUST implement this.
             // I will import isValid from lib/sudoku
             // I will add the import at the top of the file in a separate step.

             // For now, I'll just put the logic here assuming isValid is imported.
             // I'll add the import in the next step.
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, selectedCell, settings.notesMode, setCellValue, undo, clearCell, selectCell, toggleNote]);

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
