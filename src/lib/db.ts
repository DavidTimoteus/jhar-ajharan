// Penyimpanan lokal: IndexedDB tanpa dependensi. Semua data pengguna tinggal di perangkat.
import type { Attempt, Pack } from './types';

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

export const saveAttempt = (a: Attempt) => put('attempts', a.id, a);
export const listAttempts = async () => (await all<Attempt>('attempts')).sort((x, y) => y.startedAt - x.startedAt);
export const savePack = (p: Pack) => put('packs', p.id, p);
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

// Snapshot progres untuk pindah perangkat (tanpa akun/server).
export async function exportSnapshot(): Promise<string> {
  const attempts = await all<Attempt>('attempts');
  const kv = await all<unknown>('kv');
  const keys = await tx<IDBValidKey[]>('kv', 'readonly', (s) => s.getAllKeys());
  const kvObj: Record<string, unknown> = {};
  keys.forEach((k, i) => (kvObj[String(k)] = kv[i]));
  return JSON.stringify({ app: 'jhar-ajharan', v: 1, exportedAt: new Date().toISOString(), attempts, kv: kvObj }, null, 1);
}

export async function importSnapshot(text: string): Promise<number> {
  const data = JSON.parse(text);
  if (data?.app !== 'jhar-ajharan' || !Array.isArray(data.attempts)) throw new Error('Berkas bukan snapshot Jhâr-Ajhârân.');
  let n = 0;
  for (const a of data.attempts as Attempt[]) {
    if (a?.id && a.packId && a.answers) {
      await saveAttempt(a);
      n++;
    }
  }
  for (const [k, v] of Object.entries(data.kv ?? {})) await put('kv', k, v);
  return n;
}
