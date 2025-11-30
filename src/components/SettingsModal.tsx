import { useGameStore } from "@/store/gameStore";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, X, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SettingsModal() {
  const { settings, updateSettings } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  // Reset local settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleToggle = (key: keyof typeof settings) => {
    if (key === 'autocheck') return; // Handled separately
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setIsOpen(false);
    toast.success("Settings saved successfully");
  };

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
            label="Show Timer"
            description="Show the elapsed time"
            checked={localSettings.showClock}
            onChange={() => handleToggle('showClock')}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Autocheck</p>
              <p className="text-xs text-neutral-500">Highlight errors automatically</p>
            </div>
            <div className="flex rounded-md border border-neutral-200 p-1 dark:border-neutral-800">
              {(['off', 'conflicts', 'mistakes'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLocalSettings(prev => ({ ...prev, autocheck: mode }))}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    localSettings.autocheck === mode
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <SettingToggle
            label="Highlight Sections"
            description="Highlight row, column, and region"
            checked={localSettings.highlightSections}
            onChange={() => handleToggle('highlightSections')}
          />
          <SettingToggle
            label="Remaining Count"
            description="Show remaining count for each number"
            checked={localSettings.countRemaining}
            onChange={() => handleToggle('countRemaining')}
          />
          <SettingToggle
            label="Show Available Placements"
            description="Disable invalid numbers on keyboard"
            checked={localSettings.showAvailablePlacements}
            onChange={() => handleToggle('showAvailablePlacements')}
          />
          <SettingToggle
            label="Hide Finished Numbers"
            description="Disable completed numbers"
            checked={localSettings.hideFinishedNumber}
            onChange={() => handleToggle('hideFinishedNumber')}
          />
          <SettingToggle
            label="Skip Start Banner"
            description="Start game immediately"
            checked={localSettings.skipStartOverlay}
            onChange={() => handleToggle('skipStartOverlay')}
          />
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
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
