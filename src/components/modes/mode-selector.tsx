
"use client";

import * as React from "react";
import { Dice6, Trophy, Swords } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDiceStore, type GameMode } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ModeSelector() {
  const { setGameMode } = useDiceStore();

  const modes: { id: GameMode; title: string; desc: string; icon: any; color: string; sub: string }[] = [
    { 
      id: "Standard", 
      title: "Classic Mode", 
      desc: "Lucky, Decisions, Yoga & more", 
      sub: "Roll & have fun",
      icon: Dice6, 
      color: "bg-primary" 
    },
    { 
      id: "Tournament", 
      title: "Tournament Mode", 
      desc: "Roll for the highest score", 
      sub: "Compete & win",
      icon: Trophy, 
      color: "bg-accent" 
    },
    { 
      id: "SPS", 
      title: "Stone Paper Scissors", 
      desc: "Best of 1/3/5 rounds", 
      sub: "2-player battle",
      icon: Swords, 
      color: "bg-teal-600" 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-6 items-center justify-center space-y-12 overflow-hidden">
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-5xl font-headline font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          Smart Dice
        </h1>
        <p className="text-slate-400 uppercase tracking-[0.4em] text-xs font-bold">
          Choose Your Game Mode
        </p>
      </div>

      <div className="grid gap-6 w-full max-w-md">
        {modes.map((mode, index) => (
          <Card 
            key={mode.id} 
            className={cn(
              "group relative overflow-hidden transition-all duration-300 cursor-pointer border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:scale-105 active:scale-95",
              "animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
            )}
            style={{ animationDelay: `${index * 150}ms` }}
            onClick={() => setGameMode(mode.id)}
          >
            <CardContent className="p-0 flex items-center h-24">
              <div className={cn(
                "h-full w-24 flex items-center justify-center text-white transition-colors duration-300",
                mode.color
              )}>
                <mode.icon className="w-10 h-10 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-5 flex-1 space-y-1">
                <h3 className="font-headline font-bold text-xl text-white group-hover:text-primary transition-colors">{mode.title}</h3>
                <p className="text-xs text-slate-400 font-medium">{mode.sub}</p>
              </div>
            </CardContent>
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/10 rounded-lg pointer-events-none" />
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 pt-12 animate-in fade-in duration-1000 delay-700">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.5em]">
          Powered by Genkit AI
        </p>
        <div className="flex gap-4 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
           <span>v3.0.0</span>
           <span>•</span>
           <span>Stable Release</span>
        </div>
      </div>
    </div>
  );
}
