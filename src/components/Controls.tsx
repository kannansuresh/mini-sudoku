import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { Lightbulb, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function Controls() {
  const {
    settings,
    setNotesMode,
    status
  } = useGameStore();

  const handleHint = () => {
    if (status === 'won') return;
    useGameStore.getState().showHint();
  };

  if (status === 'creating') {
    return (
      <div className="flex w-full gap-2">
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={() => useGameStore.getState().validateAndStartCustomGame()}
        >
          Start Game
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-between gap-2">
      <Button
        variant={settings.notesMode ? "default" : "secondary"}
        className={cn("flex-1", settings.notesMode && "bg-blue-600 hover:bg-blue-700")}
        onClick={() => setNotesMode(!settings.notesMode)}
        disabled={status === 'won'}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Notes
      </Button>

      <Button
        variant="secondary"
        className="flex-1"
        onClick={handleHint}
        disabled={status === 'won'}
      >
        <Lightbulb className="mr-2 h-4 w-4" />
        Hint
      </Button>
    </div>
  );
}
