import { GAME_CONFIG } from '../constants/gameConfig';
import type { Rect } from './collision';


export function randomBottomHeight(): number {
  const max = Math.max(0, GAME_CONFIG.world.screenHeight - GAME_CONFIG.pipe.gap);
  return Math.random() * max;
}
export function randomTopHeight(): number {
  const max = Math.max(0, GAME_CONFIG.world.screenHeight - GAME_CONFIG.pipe.gap);
  return Math.random() * max;
}

export function createBottomPipe(x: number = GAME_CONFIG.world.screenWidth): Rect {
  const width = GAME_CONFIG.pipe.width;
  const height = randomBottomHeight();
  return {
    x,
    y: Math.max(0, GAME_CONFIG.world.screenHeight - height),
    width,
    height,
  };
}

export function createTopPipe(x: number = GAME_CONFIG.world.screenWidth): Rect {
  const width = GAME_CONFIG.pipe.width;
  const height = randomTopHeight();
  return {
    x,
    y: 0,
    width,
    height,
  };
}

export function randomGapY(): number {
  const gap = GAME_CONFIG.pipe.gap;
  const worldH = GAME_CONFIG.world.screenHeight;
  const ground = GAME_CONFIG.world.groundHeight;
  // Safe bounds for the gap center in world units
  const safeMin = gap / 2;
  const safeMax = worldH - ground - gap / 2;
  const cfgMin = (GAME_CONFIG.pipe as any).minGapY as number | undefined;
  const cfgMax = (GAME_CONFIG.pipe as any).maxGapY as number | undefined;
  const min = Math.max(safeMin, cfgMin ?? safeMin);
  const max = Math.min(safeMax, cfgMax ?? safeMax);
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const span = Math.max(0, hi - lo);
  const r = span > 0 ? Math.random() * span : 0;
  return lo + r;
}

export function gapBetweenTopAndBottom(topHeight: number, bottomHeight: number): number {
  const available = Math.max(0,
    GAME_CONFIG.world.screenHeight - GAME_CONFIG.world.groundHeight - topHeight - bottomHeight
  );
  const minGap = (GAME_CONFIG.pipe as any).minGapSize as number | undefined;
  const maxGap = (GAME_CONFIG.pipe as any).maxGapSize as number | undefined;
  if (minGap != null && maxGap != null) {
    const lo = Math.max(0, Math.min(minGap, maxGap));
    const hi = Math.max(lo, Math.max(minGap, maxGap));
    const upper = Math.min(hi, available);
    const span = Math.max(0, upper - lo);
    const r = span > 0 ? Math.random() * span : 0;
    return lo + r;
  }
  return Math.min(GAME_CONFIG.pipe.gap, available);
}

export function pipeMovement({score}:{score:number}, pipeSpeed:number): number{
	let factor = 1;
	if (score >= 30) {
		factor = 1.9;
	} else if (score >= 20) {
		factor = 1.6;
	} else if (score >= 10) {
		factor = 1.3;
	}
	return pipeSpeed * factor;
  
}

export function createPipePair(x: number = GAME_CONFIG.world.screenWidth, minGapBetweenPipes: number = 0): {
  top: Rect;
  bottom: Rect;
} {
  const width = GAME_CONFIG.pipe.width;
  const gap = minGapBetweenPipes;
  const screenHeight = GAME_CONFIG.world.screenHeight;

  const bottomHeight = randomBottomHeight();
  const topHeight = Math.max(0, screenHeight - gap - bottomHeight);

  const bottom: Rect = {
    x,
    y: Math.max(0, screenHeight - bottomHeight),
    width,
    height: bottomHeight,
  };

  const top: Rect = {
    x,
    y: 0,
    width,
    height: topHeight,
  };

  return { top, bottom };
}

export type { Rect };

// Optional time-based spawner API (pure game logic; not used by render)
export type PipeSpawner = { nextMs: number };

export function randomizedIntervalMs(): number {
  const base = GAME_CONFIG.pipe.spawnIntervalMs;
  const j = (GAME_CONFIG.pipe as any).intervalJitter ?? 0;
  return base * (1 - j + Math.random() * (2 * j));
}

export function createPipeSpawner(): PipeSpawner {
  return { nextMs: randomizedIntervalMs() };
}

