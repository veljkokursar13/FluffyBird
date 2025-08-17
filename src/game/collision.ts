export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function rectsOverlap(a: Rect, b: Rect): boolean {
  // Tolerance to account for floating point integration error
  const EPS = 1e-6;
  return (
    a.x <= b.x + b.width + EPS &&
    a.x + a.width >= b.x - EPS &&
    a.y <= b.y + b.height + EPS &&
    a.y + a.height >= b.y - EPS
  );
}

export function isPipeCollision(bird: Rect, pipe: Rect | Rect[]): boolean {
  if (Array.isArray(pipe)) {
    for (const p of pipe) {
      if (rectsOverlap(bird, p)) return true;
    }
    return false;
  }
  return rectsOverlap(bird, pipe);
}

export function isGroundCollision(bird: Rect, groundY: number): boolean {
  return bird.y + bird.height >= groundY;
}

export function isTopCollision(bird: Rect, topY: number = 0): boolean {
  return bird.y <= topY;
}

export type DetectCollisionArgs = {
  pipe?: Rect | Rect[];
  groundY: number;
  topY?: number;
};

export type CollisionResult = {
  pipe: boolean;
  ground: boolean;
  top: boolean;
  any: boolean;
};

export default function detectCollision(
  bird: Rect,
  args: DetectCollisionArgs
): CollisionResult {
  const pipeHit = args.pipe ? isPipeCollision(bird, args.pipe) : false;
  const groundHit = isGroundCollision(bird, args.groundY);
  const topHit = isTopCollision(bird, args.topY ?? 0);
  return {
    pipe: pipeHit,
    ground: groundHit,
    top: topHit,
    any: pipeHit || groundHit || topHit,
  };
}


// Convenience wrapper to detect collisions for the entire world
import { GAME_CONFIG } from '../constants/gameConfig';
import type { World } from './world';

// Circle vs Rect overlap helper
function circleRectOverlap(
  circle: { x: number; y: number; r: number },
  rect: Rect
): boolean {
  const cx = circle.x;
  const cy = circle.y;
  const rx = rect.x;
  const ry = rect.y;
  const rw = rect.width;
  const rh = rect.height;

  const distX = Math.abs(cx - (rx + rw / 2));
  const distY = Math.abs(cy - (ry + rh / 2));

  if (distX > (rw / 2 + circle.r)) return false;
  if (distY > (rh / 2 + circle.r)) return false;

  if (distX <= (rw / 2)) return true;
  if (distY <= (rh / 2)) return true;

  const dx = distX - rw / 2;
  const dy = distY - rh / 2;
  return (dx * dx + dy * dy <= circle.r * circle.r);
}

export function detectWorldCollision(
  world: World,
  cfg: typeof GAME_CONFIG,
  birdXUnits: number
): CollisionResult {
  // Bird as circle (slightly smaller than sprite bounds to match visible body)
  const bw = cfg.bird.width;
  const bh = cfg.bird.height;
  const birdCircle = {
    x: birdXUnits + bw / 2,
    y: world.bird.y + bh / 2,
    r: Math.min(bw, bh) * 0.42,
  };
  
  // Trim pipes horizontally to remove transparent edges
  const trimX = Math.max(0, cfg.pipe.width * 0.08);
  const pipeRects: Rect[] = world.pipes.flatMap((p) => {
    const pGap = (p as any).gap ?? cfg.pipe.gap;
    const topHeight = Math.max(0, p.gapY - pGap / 2);
    const bottomY = p.gapY + pGap / 2;
    const bottomHeight = Math.max(
      0,
      cfg.world.screenHeight - cfg.world.groundHeight - bottomY
    );
    const xLeft = p.x + trimX;
    const wTrim = Math.max(0, cfg.pipe.width - 2 * trimX);
    return [
      { x: xLeft, y: 0, width: wTrim, height: topHeight },
      { x: xLeft, y: bottomY, width: wTrim, height: bottomHeight },
    ];
  });

  // Pipe collisions using circle vs rect
  const pipeHit = pipeRects.some(rect => circleRectOverlap(birdCircle, rect));
  
  // Ground collision using a single ground rect
  const groundRect: Rect = {
    x: 0,
    y: cfg.world.screenHeight - cfg.world.groundHeight,
    width: cfg.world.screenWidth,
    height: cfg.world.groundHeight,
  };
  const groundHit = circleRectOverlap(birdCircle, groundRect);

  // Top collision (circle touches top)
  const topHit = (birdCircle.y - birdCircle.r) <= 0;

  return {
    pipe: pipeHit,
    ground: groundHit,
    top: topHit,
    any: pipeHit || groundHit || topHit,
  };
}
