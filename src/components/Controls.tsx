import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { Lightbulb, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

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
    activeHint
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

  if (status === 'creating') {
    return (
      <>
        <div className="flex w-full gap-2">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleStartGame}
          >
            Start Game
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
      </>
    );
  }

  return (
    <div className="flex w-full justify-between gap-2 min-h-[52px] items-center">
      {activeHint ? (
        <div className="flex w-full h-[52px] items-center justify-start p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
          <p className="text-xs text-left text-yellow-800 dark:text-yellow-200 line-clamp-2 leading-tight">
            <span className="font-bold mr-1">Place {activeHint.value}:</span>
            {activeHint.reason}
          </p>
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