// Legacy spawner (simple time/spacing based)
export function tickPipeSpawner(
  spawner: PipeSpawner,
  w: { pipes: { x: number; gapY: number; gap?: number; passed?: boolean }[] },
  dtSec: number,
  score: number
): void {
  spawner.nextMs -= dtSec * 1000;
  if (spawner.nextMs > 0) return;
  const last = w.pipes[w.pipes.length - 1];
  const minSpace = (GAME_CONFIG.pipe as any).minPairSpacing as number | undefined;
  const maxSpace = (GAME_CONFIG.pipe as any).maxPairSpacing as number | undefined;

  // Compute spacing without score-based expansion (avoid perceived slowdowns)
  let spacing: number;
  if (minSpace != null && maxSpace != null) {
    const lo = Math.max(0, Math.min(minSpace, maxSpace));
    const hi = Math.max(lo, Math.max(minSpace, maxSpace));
    const span = Math.max(0, hi - lo);
    const r = span > 0 ? Math.random() * span : 0;
    spacing = lo + r;
  } else {
    const spacingBase = (GAME_CONFIG.pipe as any).spacing ?? GAME_CONFIG.pipe.width * 3;
    const j = (GAME_CONFIG.pipe as any).intervalJitter ?? 0;
    spacing = spacingBase * (1 - j + Math.random() * (2 * j));
  }
  // Enforce a floor for horizontal spacing to prevent impossible passes
  const spacingFloor = (GAME_CONFIG.pipe as any).minPairSpacing ?? (GAME_CONFIG.pipe.width * 2.5);
  spacing = Math.max(spacing, spacingFloor);

  const minX = GAME_CONFIG.world.screenWidth + GAME_CONFIG.pipe.width;
  const x = Math.max(minX, (last ? last.x + spacing : minX));

  // Determine next gap (per-pipe), with variability for higher scores
  const baseGap = GAME_CONFIG.pipe.gap;
  let nextGap = baseGap;
  if (score >= 30) {
    const minCfg = (GAME_CONFIG.pipe as any).minGapSize as number | undefined;
    const maxCfg = (GAME_CONFIG.pipe as any).maxGapSize as number | undefined;
    const minBound = minCfg ?? Math.round(baseGap * 0.72);
    const maxBound = maxCfg ?? Math.round(baseGap * 0.95);
    nextGap = minBound + Math.random() * Math.max(0, maxBound - minBound);
    if (last && (last as any).gap != null) {
      const prevGap = (last as any).gap as number;
      const maxGapStep = baseGap * 0.35; // limit gap change between consecutive pipes
      const lo = Math.max(minBound, prevGap - maxGapStep);
      const hi = Math.min(maxBound, prevGap + maxGapStep);
      nextGap = Math.max(lo, Math.min(hi, nextGap));
    }
  }

  // Safe vertical bounds computed with the chosen gap
  const gap = nextGap;
  const worldH = GAME_CONFIG.world.screenHeight;
  const ground = GAME_CONFIG.world.groundHeight;
  const safeMin = gap / 2;
  const safeMax = worldH - ground - gap / 2;

  // Avoid alternating impossible extremes: if last was bottom-only, don't spawn top-only next, and vice versa
  let lastExtreme: 'top' | 'bottom' | null = null;
  if (last) {
    const lastGap = (last as any).gap ?? baseGap;
    const lastSafeMin = lastGap / 2;
    const lastSafeMax = worldH - ground - lastGap / 2;
    if (Math.abs(last.gapY - lastSafeMin) < 1e-3) lastExtreme = 'bottom';
    else if (Math.abs(last.gapY - lastSafeMax) < 1e-3) lastExtreme = 'top';
  }
  let willSpawnExtreme = Math.random() < 0.2;
  let topOnly = false;
  if (willSpawnExtreme) {
    topOnly = Math.random() < 0.5;
    if ((lastExtreme === 'top' && !topOnly) || (lastExtreme === 'bottom' && topOnly)) {
      // disable opposite extreme adjacency
      willSpawnExtreme = false;
    }
  }

  let maxHeight: number;
  let minHeight: number;
  // Pick a target gap center
  let gy: number;
  if (willSpawnExtreme) {
    gy = topOnly ? safeMin : safeMax;
    maxHeight = topOnly ? safeMax : safeMin;
    minHeight = topOnly ? safeMin : safeMax;
    // avoid too small gap on extremes
    nextGap = Math.max(nextGap, baseGap * 0.85);
  } else {
    // random gap center within safe bounds for this gap
    gy = safeMin + Math.random() * Math.max(0, safeMax - safeMin);
    maxHeight = safeMax;
    minHeight = safeMin;
  }

  // Clamp vertical change relative to previous gap center (but not for extremes)
  let finalGy = gy;
  if (!willSpawnExtreme) {
    const prevGy = last ? last.gapY : (safeMin + safeMax) / 2;
    const maxStep = gap * 0.6; // max vertical change per spawn
    const lower = Math.max(minHeight, prevGy - maxStep);
    const upper = Math.min(maxHeight, prevGy + maxStep);
    finalGy = Math.max(lower, Math.min(upper, gy));
  }

  w.pipes.push({ x, gapY: finalGy, gap: Math.round(nextGap), passed: false });
  spawner.nextMs = randomizedIntervalMs();
}

