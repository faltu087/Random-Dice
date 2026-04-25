
"use client";

import * as React from "react";
import { DiceCube } from "@/components/dice/dice-cube";
import { CooldownTimer } from "@/components/dice/cooldown-timer";
import { useDiceStore, type SectionType } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const [currentValue, setCurrentValue] = React.useState(1);
  const [isRolling, setIsRolling] = React.useState(false);
  const [onCooldown, setOnCooldown] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);

  const { players, currentPlayerIndex, nextTurn, addHistory, settings } = useDiceStore();
  const currentPlayer = players[currentPlayerIndex];

  const rollDice = () => {
    if (onCooldown || isRolling) return;

    // Trigger visual feedback
    if (settings.haptic && "vibrate" in navigator) {
      navigator.vibrate(50);
    }

    setIsRolling(true);
    setShowResult(false);

    // Roll animation duration
    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      setCurrentValue(newValue);
      setIsRolling(false);
      setOnCooldown(true);
      setShowResult(true);
      addHistory(type, newValue);
      
      // Auto-switch player after roll
      setTimeout(() => {
        nextTurn();
      }, 1000);
    }, 1000);
  };

  const handleCooldownComplete = () => {
    setOnCooldown(false);
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-between h-full p-8 transition-colors duration-500 rounded-3xl overflow-hidden relative",
        gradient
      )}
    >
      <div className="text-center space-y-2 z-10">
        <h2 className="text-4xl font-headline font-bold text-white drop-shadow-md">
          {title}
        </h2>
        <p className="text-white/80 font-medium">
          {description}
        </p>
      </div>

      <div className="relative flex flex-col items-center gap-12 z-10">
        <div 
          className="p-8 rounded-full transition-all duration-300 relative"
          style={{ 
            boxShadow: showResult 
              ? `0 0 40px ${currentPlayer?.color}66` 
              : "0 10px 30px rgba(0,0,0,0.1)"
          }}
        >
          <div 
            className="absolute inset-0 rounded-full border-4 opacity-50 transition-colors"
            style={{ borderColor: currentPlayer?.color || color }}
          />
          
          <DiceCube 
            value={currentValue} 
            isRolling={isRolling} 
            color={currentPlayer?.color || color} 
          />

          <CooldownTimer 
            duration={5} 
            isActive={onCooldown} 
            onComplete={handleCooldownComplete} 
          />
        </div>

        <div className="h-20 text-center flex flex-col items-center">
          {showResult ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="text-2xl font-headline font-bold text-white bg-black/20 px-6 py-2 rounded-full backdrop-blur-sm">
                {interpretResult(currentValue)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
               <span className="text-white/90 text-lg font-medium">
                 {currentPlayer?.name}&apos;s Turn
               </span>
               <div className="flex gap-1">
                 {players.map((p, idx) => (
                   <div 
                     key={p.id} 
                     className={cn(
                       "w-2 h-2 rounded-full transition-all",
                       idx === currentPlayerIndex ? "w-6" : "opacity-50"
                     )}
                     style={{ backgroundColor: p.color }}
                   />
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-xs z-10">
        <Button 
          onClick={rollDice}
          disabled={onCooldown || isRolling}
          className="w-full h-16 text-xl font-headline font-bold rounded-2xl shadow-xl transition-transform active:scale-95"
          style={{ 
            backgroundColor: onCooldown ? 'rgba(255,255,255,0.2)' : 'white',
            color: onCooldown ? 'white' : color
          }}
        >
          {onCooldown ? "Recharging..." : "ROLL DICE"}
        </Button>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-white/5 rounded-full pointer-events-none blur-3xl" />
    </div>
  );
}
