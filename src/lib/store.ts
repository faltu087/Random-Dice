
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameMode = "Menu" | "Standard" | "Tournament" | "SPS";

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
  aiWisdom?: string;
};

export type SectionType = "Game" | "Lucky" | "Decision" | "Yoga";

export type SPSChoice = "Stone" | "Paper" | "Scissors" | null;
export type SPSPhase = "Setup" | "SelectingP1" | "Handover" | "SelectingP2" | "Countdown" | "Reveal" | "GameOver";

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
  };
  tournamentCurrentRoll: number;
  tournamentScores: Record<string, number>; // playerID -> total score
  tournamentRollLog: Record<string, number[]>; // playerID -> list of rolls

  // SPS State
  spsConfig: {
    bestOf: number;
  };
  spsPhase: SPSPhase;
  spsScores: [number, number]; // [player1, player2]
  spsCurrentRound: number;
  spsChoices: [SPSChoice, SPSChoice];
  
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
  startSPSSetup: () => void;
  startSPSGame: (bestOf: number, p1: Player, p2: Player) => void;
  setSPSChoice: (playerIdx: 0 | 1, choice: SPSChoice) => void;
  setSPSPhase: (phase: SPSPhase) => void;
  incrementSPSWin: (playerIdx: 0 | 1) => void;
  resetSPSRound: () => void;

  resetAll: () => void;
}

export const useDiceStore = create<DiceState>()(
  persist(
    (set) => ({
      gameMode: "Menu",
      players: [
        { id: "1", name: "Player 1", color: "#E53935" },
        { id: "2", name: "Player 2", color: "#1E88E5" }
      ],
      currentPlayerIndex: 0,
      consecutiveSixes: 0,
      history: [],
      settings: {
        sound: true,
        haptic: true,
      },
      activeSection: "Game",
      lastAiWisdom: null,

      tournamentConfig: { rollsPerPlayer: 3 },
      tournamentCurrentRoll: 1,
      tournamentScores: {},
      tournamentRollLog: {},

      spsConfig: { bestOf: 3 },
      spsPhase: "Setup",
      spsScores: [0, 0],
      spsCurrentRound: 1,
      spsChoices: [null, null],

      setGameMode: (mode) => set({ 
        gameMode: mode,
        currentPlayerIndex: 0,
        consecutiveSixes: 0,
        tournamentScores: {},
        tournamentRollLog: {},
        tournamentCurrentRoll: 1,
        spsScores: [0, 0],
        spsCurrentRound: 1,
        spsPhase: "Setup",
        spsChoices: [null, null]
      }),
      
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
          playerColor: currentPlayer?.color || "#E53935",
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
        tournamentConfig: { rollsPerPlayer: rolls },
        tournamentCurrentRoll: 1,
        tournamentScores: {},
        tournamentRollLog: {},
        currentPlayerIndex: 0
      })),

      addTournamentScore: (playerId, score) => set((state) => {
        const currentLog = state.tournamentRollLog[playerId] || [];
        return {
          tournamentScores: {
            ...state.tournamentScores,
            [playerId]: (state.tournamentScores[playerId] || 0) + score
          },
          tournamentRollLog: {
            ...state.tournamentRollLog,
            [playerId]: [...currentLog, score]
          }
        };
      }),

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

      startSPSSetup: () => set({ spsPhase: "Setup" }),
      startSPSGame: (bestOf, p1, p2) => set({
        spsConfig: { bestOf },
        players: [p1, p2],
        spsScores: [0, 0],
        spsCurrentRound: 1,
        spsPhase: "SelectingP1",
        spsChoices: [null, null]
      }),
      setSPSChoice: (idx, choice) => set((state) => {
        const newChoices = [...state.spsChoices] as [SPSChoice, SPSChoice];
        newChoices[idx] = choice;
        return { spsChoices: newChoices };
      }),
      setSPSPhase: (phase) => set({ spsPhase: phase }),
      incrementSPSWin: (idx) => set((state) => {
        const newScores = [...state.spsScores] as [number, number];
        newScores[idx]++;
        return { spsScores: newScores };
      }),
      resetSPSRound: () => set((state) => ({
        spsCurrentRound: state.spsCurrentRound + 1,
        spsChoices: [null, null],
        spsPhase: "SelectingP1"
      })),

      resetAll: () => set({
        gameMode: "Menu",
        players: [
          { id: "1", name: "Player 1", color: "#E53935" },
          { id: "2", name: "Player 2", color: "#1E88E5" }
        ],
        currentPlayerIndex: 0,
        consecutiveSixes: 0,
        history: [],
        activeSection: "Game",
        lastAiWisdom: null,
        tournamentScores: {},
        tournamentRollLog: {},
        spsScores: [0, 0],
        spsPhase: "Setup"
      }),
    }),
    {
      name: "smart-dice-storage-v3",
    }
  )
);
