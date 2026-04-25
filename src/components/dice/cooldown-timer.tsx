
"use client";

import * as React from "react";

interface CooldownTimerProps {
  duration: number; // in seconds
  isActive: boolean;
  onComplete: () => void;
}

export function CooldownTimer({ duration, isActive, onComplete }: CooldownTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(0);
  const size = 120;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;

  // Countdown logic: strictly handles updating the local time state
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      setTimeLeft(duration);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 0.1;
          return next <= 0 ? 0 : next;
        });
      }, 100);
    } else {
      setTimeLeft(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, duration]);

  // Completion logic: triggers the parent callback outside of the state update cycle
  React.useEffect(() => {
    if (isActive && timeLeft <= 0) {
      onComplete();
    }
  }, [timeLeft, isActive, onComplete]);

  const offset = circumference - (timeLeft / duration) * circumference;

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-primary/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-100 ease-linear"
        />
      </svg>
      <span className="absolute text-primary font-headline font-bold text-xl">
        {Math.ceil(timeLeft)}
      </span>
    </div>
  );
}
