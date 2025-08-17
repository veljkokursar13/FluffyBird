import { GAME_CONFIG } from '../constants/gameConfig';
import type { Rect } from './collision';
import type { World } from './world';

export type BirdState = {
  position: { x: number; y: number };
  size: { width: number; height: number };
  velocityY: number;
};

export type GameStepState = {
  bird: BirdState;
  pipes: Rect[];
};

export type GameStepInput = {
  dt: number; // seconds
  didFlap: boolean;
};

export function applyJump(jumpForce: number): number {
  // Flap gives an immediate upward impulse (negative velocity)
  return -Math.abs(jumpForce);
}

export function applyGravity(currentVelocityY: number, gravity: number, dt: number): number {
  return currentVelocityY + gravity * dt;
}

export function advanceBird(bird: BirdState, dt: number): BirdState {
  const nextY = bird.position.y + bird.velocityY * dt;
  return {
    ...bird,
    position: { x: bird.position.x, y: nextY },
  };
}

export function advancePipes(pipes: Rect[], pipeSpeed: number, dt: number): Rect[] {
  if (pipes.length === 0) return pipes;
  const dx = pipeSpeed * dt;
  return pipes.map((p) => ({ ...p, x: p.x - dx }));
}

export default function stepPhysics(
  state: GameStepState,
  input: GameStepInput,
  cfg: typeof GAME_CONFIG = GAME_CONFIG
): GameStepState {
  const jumpVelocity = cfg.bird.jumpVelocity;
  const gravity = cfg.bird.gravity;
  const pipeSpeed = cfg.pipe.speed;

  // Jump impulse
  let velocityY = state.bird.velocityY;
  if (input.didFlap) {
    velocityY = applyJump(jumpVelocity);
  }

  // Gravity integration
  velocityY = applyGravity(velocityY, gravity, input.dt);
  // clamp fall speed
  if (velocityY > cfg.bird.maxFallSpeed) velocityY = cfg.bird.maxFallSpeed;

  // Update bird position
  const birdNext = advanceBird({ ...state.bird, velocityY }, input.dt);

  // Move pipes left
  const pipesNext = advancePipes(state.pipes, pipeSpeed, input.dt);

  return {
    bird: birdNext,
    pipes: pipesNext,
  };
}

// Mutating helpers used by the orchestrator-style game loop
export function applyBirdPhysics(w: World, cfg: typeof GAME_CONFIG, dt: number, flap: boolean) {
  const b = w.bird;
  // Determine jump with optional combo boost
  let jump = cfg.bird.jumpVelocity;
  const taps = b.tapTimes ?? [];
  if (flap) {
    let bonus = 0;
    const n = taps.length; // sliding window is maintained by the caller
    if (n >= 10) bonus = 18;
    else if (n >= 8) bonus = 14;
    else if (n >= 5) bonus = 10;
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

export function advancePipesMut(w: World, cfg: typeof GAME_CONFIG, dt: number, speedOverride?: number) {
  const speed = speedOverride != null ? speedOverride : cfg.pipe.speed;
  w.pipes.forEach((p) => {
    p.x -= speed * dt;
  });
}

export function recyclePipes(w: World, cfg: typeof GAME_CONFIG) {
  const off = -cfg.pipe.width;
  while (w.pipes.length && w.pipes[0].x < off) {
    w.pipes.shift();
  }
}

// Clouds and soil: keep static (no movement)
export function updateClouds(_w: World, _cfg: typeof GAME_CONFIG, _dt: number, _speedOverride?: number) {
  // no-op to keep clouds static
}

export function updateSoil(_w: World, _cfg: typeof GAME_CONFIG, _dt: number, _speedOverride?: number) {
  // no-op to keep soil static
}

