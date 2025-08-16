import { trackDelta } from '@/src/utils/time';
import { useCallback, useEffect, useRef, useState } from 'react';

export type GameLoopHandlers = {
  onUpdate: (dtSec: number, nowMs: number) => void;
  onStart?: () => void;
  onStop?: () => void;
};

export type UseGameLoopOptions = {
  autoStart?: boolean;
  maxDeltaSec?: number; // clamp huge dt (e.g., after tab background)
};

function getRaf()
  : (cb: FrameRequestCallback) => number {
  if (typeof globalThis !== 'undefined') {
    const raf = (globalThis as any).requestAnimationFrame || (globalThis as any).webkitRequestAnimationFrame;
    if (raf) return raf.bind(globalThis);
  }
  // Fallback polyfill
  return (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
}

function getCancelRaf()
  : (id: number) => void {
  if (typeof globalThis !== 'undefined') {
    const cancel = (globalThis as any).cancelAnimationFrame || (globalThis as any).webkitCancelAnimationFrame;
    if (cancel) return cancel.bind(globalThis);
  }
  return (id: number) => clearTimeout(id as unknown as any);
}

export default function useGameLoop(
  handlers: GameLoopHandlers,
  options: UseGameLoopOptions = {}
) {
  const { onUpdate, onStart, onStop } = handlers;
  const { autoStart = true, maxDeltaSec = 0.05 } = options;

  const rafRef = useRef<number | null>(null);
  const delta = useRef(trackDelta({ maxDeltaSec })).current;
  const runningRef = useRef<boolean>(false);

  const [running, setRunning] = useState<boolean>(false);

  const request = getRaf();
  const cancel = getCancelRaf();

  const frame = useCallback((nowMs: number) => {
    if (!runningRef.current) return;
    const { dtSec } = delta.next(nowMs);
    onUpdate(dtSec, nowMs);
    rafRef.current = request(frame);
  }, [onUpdate, request, delta]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    delta.reset();
    onStart?.();
    rafRef.current = request(frame);
  }, [frame, onStart, request]);

  const stop = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false;
    setRunning(false);
    if (rafRef.current != null) cancel(rafRef.current);
    rafRef.current = null;
    onStop?.();
  }, [cancel, onStop]);

  useEffect(() => {
    if (autoStart) start();
    return () => stop();
  }, [autoStart, start, stop]);

  return { start, stop, running } as const;
}
export function useDeadBird(initialDead: boolean = false) {
  const [dead, setDead] = useState<boolean>(initialDead);
  const kill = () => setDead(true);
  const revive = () => setDead(false);
  return { dead, setDead, kill, revive } as const;
}


