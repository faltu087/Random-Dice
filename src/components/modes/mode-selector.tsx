
"use client";

import * as React from "react";
import { Dice6, Trophy, Hand, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDiceStore, type GameMode } from "@/lib/store";
import { PlayerSetup } from "@/components/game/player-setup";
import { SettingsPopover } from "@/components/game/settings-popover";

export function ModeSelector() {
  const { setGameMode } = useDiceStore();

  const modes: { id: GameMode; title: string; desc: string; icon: any; color: string }[] = [
    { 
      id: "Standard", 
      title: "Standard Play", 
      desc: "Lucky, Decisions, Yoga & more", 
      icon: Dice6, 
      color: "bg-primary" 
    },
    { 
      id: "Tournament", 
      title: "Tournament", 
      desc: "Roll for the highest score", 
      icon: Trophy, 
      color: "bg-accent" 
    },
    { 
      id: "SPS", 
      title: "Stone Paper Scissors", 
      desc: "Best of 1/3/5 rounds", 
      icon: Hand, 
      color: "bg-teal-600" 
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 items-center justify-center space-y-8">
      <div className="text-center space-y-2 mb-4">
        <h1 className="text-4xl font-headline font-bold text-primary">Smart Dice</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-sm">Select Your Mode</p>
      </div>

      <div className="grid gap-4 w-full max-w-md">
        {modes.map((mode) => (
          <Card 
            key={mode.id} 
            className="overflow-hidden hover:scale-102 transition-transform cursor-pointer border-2 hover:border-primary/50"
            onClick={() => setGameMode(mode.id)}
          >
            <CardContent className="p-0 flex items-center">
              <div className={`${mode.color} p-6 flex items-center justify-center text-white`}>
                <mode.icon className="w-8 h-8" />
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-bold text-lg">{mode.title}</h3>
                <p className="text-xs text-muted-foreground">{mode.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <PlayerSetup />
        <SettingsPopover />
      </div>

      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-10">
        v2.0 • Pro Multiplayer System
      </p>
    </div>
  );
}
