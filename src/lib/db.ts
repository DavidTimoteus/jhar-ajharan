// Penyimpanan lokal: IndexedDB + isolasi multi-sesi berbasis cache browser.
// Semua data tinggal di cache browser perangkat; jika cache/site data dihapus, riwayat ikut bersih.
import type { Attempt, Pack } from './types';
import { DEFAULT_SESSION_ID, getActiveSessionId, resetSessionsToDefault } from './session';
import { safeJsonParse } from './sanitize';

const DB_NAME = 'jhar-ajharan';
const DB_VER = 1;
const STORES = ['attempts', 'packs', 'kv'] as const;
type Store = (typeof STORES)[number];

let dbp: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const s of STORES) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

async function tx<T>(store: Store, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const r = fn(t.objectStore(store));
    t.oncomplete = () => resolve(r.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export const put = <T>(store: Store, key: string, value: T) => tx(store, 'readwrite', (s) => s.put(value as never, key));
export const get = <T>(store: Store, key: string) => tx<T | undefined>(store, 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>);
export const del = (store: Store, key: string) => tx(store, 'readwrite', (s) => s.delete(key));
export const all = <T>(store: Store) => tx<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>);

export const saveAttempt = (a: Attempt) => {
  const scoped: Attempt = a.sessionId ? a : { ...a, sessionId: getActiveSessionId() };
  return put('attempts', scoped.id, scoped);
};

export const listAttempts = async (sessionId = getActiveSessionId()) => {
  const rows = await all<Attempt>('attempts');
  return rows
    .filter((a) =>
      sessionId === DEFAULT_SESSION_ID
        ? !a.sessionId || a.sessionId === DEFAULT_SESSION_ID
        : a.sessionId === sessionId,
    )
    .sort((x, y) => y.startedAt - x.startedAt);
};

export async function clearSessionAttempts(sessionId = getActiveSessionId()): Promise<number> {
  const matches = await listAttempts(sessionId);
  for (const a of matches) {
    await del('attempts', a.id);
  }
  return matches.length;
}

export async function clearAllBrowserCache(): Promise<void> {
  const db = await open();
  for (const s of STORES) {
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction(s, 'readwrite');
      t.objectStore(s).clear();
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
  }
  resetSessionsToDefault();
  try {
    if (typeof caches !== 'undefined') {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  } catch {
    /* abaikan jika browser membatasi Cache API */
  }
}

export const savePack = (p: Pack) => put('packs', p.id, p);
export const deletePack = (id: string) => del('packs', id);
export const listStoredPacks = () => all<Pack>('packs');

// Minta penyimpanan permanen supaya iOS/Android tidak menghapus data saat ruang menipis.
export async function requestPersist(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* abaikan */
  }
  return false;
}

// Snapshot progres untuk sesi aktif (atau semua jika diminta).
export async function exportSnapshot(sessionId = getActiveSessionId()): Promise<string> {
  const attempts = await listAttempts(sessionId);
  const kv = await all<unknown>('kv');
  const keys = await tx<IDBValidKey[]>('kv', 'readonly', (s) => s.getAllKeys());
  const kvObj: Record<string, unknown> = {};
  keys.forEach((k, i) => (kvObj[String(k)] = kv[i]));
  return JSON.stringify({ app: 'jhar-ajharan', v: 2, sessionId, exportedAt: new Date().toISOString(), attempts, kv: kvObj }, null, 1);
}

export async function importSnapshot(text: string): Promise<number> {
  const data = safeJsonParse(text) as {
    app?: unknown;
    attempts?: unknown;
    kv?: Record<string, unknown>;
  } | null;
  if (!data || data.app !== 'jhar-ajharan' || !Array.isArray(data.attempts)) {
    throw new Error('Berkas bukan snapshot Jhâr-Ajhârân.');
  }
  const targetSid = getActiveSessionId();
  let n = 0;
  for (const a of data.attempts as Attempt[]) {
    if (a?.id && a.packId && a.answers) {
      await saveAttempt({ ...a, sessionId: targetSid });
      n++;
    }
  }
  for (const [k, v] of Object.entries(data.kv ?? {})) await put('kv', k, v);
  return n;
}
