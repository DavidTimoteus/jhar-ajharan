// Manajemen multi-sesi / multi-pengguna berbasis cache browser (localStorage).
// Setiap peserta di perangkat yang sama punya riwayat, progres, dan statistik terisolasi.
// Jika cache / data situs browser dihapus, seluruh sesi & riwayat ikut terhapus.

import { useEffect, useState } from 'preact/hooks';

export interface UserSession {
  id: string;
  name: string;
  target?: 'cpns' | 'bumn' | 'all';
  createdAt: number;
}

const SESSIONS_KEY = 'ja-sessions-v1';
const ACTIVE_KEY = 'ja-active-session-v1';
export const DEFAULT_SESSION_ID = 'default';
const EVENT_NAME = 'ja-session-changed';

const DEFAULT_SESSION: UserSession = {
  id: DEFAULT_SESSION_ID,
  name: 'Peserta 1 (Utama)',
  target: 'all',
  createdAt: 1,
};

function notifySessionChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

export function listSessions(): UserSession[] {
  if (typeof localStorage === 'undefined') return [DEFAULT_SESSION];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify([DEFAULT_SESSION]));
      return [DEFAULT_SESSION];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify([DEFAULT_SESSION]));
      return [DEFAULT_SESSION];
    }
    return parsed;
  } catch {
    return [DEFAULT_SESSION];
  }
}

export function getActiveSessionId(): string {
  if (typeof localStorage === 'undefined') return DEFAULT_SESSION_ID;
  const sessions = listSessions();
  const saved = localStorage.getItem(ACTIVE_KEY);
  if (saved && sessions.some((s) => s.id === saved)) return saved;
  localStorage.setItem(ACTIVE_KEY, sessions[0].id);
  return sessions[0].id;
}

export function getActiveSession(): UserSession {
  const sessions = listSessions();
  const id = getActiveSessionId();
  return sessions.find((s) => s.id === id) ?? sessions[0];
}

export function switchSession(id: string): UserSession {
  const sessions = listSessions();
  const target = sessions.find((s) => s.id === id) ?? sessions[0];
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(ACTIVE_KEY, target.id);
  }
  notifySessionChange();
  return target;
}

export function createSession(
  name: string,
  target: 'cpns' | 'bumn' | 'all' = 'all',
): UserSession {
  const cleanName = name.trim().slice(0, 40) || `Peserta ${listSessions().length + 1}`;
  const session: UserSession = {
    id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    name: cleanName,
    target,
    createdAt: Date.now(),
  };
  const next = [...listSessions(), session];
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
    localStorage.setItem(ACTIVE_KEY, session.id);
  }
  notifySessionChange();
  return session;
}

export function renameSession(id: string, nextName: string): UserSession[] {
  const trimmed = nextName.trim().slice(0, 40);
  if (!trimmed) return listSessions();
  const next = listSessions().map((s) => (s.id === id ? { ...s, name: trimmed } : s));
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
  }
  notifySessionChange();
  return next;
}

export function removeSessionProfile(id: string): UserSession[] {
  const cur = listSessions();
  if (cur.length <= 1) return cur;
  const next = cur.filter((s) => s.id !== id);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
    if (getActiveSessionId() === id) {
      localStorage.setItem(ACTIVE_KEY, next[0].id);
    }
  }
  notifySessionChange();
  return next;
}

export function resetSessionsToDefault(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(ACTIVE_KEY);
  }
  notifySessionChange();
}

export function useSessionState() {
  const [sessions, setSessions] = useState<UserSession[]>(listSessions);
  const [active, setActive] = useState<UserSession>(getActiveSession);

  useEffect(() => {
    const sync = () => {
      setSessions(listSessions());
      setActive(getActiveSession());
    };
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return { sessions, active };
}

