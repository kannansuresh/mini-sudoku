import { useGameStore } from "@/store/gameStore";
import { useEffect } from "react";
import { SettingsModal } from "./SettingsModal";
import { Button } from "@/components/ui/button";
import type { Difficulty } from "@/lib/sudoku";
import { Settings as SettingsIcon } from "lucide-react";

export function GameHeader() {
  const { timer, settings, tickTimer, difficulty, startGame } = useGameStore();

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

  return (
    <header className="flex w-full max-w-md flex-col gap-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Mini Sudoku
        </h1>
        <div className="flex items-center gap-2">
           {settings.showClock && (
            <div className="font-mono text-lg font-medium tabular-nums text-neutral-600 dark:text-neutral-400">
              {formatTime(timer)}
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => useGameStore.setState({ status: 'idle' })}>
             <SettingsIcon className="h-5 w-5" /> {/* Placeholder for restart/home if needed, but actually we want settings */}
          </Button>
           <SettingsModal />
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
            onClick={() => useGameStore.getState().startDailyGame()}
          >
            Daily
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
            onClick={() => useGameStore.getState().enterCreateMode()}
          >
            Create
          </Button>
          {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
            <Button
              key={d}
              variant={difficulty === d ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => startGame(d)}
            >
              {d}
            </Button>
          ))}
        </div>

    </header>
  );
}
