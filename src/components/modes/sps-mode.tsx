
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RotateCcw, Home, Hand, Scissors, Square, ShieldQuestion, Swords } from "lucide-react";
import { useDiceStore, type SPSChoice, type Player } from "@/lib/store";
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

  const p1 = players[0] || { id: "p1", name: p1Name, color: "#E53935" };
  const p2 = players[1] || { id: "p2", name: p2Name, color: "#1E88E5" };

  const targetScore = Math.ceil(spsConfig.bestOf / 2);

  const handleStart = () => {
    startSPSGame(bestOfInput, 
      { id: "p1", name: p1Name || "Player 1", color: "#E53935" },
      { id: "p2", name: p2Name || "Player 2", color: "#1E88E5" }
    );
  };

  const selectChoice = (idx: 0 | 1, choice: SPSChoice) => {
    setSPSChoice(idx, choice);
    if (settings.haptic && "vibrate" in navigator) navigator.vibrate(50);
    
    if (idx === 0) setSPSPhase("Handover");
    else startCountdown();
  };

  const startCountdown = () => {
    setSPSPhase("Countdown");
    let count = 3;
    setCountdown(3);
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        revealResult();
      }
    }, 800);
  };

  const revealResult = () => {
    const [c1, c2] = spsChoices;
    setSPSPhase("Reveal");
    
    if (c1 === c2) {
      setRoundWinner(null);
    } else {
      const wins: Record<string, string> = { Stone: "Scissors", Scissors: "Paper", Paper: "Stone" };
      if (wins[c1!] === c2) {
        incrementSPSWin(0);
        setRoundWinner(0);
      } else {
        incrementSPSWin(1);
        setRoundWinner(1);
      }
    }
  };

  // Check Game Over
  React.useEffect(() => {
    if (spsPhase === "Reveal") {
      const isOver = spsScores[0] >= targetScore || spsScores[1] >= targetScore;
      if (isOver) {
        setTimeout(() => {
          setSPSPhase("GameOver");
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#E53935", "#1E88E5", "#45B1E8"]
          });
        }, 3000);
      }
    }
  }, [spsScores, targetScore, spsPhase, setSPSPhase]);

  if (spsPhase === "Setup") {
    return (
      <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col items-center justify-center space-y-12">
        <Button variant="ghost" size="icon" className="absolute top-8 left-8" onClick={() => setGameMode("Menu")}>
          <ChevronLeft className="w-8 h-8" />
        </Button>
        <div className="text-center space-y-4">
           <Swords className="w-16 h-16 text-teal-400 mx-auto opacity-80" />
           <h2 className="text-4xl font-headline font-bold">Battle Setup</h2>
        </div>

        <div className="w-full max-w-sm space-y-8 bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5">
           <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-teal-500">Player Names</label>
              <div className="space-y-3">
                 <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="w-4 h-4 rounded-full bg-[#E53935]" />
                    <Input value={p1Name} onChange={e => setP1Name(e.target.value)} className="bg-transparent border-none focus-visible:ring-0" />
                 </div>
                 <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="w-4 h-4 rounded-full bg-[#1E88E5]" />
                    <Input value={p2Name} onChange={e => setP2Name(e.target.value)} className="bg-transparent border-none focus-visible:ring-0" />
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-teal-500">Best Of</label>
              <div className="grid grid-cols-4 gap-2">
                 {[1, 3, 5, 7].map(v => (
                   <button 
                    key={v} 
                    onClick={() => setBestOfInput(v)}
                    className={cn(
                      "h-14 rounded-xl font-bold transition-all",
                      bestOfInput === v ? "bg-teal-500 text-white scale-110" : "bg-white/5 text-white/40 border border-white/5"
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
               <RotateCcw className="w-5 h-5 mr-2" /> REMATCH
            </Button>
            <Button variant="outline" onClick={() => setGameMode("Menu")} className="h-14 rounded-2xl border-white/20 hover:bg-white/5 font-bold">
               <Home className="w-5 h-5 mr-2" /> MAIN MENU
            </Button>
         </div>
      </div>
    );
  }

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

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
         {spsPhase === "SelectingP1" && (
            <div className="text-center space-y-12 animate-in fade-in zoom-in duration-500">
               <div className="space-y-4">
                  <span className="text-primary text-6xl font-black block">🔴 {p1.name.split(" ")[0]}</span>
                  <p className="text-2xl font-bold text-white/60">Choose your weapon!</p>
               </div>
               <div className="flex justify-center gap-6">
                  {["Stone", "Paper", "Scissors"].map(c => (
                     <button key={c} onClick={() => selectChoice(0, c as SPSChoice)} className="w-28 h-28 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-90">
                        {c === "Stone" && <Square className="w-10 h-10" />}
                        {c === "Paper" && <Hand className="w-10 h-10" />}
                        {c === "Scissors" && <Scissors className="w-10 h-10" />}
                        <span className="text-[10px] font-bold uppercase">{c}</span>
                     </button>
                  ))}
               </div>
               <p className="text-xs text-white/20 uppercase tracking-widest">({p2.name} look away!)</p>
            </div>
         )}

         {spsPhase === "Handover" && (
            <div className="text-center space-y-8 animate-in fade-in duration-500">
               <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-bounce">
                  <Hand className="w-10 h-10 text-white" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-4xl font-black text-white">READY!</h3>
                  <p className="text-xl text-white/40">Pass phone to <span className="text-blue-400 font-bold">{p2.name}</span></p>
               </div>
               <Button onClick={() => setSPSPhase("SelectingP2")} className="h-18 px-12 bg-teal-500 text-white font-black text-xl rounded-2xl">
                  I AM READY
               </Button>
            </div>
         )}

         {spsPhase === "SelectingP2" && (
            <div className="text-center space-y-12 animate-in fade-in zoom-in duration-500">
               <div className="space-y-4">
                  <span className="text-blue-500 text-6xl font-black block">🔵 {p2.name.split(" ")[0]}</span>
                  <p className="text-2xl font-bold text-white/60">Your turn to strike!</p>
               </div>
               <div className="flex justify-center gap-6">
                  {["Stone", "Paper", "Scissors"].map(c => (
                     <button key={c} onClick={() => selectChoice(1, c as SPSChoice)} className="w-28 h-28 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-90">
                        {c === "Stone" && <Square className="w-10 h-10" />}
                        {c === "Paper" && <Hand className="w-10 h-10" />}
                        {c === "Scissors" && <Scissors className="w-10 h-10" />}
                        <span className="text-[10px] font-bold uppercase">{c}</span>
                     </button>
                  ))}
               </div>
            </div>
         )}

         {spsPhase === "Countdown" && (
            <div className="text-[14rem] font-black text-teal-400 animate-ping duration-700">{countdown === 0 ? "GO!" : countdown}</div>
         )}

         {spsPhase === "Reveal" && (
            <div className="flex flex-col items-center gap-12 w-full px-4">
               <div className="flex gap-8 items-center justify-center w-full max-w-lg">
                  <div className="flex-1 flex flex-col items-center gap-6">
                     <span className="text-xs font-black uppercase text-white/40">{p1.name}</span>
                     <div 
                        className="h-40 w-40 rounded-[3rem] flex items-center justify-center shadow-[0_0_50px_rgba(229,57,53,0.3)] animate-in slide-in-from-left-20 duration-700"
                        style={{ backgroundColor: p1.color }}
                     >
                        {spsChoices[0] === "Stone" && <Square className="w-20 h-20" />}
                        {spsChoices[0] === "Paper" && <Hand className="w-20 h-20" />}
                        {spsChoices[0] === "Scissors" && <Scissors className="w-20 h-20" />}
                     </div>
                  </div>
                  <div className="text-5xl font-black text-white/10 italic animate-pulse">VS</div>
                  <div className="flex-1 flex flex-col items-center gap-6">
                     <span className="text-xs font-black uppercase text-white/40">{p2.name}</span>
                     <div 
                        className="h-40 w-40 rounded-[3rem] flex items-center justify-center shadow-[0_0_50px_rgba(30,136,229,0.3)] animate-in slide-in-from-right-20 duration-700"
                        style={{ backgroundColor: p2.color }}
                     >
                        {spsChoices[1] === "Stone" && <Square className="w-20 h-20" />}
                        {spsChoices[1] === "Paper" && <Hand className="w-20 h-20" />}
                        {spsChoices[1] === "Scissors" && <Scissors className="w-20 h-20" />}
                     </div>
                  </div>
               </div>
               
               <div className="bg-white/10 px-12 py-5 rounded-[2.5rem] border border-white/20 animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-4xl font-black text-teal-300">
                    {roundWinner === null ? "IT'S A DRAW! 🤝" : `${roundWinner === 0 ? p1.name : p2.name} WINS! ⚡`}
                  </h3>
               </div>

               <Button onClick={resetSPSRound} className="h-16 px-12 bg-teal-500 hover:bg-teal-600 text-white font-black text-xl rounded-2xl shadow-xl">
                  NEXT ROUND
               </Button>
            </div>
         )}
      </main>

      <footer className="text-center p-6 bg-white/[0.02] border-t border-white/5 rounded-t-[3rem]">
         <p className="text-[10px] text-teal-400 font-black uppercase tracking-[0.4em]">First to reach {targetScore} wins battle</p>
      </footer>
    </div>
  );
}
