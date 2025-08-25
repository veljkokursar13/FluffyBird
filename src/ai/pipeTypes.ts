export type Pipe = { id: number; x: number; gapY: number };

export type DirectorParams = {
  gapPx: number;          // current gap size in pixels
  speedPxPerSec: number;  // pipe horizontal speed
  spacingPx: number;      // distance between pipe pairs
  variancePx: number;     // vertical jitter when picking next gapY
};

export type Telemetry = {
  avgSurvivalSec: number;         // rolling average
  lastDeath: 'top' | 'bottom' | 'none';
  tapRatePerSec: number;          // taps/s last run
  streak: number;                 // consecutive clears
};

export type WorldDims = { widthPx: number; heightPx: number };

export interface PipeDirectorConfig {
  minGapPx: number; maxGapPx: number;
  minSpeed: number; maxSpeed: number;
  minSpacing: number; maxSpacing: number;
  minGapY: number; maxGapY: number;   // in 0..1
}
