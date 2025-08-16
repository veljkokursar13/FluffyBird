import { useEffect, useMemo, useRef, useState } from 'react';
import type { Rect } from '../game/collision';

export type UseScoreArgs = {
  birdX?: number; // center X of the bird
  pipes?: Rect[]; // both top and bottom pipes (same x/width)
};

export function useScore({ birdX, pipes = [] }: UseScoreArgs = {}) {
  const [score, setScore] = useState(0);
  const passedCentersRef = useRef<Set<number>>(new Set());
  const prevBirdXRef = useRef<number | null>(null);

  const pipeCenters = useMemo(() => {
    if (!pipes || pipes.length === 0) return [] as number[];
    const centers = new Set<number>();
    for (const p of pipes) {
      const cx = Math.round(p.x + p.width / 2);
      centers.add(cx);
    }
    return Array.from(centers).sort((a, b) => a - b);
  }, [pipes]);

  useEffect(() => {
    if (typeof birdX !== 'number' || pipeCenters.length === 0) {
      prevBirdXRef.current = birdX ?? prevBirdXRef.current;
      return;
    }

    const previousX = prevBirdXRef.current ?? birdX;
    let increments = 0;
    for (const centerX of pipeCenters) {
      if (
        previousX < centerX &&
        birdX >= centerX &&
        !passedCentersRef.current.has(centerX)
      ) {
        passedCentersRef.current.add(centerX);
        increments += 1;
      }
    }
    if (increments > 0) setScore((s) => s + increments);
    prevBirdXRef.current = birdX;
  }, [birdX, pipeCenters]);

  const reset = () => {
    setScore(0);
    passedCentersRef.current.clear();
    prevBirdXRef.current = null;
  };

  return { score, reset } as const;
}

export default useScore;