
"use client";

import * as React from "react";
import { DiceCube } from "@/components/dice/dice-cube";
import { CooldownTimer } from "@/components/dice/cooldown-timer";
import { useDiceStore, type Player } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trophy, RotateCcw, Home, Award, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";

const PLAYER_COLORS = [
  "#E53935", "#1E88E5", "#43A047", "#FB8C00", "#8E24AA", 
  "#00ACC1", "#E91E63", "#FFB300", "#00BCD4", "#3949AB"
];

export function TournamentMode() {
  const { 
    players, 
    currentPlayerIndex, 
    tournamentConfig, 
    tournamentCurrentRoll, 
    tournamentScores,
    tournamentRollLog,
    setPlayers,
    startTournament,
    addTournamentScore,
    nextTournamentRoll,
    setGameMode,
    settings
  } = useDiceStore();

  const [isSetup, setIsSetup] = React.useState(true);
  const [numPlayers, setNumPlayers] = React.useState(2);
  const [localPlayers, setLocalPlayers] = React.useState<string[]>(["Player 1", "Player 2"]);
  const [rollsInput, setRollsInput] = React.useState(5);
  const [currentValue, setCurrentValue] = React.useState(1);
  const [isRolling, setIsRolling] = React.useState(false);
  const [onCooldown, setOnCooldown] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);

  const isFinished = currentPlayerIndex >= players.length;
  const currentPlayer = players[currentPlayerIndex];

  // Handle local setup changes
  const updatePlayerName = (idx: number, name: string) => {
    const newNames = [...localPlayers];
    newNames[idx] = name;
    setLocalPlayers(newNames);
  };

  const handleNumPlayersChange = (n: number) => {
    setNumPlayers(n);
    const newNames = Array.from({ length: n }).map((_, i) => localPlayers[i] || `Player ${i + 1}`);
    setLocalPlayers(newNames);
  };

  const handleStart = () => {
    const playersToSet: Player[] = localPlayers.map((name, i) => ({
      id: `p-${i}-${Date.now()}`,
      name: name || `Player ${i + 1}`,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length]
    }));
    setPlayers(playersToSet);
    startTournament(rollsInput);
    setIsSetup(false);
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

  // Winner calculation
  React.useEffect(() => {
    if (isFinished && players.length > 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: PLAYER_COLORS
      });
    }
  }, [isFinished, players.length]);

  if (isFinished && players.length > 0) {
    const sorted = [...players].sort((a, b) => (tournamentScores[b.id] || 0) - (tournamentScores[a.id] || 0));
    const winner = sorted[0];
    const isTie = sorted[0] && sorted[1] && tournamentScores[sorted[0].id] === tournamentScores[sorted[1].id];

    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] animate-bounce" />
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
                i === 0 ? "bg-yellow-500/10 border-yellow-500/50 scale-105" : "bg-white/5 border-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-black text-lg",
                  i === 0 ? "bg-yellow-500 text-slate-950" : i === 1 ? "bg-slate-300 text-slate-950" : i === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-white/50"
                )}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg" style={{ color: p.color }}>{p.name}</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Total Points</span>
                </div>
              </div>
              <span className={cn("text-3xl font-black", i === 0 ? "text-yellow-500" : "text-white")}>
                {tournamentScores[p.id] || 0}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col w-full max-w-sm gap-3 pt-4">
          <Button onClick={() => setIsSetup(true)} className="h-16 rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-lg shadow-xl">
            <RotateCcw className="w-6 h-6 mr-2" /> NEW TOURNAMENT
          </Button>
          <Button variant="ghost" onClick={() => setGameMode("Menu")} className="h-14 rounded-2xl text-white/60 hover:text-white hover:bg-white/5">
            <Home className="w-5 h-5 mr-2" /> EXIT TO MENU
          </Button>
        </div>
      </div>
    );
  }

  if (isSetup) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center space-y-12">
        <Button variant="ghost" size="icon" onClick={() => setGameMode("Menu")} className="absolute top-8 left-8 text-white/50"><ChevronLeft className="w-8 h-8" /></Button>

        <div className="text-center space-y-4">
           <Trophy className="w-16 h-16 text-yellow-500 mx-auto opacity-80" />
           <h2 className="text-4xl font-headline font-bold">Tournament Setup</h2>
        </div>

        <div className="w-full max-w-md space-y-8 bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5">
           <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Number of Players</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 {[2, 3, 4, 5, 6, 7, 8].map(n => (
                   <button 
                    key={n}
                    onClick={() => handleNumPlayersChange(n)}
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-xl font-bold transition-all",
                      numPlayers === n ? "bg-primary text-white scale-110 shadow-lg" : "bg-white/5 text-white/40 border border-white/5"
                    )}
                   >
                     {n}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Player Names</label>
              <div className="grid grid-cols-1 gap-3 max-h-[30vh] overflow-y-auto pr-2">
                 {localPlayers.map((name, i) => (
                   <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length] }} />
                      <Input 
                        value={name} 
                        onChange={(e) => updatePlayerName(i, e.target.value)}
                        placeholder={`Player ${i + 1}`}
                        className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-white/20"
                      />
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Rolls Per Player</label>
                <span className="text-3xl font-black text-primary">{rollsInput}</span>
              </div>
              <Slider 
                value={[rollsInput]} 
                onValueChange={([v]) => setRollsInput(v)} 
                min={1} max={10} step={1}
              />
           </div>

           <Button onClick={handleStart} className="w-full h-18 bg-primary hover:bg-primary/90 text-white text-xl font-black rounded-2xl shadow-2xl transition-all active:scale-95">
              START TOURNAMENT
           </Button>
        </div>
      </div>
    );
  }

  const currentRolls = tournamentRollLog[currentPlayer?.id] || [];
  const turnScoreText = currentRolls.length > 0 
    ? `${currentRolls.join(" + ")}${currentRolls.length > 1 ? " = " + (tournamentScores[currentPlayer?.id] || 0) : ""}`
    : "Roll to start!";

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-between overflow-hidden">
      <header className="w-full flex justify-between items-center bg-white/5 p-5 rounded-[2rem] border border-white/10">
         <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Current Tournament</span>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Battle Phase
            </h2>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Progress</span>
            <span className="text-2xl font-black text-primary">
               {tournamentCurrentRoll} <span className="text-white/10 text-xl mx-1">/</span> {tournamentConfig.rollsPerPlayer}
            </span>
         </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
         <div className="text-center space-y-3">
            <div className="flex items-center gap-3 justify-center">
               <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" style={{ backgroundColor: currentPlayer?.color, color: currentPlayer?.color }} />
               <span className="text-xs uppercase font-black tracking-[0.3em] text-white/40">Active Turn</span>
            </div>
            <h3 className="text-6xl font-headline font-bold drop-shadow-lg" style={{ color: currentPlayer?.color }}>{currentPlayer?.name}</h3>
            
            <div className="flex gap-2 justify-center mt-4">
               {Array.from({ length: tournamentConfig.rollsPerPlayer }).map((_, i) => (
                 <div 
                  key={i} 
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    i < tournamentCurrentRoll - (onCooldown ? 0 : 1) ? "scale-125" : "bg-white/10"
                  )}
                  style={{ backgroundColor: i < tournamentCurrentRoll - (onCooldown ? 0 : 1) ? currentPlayer?.color : undefined }}
                 />
               ))}
            </div>
         </div>

         <div className="relative">
            <div 
              className="p-14 rounded-full bg-white/[0.02] border border-white/5 relative transition-all duration-500"
              style={{ boxShadow: showResult ? `0 0 70px ${currentPlayer?.color}44` : 'none' }}
            >
                <DiceCube value={currentValue} isRolling={isRolling} color={currentPlayer?.color} />
                <CooldownTimer duration={2} isActive={onCooldown} onComplete={handleCooldownComplete} />
                
                {showResult && !onCooldown && (
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-950 px-8 py-3 rounded-full font-black text-2xl animate-bounce shadow-2xl z-30">
                      +{currentValue}
                   </div>
                )}
            </div>
         </div>

         <div className="text-center min-h-[4rem]">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-1">Live Score Calculation</p>
            <p className="text-2xl font-black tracking-tight text-white">{turnScoreText}</p>
         </div>

         <div className="w-full max-w-xs">
            <Button 
               disabled={isRolling || onCooldown}
               onClick={rollDice}
               className="w-full h-20 text-2xl font-black rounded-[2rem] bg-white text-slate-950 hover:bg-slate-200 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            >
               {onCooldown ? "COOLING DOWN..." : isRolling ? "ROLLING..." : "ROLL DICE"}
            </Button>
         </div>
      </div>

      <footer className="w-full bg-white/[0.02] border-t border-white/5 p-4 rounded-t-[3rem]">
         <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-2">
            {players.map((p, idx) => (
               <div 
                 key={p.id}
                 className={cn(
                   "flex items-center gap-3 px-6 py-3 rounded-2xl flex-shrink-0 transition-all duration-500",
                   idx === currentPlayerIndex 
                    ? "bg-white/10 border-white/20 border-2 scale-105 shadow-xl" 
                    : idx < currentPlayerIndex ? "bg-white/5 border border-white/5 opacity-80" : "bg-white/2 border border-transparent opacity-40"
                 )}
               >
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-white/40">{p.name}</span>
                    <span className="text-lg font-black">{idx < currentPlayerIndex || idx === currentPlayerIndex ? (tournamentScores[p.id] || 0) : "--"} pts</span>
                 </div>
                 {idx < currentPlayerIndex && <div className="ml-2 text-green-500 font-bold">✅</div>}
               </div>
            ))}
         </div>
      </footer>
    </div>
  );
}
