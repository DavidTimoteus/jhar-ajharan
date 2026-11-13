// Store ringan berbasis hook + sinkronisasi hash ringan agar menu CPNS & BUMN
// punya URL terpisah (#/cpns, #/bumn, #/pengaturan) tanpa dependency router.

import { useState, useEffect, useCallback } from 'preact/hooks';
import type { TrackId } from './types';

export type Screen =
  | { name: 'home' }
  | { name: 'track'; family: TrackId }
  | { name: 'cpns' }
  | { name: 'bumn' }
  | { name: 'materi'; family?: 'cpns' | 'bumn'; submateriId?: string }
  | {
      name: 'workbench';
      packId: string;
      mode: 'latihan' | 'simulasi';
      subtest?: string;
      questionIds?: string[];
      limit?: number;
    }
  | { name: 'review'; attemptId: string }
  | { name: 'settings' };

export type Nav = {
  screen: Screen;
  go: (s: Screen) => void;
};

function screenFromHash(): Screen {
  if (typeof window === 'undefined') return { name: 'home' };
  const h = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (h === 'cpns' || h === 'bumn' || h === 'toefl' || h === 'toeic' || h === 'programming' || h === 'data') {
    return { name: 'track', family: h };
  }
  if (h.startsWith('jalur/')) {
    const fam = h.slice('jalur/'.length).trim();
    if (fam) return { name: 'track', family: fam };
  }
  if (h === 'materi' || h === 'kisi') return { name: 'materi' };
  if (h === 'pengaturan' || h === 'settings') return { name: 'settings' };
  return { name: 'home' };
}

function hashForScreen(s: Screen): string | null {
  switch (s.name) {
    case 'home':
      return '#/';
    case 'cpns':
      return '#/cpns';
    case 'bumn':
      return '#/bumn';
    case 'track':
      return `#/${encodeURIComponent(String(s.family))}`;
    case 'materi':
      return '#/materi';
    case 'settings':
      return '#/pengaturan';
    default:
      return null;
  }
}

export function useNav(): Nav {
  const [screen, setScreen] = useState<Screen>(screenFromHash);

  const go = useCallback((next: Screen) => {
    setScreen(next);
    const h = hashForScreen(next);
    if (h && typeof window !== 'undefined' && window.location.hash !== h) {
      window.history.pushState(null, '', h);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const onPop = () => setScreen(screenFromHash());
    window.addEventListener('hashchange', onPop);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('hashchange', onPop);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  return { screen, go };
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
