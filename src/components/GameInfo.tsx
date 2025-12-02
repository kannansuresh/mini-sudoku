import { useGameStore } from "@/store/gameStore";
import { useEffect } from "react";

export function GameInfo() {
  const { timer, settings, tickTimer, status, difficulty, dailyDate } = useGameStore();

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

  if (status === 'creating') return null;

  return (
    <div className="flex w-full items-center justify-between px-2 mb-2">
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
  );
}
