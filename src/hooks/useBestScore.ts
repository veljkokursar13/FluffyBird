import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

type UseBestScoreArgs = { score: number };

export default function useBestScore({ score }: UseBestScoreArgs) {
  const [bestScore, setBestScore] = useState(0);

  // Load persisted best score once
  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem('bestScore')
      .then((value) => {
        if (!isMounted) return;
        const parsed = value ? parseInt(value, 10) : 0;
        if (!Number.isNaN(parsed)) setBestScore(parsed);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Update best score when beaten
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      AsyncStorage.setItem('bestScore', String(score)).catch(() => {});
    }
  }, [score, bestScore]);

  return { bestScore, setBestScore } as const;
}
