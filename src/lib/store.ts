
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameMode = "Menu" | "Standard" | "Tournament" | "SPS";

export type Player = {
  id: string;
  name: string;
  color: string;
  score?: number;
};

export type RollHistory = {
  id: string;
  section: string;
  result: number;
  playerName: string;
  playerColor: string;
  timestamp: number;
  aiWisdom?: string;
};

export type SectionType = "Game" | "Lucky" | "Decision" | "Yoga";

interface DiceState {
  gameMode: GameMode;
  players: Player[];
  currentPlayerIndex: number;
  consecutiveSixes: number;
  history: RollHistory[];
  settings: {
    sound: boolean;
    haptic: boolean;
  };
  activeSection: SectionType;
  lastAiWisdom: string | null;

  // Tournament State
  tournamentConfig: {
    rollsPerPlayer: number;
    totalPlayers: number;
  };
  tournamentCurrentRoll: number;
  tournamentScores: Record<string, number>; // playerID -> score

  // SPS State
  spsConfig: {
    bestOf: number;
  };
  spsScores: [number, number]; // [player1, player2]
  spsCurrentRound: number;
  
  // Actions
  setGameMode: (mode: GameMode) => void;
  setPlayers: (players: Player[]) => void;
  nextTurn: () => void;
  incrementSixes: () => void;
  resetSixes: () => void;
  addHistory: (section: SectionType, result: number, aiWisdom?: string) => void;
  updateSettings: (settings: Partial<DiceState["settings"]>) => void;
  setActiveSection: (section: SectionType) => void;
  setAiWisdom: (wisdom: string | null) => void;
  
  // Tournament Actions
  startTournament: (rolls: number) => void;
  addTournamentScore: (playerId: string, score: number) => void;
  nextTournamentRoll: () => void;

  // SPS Actions
  startSPS: (bestOf: number) => void;
  updateSPSScore: (p1Win: boolean | null) => void; // null for draw

  resetAll: () => void;
}

export const useDiceStore = create<DiceState>()(
  persist(
    (set) => ({
      gameMode: "Menu",
      players: [{ id: "1", name: "Player 1", color: "#CF8012" }],
      currentPlayerIndex: 0,
      consecutiveSixes: 0,
      history: [],
      settings: {
        sound: true,
        haptic: true,
      },
      activeSection: "Game",
      lastAiWisdom: null,

      tournamentConfig: { rollsPerPlayer: 3, totalPlayers: 0 },
      tournamentCurrentRoll: 1,
      tournamentScores: {},

      spsConfig: { bestOf: 3 },
      spsScores: [0, 0],
      spsCurrentRound: 1,

      setGameMode: (gameMode) => set({ gameMode }),
      setPlayers: (players) => set({ players, currentPlayerIndex: 0, consecutiveSixes: 0 }),
      
      nextTurn: () => set((state) => ({ 
        currentPlayerIndex: (state.currentPlayerIndex + 1) % (state.players.length || 1),
        consecutiveSixes: 0,
        lastAiWisdom: null
      })),

      incrementSixes: () => set((state) => ({ consecutiveSixes: state.consecutiveSixes + 1 })),
      resetSixes: () => set({ consecutiveSixes: 0 }),

      addHistory: (section, result, aiWisdom) => set((state) => {
        const currentPlayer = state.players[state.currentPlayerIndex];
        const newEntry: RollHistory = {
          id: Math.random().toString(36).substring(7),
          section,
          result,
          playerName: currentPlayer?.name || "Guest",
          playerColor: currentPlayer?.color || "#CF8012",
          timestamp: Date.now(),
          aiWisdom,
        };
        const updatedHistory = [newEntry, ...state.history].slice(0, 50);
        return { history: updatedHistory, lastAiWisdom: aiWisdom || null };
      }),

      updateSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),

      setActiveSection: (activeSection) => set({ activeSection }),
      setAiWisdom: (lastAiWisdom) => set({ lastAiWisdom }),

      startTournament: (rolls) => set((state) => ({
        tournamentConfig: { rollsPerPlayer: rolls, totalPlayers: state.players.length },
        tournamentCurrentRoll: 1,
        tournamentScores: {},
        currentPlayerIndex: 0
      })),

      addTournamentScore: (playerId, score) => set((state) => ({
        tournamentScores: {
          ...state.tournamentScores,
          [playerId]: (state.tournamentScores[playerId] || 0) + score
        }
      })),

      nextTournamentRoll: () => set((state) => {
        const isEndOfPlayerTurn = state.tournamentCurrentRoll >= state.tournamentConfig.rollsPerPlayer;
        if (isEndOfPlayerTurn) {
          return {
            tournamentCurrentRoll: 1,
            currentPlayerIndex: state.currentPlayerIndex + 1
          };
        }
        return {
          tournamentCurrentRoll: state.tournamentCurrentRoll + 1
        };
      }),

      startSPS: (bestOf) => set({
        spsConfig: { bestOf },
        spsScores: [0, 0],
        spsCurrentRound: 1
      }),

      updateSPSScore: (p1Win) => set((state) => {
        const scores = [...state.spsScores] as [number, number];
        if (p1Win === true) scores[0]++;
        if (p1Win === false) scores[1]++;
        return {
          spsScores: scores,
          spsCurrentRound: state.spsCurrentRound + 1
        };
      }),

      resetAll: () => set({
        gameMode: "Menu",
        players: [{ id: "1", name: "Player 1", color: "#CF8012" }],
        currentPlayerIndex: 0,
        consecutiveSixes: 0,
        history: [],
        activeSection: "Game",
        lastAiWisdom: null,
        tournamentScores: {},
        spsScores: [0, 0]
      }),
    }),
    {
      name: "smart-dice-storage",
    }
  )
);
