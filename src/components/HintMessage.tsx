import { useGameStore } from "@/store/gameStore";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HintMessage() {
  const { activeHint, clearHint } = useGameStore();

  if (!activeHint) return null;

  return (
    <div className="absolute bottom-20 left-0 right-0 z-50 mx-auto w-full max-w-md px-4">
      <div className="flex w-full items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-lg dark:border-yellow-900/50 dark:bg-yellow-950/90 dark:text-yellow-200 backdrop-blur-sm">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
        <div className="flex-1">
          <p className="font-bold text-yellow-800 dark:text-yellow-100 mb-1">
            Hint: Place <span className="text-lg">{activeHint.value}</span>
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-200/80 leading-relaxed">
            {activeHint.reason}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mt-1 -mr-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400"
          onClick={clearHint}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
