import { useGameStore } from "@/store/gameStore";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, X, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTheme } from "@/components/theme-provider";

interface SettingsModalProps {
  trigger?: React.ReactNode;
}

export function SettingsModal({ trigger }: SettingsModalProps) {
  const { settings, updateSettings } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const { theme, setTheme } = useTheme();
  const [originalTheme, setOriginalTheme] = useState(theme);

  // Reset local settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setOriginalTheme(theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only run when modal opens to avoid resetting on theme preview

  const handleToggle = (key: keyof typeof settings) => {
    if (key === 'autoCheck') return; // Handled separately
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    setLocalSettings(prev => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
  };

  const handleCancel = () => {
    setTheme(originalTheme);
    setIsOpen(false);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setIsOpen(false);
    toast.success("Settings saved successfully");
  };

  if (!isOpen) {
    if (trigger) {
      return <div onClick={() => setIsOpen(true)}>{trigger}</div>;
    }
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
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="assistance">Assistance</TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
            <TabsContent value="general" className="space-y-4 data-[state=inactive]:hidden">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Theme</Label>
                  <p className="text-[10px] text-muted-foreground">
                    App appearance
                  </p>
                </div>
                <div className="flex rounded-md border border-neutral-200 p-1 dark:border-neutral-800">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleThemeChange(t)}
                      className={`rounded px-3 py-1 text-xs font-medium capitalize transition-colors ${
                        localSettings.theme === t
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Default Mode</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Game mode to start on load
                  </p>
                </div>
                <div className="flex rounded-md border border-neutral-200 p-1 dark:border-neutral-800">
                  {(['Daily', 'Standard'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setLocalSettings(prev => ({ ...prev, defaultMode: mode }))}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        localSettings.defaultMode === mode
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Default Difficulty</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Difficulty for standard games
                  </p>
                </div>
                <div className="flex rounded-md border border-neutral-200 p-1 dark:border-neutral-800">
                  {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setLocalSettings(prev => ({ ...prev, defaultDifficulty: diff }))}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        localSettings.defaultDifficulty === diff
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <SettingToggle
                label="Show Timer"
                description="Show the elapsed time"
                checked={localSettings.showTimer}
                onChange={() => handleToggle('showTimer')}
              />

              <SettingToggle
                label="Skip Start Banner"
                description="Start games immediately without the overlay (not applicable for Daily Challenge)"
                checked={localSettings.skipStartBanner}
                onChange={() => handleToggle('skipStartBanner')}
              />
            </TabsContent>

            <TabsContent value="assistance" className="space-y-4 data-[state=inactive]:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Autocheck</p>
                  <p className="text-[10px] text-neutral-500">Highlight errors automatically</p>
                </div>
                <div className="flex rounded-md border border-neutral-200 p-1 dark:border-neutral-800">
                  {(['Off', 'Conflicts', 'Mistakes'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setLocalSettings(prev => ({ ...prev, autoCheck: mode }))}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        localSettings.autoCheck === mode
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      {mode}
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
                checked={localSettings.remainingCount}
                onChange={() => handleToggle('remainingCount')}
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
                checked={localSettings.hideFilledNumbers}
                onChange={() => handleToggle('hideFilledNumbers')}
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="mt-8 flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
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
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[10px] text-neutral-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
