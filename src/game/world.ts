import type { GAME_CONFIG } from '../constants/gameConfig';
import type { Cloud, Soil } from './environmentCreation';
import { createRandomCloud, initializeSoil } from './environmentCreation';

export type World = {
  bird: { y: number; vy: number; tapTimes?: number[]; fallT?: number };
  pipes: { x: number; gapY: number; passed?: boolean }[];
  clouds: Cloud[];
  soil: Soil[];
  score: number;
};

export function createWorld(cfg: typeof GAME_CONFIG): World {
  const minCenter = (cfg.pipe as any).minGapY ?? cfg.pipe.gap / 2;
  const maxCenter = (cfg.pipe as any).maxGapY ?? (cfg.world.screenHeight - cfg.world.groundHeight - cfg.pipe.gap / 2);
  const randCenter = () => {
    const r = Math.random();
    return minCenter + r * Math.max(0, maxCenter - minCenter);
  };
  const minSpace = (cfg.pipe as any).minPairSpacing as number | undefined;
  const maxSpace = (cfg.pipe as any).maxPairSpacing as number | undefined;
  const randSpacing = () => {
    if (minSpace != null && maxSpace != null) {
      const lo = Math.max(0, Math.min(minSpace, maxSpace));
      const hi = Math.max(lo, Math.max(minSpace, maxSpace));
      const span = Math.max(0, hi - lo);
      const r = span > 0 ? Math.random() * span : 0;
      return lo + r;
    }
    const spacingBase = (cfg.pipe as any).spacing ?? cfg.pipe.width * 3;
    const j = (cfg.pipe as any).intervalJitter ?? 0;
    return spacingBase * (1 - j + Math.random() * (2 * j));
  };
  // Spawn initial pipes off-screen to the right so they slide in naturally
  const x0 = cfg.world.screenWidth + cfg.pipe.width * 1.25;
  const x1 = x0 + randSpacing();
  return {
    bird: { y: cfg.world.screenHeight * 0.35, vy: 0, tapTimes: [], fallT: 0 },
    pipes: [
      { x: x0, gapY: randCenter() },
      { x: x1, gapY: randCenter() },
    ],
    // Pre-seed a few clouds across the sky so it doesn't start empty
    clouds: Array.from({ length: 5 }).map(() => {
      const c = createRandomCloud();
      c.x = Math.random() * (cfg.world.screenWidth * 1.2) - cfg.pipe.width;
      c.y = Math.random() * (cfg.world.screenHeight * 0.55);
      return c;
    }),
    soil: initializeSoil(), // Initialize soil segments
    score: 0,
  };
}


