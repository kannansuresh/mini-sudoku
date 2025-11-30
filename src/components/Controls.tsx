import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { Lightbulb, Pencil, X, Play, ScanLine, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageImportModal } from "./ImageImportModal";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export function Controls() {
  const {
    settings,
    setNotesMode,
    status,
    tempNotesMode,
    activeHint,
    clearHint,
    hasMadeMoves
  } = useGameStore();

  const isNotesActive = settings.notesMode || tempNotesMode;
  const [error, setError] = useState<string | null>(null);

  const handleHint = () => {
    if (status === 'Completed') return;
    useGameStore.getState().showHint();
  };

  const handleStartGame = () => {
    const result = useGameStore.getState().validateAndStartCustomGame();
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const [isImportOpen, setIsImportOpen] = useState(false);
  const { importGrid, resetGame } = useGameStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (status === 'creating') {
    return (
      <>
        <div className="flex w-full gap-2 min-h-[48px]">
          <Button
            variant="outline"
            className="flex-1 h-auto py-2"
            onClick={() => setIsImportOpen(true)}
          >
            <ScanLine className="mr-2 h-4 w-4" />
            <span className="font-semibold">Import</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 h-auto py-2 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-900/50"
            onClick={handleStartGame}
          >
            <Play className="mr-2 h-4 w-4 fill-current" />
            <span className="font-semibold">Start Game</span>
          </Button>
        </div>

        <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Invalid Puzzle</AlertDialogTitle>
              <AlertDialogDescription>
                {error}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setError(null)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ImageImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onScanComplete={importGrid}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-3">
        {activeHint ? (
          <div className="flex w-full h-[48px] items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
            <p className="text-xs text-left text-yellow-800 dark:text-yellow-200 line-clamp-2 leading-tight flex-1 mr-2">
              {activeHint.reason.split(String(activeHint.value)).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="font-bold">{activeHint.value}</span>}
                </span>
              ))}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 min-w-6 text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100 dark:text-yellow-300 dark:hover:text-yellow-100 dark:hover:bg-yellow-900/50"
              onClick={clearHint}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            {/* Reset Button */}
            {(status === 'In Progress' || (status as string) === 'creating') ? (
              <Button
                variant="secondary"
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-200 disabled:opacity-50"
                onClick={() => setShowResetConfirm(true)}
                disabled={!hasMadeMoves}
              >
                <RotateCcw className="h-4 w-4" />
                <span className="text-sm font-semibold">Reset</span>
              </Button>
            ) : (
              // Placeholder to keep layout consistent if we wanted, but user asked to hide it.
              // If hidden, the other two will expand. That's fine.
              null
            )}

            {/* Notes Button */}
            <Button
              variant="secondary"
              className={cn(
                "flex-1 h-12 flex items-center justify-center gap-2 transition-all duration-200",
                isNotesActive
                  ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ring-2 ring-neutral-400 dark:ring-neutral-600"
                  : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              )}
              onClick={() => setNotesMode(!settings.notesMode)}
              disabled={status !== 'In Progress' && (status as string) !== 'creating'}
            >
              <div className="relative flex items-center justify-center">
                <Pencil className={cn("h-4 w-4 transition-all", isNotesActive && "stroke-[2.5px]")} />
                {isNotesActive && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold">Notes</span>
            </Button>

            {/* Hint Button */}
            <Button
              variant="secondary"
              className="flex-1 h-12 flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-200 group"
              onClick={handleHint}
              disabled={status !== 'In Progress'}
            >
              <Lightbulb className="h-4 w-4 transition-all duration-300 group-hover:text-yellow-500 group-hover:fill-yellow-500 group-hover:scale-110 group-hover:animate-pulse" />
              <span className="text-sm font-semibold">Hint</span>
            </Button>
          </>
        )}
      </div>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Puzzle?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the current puzzle to its initial state? All your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowResetConfirm(false)}>Cancel</AlertDialogAction>
            <AlertDialogAction onClick={() => { resetGame(); setShowResetConfirm(false); }}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
