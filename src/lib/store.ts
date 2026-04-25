
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Player = {
  id: string;
  name: string;
  color: string;
};

export type RollHistory = {
  id: string;
  section: string;
  result: number;
  playerName: string;
  playerColor: string;
  timestamp: number;
};

export type SectionType = "Game" | "Lucky" | "Decision" | "Yoga";

interface DiceState {
  players: Player[];
  currentPlayerIndex: number;
  consecutiveSixes: number;
  history: RollHistory[];
  settings: {
    sound: boolean;
    haptic: boolean;
  };
  activeSection: SectionType;
  
  // Actions
  setPlayers: (players: Player[]) => void;
  nextTurn: () => void;
  incrementSixes: () => void;
  resetSixes: () => void;
  addHistory: (section: SectionType, result: number) => void;
  updateSettings: (settings: Partial<DiceState["settings"]>) => void;
  setActiveSection: (section: SectionType) => void;
  resetAll: () => void;
}

export const useDiceStore = create<DiceState>()(
  persist(
    (set) => ({
      players: [{ id: "1", name: "Player 1", color: "#CF8012" }],
      currentPlayerIndex: 0,
      consecutiveSixes: 0,
      history: [],
      settings: {
        sound: true,
        haptic: true,
      },
      activeSection: "Game",

      setPlayers: (players) => set({ players, currentPlayerIndex: 0, consecutiveSixes: 0 }),
      nextTurn: () => set((state) => ({ 
        currentPlayerIndex: (state.currentPlayerIndex + 1) % (state.players.length || 1),
        consecutiveSixes: 0
      })),
      incrementSixes: () => set((state) => ({ consecutiveSixes: state.consecutiveSixes + 1 })),
      resetSixes: () => set({ consecutiveSixes: 0 }),
      addHistory: (section, result) => set((state) => {
        const currentPlayer = state.players[state.currentPlayerIndex];
        const newEntry: RollHistory = {
          id: Math.random().toString(36).substring(7),
          section,
          result,
          playerName: currentPlayer?.name || "Guest",
          playerColor: currentPlayer?.color || "#CF8012",
          timestamp: Date.now(),
        };
        const updatedHistory = [newEntry, ...state.history].slice(0, 50);
        return { history: updatedHistory };
      }),
      updateSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),
      setActiveSection: (activeSection) => set({ activeSection }),
      resetAll: () => set({
        players: [{ id: "1", name: "Player 1", color: "#CF8012" }],
        currentPlayerIndex: 0,
        consecutiveSixes: 0,
        history: [],
        activeSection: "Game",
      }),
    }),
    {
      name: "smart-dice-storage",
    }
  )
);
