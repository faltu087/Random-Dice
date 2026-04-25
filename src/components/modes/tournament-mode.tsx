
"use client";

import * as React from "react";
import { DiceCube } from "@/components/dice/dice-cube";
import { CooldownTimer } from "@/components/dice/cooldown-timer";
import { useDiceStore, type Player } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trophy, Medal, RotateCcw, Home } from "lucide-react";
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
    }, 1000);
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
      <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
        <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce" />
        <div className="text-center">
          <h2 className="text-4xl font-headline font-bold mb-2">
            {isTie ? "It's a Tie! 🤝" : `${winner.name} Wins! 🥇`}
          </h2>
          <p className="text-slate-400 uppercase tracking-widest text-sm">Final Results</p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          {sorted.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-white/10">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">{p.name}</span>
                  <span className="text-[10px] text-white/50 uppercase">Final Score</span>
                </div>
              </div>
              <span className="text-2xl font-bold">{tournamentScores[p.id] || 0}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col w-full max-w-sm gap-3">
          <Button onClick={() => handleStart()} className="h-14 rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold">
            <RotateCcw className="w-5 h-5 mr-2" /> Play Again
          </Button>
          <Button variant="outline" onClick={() => setGameMode("Menu")} className="h-14 rounded-2xl border-white/20 text-white hover:bg-white/10">
            <Home className="w-5 h-5 mr-2" /> Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center space-y-12">
        <div className="flex items-center gap-4 w-full max-w-md absolute top-6 left-6">
           <Button variant="ghost" size="icon" onClick={() => setGameMode("Menu")}>
             <ChevronLeft className="w-6 h-6" />
           </Button>
           <h2 className="text-xl font-bold">Tournament Setup</h2>
        </div>

        <div className="text-center space-y-4">
           <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
           <p className="text-slate-400">Set total rolls per player</p>
           <h3 className="text-6xl font-bold text-yellow-500">{rollsInput}</h3>
           <Slider 
             value={[rollsInput]} 
             onValueChange={([v]) => setRollsInput(v)} 
             min={1} 
             max={10} 
             step={1} 
             className="w-64 mx-auto"
           />
        </div>

        <div className="w-full max-w-sm space-y-4">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs uppercase text-slate-400 mb-2">Players Participating</h4>
              <div className="flex flex-wrap gap-2">
                 {players.map(p => (
                   <div key={p.id} className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                     {p.name}
                   </div>
                 ))}
              </div>
           </div>
           <Button onClick={handleStart} className="w-full h-16 bg-yellow-500 hover:bg-yellow-600 text-slate-900 text-xl font-bold rounded-2xl">
              START TOURNAMENT
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-between overflow-hidden">
      <header className="w-full flex justify-between items-start">
         <div className="flex flex-col">
            <span className="text-[10px] text-white/50 uppercase tracking-widest">Tournament Mode</span>
            <h2 className="text-2xl font-bold">Arena</h2>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/50 uppercase tracking-widest">Roll Progress</span>
            <span className="text-xl font-bold text-yellow-500">
               {tournamentCurrentRoll} / {tournamentConfig.rollsPerPlayer}
            </span>
         </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
         <div className="text-center animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 justify-center mb-1">
               <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentPlayer?.color }} />
               <span className="text-xs uppercase font-bold text-white/70">Currently Rolling</span>
            </div>
            <h3 className="text-4xl font-headline font-bold">{currentPlayer?.name}</h3>
            <p className="text-yellow-500 text-2xl font-bold mt-2">
               Score: {tournamentScores[currentPlayer?.id] || 0}
            </p>
         </div>

         <div 
           className="p-10 rounded-full bg-white/5 relative"
           style={{ boxShadow: showResult ? `0 0 50px ${currentPlayer?.color}44` : 'none' }}
         >
            <DiceCube value={currentValue} isRolling={isRolling} color={currentPlayer?.color} />
            <CooldownTimer duration={2} isActive={onCooldown} onComplete={handleCooldownComplete} />
            
            {showResult && !onCooldown && (
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-1 rounded-full font-bold animate-bounce shadow-xl">
                  +{currentValue}
               </div>
            )}
         </div>

         <div className="w-full max-w-xs">
            <Button 
               disabled={isRolling || onCooldown}
               onClick={rollDice}
               className="w-full h-16 text-xl font-bold rounded-2xl bg-white text-slate-900 hover:bg-slate-200"
            >
               {onCooldown ? "NEXT..." : isRolling ? "ROLLING..." : "ROLL DICE"}
            </Button>
         </div>
      </div>

      <footer className="w-full overflow-x-auto pb-2">
         <div className="flex gap-3 px-2">
            {players.map((p, idx) => (
               <div 
                 key={p.id}
                 className={cn(
                   "flex items-center gap-3 px-4 py-2 rounded-xl transition-all",
                   idx === currentPlayerIndex ? "bg-white/20 border-white/40 border" : "bg-white/5"
                 )}
               >
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                 <span className="text-xs font-bold whitespace-nowrap">{p.name}: {tournamentScores[p.id] || 0}</span>
               </div>
            ))}
         </div>
      </footer>
    </div>
  );
}
