import { useGameStore } from "@/store/gameStore";
import { useEffect } from "react";
import { SettingsModal } from "./SettingsModal";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button";
import type { Difficulty } from "@/lib/sudoku";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RotateCcw, Calendar, PenLine, Play } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function GameHeader() {
  const { timer, settings, tickTimer, startGame, status, difficulty, resetGame, hasMadeMoves } = useGameStore();
  const [pendingAction, setPendingAction] = useState<{ action: () => void, message: string, title: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNewGame = (action: () => void, title: string, message: string) => {
    // Only ask for confirmation if game is in progress AND moves have been made
    if (status === 'playing' && hasMadeMoves) {
      setPendingAction({ action, title, message });
    } else {
      action();
    }
  };

  const confirmNewGame = () => {
    if (pendingAction) {
      pendingAction.action();
      setPendingAction(null);
    }
  };

  return (
    <header className="flex w-full flex-col gap-4 mb-4">
      {/* Title Row */}
      <div className="flex w-full justify-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Mini Sudoku
        </h1>
      </div>

      {/* Controls Row */}
      <div className="flex w-full items-center justify-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowResetConfirm(true)}
                disabled={status !== 'playing'}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset Puzzle</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNewGame(
                  () => useGameStore.getState().startDailyGame(),
                  "Start Daily Challenge?",
                  "Are you sure you want to start the Daily Challenge? Your current progress will be lost."
                )}
              >
                <Calendar className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Daily Challenge</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNewGame(
                  () => useGameStore.getState().enterCreateMode(),
                  "Create Custom Puzzle?",
                  "Are you sure you want to create a custom puzzle? Your current progress will be lost."
                )}
              >
                <PenLine className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create Custom Puzzle</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Play className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Game</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                <DropdownMenuItem key={d} onClick={() => handleNewGame(
                  () => startGame(d),
                  "Start New Game?",
                  `Are you sure you want to start a new ${d} game? Your current progress will be lost.`
                )}>
                  {d}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <SettingsModal />
          <ModeToggle />
        </TooltipProvider>
      </div>

      {/* Info Row (Difficulty & Timer) */}
      <div className="flex w-full items-center justify-between px-2 mt-2">
        <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {status === 'playing' ? difficulty : 'Select a game'}
        </div>

        {settings.showClock && (
          <div className="font-mono text-lg font-medium tabular-nums text-neutral-600 dark:text-neutral-400">
            {formatTime(timer)}
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNewGame}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Puzzle?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the current puzzle to its initial state? All your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { resetGame(); setShowResetConfirm(false); }}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
