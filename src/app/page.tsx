
"use client";

import * as React from "react";
import { ModeSelector } from "@/components/modes/mode-selector";
import { StandardMode } from "@/components/modes/standard-mode";
import { TournamentMode } from "@/components/modes/tournament-mode";
import { SPSMode } from "@/components/modes/sps-mode";
import { useDiceStore } from "@/lib/store";

export default function Home() {
  const { gameMode } = useDiceStore();

  switch (gameMode) {
    case "Standard":
      return <StandardMode />;
    case "Tournament":
      return <TournamentMode />;
    case "SPS":
      return <SPSMode />;
    default:
      return <ModeSelector />;
  }
}
