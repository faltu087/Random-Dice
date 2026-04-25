"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  RotateCcw, 
  Home, 
  Hand, 
  Scissors, 
  Square, 
  Swords,
  Trophy,
  Dices
} from "lucide-react";
import { useDiceStore, type SPSChoice } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";

export function SPSMode() {
  const { 
    spsConfig, 
    spsScores, 
    spsCurrentRound,
    spsPhase,
    spsChoices,
    players,
    startSPSGame,
    setSPSChoice,
    setSPSPhase,
    incrementSPSWin,
    resetSPSRound,
    setGameMode,
    settings
  } = useDiceStore();

  const [bestOfInput, setBestOfInput] = React.useState(3);
  const [p1Name, setP1Name] = React.useState("Player 1");
  const [p2Name, setP2Name] = React.useState("Player 2");
  const [countdown, setCountdown] = React.useState(3);
  const [roundWinner, setRoundWinner] = React.useState<number | null>(null);
  const [isBattleCalculating, setIsBattleCalculating] = React.useState(false);

  const p1 = players[0] || { id: "p1", name: p1Name, color: "#E53935" };
  const p2 = players[1] || { id: "p2", name: p2Name, color: "#1E88E5" };

  const targetScore = Math.ceil(spsConfig.bestOf / 2);

  const handleStart = () => {
    startSPSGame(bestOfInput, 
      { id: "p1", name: p1Name || "Player 1", color: "#E53935" },
      { id: "p2", name: p2Name || "Player 2", color: "#1E88E5" }
    );
  };

  const startBattle = () => {
    if (isBattleCalculating) return;
    
    setIsBattleCalculating(true);
    setSPSPhase("Countdown");
    setRoundWinner(null);
    
    if (settings.haptic && "vibrate" in navigator) navigator.vibrate([30, 30, 30]);

    // Choose weapons randomly
    const options: SPSChoice[] = ["Stone", "Paper", "Scissors"];
    const choice1 = options[Math.floor(Math.random() * 3)];
    const choice2 = options[Math.floor(Math.random() * 3)];
    
    // Set choices in store
    setSPSChoice(0, choice1);
    setSPSChoice(1, choice2);

    // Countdown timer animation
    let count = 3;
    setCountdown(3);
    const interval = setInterval(() => {
      count--;
      if (count >= 0) {
        setCountdown(count);
      }
      
      if (count === 0) {
        clearInterval(interval);
        setTimeout(() => {
          finalizeRound(choice1, choice2);
          setIsBattleCalculating(false);
        }, 500);
      }
    }, 800);
  };

  const finalizeRound = (c1: SPSChoice, c2: SPSChoice) => {
    setSPSPhase("Reveal");
    
    if (c1 === c2) {
      setRoundWinner(null);
    } else {
      // WIN LOGIC: 
      // Stone beats Scissors
      // Scissors beats Paper
      // Paper beats Stone
      const winsAgainst: Record<string, string> = { 
        Stone: "Scissors", 
        Scissors: "Paper", 
        Paper: "Stone" 
      };
      
      if (winsAgainst[c1!] === c2) {
        incrementSPSWin(0);
        setRoundWinner(0);
      } else {
        incrementSPSWin(1);
        setRoundWinner(1);
      }
    }
  };

  // Check Match Over logic
  React.useEffect(() => {
    if (spsPhase === "Reveal") {
      const isGameOver = spsScores[0] >= targetScore || spsScores[1] >= targetScore;
      if (isGameOver) {
        const timer = setTimeout(() => {
          setSPSPhase("GameOver");
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#2DD4BF", "#E53935", "#1E88E5"]
          });
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [spsScores, targetScore, spsPhase, setSPSPhase]);

  // Main UI States
  if (spsPhase === "Setup") {
    return (
      <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col items-center justify-center space-y-12">
        <Button variant="ghost" size="icon" className="absolute top-8 left-8" onClick={() => setGameMode("Menu")}>
          <ChevronLeft className="w-8 h-8" />
        </Button>
        <div className="text-center space-y-4">
           <Swords className="w-16 h-16 text-teal-400 mx-auto animate-pulse" />
           <h2 className="text-4xl font-headline font-bold">Battle Setup</h2>
        </div>

        <div className="w-full max-w-sm space-y-8 bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5">
           <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-teal-500">Combatants</label>
              <div className="space-y-3">
                 <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="w-4 h-4 rounded-full bg-[#E53935]" />
                    <Input value={p1Name} onChange={e => setP1Name(e.target.value)} placeholder="Player 1" className="bg-transparent border-none focus-visible:ring-0" />
                 </div>
                 <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="w-4 h-4 rounded-full bg-[#1E88E5]" />
                    <Input value={p2Name} onChange={e => setP2Name(e.target.value)} placeholder="Player 2" className="bg-transparent border-none focus-visible:ring-0" />
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-teal-500">Series Limit</label>
              <div className="grid grid-cols-4 gap-2">
                 {[1, 3, 5, 7].map(v => (
                   <button 
                    key={v} 
                    onClick={() => setBestOfInput(v)}
                    className={cn(
                      "h-14 rounded-xl font-bold transition-all",
                      bestOfInput === v ? "bg-teal-500 text-white scale-110 shadow-lg" : "bg-white/5 text-white/40 border border-white/5"
                    )}
                   >
                     {v}
                   </button>
                 ))}
              </div>
           </div>

           <Button onClick={handleStart} className="w-full h-18 bg-teal-500 hover:bg-teal-600 text-white text-xl font-black rounded-2xl shadow-2xl transition-all active:scale-95">
              START BATTLE
           </Button>
        </div>
      </div>
    );
  }

  if (spsPhase === "GameOver") {
    const winner = spsScores[0] > spsScores[1] ? p1 : p2;
    const isMatchDraw = spsScores[0] === spsScores[1];

    return (
      <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col items-center justify-center space-y-12 animate-in zoom-in duration-500">
         <div className="text-center space-y-4">
            <h2 className="text-6xl font-black text-teal-400 drop-shadow-lg">{isMatchDraw ? "DRAW!" : "VICTORY!"}</h2>
            <p className="text-white/40 uppercase tracking-[0.4em] text-xs font-bold">Supreme Battle Result</p>
         </div>
         
         <div className="text-center space-y-6">
            <div 
              className="w-32 h-32 rounded-full mx-auto flex items-center justify-center border-4 border-teal-400 shadow-[0_0_40px_rgba(45,212,191,0.3)]"
              style={{ backgroundColor: isMatchDraw ? '#333' : winner.color }}
            >
               <Trophy className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-4xl font-headline font-bold">{isMatchDraw ? "Friendship Wins" : winner.name}</h3>
         </div>

         <div className="text-4xl font-black bg-white/5 px-12 py-6 rounded-[2rem] border border-white/10 tracking-widest">
            {spsScores[0]} <span className="text-teal-500 mx-2">—</span> {spsScores[1]}
         </div>

         <div className="flex flex-col w-full max-w-sm gap-4">
            <Button onClick={handleStart} className="h-16 rounded-2xl bg-teal-500 hover:bg-teal-600 font-black text-lg shadow-xl">
               <RotateCcw className="w-5 h-5 mr-2" /> NEW BATTLE
            </Button>
            <Button variant="outline" onClick={() => setGameMode("Menu")} className="h-14 rounded-2xl border-white/20 hover:bg-white/5 font-bold">
               <Home className="w-5 h-5 mr-2" /> EXIT TO MENU
            </Button>
         </div>
      </div>
    );
  }

  // Active Battle Screen
  return (
    <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col justify-between overflow-hidden">
      <header className="flex justify-between items-center bg-white/5 p-5 rounded-[2rem] border border-white/10">
         <div className="flex flex-col">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p1.color }} />
               <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">{p1.name}</span>
            </div>
            <p className="text-3xl font-black">{spsScores[0]}</p>
         </div>
         <div className="px-6 py-2 bg-teal-500/20 rounded-full border border-teal-500/30">
            <span className="text-sm font-black text-teal-400 uppercase tracking-[0.2em]">Round {spsCurrentRound}</span>
         </div>
         <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">{p2.name}</span>
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p2.color }} />
            </div>
            <p className="text-3xl font-black">{spsScores[1]}</p>
         </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative">
         {(spsPhase === "SelectingP1" || spsPhase === "SelectingP2" || spsPhase === "Handover" || spsPhase === "Setup") && (
            <div className="text-center space-y-12 animate-in fade-in zoom-in duration-500">
               <div className="space-y-4">
                  <div className="relative inline-block">
                    <Dices className="w-24 h-24 text-teal-400 mx-auto animate-bounce" />
                    <Swords className="absolute -top-4 -right-4 w-10 h-10 text-white opacity-40" />
                  </div>
                  <h2 className="text-4xl font-black text-white">READY FOR BATTLE?</h2>
                  <p className="text-xl text-white/40">Dice will decide your weapons!</p>
               </div>
               
               <Button 
                onClick={startBattle} 
                disabled={isBattleCalculating}
                className="h-24 px-16 bg-white text-teal-950 hover:bg-teal-50 font-black text-3xl rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all active:scale-90"
               >
                  ROLL BATTLE!
               </Button>
               
               <div className="flex gap-6 justify-center opacity-30">
                  <Square className="w-8 h-8" />
                  <Hand className="w-8 h-8" />
                  <Scissors className="w-8 h-8" />
               </div>
            </div>
         )}

         {spsPhase === "Countdown" && (
            <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-300">
               <div className="text-[14rem] font-black text-teal-400 leading-none">
                  {countdown === 0 ? "GO!" : countdown}
               </div>
               <p className="text-teal-500 font-black tracking-[0.5em] uppercase animate-pulse">Assigning Fates...</p>
            </div>
         )}

         {spsPhase === "Reveal" && (
            <div className="flex flex-col items-center gap-10 w-full px-4">
               <div className="flex gap-4 sm:gap-12 items-center justify-center w-full max-w-2xl">
                  <div className="flex-1 flex flex-col items-center gap-6 animate-in slide-in-from-left-24 duration-700">
                     <span className="text-xs font-black uppercase text-white/40">{p1.name}</span>
                     <div 
                        className="h-32 w-32 sm:h-48 sm:w-48 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(229,57,53,0.4)] border-4 border-white/10"
                        style={{ backgroundColor: p1.color }}
                     >
                        {spsChoices[0] === "Stone" && <Square className="w-16 h-16 sm:w-24 sm:h-24" />}
                        {spsChoices[0] === "Paper" && <Hand className="w-16 h-16 sm:w-24 sm:h-24" />}
                        {spsChoices[0] === "Scissors" && <Scissors className="w-16 h-16 sm:w-24 sm:h-24" />}
                     </div>
                  </div>
                  
                  <div className="text-2xl sm:text-5xl font-black text-white/20 italic">VS</div>
                  
                  <div className="flex-1 flex flex-col items-center gap-6 animate-in slide-in-from-right-24 duration-700">
                     <span className="text-xs font-black uppercase text-white/40">{p2.name}</span>
                     <div 
                        className="h-32 w-32 sm:h-48 sm:w-48 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(30,136,229,0.4)] border-4 border-white/10"
                        style={{ backgroundColor: p2.color }}
                     >
                        {spsChoices[1] === "Stone" && <Square className="w-16 h-16 sm:w-24 sm:h-24" />}
                        {spsChoices[1] === "Paper" && <Hand className="w-16 h-16 sm:w-24 sm:h-24" />}
                        {spsChoices[1] === "Scissors" && <Scissors className="w-16 h-16 sm:w-24 sm:h-24" />}
                     </div>
                  </div>
               </div>
               
               <div className="bg-white/10 px-8 py-5 rounded-[2.5rem] border border-white/20 animate-in slide-in-from-bottom-8 duration-500 text-center max-w-sm w-full">
                  <h3 className="text-2xl sm:text-3xl font-black text-teal-300 mb-1">
                    {roundWinner === null ? "IT'S A DRAW! 🤝" : `${roundWinner === 0 ? p1.name : p2.name} WINS! ⚡`}
                  </h3>
                  {roundWinner !== null && (
                    <p className="text-[10px] text-teal-400/60 uppercase font-black tracking-widest">
                       {spsChoices[roundWinner] === "Stone" && "Stone crushes Scissors"}
                       {spsChoices[roundWinner] === "Paper" && "Paper covers Stone"}
                       {spsChoices[roundWinner] === "Scissors" && "Scissors cuts Paper"}
                    </p>
                  )}
               </div>

               <Button 
                onClick={resetSPSRound} 
                className="h-16 px-12 bg-teal-500 hover:bg-teal-600 text-white font-black text-xl rounded-2xl shadow-xl transition-transform active:scale-95"
               >
                  NEXT ROUND
               </Button>
            </div>
         )}
      </main>

      <footer className="text-center p-4">
         <div className="inline-block bg-white/[0.03] px-6 py-2 rounded-full border border-white/5">
            <p className="text-[10px] text-teal-400 font-black uppercase tracking-[0.4em]">Target: {targetScore} Wins to Victory</p>
         </div>
      </footer>
    </div>
  );
}
