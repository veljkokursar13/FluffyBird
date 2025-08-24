import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { preloadSoundtrack } from './fluffy-soundtrack';
import { preloadTapSound } from './gameplaysound';

export function useGameLoading(minMs: number = 900) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    const start = Date.now();
    (async () => {
      try {
        await Promise.all([
          Font.loadAsync({
            SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
          }),
          preloadSoundtrack(),
          preloadTapSound(),
        ]);
      } catch (e) {
        // ignore errors and proceed
      } finally {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, minMs - elapsed);
        setTimeout(() => { if (mounted) setLoading(false); }, remaining);
      }
    })();
    return () => { mounted = false; };
  }, [minMs]);
  return loading;
}

export default useGameLoading;