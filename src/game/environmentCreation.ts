import { GAME_CONFIG } from "../constants/gameConfig";

// Asset imports using require() for React Native
const cloudClose1 = require('../../assets/images/cloud-close-1.svg');
const cloudFar1 = require('../../assets/images/cloud-far-1.svg');
const cloudFar2 = require('../../assets/images/cloud-far-2.svg');
const soil = require('../../assets/images/soil-with-grass.svg');

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

export function spawnClouds(clouds: Cloud[], dtSec: number): void {
  // Higher spawn rate: ~1 cloud per second on average
  const spawnChance = dtSec * 1.0; // 100% chance per second
  if (Math.random() < spawnChance) {
    const margin = 2; // units vertical margin
    let c = createRandomCloud();
    let attempts = 5;
    const overlaps = (a: Cloud, b: Cloud) => !(a.y + a.height + margin < b.y || b.y + b.height + margin < a.y);
    while (attempts-- > 0 && clouds.some((other) => overlaps(c, other))) {
      c.y = Math.random() * (GAME_CONFIG.world.screenHeight * 0.6);
    }
    if (!clouds.some((other) => overlaps(c, other))) {
      clouds.push(c);
    }
  }
}

export function advanceClouds(clouds: Cloud[], dtSec: number, basePipeSpeed?: number): void {
  const pipeSpeed = basePipeSpeed ?? GAME_CONFIG.pipe.speed;
  clouds.forEach(cloud => {
    cloud.x -= pipeSpeed * cloud.speed * dtSec;
  });
}

export function recycleClouds(clouds: Cloud[]): void {
  // Remove clouds that have moved off-screen
  for (let i = clouds.length - 1; i >= 0; i--) {
    if (clouds[i].x + clouds[i].width < -20) {
      clouds.splice(i, 1);
    }
  }
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

export function advanceSoil(soilSegments: Soil[], dtSec: number, basePipeSpeed?: number): void {
  const pipeSpeed = basePipeSpeed ?? GAME_CONFIG.pipe.speed;
  soilSegments.forEach(segment => {
    segment.x -= pipeSpeed * dtSec;
  });
}

export function recycleSoil(soilSegments: Soil[]): void {
  const segmentWidth = GAME_CONFIG.world.screenWidth;
  
  // Remove segments that are completely off-screen to the left
  for (let i = soilSegments.length - 1; i >= 0; i--) {
    const segment = soilSegments[i];
    if (segment.x + segment.width < -segmentWidth * 0.1) { // Small buffer
      soilSegments.splice(i, 1);
    }
  }
  
  // Add new segments to the right if needed
  const rightmostSegment = soilSegments.reduce((rightmost, segment) => 
    segment.x > rightmost.x ? segment : rightmost
  );
  
  // If the rightmost segment has moved left enough, add a new one
  if (rightmostSegment.x <= segmentWidth * 0.5) {
    const newX = rightmostSegment.x + segmentWidth;
    soilSegments.push(createSoilSegment(newX));
  }
}