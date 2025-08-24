import { useEffect, useRef, useState } from 'react';
import type { GAME_CONFIG } from "../constants/gameConfig";


type WingFlapOptions = {
  trigger: boolean;      // toggle/edge per tap
  liftPx?: number;       // how much the wing jumps up per tap
  maxLiftPx?: number;    // clamp maximum offset
  decayPerSec?: number;  // how fast it returns towards 0
};

export function useWingFlap({ trigger, liftPx = 10, maxLiftPx = 16, decayPerSec = 80 }: WingFlapOptions) {
  const [offsetPx, setOffsetPx] = useState(0);
  const valueRef = useRef(0);
  const prevTriggerRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  // rising edge detection
  useEffect(() => {
    if (trigger && !prevTriggerRef.current) {
      valueRef.current = Math.min(maxLiftPx, valueRef.current + liftPx);
      setOffsetPx(valueRef.current);
    }
    prevTriggerRef.current = trigger;
  }, [trigger, liftPx, maxLiftPx]);

  // remove stray global frame function; the effect below drives the loop

  // decay back to 0
  useEffect(() => {
    const wingAnimationFrame = (now: number) => {
      const last = lastRef.current ?? now;
      let dt = (now - last) / 1000; // seconds
      if (dt > 0.05) dt = 0.05;
      lastRef.current = now;

      if (valueRef.current > 0) {
        valueRef.current = Math.max(0, valueRef.current - decayPerSec * dt);
        // only update state when value changes noticeably to avoid extra renders
        setOffsetPx((prev) => (prev !== valueRef.current ? valueRef.current : prev));
      }

      rafRef.current = requestAnimationFrame(wingAnimationFrame);
    };

    rafRef.current = requestAnimationFrame(wingAnimationFrame);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [decayPerSec]);

  return { offsetPx } as const;
}

export function computeBirdTiltDeg(vy: number, cfg: typeof GAME_CONFIG, dead: boolean): number {
  if (dead) return 70;
  const upTilt = -15;
  const downTilt = 35;
  if (vy < 0) {
    const t = Math.min(1, Math.abs(vy) / (cfg.bird.jumpVelocity * 0.8));
    return upTilt * t;
  } else {
    const t = Math.min(1, vy / (cfg.bird.maxFallSpeed * 0.7));
    return downTilt * t;
  }
}

export function registerTap(
  bird: { tapTimes?: number[] },
  windowMs: number = 1500
): void {
  const now = Date.now();
  const taps = bird.tapTimes ?? [];
  taps.push(now);
  bird.tapTimes = taps.filter((t) => now - t <= windowMs);
}