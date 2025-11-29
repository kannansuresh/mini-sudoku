import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isValid } from "@/lib/sudoku";
import type { CellValue } from "@/lib/sudoku";
import { Undo2, Eraser } from "lucide-react";

export function Keyboard() {
  const {
    setCellValue,
    toggleNote,
    undo,
    clearCell,
    settings,
    grid,
    initialGrid,
    selectedCell,
    status,
    tempNotesMode
  } = useGameStore();

  const handleNumberClick = (num: CellValue) => {
    if (status === 'won') return;
    if (settings.notesMode || tempNotesMode) {
      toggleNote(num as number);
    } else {
      setCellValue(num);
    }
  };

  // Calculate remaining counts
  const getRemainingCount = (num: number) => {
    let count = 0;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (grid[r][c] === num) count++;
      }
    }
    return 6 - count;
  };

  // Check if number is finished
  const isFinished = (num: number) => getRemainingCount(num) <= 0;

  // Check if number is valid for selected cell (for "Show available placements")
  const isPlacementValid = (num: number) => {
    if (!selectedCell) return true;
    // Check if it's valid in the grid
    return isValid(grid, selectedCell.row, selectedCell.col, num as CellValue);
  };

  const renderNumberButton = (num: number) => {
    const finished = isFinished(num);
    const isInitial = selectedCell && initialGrid[selectedCell.row][selectedCell.col] !== null;
    const disabled = (settings.hideFinishedNumber && finished) ||
                     (settings.showAvailablePlacements && !isPlacementValid(num)) ||
                     isInitial;

    return (
      <Button
        key={num}
        variant="outline"
        className={cn(
          "relative flex h-14 w-full flex-col items-center justify-center p-0 text-2xl font-medium sm:h-16 sm:text-3xl",
          "bg-white dark:bg-neutral-800",
          (settings.notesMode || tempNotesMode) && "font-['Patrick_Hand'] italic",
          disabled && "opacity-20 pointer-events-none"
        )}
        onClick={() => handleNumberClick(num as CellValue)}
        disabled={disabled || status === 'won'}
      >
        <span>{num}</span>
        {settings.countRemaining && !finished && !settings.notesMode && !tempNotesMode && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-600 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:ring-neutral-600">
            {getRemainingCount(num)}
          </span>
        )}
      </Button>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {/* Row 1: 1, 2, 3, Undo */}
      {renderNumberButton(1)}
      {renderNumberButton(2)}
      {renderNumberButton(3)}
      <Button
        variant="secondary"
        className="h-14 w-full sm:h-16 flex flex-col items-center justify-center gap-1"
        onClick={undo}
        disabled={status === 'won'}
      >
        <Undo2 className="h-5 w-5" />
        <span className="text-xs">Undo</span>
      </Button>

      {/* Row 2: 4, 5, 6, Clear */}
      {renderNumberButton(4)}
      {renderNumberButton(5)}
      {renderNumberButton(6)}
      <Button
        variant="secondary"
        className="h-14 w-full sm:h-16 flex flex-col items-center justify-center gap-1"
        onClick={clearCell}
        disabled={status === 'won'}
      >
        <Eraser className="h-5 w-5" />
        <span className="text-xs">Erase</span>
      </Button>
    </div>
  );
}
