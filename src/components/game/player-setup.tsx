
"use client";

import * as React from "react";
import { Plus, X, Users, UserPlus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDiceStore, type Player } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";

const PRESET_COLORS = [
  "#CF8012", "#F46659", "#2A9D8F", "#E9C46A", "#F4A261", 
  "#E76F51", "#264653", "#8AB17D", "#6D597A", "#B56576"
];

export function PlayerSetup() {
  const { players, setPlayers } = useDiceStore();
  const [localPlayers, setLocalPlayers] = React.useState<Player[]>(players);
  const [open, setOpen] = React.useState(false);

  const addPlayer = () => {
    if (localPlayers.length >= 10) return;
    const id = Math.random().toString(36).substring(7);
    const newPlayer: Player = {
      id,
      name: `Player ${localPlayers.length + 1}`,
      color: PRESET_COLORS[localPlayers.length % PRESET_COLORS.length],
    };
    setLocalPlayers([...localPlayers, newPlayer]);
  };

  const removePlayer = (id: string) => {
    if (localPlayers.length <= 1) return;
    setLocalPlayers(localPlayers.filter(p => p.id !== id));
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setLocalPlayers(localPlayers.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleSave = () => {
    setPlayers(localPlayers);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Users className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Local Multiplayer Setup
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] px-1">
          <div className="space-y-4 py-4">
            {localPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: player.color }} 
                />
                <Input 
                  value={player.name} 
                  onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
                  placeholder={`Player ${index + 1}`}
                  className="flex-grow"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removePlayer(player.id)}
                  disabled={localPlayers.length <= 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Button 
          variant="outline" 
          className="w-full border-dashed" 
          onClick={addPlayer}
          disabled={localPlayers.length >= 10}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Player ({localPlayers.length}/10)
        </Button>
        <DialogFooter className="mt-4">
          <Button className="w-full" onClick={handleSave}>Save Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
