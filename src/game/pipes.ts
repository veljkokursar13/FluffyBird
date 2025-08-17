import { GAME_CONFIG } from '../constants/gameConfig';

export function randomGapY(gap: number = GAME_CONFIG.pipe.gap): number {
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

export function pipeMovement({score}:{score:number}, pipeSpeed:number){
	let factor = 1;
	if (score >= 30) {
		factor = 1.8;
	} else if (score >= 20) {
		factor = 1.5;
	} else if (score >= 10) {
		factor = 1.25;
	}
	return pipeSpeed * factor;
}

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
  w: { pipes: { x: number; gapY: number; gap: number; passed?: boolean }[] },
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

  // Determine gap size respecting configured min/max
  const gap = gapBetweenTopAndBottom(0, 0);
  const worldH = GAME_CONFIG.world.screenHeight;
  const ground = GAME_CONFIG.world.groundHeight;
  const safeMin = gap / 2;
  const safeMax = worldH - ground - gap / 2;

  // Pick a target gap center within safe bounds
  const gy = randomGapY(gap);

  // Clamp vertical change relative to previous gap center
  const prevGy = last ? last.gapY : (safeMin + safeMax) / 2;
  const maxStep = gap * 0.6; // max vertical change per spawn
  const lower = Math.max(safeMin, prevGy - maxStep);
  const upper = Math.min(safeMax, prevGy + maxStep);
  const finalGy = Math.max(lower, Math.min(upper, gy));

  w.pipes.push({ x, gapY: finalGy, gap, passed: false });
  spawner.nextMs = randomizedIntervalMs();
}

