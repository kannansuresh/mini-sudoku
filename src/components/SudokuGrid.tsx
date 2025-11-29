import { useGameStore } from "@/store/gameStore";
import { Cell } from "./Cell";
import { cn } from "@/lib/utils";

export function SudokuGrid() {
  const { grid, initialGrid } = useGameStore();

  if (!grid || grid.length === 0) return null;

  return (
    <div className="select-none overflow-hidden rounded-lg border-2 border-neutral-800 shadow-lg dark:border-neutral-200">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((value, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                // Add thick borders for regions
                // Regions are 2 rows x 3 cols (Standard Mini Sudoku)
                // So thick border after col 2 (index 2)
                // And thick border after row 1, 3 (index 1, 3)
                colIndex === 2 && "border-r-2 border-r-neutral-800 dark:border-r-neutral-200",
                rowIndex % 2 === 1 && rowIndex !== 5 && "border-b-2 border-b-neutral-800 dark:border-b-neutral-200"
              )}
            >
              <Cell
                row={rowIndex}
                col={colIndex}
                value={value}
                isInitial={initialGrid[rowIndex][colIndex] !== null}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
