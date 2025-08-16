export type DeltaTracker = {
  last: number | null;
  maxDeltaSec: number;
  now: () => number;
  next: (nowMs?: number) => { dtSec: number; nowMs: number };
  reset: (nowMs?: number) => void;
};

export function trackDelta(options: { maxDeltaSec?: number; now?: () => number } = {}): DeltaTracker {
  const maxDeltaSec = options.maxDeltaSec ?? 0.05;
  const now = options.now ?? (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
  let last: number | null = null;

  return {
    last,
    maxDeltaSec,
    now,
    next(nowMsInput?: number) {
      const nowMs = nowMsInput ?? now();
      const lastLocal = last ?? nowMs;
      let dtSec = (nowMs - lastLocal) / 1000;
      if (dtSec > maxDeltaSec) dtSec = maxDeltaSec;
      last = nowMs;
      return { dtSec, nowMs };
    },
    reset(nowMsInput?: number) {
      last = nowMsInput ?? now();
    },
  };
}


