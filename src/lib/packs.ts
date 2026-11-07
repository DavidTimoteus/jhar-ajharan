// Pemuat paket soal: bawaan (di-precache service worker) + pembaruan online dari GitHub.
import { listStoredPacks, savePack } from './db';
import type { Pack, PackMeta } from './types';

// Sumber pembaruan: repo publik. Kalau offline, gagal diam-diam dan paket lokal tetap dipakai.
export const REMOTE_INDEX = 'https://raw.githubusercontent.com/DavidTimoteus/jhar-ajharan/main/public/packs/index.json';
const REMOTE_BASE = 'https://raw.githubusercontent.com/DavidTimoteus/jhar-ajharan/main/public/packs/';

const localUrl = (f: string) => new URL(`packs/${f}`, document.baseURI).toString();

async function fetchJson<T>(url: string, bust = false): Promise<T> {
  const r = await fetch(bust ? `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}` : url, { cache: bust ? 'no-store' : 'default' });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

const cache = new Map<string, Pack>();

export async function loadMetas(): Promise<PackMeta[]> {
  const stored = await listStoredPacks();
  const metas = new Map<string, PackMeta>();
  try {
    for (const m of await fetchJson<PackMeta[]>(localUrl('index.json'))) metas.set(m.id, m);
  } catch {
    /* index bawaan belum ada di cache */
  }
  // Paket hasil unduhan menang bila versinya lebih baru.
  for (const p of stored) {
    const cur = metas.get(p.id);
    if (!cur || p.version > cur.version)
      metas.set(p.id, { id: p.id, name: p.name, family: p.family, version: p.version, updatedAt: p.updatedAt, file: '', count: p.questions.length });
  }
  return [...metas.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadPack(id: string): Promise<Pack> {
  const hit = cache.get(id);
  if (hit) return hit;
  const stored = (await listStoredPacks()).find((p) => p.id === id);
  let pack: Pack | undefined = stored;
  try {
    const metas = await fetchJson<PackMeta[]>(localUrl('index.json'));
    const m = metas.find((x) => x.id === id);
    if (m && (!stored || m.version > stored.version)) pack = await fetchJson<Pack>(localUrl(m.file));
  } catch {
    /* pakai yang tersimpan */
  }
  if (!pack) throw new Error(`Paket ${id} tidak ditemukan`);
  cache.set(id, pack);
  return pack;
}

export interface UpdateResult {
  checked: boolean;
  updated: string[];
  error?: string;
}

/** Cek repo online; unduh paket yang versinya lebih baru dan simpan ke IndexedDB. */
export async function checkUpdates(): Promise<UpdateResult> {
  if (!navigator.onLine) return { checked: false, updated: [], error: 'Sedang offline' };
  try {
    const remote = await fetchJson<PackMeta[]>(REMOTE_INDEX, true);
    const have = new Map((await loadMetas()).map((m) => [m.id, m.version]));
    const updated: string[] = [];
    for (const m of remote) {
      if ((have.get(m.id) ?? 0) < m.version) {
        const p = await fetchJson<Pack>(REMOTE_BASE + m.file, true);
        if (!p?.id || !Array.isArray(p.questions) || !p.config) continue; // validasi minimal
        await savePack(p);
        cache.delete(p.id);
        updated.push(p.name);
      }
    }
    return { checked: true, updated };
  } catch (e) {
    return { checked: false, updated: [], error: e instanceof Error ? e.message : String(e) };
  }
}
