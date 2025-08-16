import { useEffect, useRef, useState } from 'react';

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

  // decay back to 0
  useEffect(() => {
    const frame = (now: number) => {
      const last = lastRef.current ?? now;
      let dt = (now - last) / 1000; // seconds
      if (dt > 0.05) dt = 0.05;
      lastRef.current = now;

      if (valueRef.current > 0) {
        valueRef.current = Math.max(0, valueRef.current - decayPerSec * dt);
        // only update state when value changes noticeably to avoid extra renders
        setOffsetPx((prev) => (prev !== valueRef.current ? valueRef.current : prev));
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [decayPerSec]);

  return { offsetPx } as const;
}