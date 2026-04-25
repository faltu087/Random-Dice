
"use client";

import { cn } from "@/lib/utils";

interface DiceCubeProps {
  value: number;
  isRolling: boolean;
  color?: string;
}

const faceRotationMap: Record<number, string> = {
  1: "rotateX(0deg) rotateY(0deg)",
  2: "rotateX(0deg) rotateY(180deg)",
  3: "rotateX(0deg) rotateY(-90deg)",
  4: "rotateX(0deg) rotateY(90deg)",
  5: "rotateX(-90deg) rotateY(0deg)",
  6: "rotateX(90deg) rotateY(0deg)",
};

const dotsMap: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function DiceCube({ value, isRolling, color = "#CF8012" }: DiceCubeProps) {
  return (
    <div className="dice-container flex items-center justify-center">
      <div 
        className={cn("dice-cube", isRolling && "dice-rolling")}
        style={{ transform: !isRolling ? faceRotationMap[value] : undefined }}
      >
        {[1, 2, 3, 4, 5, 6].map((face) => (
          <div 
            key={face} 
            className={cn("dice-face", `face-${face}`)}
            style={{ borderColor: color }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "dot", 
                  dotsMap[face].includes(i) ? "opacity-100" : "opacity-0"
                )} 
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
