import { cn } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import type { CellValue } from "@/lib/sudoku";

interface CellProps {
  row: number;
  col: number;
  value: CellValue;
  isInitial: boolean;
  isConflict: boolean;
}

export function Cell({ row, col, value, isInitial, isConflict }: CellProps) {
  const {
    selectedCell,
    selectCell,
    notes,
    settings,
    grid,
    solution,
    status,
    activeHint
  } = useGameStore();

  const isSelected = selectedCell?.row === row && selectedCell?.col === col;
  const isHintTarget = activeHint?.row === row && activeHint?.col === col;

  // Highlight logic
  const isRelated = selectedCell && (
    selectedCell.row === row ||
    selectedCell.col === col ||
    (Math.floor(selectedCell.row / 2) === Math.floor(row / 2) &&
     Math.floor(selectedCell.col / 3) === Math.floor(col / 3))
  );

  const isSameValue = selectedCell && grid[selectedCell.row][selectedCell.col] !== null && grid[selectedCell.row][selectedCell.col] === value;

  // Check against solution for "wrong value" (even if unique)
  const isSolutionError = settings.autocheck && value !== null && value !== solution[row][col];

  // Combine conflict (duplicate) and solution error
  // If it's a conflict, it's definitely an error.
  // If it's a solution error but not a conflict (unique wrong number), we still show it.
  const isError = isConflict || isSolutionError;

  const cellNotes = notes[`${row}-${col}`] || [];

  return (
    <div
      onClick={() => selectCell(row, col)}
      style={isError ? {
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(220, 38, 38, 0.1) 5px, rgba(220, 38, 38, 0.1) 10px)"
      } : undefined}
      className={cn(
        "relative flex h-12 w-12 cursor-pointer items-center justify-center border-r border-b border-neutral-200 text-2xl font-medium transition-colors select-none dark:border-neutral-700 sm:h-14 sm:w-14",
        // Borders for regions (handled in Grid, but maybe here too?)
        // Grid handles thick borders. Here we just do standard cell borders.

        // Background colors
        isInitial ? "bg-neutral-200/50 text-neutral-950 font-semibold dark:bg-neutral-800 dark:text-neutral-50" : "bg-white text-blue-600 dark:bg-neutral-900 dark:text-blue-400",
        isSelected && "bg-blue-200 dark:bg-blue-900/50",
        isHintTarget && "bg-yellow-200 ring-2 ring-inset ring-yellow-400 dark:bg-yellow-900/50 dark:ring-yellow-600",
        !isSelected && !isHintTarget && settings.highlightSections && isRelated && "bg-purple-50 dark:bg-purple-900/20", // Changed to purple as requested
        !isSelected && !isHintTarget && isSameValue && value !== null && "bg-blue-100 dark:bg-blue-900/30",

        // Error state (Text color only, background handled by stripes or red tint if stripes not visible enough)
        // We use stripes for background. Text color red.
        isError && "text-red-600 dark:text-red-400",

        // Won state
        status === 'won' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",

        // Dim irrelevant cells when hint is active
        activeHint && !isHintTarget && !isRelated && "opacity-30 grayscale transition-all duration-300"
      )}
    >
      {value !== null ? (
        value
      ) : (
        <div className="grid h-full w-full grid-cols-3 grid-rows-2 font-['Patrick_Hand'] italic">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="flex items-center justify-center text-sm leading-none text-neutral-500 dark:text-neutral-400 sm:text-base">
              {cellNotes.includes(n) ? n : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
