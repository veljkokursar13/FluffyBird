import { GAME_CONFIG } from "./config";

export type Cloud = {
  x: number;
  y: number;
  type: 'close' | 'far1' | 'far2';
  speed: number; // parallax speed factor (0.2-0.8 for background effect)
  width: number;
  height: number;
};

export function createRandomCloud(): Cloud {
  const types: Array<'close' | 'far1' | 'far2'> = ['close', 'far1', 'far2'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  // Different sizes and speeds for parallax depth (bigger clouds)
  let width, height, speed;
  switch (type) {
    case 'close':
      width = 14 + Math.random() * 8; // 14-22 units
      height = 7 + Math.random() * 4; // 7-11 units
      speed = 0.6 + Math.random() * 0.2; // 0.6-0.8x pipe speed
      break;
    case 'far1':
      width = 10 + Math.random() * 6; // 10-16 units
      height = 5 + Math.random() * 3; // 5-8 units
      speed = 0.4 + Math.random() * 0.2; // 0.4-0.6x pipe speed
      break;
    case 'far2':
      width = 7 + Math.random() * 5; // 7-12 units
      height = 3.5 + Math.random() * 2; // 3.5-5.5 units
      speed = 0.25 + Math.random() * 0.2; // slightly faster
      break;
  }
  
  return {
    x: GAME_CONFIG.world.screenWidth + width,
    y: Math.random() * (GAME_CONFIG.world.screenHeight * 0.6), // upper 60% of screen
    type,
    speed,
    width,
    height,
  };
}

export type Soil = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function createSoilSegment(x: number): Soil {
  return {
    x,
    y: GAME_CONFIG.world.screenHeight - GAME_CONFIG.world.groundHeight,
    width: GAME_CONFIG.world.screenWidth, // Full screen width per segment
    height: GAME_CONFIG.world.groundHeight,
  };
}

export function initializeSoil(): Soil[] {
  // Create initial soil segments to cover screen plus one extra for seamless scrolling
  const segments: Soil[] = [];
  const segmentWidth = GAME_CONFIG.world.screenWidth;
  
  // Start with one segment at x=0, and one off-screen to the right
  segments.push(createSoilSegment(0));
  segments.push(createSoilSegment(segmentWidth));
  
  return segments;
}

export type Bush = {
  x: number;
  y: number;
  type: 'near' | 'far';
  width: number;
  height: number;
};

export function initializeBushes(): Bush[] {
  const bushes: Bush[] = [];
  const groundY = GAME_CONFIG.world.screenHeight - GAME_CONFIG.world.groundHeight;
  const nearCount = 2 + Math.floor(Math.random() * 2); // 2-3 near
  const farCount = 2 + Math.floor(Math.random() * 2);  // 2-3 far

  const pushBush = (type: 'near' | 'far') => {
    const isNear = type === 'near';
    const width = isNear ? 18 + Math.random() * 10 : 12 + Math.random() * 8; // units
    const height = isNear ? 8 + Math.random() * 5 : 5 + Math.random() * 4;   // units
    const x = Math.random() * (GAME_CONFIG.world.screenWidth - width);
    const y = groundY - height - (isNear ? 0.5 : 1);
    bushes.push({ x, y, type, width, height });
  };

  for (let i = 0; i < nearCount; i++) pushBush('near');
  for (let i = 0; i < farCount; i++) pushBush('far');
  return bushes;
}