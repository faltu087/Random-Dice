
"use client";

import { Settings, Volume2, VolumeX, Smartphone, SmartphoneNfc } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDiceStore } from "@/lib/store";

export function SettingsPopover() {
  const { settings, updateSettings } = useDiceStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Settings className="w-4 h-4" /> Preferences
          </h4>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="sound-toggle" className="flex items-center gap-2">
              {settings.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Sound Effects
            </Label>
            <Switch 
              id="sound-toggle" 
              checked={settings.sound} 
              onCheckedChange={(checked) => updateSettings({ sound: checked })}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="haptic-toggle" className="flex items-center gap-2">
              {settings.haptic ? <SmartphoneNfc className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              Haptic Feedback
            </Label>
            <Switch 
              id="haptic-toggle" 
              checked={settings.haptic} 
              onCheckedChange={(checked) => updateSettings({ haptic: checked })}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
