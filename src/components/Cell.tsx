import { cn } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import type { CellValue } from "@/lib/sudoku";

interface CellProps {
  row: number;
  col: number;
  value: CellValue;
  isInitial: boolean;
  isConflict: boolean;
  isGridFull: boolean;
}

export function Cell({ row, col, value, isInitial, isConflict, isGridFull }: CellProps) {
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

  // Determine effective autocheck mode
  // If grid is full and autocheck is off, treat it as 'mistakes' to show errors
  const effectiveAutocheck = (settings.autoCheck === 'Off' && isGridFull) ? 'Mistakes' : settings.autoCheck;

  // Combine conflict (duplicate) and solution error
  const isError = value !== null && (
    (effectiveAutocheck === 'Mistakes' && value !== solution[row][col]) ||
    (effectiveAutocheck === 'Conflicts' && isConflict)
  );

  const cellNotes = notes[`${row}-${col}`] || [];

  return (
    <div
      onClick={() => selectCell(row, col)}
      style={isError ? {
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(220, 38, 38, 0.1) 5px, rgba(220, 38, 38, 0.1) 10px)"
      } : undefined}
      className={cn(
        "relative flex h-12 w-12 cursor-pointer items-center justify-center border-r border-b border-neutral-200 text-2xl sm:text-3xl font-medium transition-colors select-none dark:border-neutral-700 sm:h-[68px] sm:w-[68px]",
        // Borders for regions (handled in Grid, but maybe here too?)
        // Grid handles thick borders. Here we just do standard cell borders.

        // Background colors
        isInitial ? "bg-neutral-200/50 text-neutral-950 font-semibold dark:bg-neutral-800 dark:text-neutral-50" : "bg-white text-blue-600 dark:bg-neutral-900 dark:text-blue-400",
        isSelected && "bg-blue-200 dark:bg-blue-900/50",
        isHintTarget && "bg-yellow-200 dark:bg-yellow-900/50",
        !isSelected && !isHintTarget && settings.highlightSections && isRelated && "bg-purple-50 dark:bg-purple-900/20", // Changed to purple as requested
        !isSelected && !isHintTarget && isSameValue && value !== null && "bg-blue-100 dark:bg-blue-900/30",

        // Error state (Text color only, background handled by stripes or red tint if stripes not visible enough)
        // We use stripes for background. Text color red.
        isError && "text-red-600 dark:text-red-400",

        // Won state
        status === 'Completed' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      )}
    >
      {value !== null ? (
        value
      ) : (
        <div className="grid h-full w-full grid-cols-3 grid-rows-2 font-['Patrick_Hand'] italic">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="flex items-center justify-center text-sm leading-none text-neutral-500 dark:text-neutral-400 sm:text-sm">
              {cellNotes.includes(n) ? n : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
