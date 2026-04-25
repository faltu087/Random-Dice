
"use client";

import * as React from "react";
import { DiceCube } from "@/components/dice/dice-cube";
import { CooldownTimer } from "@/components/dice/cooldown-timer";
import { useDiceStore, type SectionType, type Player } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AlertCircle, User } from "lucide-react";

interface DiceSectionProps {
  type: SectionType;
  title: string;
  description: string;
  gradient: string;
  color: string;
  interpretResult: (val: number) => string;
}

export function DiceSection({ 
  type, 
  title, 
  description, 
  gradient, 
  color,
  interpretResult 
}: DiceSectionProps) {
  const [hasMounted, setHasMounted] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(1);
  const [isRolling, setIsRolling] = React.useState(false);
  const [onCooldown, setOnCooldown] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);
  const [shouldSwitchPlayer, setShouldSwitchPlayer] = React.useState(false);
  const [activeRollingPlayer, setActiveRollingPlayer] = React.useState<Player | null>(null);

  const { 
    players, 
    currentPlayerIndex, 
    nextTurn, 
    addHistory, 
    settings, 
    consecutiveSixes, 
    incrementSixes, 
    resetSixes 
  } = useDiceStore();
  
  // Hydration fix
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const currentPlayer = players[currentPlayerIndex] || players[0];

  const rollDice = () => {
    if (onCooldown || isRolling) return;

    if (settings.haptic && "vibrate" in navigator) {
      navigator.vibrate(50);
    }

    setIsRolling(true);
    setShowResult(false);
    setShouldSwitchPlayer(false);
    setActiveRollingPlayer(currentPlayer);

    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      setCurrentValue(newValue);
      setIsRolling(false);
      setOnCooldown(true);
      setShowResult(true);
      addHistory(type, newValue);

      // Rule Logic
      if (newValue === 6) {
        const nextCount = consecutiveSixes + 1;
        if (nextCount >= 3) {
          // Triple six! Turn ends and moves to next player.
          setShouldSwitchPlayer(true);
          resetSixes();
        } else {
          // Bonus turn! Stay on player.
          incrementSixes();
          setShouldSwitchPlayer(false);
        }
      } else {
        // Not a six, turn ends.
        setShouldSwitchPlayer(true);
        resetSixes();
      }
    }, 1000);
  };

  const handleCooldownComplete = () => {
    setOnCooldown(false);
    setShowResult(false);
    setActiveRollingPlayer(null);
    if (shouldSwitchPlayer) {
      nextTurn();
    }
  };

  if (!hasMounted) return null;

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-between h-full p-6 transition-colors duration-500 rounded-3xl overflow-hidden relative",
        gradient
      )}
    >
      {/* Header Info */}
      <div className="text-center space-y-1 z-10 w-full">
        <h2 className="text-3xl font-headline font-bold text-white drop-shadow-md">
          {title}
        </h2>
        <p className="text-white/70 text-sm font-medium">
          {description}
        </p>
      </div>

      {/* Player Turn List */}
      <div className="w-full z-10 mt-2">
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex w-max space-x-3 px-4">
            {players.map((player, idx) => (
              <div
                key={player.id}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 border-2",
                  idx === currentPlayerIndex 
                    ? "bg-white text-foreground border-white scale-110 shadow-lg" 
                    : "bg-black/20 text-white/60 border-transparent"
                )}
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: player.color }} 
                />
                <span className="text-sm font-bold uppercase tracking-wider">
                  {player.name}
                </span>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* Dice Area */}
      <div className="relative flex flex-col items-center gap-8 z-10 flex-1 justify-center py-4 w-full">
        {/* Consecutive Sixes Badge */}
        {consecutiveSixes > 0 && !showResult && !isRolling && (
          <div className="absolute top-0 animate-bounce bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-white text-xs font-bold border border-white/20">
            {consecutiveSixes === 1 ? "BONUS TURN! 🎲" : "ANOTHER SIX! 🔥"}
          </div>
        )}

        <div 
          className="p-8 rounded-full transition-all duration-500 relative bg-white/5 backdrop-blur-sm"
          style={{ 
            boxShadow: showResult 
              ? `0 0 50px ${activeRollingPlayer?.color || currentPlayer?.color}88` 
              : "0 10px 40px rgba(0,0,0,0.2)"
          }}
        >
          <div 
            className="absolute inset-0 rounded-full border-4 opacity-30 transition-colors duration-500"
            style={{ borderColor: activeRollingPlayer?.color || currentPlayer?.color || color }}
          />
          
          <DiceCube 
            value={currentValue} 
            isRolling={isRolling} 
            color={activeRollingPlayer?.color || currentPlayer?.color || color} 
          />

          <CooldownTimer 
            duration={3} 
            isActive={onCooldown} 
            onComplete={handleCooldownComplete} 
          />
        </div>

        {/* Dynamic Status / Result Display */}
        <div className="h-32 text-center flex flex-col items-center justify-center w-full px-4">
          {showResult ? (
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center gap-3 w-full">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeRollingPlayer?.color }} />
                <span className="text-white text-xs font-bold uppercase tracking-widest">
                  {activeRollingPlayer?.name}'s Roll
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-2 w-full">
                <span className="text-xl sm:text-2xl font-headline font-bold text-white bg-black/40 px-6 sm:px-8 py-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl w-full max-w-sm truncate">
                  {interpretResult(currentValue)}
                </span>
                
                {currentValue === 6 && !shouldSwitchPlayer && (
                   <span className="text-white text-xs font-bold uppercase animate-pulse flex items-center gap-1">
                     Extra Chance! Roll Again! 🌟
                   </span>
                )}
                {currentValue === 6 && shouldSwitchPlayer && (
                   <div className="flex items-center gap-1 text-red-200 text-xs font-bold uppercase">
                     <AlertCircle className="w-3 h-3" />
                     Triple Six! Turn Cancelled! ❌
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-700">
               <div className="flex items-center gap-2 text-white/60">
                 <User className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase tracking-[0.2em]">Active Turn</span>
               </div>
               <span className="text-3xl sm:text-4xl font-headline font-bold text-white drop-shadow-lg truncate max-w-[280px]">
                 {currentPlayer?.name}
               </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full max-w-xs z-10 pb-4">
        <Button 
          onClick={rollDice}
          disabled={onCooldown || isRolling}
          className="w-full h-16 text-xl font-headline font-bold rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
          style={{ 
            backgroundColor: onCooldown ? 'rgba(255,255,255,0.1)' : 'white',
            color: onCooldown ? 'white' : activeRollingPlayer?.color || currentPlayer?.color || color,
            border: onCooldown ? '1px solid rgba(255,255,255,0.2)' : 'none'
          }}
        >
          {onCooldown ? "COOLING DOWN..." : isRolling ? "ROLLING..." : "ROLL DICE"}
        </Button>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-white/5 rounded-full pointer-events-none blur-3xl opacity-50" />
    </div>
  );
}
