import { Dimensions } from 'react-native';

export interface GameConfig {
  pipe: {
    width: number;
    height: number;
    gap: number;
    speed: number;
    spacing?: number;
    spawnIntervalMs: number;
    poolSize: number;
    capHeight?: number;
    intervalJitter?: number; // 0..1
    minGapY?: number;
    maxGapY?: number;
    minGapSize?: number; // optional: min vertical gap size between top/bottom
    maxGapSize?: number; // optional: max vertical gap size between top/bottom
    minPairSpacing?: number; // optional: min horizontal spacing between consecutive pipes
    maxPairSpacing?: number; // optional: max horizontal spacing between consecutive pipes
  };
  bird: {
    width: number;
    height: number;
    jumpVelocity: number; // units/sec (positive; physics applies upward as negative)
    gravity: number; // units/sec^2
    maxFallSpeed: number; // units/sec
    x?: number;
  };
  world: {
    screenWidth: number; // in units
    screenHeight: number; // in units
    groundHeight: number; // in units
  };
}

const { width: DEVICE_W, height: DEVICE_H } = Dimensions.get('window');
const WORLD_UNITS = 100;
// Derive world width (in units) from device aspect ratio and fixed world height
const SCREEN_WIDTH_UNITS = Math.round((DEVICE_W / DEVICE_H) * WORLD_UNITS);

export const GAME_CONFIG: Readonly<GameConfig> = {
  pipe: {
    width: 6,
    height: 100, // not used by view rendering, kept for compatibility
    gap: 22,
    speed: 20,
    spacing: 26,
    spawnIntervalMs: 1400,
    poolSize: 10,
    capHeight: 4,
    intervalJitter: 0.35,
    minGapY: 20,
    maxGapY: 80,
    // default to fixed gap unless tuned
    minGapSize: 22,
    maxGapSize: 22,
    // enforce horizontal spacing between pipe pairs (units)
    minPairSpacing: 26,
    maxPairSpacing: 40,
  },
  bird: {
    width: 7.5,
    height: 5.5,
    jumpVelocity: 45, // positive; physics inverts on flap
    gravity: 100,
    maxFallSpeed: 60,
    x: 12,
  },
  world: {
    screenWidth: SCREEN_WIDTH_UNITS,
    screenHeight: WORLD_UNITS,
    groundHeight: 10,
  },
} as const;

