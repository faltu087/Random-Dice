
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RotateCcw, Home, Hand, Scissors, Square } from "lucide-react";
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

  const p1 = players[0] || { name: "Player 1", color: "#CF8012" };
  const p2 = players[1] || { name: "Player 2", color: "#F46659" };

  const isFinished = spsScores[0] > spsConfig.bestOf / 2 || spsScores[1] > spsConfig.bestOf / 2;

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
    const newChoices = [...choices] as [Choice, Choice];
    newChoices[playerIdx] = choice;
    setChoices(newChoices);

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
    }, 1000);
  };

  const revealResult = () => {
    const [c1, c2] = choices;
    setGameState("Reveal");
    
    if (c1 === c2) {
      setRoundResult("It's a Draw! 🤝");
      setTimeout(resetRound, 2000);
      return;
    }

    const wins: Record<string, string> = { Stone: "Scissors", Scissors: "Paper", Paper: "Stone" };
    const p1Wins = wins[c1!] === c2;
    
    setRoundResult(p1Wins ? `${p1.name} Wins Round!` : `${p2.name} Wins Round!`);
    updateSPSScore(p1Wins);
    
    setTimeout(() => {
      if (!isFinished) resetRound();
    }, 2000);
  };

  if (isFinished) {
    const winner = spsScores[0] > spsScores[1] ? p1 : p2;
    return (
      <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col items-center justify-center space-y-8">
         <h2 className="text-5xl font-bold text-teal-400">CHAMPION! 🏆</h2>
         <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Tournament Winner</p>
            <h3 className="text-4xl font-headline font-bold">{winner.name}</h3>
         </div>
         <div className="text-3xl font-bold bg-white/10 px-8 py-4 rounded-3xl border border-white/20">
            {spsScores[0]} — {spsScores[1]}
         </div>
         <div className="flex flex-col w-full max-w-sm gap-3">
            <Button onClick={handleStart} className="h-14 rounded-2xl bg-teal-500 hover:bg-teal-600 font-bold">
               <RotateCcw className="w-5 h-5 mr-2" /> Rematch
            </Button>
            <Button variant="outline" onClick={() => setGameMode("Menu")} className="h-14 rounded-2xl border-white/20">
               <Home className="w-5 h-5 mr-2" /> Main Menu
            </Button>
         </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col items-center justify-center space-y-12">
        <Button variant="ghost" className="absolute top-6 left-6" onClick={() => setGameMode("Menu")}>
          <ChevronLeft className="w-6 h-6 mr-2" /> Back
        </Button>
        <div className="text-center space-y-4">
           <Hand className="w-20 h-20 text-teal-400 mx-auto" />
           <h2 className="text-3xl font-bold">Stone Paper Scissors</h2>
           <p className="text-white/60">Choose match duration</p>
        </div>
        <div className="flex gap-4">
           {[1, 3, 5].map(v => (
             <Button 
               key={v} 
               onClick={() => setBestOfInput(v)}
               variant={bestOfInput === v ? "default" : "outline"}
               className={cn("h-16 w-16 text-xl rounded-2xl", bestOfInput === v ? "bg-teal-500" : "border-white/20")}
             >
               {v}
             </Button>
           ))}
        </div>
        <Button onClick={handleStart} className="w-full max-w-sm h-16 bg-teal-500 text-xl font-bold rounded-2xl">
           START MATCH
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col justify-between overflow-hidden">
      <header className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
         <div className="text-center flex-1">
            <p className="text-[10px] uppercase text-white/50">{p1.name}</p>
            <p className="text-2xl font-bold">{spsScores[0]}</p>
         </div>
         <div className="px-4 py-1 bg-teal-500/20 rounded-full text-xs font-bold text-teal-400 uppercase">
            Round {spsCurrentRound}
         </div>
         <div className="text-center flex-1">
            <p className="text-[10px] uppercase text-white/50">{p2.name}</p>
            <p className="text-2xl font-bold">{spsScores[1]}</p>
         </div>
      </header>

      <div className="flex-1 relative flex flex-col items-center justify-center">
         {gameState === "Countdown" && (
           <div className="text-9xl font-black text-teal-400 animate-ping">{countdown}</div>
         )}

         {gameState === "Selection" && (
           <div className="w-full space-y-12">
              <div className="space-y-4">
                 <p className="text-center text-xs uppercase font-bold text-white/50">{p1.name}'s Choice</p>
                 <div className="flex justify-center gap-4">
                    {["Stone", "Paper", "Scissors"].map(c => (
                      <Button 
                        key={c} 
                        onClick={() => selectChoice(0, c as Choice)}
                        className={cn(
                          "h-20 w-20 rounded-2xl transition-all",
                          choices[0] === c ? "bg-teal-500 scale-110" : "bg-white/5 border border-white/10"
                        )}
                      >
                         {c === "Stone" && <Square className="w-8 h-8" />}
                         {c === "Paper" && <Hand className="w-8 h-8" />}
                         {c === "Scissors" && <Scissors className="w-8 h-8" />}
                      </Button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-center text-xs uppercase font-bold text-white/50">{p2.name}'s Choice</p>
                 <div className="flex justify-center gap-4">
                    {["Stone", "Paper", "Scissors"].map(c => (
                      <Button 
                        key={c} 
                        onClick={() => selectChoice(1, c as Choice)}
                        className={cn(
                          "h-20 w-20 rounded-2xl transition-all",
                          choices[1] === c ? "bg-teal-500 scale-110" : "bg-white/5 border border-white/10"
                        )}
                      >
                         {c === "Stone" && <Square className="w-8 h-8" />}
                         {c === "Paper" && <Hand className="w-8 h-8" />}
                         {c === "Scissors" && <Scissors className="w-8 h-8" />}
                      </Button>
                    ))}
                 </div>
              </div>
           </div>
         )}

         {gameState === "Reveal" && (
           <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-300">
              <div className="flex gap-12 items-center">
                 <div className="text-center space-y-2">
                    <p className="text-xs uppercase text-white/50">{p1.name}</p>
                    <div className="h-24 w-24 bg-teal-500 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                       {choices[0] === "Stone" && <Square className="w-12 h-12" />}
                       {choices[0] === "Paper" && <Hand className="w-12 h-12" />}
                       {choices[0] === "Scissors" && <Scissors className="w-12 h-12" />}
                    </div>
                 </div>
                 <div className="text-4xl font-black text-white/20 italic">VS</div>
                 <div className="text-center space-y-2">
                    <p className="text-xs uppercase text-white/50">{p2.name}</p>
                    <div className="h-24 w-24 bg-teal-500 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                       {choices[1] === "Stone" && <Square className="w-12 h-12" />}
                       {choices[1] === "Paper" && <Hand className="w-12 h-12" />}
                       {choices[1] === "Scissors" && <Scissors className="w-12 h-12" />}
                    </div>
                 </div>
              </div>
              <h3 className="text-3xl font-headline font-bold text-teal-400">{roundResult}</h3>
           </div>
         )}
      </div>

      <div className="text-center p-4">
         <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">First to reach {Math.ceil(spsConfig.bestOf/2)} wins</p>
      </div>
    </div>
  );
}
