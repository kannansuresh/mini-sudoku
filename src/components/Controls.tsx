import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { Lightbulb, Pencil, X, Play, ScanLine } from "lucide-react";
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
    clearHint
  } = useGameStore();

  const isNotesActive = settings.notesMode || tempNotesMode;
  const [error, setError] = useState<string | null>(null);

  const handleHint = () => {
    if (status === 'won') return;
    useGameStore.getState().showHint();
  };

  const handleStartGame = () => {
    const result = useGameStore.getState().validateAndStartCustomGame();
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const [isImportOpen, setIsImportOpen] = useState(false);
  const { importGrid } = useGameStore();

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
    <div className="flex w-full justify-between gap-2 min-h-[48px] items-center">
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
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "flex-1 gap-2 h-auto py-2 hover:bg-transparent",
              isNotesActive
                ? "text-neutral-900 dark:text-neutral-100"
                : "text-neutral-500 dark:text-neutral-400"
            )}
            onClick={() => setNotesMode(!settings.notesMode)}
            disabled={status === 'won'}
          >
            <div className="relative">
              <Pencil className={cn("h-5 w-5 transition-all", isNotesActive && "stroke-2")} />
              {isNotesActive && (
                <span className="absolute -left-1 -bottom-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </div>
            <span className="text-sm font-medium">
              Notes
            </span>
          </Button>

          <Button
            variant="ghost"
            className="flex-1 hover:bg-transparent hover:text-neutral-900 dark:hover:text-neutral-100"
            onClick={handleHint}
            disabled={status === 'won'}
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Hint
          </Button>
        </>
      )}
    </div>
  );
}
