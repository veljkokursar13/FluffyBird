import { useEffect, useMemo, useRef, useState } from 'react';

export type PipeLike = { id: number; x: number; width: number };

export type UseScoreArgs = {
  birdX?: number; // center X of the bird (in world units)
  pipes?: PipeLike[]; // pipe data with stable ids
};

export function useScore({ birdX, pipes = [] }: UseScoreArgs = {}) {
  const [score, setScore] = useState(0);
  const passedIdsRef = useRef<Set<number>>(new Set());

  const pipeCenters = useMemo(() => {
    if (!pipes || pipes.length === 0) return [] as { id: number; centerX: number }[];
    return pipes
      .map((p) => ({ id: p.id, centerX: Math.round(p.x + p.width / 2) }))
      .sort((a, b) => a.centerX - b.centerX);
  }, [pipes]);

  useEffect(() => {
    if (typeof birdX !== 'number' || pipeCenters.length === 0) return;

    let increments = 0;
    const bx = Math.round(birdX);
    for (const { id, centerX } of pipeCenters) {
      if (centerX <= bx && !passedIdsRef.current.has(id)) {
        passedIdsRef.current.add(id);
        increments += 1;
      }
    }
    if (increments > 0) setScore((s) => s + increments);
  }, [birdX, pipeCenters]);

  const reset = () => {
    setScore(0);
    passedIdsRef.current.clear();
  };

  return { score, reset } as const;
}

export default useScore;