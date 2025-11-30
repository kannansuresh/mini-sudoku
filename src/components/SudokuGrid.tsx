import { useGameStore } from "@/store/gameStore";
import { Cell } from "./Cell";
import { cn } from "@/lib/utils";
import { getConflictingCells } from "@/lib/sudoku";
import { useMemo } from "react";
import { StartGameOverlay } from "./StartGameOverlay"; // Assuming StartGameOverlay is defined elsewhere

export function SudokuGrid() {
  const { grid, initialGrid, settings, status } = useGameStore();

  const conflictingCells = useMemo(() => {
    if (!settings.autocheck) return new Set<string>();
    return getConflictingCells(grid);
  }, [grid, settings.autocheck]);

  if (!grid || grid.length === 0) return null;

  return (
    <div className="relative mx-auto w-full max-w-md select-none">
      {status === 'ready' && <StartGameOverlay />}

      <div className="overflow-hidden rounded-lg border-2 border-neutral-800 shadow-lg dark:border-neutral-200">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((value, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  colIndex === 2 && "border-r-2 border-r-neutral-800 dark:border-r-neutral-200",
                  rowIndex % 2 === 1 && rowIndex !== 5 && "border-b-2 border-b-neutral-800 dark:border-b-neutral-200"
                )}
              >
                <Cell
                  row={rowIndex}
                  col={colIndex}
                  value={value}
                  isInitial={initialGrid[rowIndex][colIndex] !== null}
                  isConflict={conflictingCells.has(`${rowIndex}-${colIndex}`)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
