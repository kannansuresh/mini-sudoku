import { useGameStore } from "@/store/gameStore";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, X } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// I need to add Switch component from Shadcn first.
// I'll assume I'll add it in the next step or use a simple HTML checkbox for now if I don't want to run another command immediately.
// But I should use Shadcn Switch for "Premium" feel.
// I will add the Switch component via command in the next step.
// For now I will write the code assuming it exists.

export function SettingsModal() {
  const { settings, toggleSettings } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
              <SettingsIcon className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Settings</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <SettingToggle
            label="Show Clock"
            description="Show the elapsed time"
            checked={settings.showClock}
            onChange={() => toggleSettings('showClock')}
          />
          <SettingToggle
            label="Autocheck"
            description="Highlight errors automatically"
            checked={settings.autocheck}
            onChange={() => toggleSettings('autocheck')}
          />
          <SettingToggle
            label="Highlight Sections"
            description="Highlight row, column, and region"
            checked={settings.highlightSections}
            onChange={() => toggleSettings('highlightSections')}
          />
          <SettingToggle
            label="Count Remaining"
            description="Show remaining count for each number"
            checked={settings.countRemaining}
            onChange={() => toggleSettings('countRemaining')}
          />
          <SettingToggle
            label="Show Available Placements"
            description="Disable invalid numbers on keyboard"
            checked={settings.showAvailablePlacements}
            onChange={() => toggleSettings('showAvailablePlacements')}
          />
          <SettingToggle
            label="Hide Finished Numbers"
            description="Disable completed numbers"
            checked={settings.hideFinishedNumber}
            onChange={() => toggleSettings('hideFinishedNumber')}
          />
          <SettingToggle
            label="Skip Start Banner"
            description="Start game immediately"
            checked={settings.skipStartOverlay}
            onChange={() => toggleSettings('skipStartOverlay')}
          />
        </div>

        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>Mini Sudoku v1.0</p>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
