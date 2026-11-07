// Store ringan berbasis hook + subscription. Menghindari dependency router/library
// eksternal agar bundle tetap kecil dan offline-first.

import { useState, useEffect } from 'preact/hooks';

export type Screen =
  | { name: 'home' }
  | { name: 'workbench'; packId: string; mode: 'latihan' | 'simulasi'; subtest?: string }
  | { name: 'review'; attemptId: string }
  | { name: 'settings' };

export type Nav = {
  screen: Screen;
  go: (s: Screen) => void;
};

export function useNav(): Nav {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  return { screen, go: setScreen };
}

/** Hook util: re-render tiap detik untuk timer. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}
