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
import { Calendar, PenLine, Play, Github } from "lucide-react";

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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function GameHeader() {
  const { timer, settings, tickTimer, startGame, status, difficulty, hasMadeMoves, dailyDate, dailyHistory, loadDailyHistory } = useGameStore();
  const [pendingAction, setPendingAction] = useState<{ action: () => void, message: string, title: string } | null>(null);

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
    if (status === 'In Progress' && hasMadeMoves) {
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

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    loadDailyHistory();
  }, [loadDailyHistory]);

  const getTodayStatus = () => {
    const today = new Date();
    const todaySession = dailyHistory.find(s => {
      if (!s.targetDate) return false;
      const d = new Date(s.targetDate);
      return d.getDate() === today.getDate() &&
             d.getMonth() === today.getMonth() &&
             d.getFullYear() === today.getFullYear();
    });
    return todaySession?.status;
  };

  const todayStatus = getTodayStatus();

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
                  dailyDate
                    ? `Are you sure you want to start a new ${d} game? Your progress will be saved up until now including elapsed time.`
                    : `Are you sure you want to start a new ${d} game? Your current progress will be lost.`
                )}>
                  {d}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover open={isCalendarOpen} onOpenChange={(open) => {
            setIsCalendarOpen(open);
            if (open) {
              loadDailyHistory();
            }
          }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Calendar className={`h-5 w-5 ${todayStatus === 'In Progress' ? 'text-amber-600 dark:text-amber-400' : todayStatus === 'Completed' ? 'text-green-600 dark:text-green-400' : ''}`} />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Daily Challenge</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dailyDate ? new Date(dailyDate) : new Date()}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    setIsCalendarOpen(false);
                    handleNewGame(
                      () => useGameStore.getState().startDailyGame(date),
                      "Start Daily Challenge?",
                      dailyDate
                        ? `Are you sure you want to start the Daily Challenge for ${date.toLocaleDateString()}? Your progress will be saved up until now including elapsed time.`
                        : `Are you sure you want to start the Daily Challenge for ${date.toLocaleDateString()}? Your current progress will be lost.`
                    );
                  }
                }}
                disabled={(date: Date) => date > new Date() || date < new Date("2025-11-21")}
                startMonth={new Date("2025-11-01")}
                endMonth={new Date()}
                captionLayout="dropdown"
                fromYear={2025}
                toYear={new Date().getFullYear()}
                initialFocus
                footer={
                  <div className="flex justify-center pt-3 border-t mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs font-normal"
                      onClick={() => {
                        setIsCalendarOpen(false);
                        handleNewGame(
                          () => useGameStore.getState().startDailyGame(new Date()),
                          "Start Daily Challenge?",
                          dailyDate
                            ? "Are you sure you want to start the Daily Challenge for today? Your progress will be saved up until now including elapsed time."
                            : "Are you sure you want to start the Daily Challenge for today? Your current progress will be lost."
                        );
                      }}
                    >
                      Go to Today
                    </Button>
                  </div>
                }
                modifiers={{
                  played: (date) => {
                    return dailyHistory.some(s => {
                      if (!s.targetDate) return false;
                      const d = new Date(s.targetDate);
                      return d.getDate() === date.getDate() &&
                             d.getMonth() === date.getMonth() &&
                             d.getFullYear() === date.getFullYear() &&
                             s.status === 'In Progress';
                    });
                  },
                  won: (date) => {
                    return dailyHistory.some(s => {
                      if (!s.targetDate) return false;
                      const d = new Date(s.targetDate);
                      return d.getDate() === date.getDate() &&
                             d.getMonth() === date.getMonth() &&
                             d.getFullYear() === date.getFullYear() &&
                             s.status === 'Completed';
                    });
                  }
                }}
                modifiersClassNames={{
                  played: "text-amber-600 dark:text-amber-400 font-bold",
                  won: "text-green-600 dark:text-green-400 font-bold"
                }}
              />
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNewGame(
                  () => useGameStore.getState().enterCreateMode(),
                  "Create Custom Puzzle?",
                  dailyDate
                    ? "Are you sure you want to create a custom puzzle? Your progress will be saved up until now including elapsed time."
                    : "Are you sure you want to create a custom puzzle? Your current progress will be lost."
                )}
              >
                <PenLine className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create Custom Puzzle</p>
            </TooltipContent>
          </Tooltip>



          <SettingsModal />
          <ModeToggle />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com/kannansuresh" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View on GitHub</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Info Row (Difficulty & Timer) */}
      {status !== 'creating' && (
        <div className="flex w-full items-center justify-between px-2 mt-2">
          <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {status === 'In Progress' || status === 'Not Started' || status === 'Completed' ? (
              dailyDate ? (
                <span>
                  {new Date(dailyDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} ({difficulty})
                </span>
              ) : (
                difficulty
              )
            ) : (
              'Select a game'
            )}
          </div>

          {settings.showTimer && (
            <div className="font-mono text-sm font-medium tabular-nums text-neutral-600 dark:text-neutral-400">
              {formatTime(timer)}
            </div>
          )}
        </div>
      )}

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
    </header>
  );
}
