
"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { DiceSection } from "@/components/sections/dice-section";
import { PlayerSetup } from "@/components/game/player-setup";
import { HistoryDrawer } from "@/components/game/history-drawer";
import { SettingsPopover } from "@/components/game/settings-popover";
import { useDiceStore, type SectionType } from "@/lib/store";
import { cn } from "@/lib/utils";

const SECTIONS: {
  id: SectionType;
  title: string;
  description: string;
  gradient: string;
  color: string;
  interpret: (v: number) => string;
}[] = [
  {
    id: "Game",
    title: "Tabletop Game",
    description: "Classic 6-sided die for your favorite games",
    gradient: "bg-gradient-to-br from-[#CF8012] to-[#B86E0A]",
    color: "#CF8012",
    interpret: (v) => `Result: ${v}`,
  },
  {
    id: "Lucky",
    title: "LUCK-O-METER",
    description: "Will fortune favor you today?",
    gradient: "bg-gradient-to-br from-[#F46659] to-[#D85549]",
    color: "#F46659",
    interpret: (v) => {
      if (v === 6) return "Jackpot! 🌟";
      if (v >= 4) return "Pretty Lucky! ✨";
      if (v >= 2) return "Neutral Vibes ⚖️";
      return "Better luck next time! 🍀";
    },
  },
  {
    id: "Decision",
    title: "DICE DECIDER",
    description: "Let the dots guide your next move",
    gradient: "bg-gradient-to-br from-[#2A9D8F] to-[#208074]",
    color: "#2A9D8F",
    interpret: (v) => {
      if (v % 2 === 0) return "HELL YES! ✅";
      return "PROBABLY NOT ❌";
    },
  },
  {
    id: "Yoga",
    title: "YOGA FLOW",
    description: "Roll for your next movement",
    gradient: "bg-gradient-to-br from-[#6D597A] to-[#594963]",
    color: "#6D597A",
    interpret: (v) => {
      const poses = [
        "Mountain Pose 🏔️",
        "Tree Pose 🌳",
        "Warrior II ⚔️",
        "Bridge Pose 🌉",
        "Child's Pose 👶",
        "Plank 🪵"
      ];
      return poses[v - 1];
    },
  },
];

export default function Home() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const setActiveSection = useDiceStore((state) => state.setActiveSection);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    setActiveSection(SECTIONS[index].id);
  }, [emblaApi, setActiveSection]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <div className="flex flex-col">
          <h1 className="text-xl font-headline font-bold text-primary">Smart Dice</h1>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Multi-Section</span>
        </div>
        <div className="flex gap-2">
          <PlayerSetup />
          <HistoryDrawer />
          <SettingsPopover />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container h-full flex">
            {SECTIONS.map((section) => (
              <div key={section.id} className="embla__slide flex-[0_0_100%] min-w-0 h-full px-2">
                <DiceSection 
                  type={section.id}
                  title={section.title}
                  description={section.description}
                  gradient={section.gradient}
                  color={section.color}
                  interpretResult={section.interpret}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Indicators */}
      <footer className="py-8 flex flex-col items-center gap-4 z-20">
        <div className="flex gap-3">
          {SECTIONS.map((section, index) => (
            <button
              key={section.id}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === selectedIndex ? "w-8 bg-primary" : "w-2 bg-primary/20"
              )}
              aria-label={`Go to ${section.title} section`}
            />
          ))}
        </div>
        <div className="flex gap-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
           {SECTIONS.map((s, i) => (
             <span key={s.id} className={cn(i === selectedIndex && "text-primary")}>
               {s.id}
             </span>
           ))}
        </div>
      </footer>
    </main>
  );
}
