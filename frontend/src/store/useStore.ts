import { create } from 'zustand';
import type { RateLimiterState, AlgorithmInfo, RequestLogEntry } from '../services/api';

interface AppStore {
  // Auth
  token: string | null;
  username: string | null;
  setAuth: (token: string, username: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;

  // Algorithms
  algorithms: AlgorithmInfo[];
  setAlgorithms: (algorithms: AlgorithmInfo[]) => void;

  // Current algorithm state
  currentState: RateLimiterState | null;
  setCurrentState: (state: RateLimiterState) => void;

  // Simulation
  isSimulating: boolean;
  simulationSpeed: number;
  setSimulating: (value: boolean) => void;
  setSimulationSpeed: (speed: number) => void;

  // Stats history for graphs
  statsHistory: { timestamp: number; accepted: number; rejected: number }[];
  addStatsPoint: (accepted: number, rejected: number) => void;
  clearStats: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // Auth
  token: localStorage.getItem('token'),
  username: localStorage.getItem('username'),
  setAuth: (token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    set({ token, username });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    set({ token: null, username: null });
  },
  isAuthenticated: () => !!get().token,

  // Algorithms
  algorithms: [],
  setAlgorithms: (algorithms) => set({ algorithms }),

  // Current state
  currentState: null,
  setCurrentState: (state) => set({ currentState: state }),

  // Simulation
  isSimulating: false,
  simulationSpeed: 1,
  setSimulating: (value) => set({ isSimulating: value }),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

  // Stats
  statsHistory: [],
  addStatsPoint: (accepted, rejected) =>
    set((s) => ({
      statsHistory: [
        ...s.statsHistory.slice(-59),
        { timestamp: Date.now(), accepted, rejected },
      ],
    })),
  clearStats: () => set({ statsHistory: [] }),
}));
