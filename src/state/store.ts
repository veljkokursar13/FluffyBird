
import { create } from 'zustand';

export type Phase = 'loading' | 'menu' | 'playing' | 'paused' | 'gameover';

export type Pipe = { id: string; x: number; y: number; width: number; height: number };

export type Bird = { x: number; y: number; width: number; height: number };



export type GameState = {
  w: number;
  h: number;
  phase: Phase;
  pipes: Pipe[];
  bird: Bird;
  score: number;
  reset: () => void;
  start: () => void;
  flap: () => void;
  set: (p: Partial<GameState>) => void;
};

const initialState: Omit<GameState, 'reset' | 'start' | 'flap' | 'set'> = {
  w: 0,
  h: 0,
  phase: 'loading',
  pipes: [],
  bird: { x: 0, y: 0, width: 0, height: 0 },
  score: 0,
};


export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  set: (p: Partial<GameState>) => set(p),
  reset: () => set(() => ({ ...initialState })),
  start: () => set(() => ({ phase: 'playing' })),
  flap: () => set((s) => ({ bird: { ...s.bird, y: s.bird.y - 10 } })),
}));