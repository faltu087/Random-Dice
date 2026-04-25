
"use client";

import * as React from "react";
import { DiceCube } from "@/components/dice/dice-cube";
import { CooldownTimer } from "@/components/dice/cooldown-timer";
import { useDiceStore, type Player } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trophy, RotateCcw, Home, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

export function TournamentMode() {
  const { 
    players, 
    currentPlayerIndex, 
    tournamentConfig, 
    tournamentCurrentRoll, 
    tournamentScores,
    startTournament,
    addTournamentScore,
    nextTournamentRoll,
    setGameMode,
    settings
  } = useDiceStore();

  const [started, setStarted] = React.useState(false);
  const [rollsInput, setRollsInput] = React.useState(3);
  const [currentValue, setCurrentValue] = React.useState(1);
  const [isRolling, setIsRolling] = React.useState(false);
  const [onCooldown, setOnCooldown] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);

  const isFinished = currentPlayerIndex >= players.length;
  const currentPlayer = players[currentPlayerIndex];

  const handleStart = () => {
    if (players.length < 2) {
      alert("Add at least 2 players in settings first!");
      return;
    }
    startTournament(rollsInput);
    setStarted(true);
  };

  const rollDice = () => {
    if (onCooldown || isRolling || isFinished) return;

    if (settings.haptic && "vibrate" in navigator) {
      navigator.vibrate(50);
    }

    setIsRolling(true);
    setShowResult(false);

    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      setCurrentValue(newValue);
      setIsRolling(false);
      setShowResult(true);
      setOnCooldown(true);
      addTournamentScore(currentPlayer.id, newValue);
    }, 800);
  };

  const handleCooldownComplete = () => {
    setOnCooldown(false);
    setShowResult(false);
    nextTournamentRoll();
  };

  if (isFinished) {
    const sorted = [...players].sort((a, b) => (tournamentScores[b.id] || 0) - (tournamentScores[a.id] || 0));
    const winner = sorted[0];
    const isTie = sorted[0] && sorted[1] && tournamentScores[sorted[0].id] === tournamentScores[sorted[1].id];

    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-bounce" />
          <Award className="absolute -bottom-2 -right-2 w-10 h-10 text-blue-400" />
        </div>
        
        <div className="text-center">
          <h2 className="text-4xl font-headline font-bold mb-1">
            {isTie ? "It's a Tie! 🤝" : `${winner.name} Wins! 👑`}
          </h2>
          <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px]">Grand Finale Results</p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          {sorted.map((p, i) => (
            <div 
              key={p.id} 
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all duration-500",
                i === 0 ? "bg-yellow-500/10 border-yellow-500/50 scale-105 shadow-[0_0_20px_rgba(234,179,8,0.1)]" : "bg-white/5 border-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                  i === 0 ? "bg-yellow-500 text-slate-950" : "bg-white/10 text-white/50"
                )}>
                  {i === 0 ? "1" : i === 1 ? "2" : i === 2 ? "3" : i + 1}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{p.name}</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Score</span>
                </div>
              </div>
              <span className={cn("text-3xl font-black", i === 0 ? "text-yellow-500" : "text-white")}>
                {tournamentScores[p.id] || 0}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col w-full max-w-sm gap-3 pt-4">
          <Button onClick={handleStart} className="h-16 rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-lg shadow-xl">
            <RotateCcw className="w-6 h-6 mr-2" /> NEW TOURNAMENT
          </Button>
          <Button variant="ghost" onClick={() => setGameMode("Menu")} className="h-14 rounded-2xl text-white/60 hover:text-white hover:bg-white/5">
            <Home className="w-5 h-5 mr-2" /> EXIT TO MENU
          </Button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center space-y-12">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setGameMode("Menu")}
          className="absolute top-8 left-8 text-white/50 hover:text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>

        <div className="text-center space-y-6">
           <Trophy className="w-20 h-20 text-yellow-500 mx-auto opacity-80" />
           <div className="space-y-2">
             <h2 className="text-3xl font-headline font-bold">Arena Setup</h2>
             <p className="text-slate-500 text-sm">Select number of rolls per participant</p>
           </div>
           
           <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-8">
             <h3 className="text-7xl font-black text-yellow-500 tabular-nums">{rollsInput}</h3>
             <Slider 
               value={[rollsInput]} 
               onValueChange={([v]) => setRollsInput(v)} 
               min={1} 
               max={10} 
               step={1} 
               className="w-64 mx-auto"
             />
           </div>
        </div>

        <div className="w-full max-w-sm space-y-4">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h4 className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-3">Lineup</h4>
              <div className="flex flex-wrap gap-2">
                 {players.map(p => (
                   <div key={p.id} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                     {p.name}
                   </div>
                 ))}
              </div>
           </div>
           <Button onClick={handleStart} className="w-full h-16 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xl font-black rounded-2xl shadow-lg">
              ENTER THE ARENA
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-between overflow-hidden">
      <header className="w-full flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
         <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Tournament</span>
            <h2 className="text-xl font-bold">Battle Phase</h2>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Progress</span>
            <span className="text-xl font-black text-yellow-500">
               {tournamentCurrentRoll} <span className="text-white/20">/</span> {tournamentConfig.rollsPerPlayer}
            </span>
         </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
         <div className="text-center space-y-2">
            <div className="flex items-center gap-2 justify-center">
               <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: currentPlayer?.color }} />
               <span className="text-xs uppercase font-black tracking-widest text-white/40">Active Competitor</span>
            </div>
            <h3 className="text-5xl font-headline font-bold">{currentPlayer?.name}</h3>
            <div className="bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20 inline-block">
               <span className="text-yellow-500 text-2xl font-black">Score: {tournamentScores[currentPlayer?.id] || 0}</span>
            </div>
         </div>

         <div className="relative">
            <div 
              className="p-12 rounded-full bg-white/[0.02] border border-white/5 transition-all duration-500"
              style={{ boxShadow: showResult ? `0 0 60px ${currentPlayer?.color}33` : 'none' }}
            >
                <DiceCube value={currentValue} isRolling={isRolling} color={currentPlayer?.color} />
                <CooldownTimer duration={2} isActive={onCooldown} onComplete={handleCooldownComplete} />
                
                {showResult && !onCooldown && (
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-slate-950 px-6 py-2 rounded-full font-black text-xl animate-bounce shadow-2xl z-30">
                      +{currentValue}
                   </div>
                )}
            </div>
            
            {/* Visual background pulse */}
            <div 
              className="absolute inset-0 rounded-full blur-3xl opacity-20 -z-10 transition-colors duration-500"
              style={{ backgroundColor: isRolling ? currentPlayer?.color : 'transparent' }}
            />
         </div>

         <div className="w-full max-w-xs">
            <Button 
               disabled={isRolling || onCooldown}
               onClick={rollDice}
               className="w-full h-18 text-xl font-black rounded-2xl bg-white text-slate-950 hover:bg-slate-200 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            >
               {onCooldown ? "NEXT ROLL..." : isRolling ? "ROLLING..." : "ROLL DICE"}
            </Button>
         </div>
      </div>

      <footer className="w-full overflow-x-auto pb-4 pt-2">
         <div className="flex gap-3 px-2">
            {players.map((p, idx) => (
               <div 
                 key={p.id}
                 className={cn(
                   "flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300",
                   idx === currentPlayerIndex 
                    ? "bg-white/10 border-white/30 border-2 scale-105 shadow-lg" 
                    : "bg-white/[0.03] border border-transparent opacity-60"
                 )}
               >
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-white/40">{p.name}</span>
                    <span className="text-sm font-black">{tournamentScores[p.id] || 0}</span>
                 </div>
               </div>
            ))}
         </div>
      </footer>
    </div>
  );
}
