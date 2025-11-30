import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { Play } from "lucide-react";

export function StartGameOverlay() {
  const { confirmStartGame, difficulty, dailyDate, dailyProgress } = useGameStore();

  let title = "Ready to Play?";
  let buttonText = "Start Game";

  if (dailyDate) {
    const today = new Date();
    const isToday = dailyDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
    const dateKey = dailyDate.toISOString().split('T')[0];
    const hasProgress = !!dailyProgress[dateKey];

    if (hasProgress) {
      title = "Ready to continue with this challenge?";
      buttonText = "Continue Challenge";
    } else if (isToday) {
      title = "Ready to play today's challenge?";
    } else {
      title = "Ready to play a past challenge?";
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-neutral-950/80">
      <div className="flex flex-col items-center gap-4 p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
          <Play className="h-8 w-8 text-blue-600 dark:text-blue-400 ml-1" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h2>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {dailyDate ? (
                <span>
                  {dailyDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} ({difficulty})
                </span>
              ) : (
                `${difficulty} Puzzle`
              )}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[200px] mx-auto">
              Click start to reveal the board. The timer will begin immediately.
            </p>
          </div>
        </div>
        <Button
          size="lg"
          onClick={confirmStartGame}
          className="w-full font-semibold"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
