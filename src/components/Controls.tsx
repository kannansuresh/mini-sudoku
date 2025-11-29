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
    status
  } = useGameStore();
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
    <div className="flex w-full justify-between gap-2">
      <Button
        variant="ghost"
        className="flex-1 hover:bg-transparent hover:text-neutral-900 dark:hover:text-neutral-100"
        onClick={() => setNotesMode(!settings.notesMode)}
        disabled={status === 'won'}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Notes
        <span className={cn(
          "ml-1 font-bold w-8 text-left inline-block",
          settings.notesMode ? "text-green-600 dark:text-green-400" : "text-neutral-300 dark:text-neutral-600"
        )}>
          {settings.notesMode ? "ON" : "OFF"}
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
    </div>
  );
}
