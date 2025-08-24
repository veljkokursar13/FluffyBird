import { GAME_CONFIG } from '../constants/gameConfig';
import type { World } from './world';

// Mutating helpers used by the orchestrator-style game loop
export function applyBirdPhysics(w: World, cfg: typeof GAME_CONFIG, dt: number, flap: boolean) {
  const b = w.bird;
  // Determine jump with optional combo boost
  let jump = cfg.bird.jumpVelocity;
  const taps = b.tapTimes ?? [];
  if (flap) {
    let bonus = 0;
    const n = taps.length; // sliding window is maintained by the caller
    // Ascending checks with cascading overrides so highest threshold wins
    if (n >= 5) bonus = 10;
    if (n >= 8) bonus = 14;
    if (n >= 10) bonus = 18;
    b.vy = -(jump + bonus);
    if (bonus > 0) {
      // consume the combo so it must be rebuilt
      b.tapTimes = [];
    }
  }

  // Track continuous fall duration (vy >= 0 means falling or zero)
  if (b.vy >= 0) {
    b.fallT = (b.fallT ?? 0) + dt;
  } else {
    b.fallT = 0;
  }
  // Ramp gravity and max fall after a short delay of continuous falling
  const fallT = b.fallT ?? 0;
  const startRampAt = 0.6; // seconds of continuous fall before ramp starts
  const rampRate = 0.6;    // per-second growth factor
  const rampMax = 1.4;     // cap multiplier
  const ramp = Math.min(rampMax, 1 + Math.max(0, fallT - startRampAt) * rampRate);
  const g = cfg.bird.gravity * ramp;
  const maxFall = cfg.bird.maxFallSpeed * ramp;

  // integrate gravity with clamp
  b.vy = Math.min(b.vy + g * dt, maxFall);
  b.y += b.vy * dt;
}

export function advancePipesMut(w: World, _cfg: typeof GAME_CONFIG, dt: number, speedOverride?: number) {
  const speed = speedOverride != null ? speedOverride : GAME_CONFIG.pipe.speed;
  w.pipes.forEach((p) => {
    p.x -= speed * dt;
  });
}

export function recyclePipes(w: World, _cfg: typeof GAME_CONFIG) {
  const off = -GAME_CONFIG.pipe.width;
  while (w.pipes.length && w.pipes[0].x < off) {
    w.pipes.shift();
  }
}

