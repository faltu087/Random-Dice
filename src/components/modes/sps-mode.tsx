
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RotateCcw, Home, Hand, Scissors, Square, ShieldQuestion } from "lucide-react";
import { useDiceStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Choice = "Stone" | "Paper" | "Scissors" | null;

export function SPSMode() {
  const { 
    players, 
    spsConfig, 
    spsScores, 
    spsCurrentRound,
    startSPS,
    updateSPSScore,
    setGameMode,
    settings
  } = useDiceStore();

  const [started, setStarted] = React.useState(false);
  const [bestOfInput, setBestOfInput] = React.useState(3);
  const [choices, setChoices] = React.useState<[Choice, Choice]>([null, null]);
  const [gameState, setGameState] = React.useState<"Selection" | "Countdown" | "Reveal">("Selection");
  const [countdown, setCountdown] = React.useState(3);
  const [roundResult, setRoundResult] = React.useState<string | null>(null);

  const p1 = players[0] || { id: "1", name: "Player 1", color: "#CF8012" };
  const p2 = players[1] || { id: "2", name: "Player 2", color: "#F46659" };

  const targetScore = Math.ceil(spsConfig.bestOf / 2);
  const isFinished = spsScores[0] >= targetScore || spsScores[1] >= targetScore;

  const handleStart = () => {
    if (players.length < 2) {
      alert("Two players needed!");
      return;
    }
    startSPS(bestOfInput);
    setStarted(true);
    resetRound();
  };

  const resetRound = () => {
    setChoices([null, null]);
    setGameState("Selection");
    setCountdown(3);
    setRoundResult(null);
  };

  const selectChoice = (playerIdx: number, choice: Choice) => {
    if (choices[playerIdx]) return; // prevent changing choice
    
    const newChoices = [...choices] as [Choice, Choice];
    newChoices[playerIdx] = choice;
    setChoices(newChoices);

    if (settings.haptic && "vibrate" in navigator) {
      navigator.vibrate(20);
    }

    if (newChoices[0] && newChoices[1]) {
      startCountdown();
    }
  };

  const startCountdown = () => {
    setGameState("Countdown");
    let count = 3;
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
    const [c1, c2] = choices;
    setGameState("Reveal");
    
    if (c1 === c2) {
      setRoundResult("It's a Draw! 🤝");
      setTimeout(resetRound, 2500);
      return;
    }

    const wins: Record<string, string> = { Stone: "Scissors", Scissors: "Paper", Paper: "Stone" };
    const p1Wins = wins[c1!] === c2;
    
    setRoundResult(p1Wins ? `${p1.name} Scores! ⚡` : `${p2.name} Scores! ⚡`);
    updateSPSScore(p1Wins);
    
    setTimeout(() => {
      // Check for finish status directly from logic
      const nextP1 = p1Wins ? spsScores[0] + 1 : spsScores[0];
      const nextP2 = !p1Wins ? spsScores[1] + 1 : spsScores[1];
      if (nextP1 < targetScore && nextP2 < targetScore) {
        resetRound();
      }
    }, 2500);
  };

  if (isFinished) {
    const winner = spsScores[0] > spsScores[1] ? p1 : p2;
    return (
      <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col items-center justify-center space-y-12 animate-in zoom-in duration-500">
         <div className="text-center space-y-4">
            <h2 className="text-6xl font-black text-teal-400 drop-shadow-lg">VICTORY!</h2>
            <p className="text-white/40 uppercase tracking-[0.4em] text-xs font-bold">Supreme Champion</p>
         </div>
         
         <div className="text-center space-y-6">
            <div 
              className="w-32 h-32 rounded-full mx-auto flex items-center justify-center border-4 border-teal-400 shadow-[0_0_40px_rgba(45,212,191,0.3)]"
              style={{ backgroundColor: winner.color }}
            >
               <Trophy className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-4xl font-headline font-bold">{winner.name}</h3>
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

  if (!started) {
    return (
      <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col items-center justify-center space-y-12">
        <Button variant="ghost" size="icon" className="absolute top-8 left-8" onClick={() => setGameMode("Menu")}>
          <ChevronLeft className="w-8 h-8" />
        </Button>
        <div className="text-center space-y-4">
           <div className="flex justify-center -space-x-4 mb-4">
              <div className="p-4 bg-teal-500 rounded-2xl rotate-[-10deg] shadow-lg"><Hand className="w-10 h-10" /></div>
              <div className="p-4 bg-teal-600 rounded-2xl rotate-[10deg] shadow-lg"><Scissors className="w-10 h-10" /></div>
           </div>
           <h2 className="text-4xl font-black tracking-tight">Stone Paper Scissors</h2>
           <p className="text-white/50 font-medium">Select Match Type</p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
           {[1, 3, 5].map(v => (
             <button 
               key={v} 
               onClick={() => setBestOfInput(v)}
               className={cn(
                 "flex flex-col items-center justify-center h-28 rounded-3xl border-2 transition-all duration-300",
                 bestOfInput === v 
                  ? "bg-teal-500 border-teal-300 scale-105 shadow-xl" 
                  : "bg-white/5 border-white/10 opacity-60 hover:opacity-100"
               )}
             >
               <span className="text-3xl font-black">{v}</span>
               <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Best Of</span>
             </button>
           ))}
        </div>

        <Button onClick={handleStart} className="w-full max-w-sm h-18 bg-teal-500 hover:bg-teal-600 text-xl font-black rounded-2xl shadow-2xl transition-all active:scale-95">
           READY TO CLASH
        </Button>
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

      <div className="flex-1 relative flex flex-col items-center justify-center py-12">
         {gameState === "Countdown" && (
           <div className="text-[12rem] font-black text-teal-400 animate-ping duration-700">{countdown}</div>
         )}

         {gameState === "Selection" && (
           <div className="w-full space-y-16">
              {/* Player 1 Selection */}
              <div className="space-y-4">
                 <div className="flex justify-center items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">{p1.name}</span>
                    {choices[0] && <div className="px-3 py-1 bg-teal-500 rounded-full text-[10px] font-bold animate-bounce">READY!</div>}
                 </div>
                 <div className="flex justify-center gap-4">
                    {["Stone", "Paper", "Scissors"].map(c => (
                      <button 
                        key={c} 
                        onClick={() => selectChoice(0, c as Choice)}
                        className={cn(
                          "h-24 w-24 rounded-3xl transition-all duration-300 flex items-center justify-center",
                          choices[0] === c 
                            ? "bg-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.4)] scale-110" 
                            : choices[0] ? "bg-white/5 opacity-30 grayscale" : "bg-white/5 border border-white/10 hover:bg-white/10"
                        )}
                      >
                         {c === "Stone" && <Square className="w-10 h-10" />}
                         {c === "Paper" && <Hand className="w-10 h-10" />}
                         {c === "Scissors" && <Scissors className="w-10 h-10" />}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="h-px bg-white/5 w-1/2 mx-auto" />

              {/* Player 2 Selection */}
              <div className="space-y-4">
                 <div className="flex justify-center items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">{p2.name}</span>
                    {choices[1] && <div className="px-3 py-1 bg-teal-500 rounded-full text-[10px] font-bold animate-bounce">READY!</div>}
                 </div>
                 <div className="flex justify-center gap-4">
                    {["Stone", "Paper", "Scissors"].map(c => (
                      <button 
                        key={c} 
                        onClick={() => selectChoice(1, c as Choice)}
                        className={cn(
                          "h-24 w-24 rounded-3xl transition-all duration-300 flex items-center justify-center",
                          choices[1] === c 
                            ? "bg-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.4)] scale-110" 
                            : choices[1] ? "bg-white/5 opacity-30 grayscale" : "bg-white/5 border border-white/10 hover:bg-white/10"
                        )}
                      >
                         {c === "Stone" && <Square className="w-10 h-10" />}
                         {c === "Paper" && <Hand className="w-10 h-10" />}
                         {c === "Scissors" && <Scissors className="w-10 h-10" />}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
         )}

         {gameState === "Reveal" && (
           <div className="flex flex-col items-center gap-12 animate-in zoom-in duration-500 w-full px-4">
              <div className="flex gap-8 items-center justify-center w-full max-w-md">
                 <div className="flex-1 flex flex-col items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-white/40">{p1.name}</span>
                    <div 
                      className="h-32 w-32 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(20,184,166,0.3)] animate-in slide-in-from-left-8 duration-500"
                      style={{ backgroundColor: p1.color }}
                    >
                       {choices[0] === "Stone" && <Square className="w-14 h-14" />}
                       {choices[0] === "Paper" && <Hand className="w-14 h-14" />}
                       {choices[0] === "Scissors" && <Scissors className="w-14 h-14" />}
                    </div>
                 </div>
                 <div className="text-4xl font-black text-white/10 italic">VS</div>
                 <div className="flex-1 flex flex-col items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-white/40">{p2.name}</span>
                    <div 
                      className="h-32 w-32 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(20,184,166,0.3)] animate-in slide-in-from-right-8 duration-500"
                      style={{ backgroundColor: p2.color }}
                    >
                       {choices[1] === "Stone" && <Square className="w-14 h-14" />}
                       {choices[1] === "Paper" && <Hand className="w-14 h-14" />}
                       {choices[1] === "Scissors" && <Scissors className="w-14 h-14" />}
                    </div>
                 </div>
              </div>
              <div className="bg-white/10 px-10 py-4 rounded-3xl border border-white/20">
                 <h3 className="text-3xl font-headline font-black text-teal-300 text-center">{roundResult}</h3>
              </div>
           </div>
         )}
      </div>

      <div className="text-center p-6 bg-white/[0.02] border-t border-white/5 rounded-t-[3rem]">
         <p className="text-[10px] text-teal-400 font-black uppercase tracking-[0.4em]">First to reach {targetScore} wins match</p>
      </div>
    </div>
  );
}
