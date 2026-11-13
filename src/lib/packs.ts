// Pemuat paket soal: bawaan (di-precache service worker) + pembaruan online dari GitHub
// + impor bank soal kustom (.json) langsung ke IndexedDB.
import { deletePack, listStoredPacks, savePack } from './db';
import { cleanDisplayText, safeJsonParse } from './sanitize';
import { loadSubmateriIndex, SUBMATERI_LIST } from './submateri';
import type { Pack, PackMeta, Question, SubtestConfig, TrackId } from './types';

// Sumber pembaruan: repo publik. Kalau offline, gagal diam-diam dan paket lokal tetap dipakai.
export const REMOTE_INDEX =
  'https://raw.githubusercontent.com/DavidTimoteus/jhar-ajharan/master/public/packs/index.json';
const REMOTE_BASE =
  'https://raw.githubusercontent.com/DavidTimoteus/jhar-ajharan/master/public/packs/';

const localUrl = (f: string) => new URL(`packs/${f}`, document.baseURI).toString();

async function fetchJson<T>(url: string, bust = false): Promise<T> {
  const r = await fetch(
    bust ? `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}` : url,
    { cache: bust ? 'no-store' : 'default' },
  );
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
  // Paket hasil unduhan atau impor kustom menang bila versinya lebih baru atau belum ada di index bawaan.
  for (const p of stored) {
    const cur = metas.get(p.id);
    if (!cur || p.version >= cur.version) {
      metas.set(p.id, {
        id: p.id,
        name: p.name,
        family: p.family,
        version: p.version,
        updatedAt: p.updatedAt,
        file: '',
        count: p.questions.length,
        durationMin: p.config?.durationMin,
        subtests: p.config?.subtests?.map((s) => s.id),
        note: p.note,
        custom: !cur,
      });
    }
  }
  return [...metas.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadPack(id: string): Promise<Pack> {
  const hit = cache.get(id);
  if (hit) return hit;

  if (id.startsWith('submateri:')) {
    const subId = id.slice('submateri:'.length);
    const virtual = await buildSubmateriPack(subId);
    cache.set(id, virtual);
    return virtual;
  }

  const stored = (await listStoredPacks()).find((p) => p.id === id);
  let pack: Pack | undefined = stored;
  try {
    const metas = await fetchJson<PackMeta[]>(localUrl('index.json'));
    const m = metas.find((x) => x.id === id);
    if (m && (!stored || m.version > stored.version)) {
      pack = await fetchJson<Pack>(localUrl(m.file));
    }
  } catch {
    /* pakai yang tersimpan */
  }
  if (!pack) throw new Error(`Paket ${id} tidak ditemukan`);
  cache.set(id, pack);
  return pack;
}

async function buildSubmateriPack(submateriId: string): Promise<Pack> {
  const idx = await loadSubmateriIndex();
  const bucket = idx.submateris[submateriId];
  if (!bucket || bucket.packs.length === 0) {
    throw new Error(`Submateri "${submateriId}" belum memiliki soal terindeks.`);
  }
  const meta = SUBMATERI_LIST.find((s) => s.id === submateriId);
  const loadedPacks = await Promise.all(bucket.packs.map((ref) => loadPack(ref.packId)));

  const questions: Question[] = [];
  const seenStem = new Set<string>();
  const subtestConfigMap = new Map<string, SubtestConfig>();

  bucket.packs.forEach((ref, i) => {
    const srcPack = loadedPacks[i];
    const qMap = new Map(srcPack.questions.map((q) => [q.id, q]));
    for (const sc of srcPack.config.subtests) {
      if (!subtestConfigMap.has(sc.id)) subtestConfigMap.set(sc.id, sc);
    }
    for (const qid of ref.qIds) {
      const q = qMap.get(qid);
      if (!q) continue;
      const normStem = q.stem.trim().toLowerCase().slice(0, 140);
      if (seenStem.has(normStem)) continue;
      seenStem.add(normStem);
      questions.push(q);
    }
  });

  const subIds = [...new Set(questions.map((q) => q.subtest))];
  const subtests: SubtestConfig[] = subIds.map((sid) => {
    const base = subtestConfigMap.get(sid);
    const qCount = questions.filter((q) => q.subtest === sid).length;
    const isWeighted = questions.some((q) => q.subtest === sid && Array.isArray(q.weights));
    return {
      id: sid,
      name: base?.name ?? sid.toUpperCase(),
      scheme: base?.scheme ?? (isWeighted ? 'weighted' : 'binary'),
      ...(isWeighted ? {} : { perCorrect: base?.perCorrect ?? 5 }),
      passMin: isWeighted ? Math.round(qCount * 3.6) : Math.round(qCount * 3),
    };
  });

  return {
    id: `submateri:${submateriId}`,
    name: meta ? `Kisi Submateri · ${meta.title}` : `Drill Submateri · ${submateriId}`,
    family: bucket.family,
    version: 1,
    updatedAt: new Date().toISOString(),
    note: meta?.goal ?? 'Latihan terfokus berdasarkan submateri kisi-kisi resmi.',
    source: 'Indeks Kisi-Kisi Terpadu Jhâr-Ajhârân',
    config: {
      durationMin: Math.max(10, Math.round(questions.length * 0.9)),
      subtests,
    },
    questions,
  };
}

export async function removeCustomPack(id: string): Promise<void> {
  await deletePack(id);
  cache.delete(id);
}

/** Validasi & impor bank soal JSON dari pengguna ke IndexedDB. */
export async function importCustomPack(
  jsonText: string,
  familyChoice: 'auto' | TrackId = 'auto',
): Promise<Pack> {
  let raw: unknown;
  try {
    raw = safeJsonParse(jsonText);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Berkas bukan JSON yang valid.');
  }

  if (!raw || typeof raw !== 'object') {
    throw new Error('Struktur JSON harus berupa objek paket soal.');
  }

  const obj = raw as Partial<Pack> & { questions?: unknown[] };
  if (!Array.isArray(obj.questions) || obj.questions.length === 0) {
    throw new Error('Properti "questions" wajib berisi minimal 1 soal.');
  }

  const rawFamily =
    familyChoice !== 'auto'
      ? String(familyChoice)
      : typeof obj.family === 'string' && obj.family.trim()
        ? obj.family
        : 'cpns';
  const family: TrackId =
    rawFamily.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'cpns';

  const id =
    typeof obj.id === 'string' && obj.id.trim()
      ? obj.id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-')
      : `custom-${family}-${Date.now().toString(36)}`;

  const name =
    typeof obj.name === 'string' && obj.name.trim()
      ? obj.name.trim()
      : `Bank Soal ${family.toUpperCase()} Kustom`;

  const questions: Question[] = obj.questions.map((rawQ, idx) => {
    const q = rawQ as Partial<Question>;
    if (!q || typeof q.stem !== 'string' || !q.stem.trim()) {
      throw new Error(`Soal #${idx + 1} tidak memiliki teks pertanyaan ("stem").`);
    }
    if (!Array.isArray(q.options) || q.options.length < 4 || q.options.length > 5) {
      throw new Error(`Soal #${idx + 1} harus memiliki 4 atau 5 pilihan ("options").`);
    }
    const subtest =
      typeof q.subtest === 'string' && q.subtest.trim()
        ? q.subtest.trim().toLowerCase()
        : family === 'cpns'
          ? 'twk'
          : family === 'bumn'
            ? 'tkd'
            : 'materi';

    const hasWeights = Array.isArray(q.weights) && q.weights.length === q.options.length;
    const hasKey =
      typeof q.key === 'number' && q.key >= 0 && q.key < q.options.length;
    if (!hasWeights && !hasKey) {
      throw new Error(
        `Soal #${idx + 1} wajib memiliki "key" (0-${q.options.length - 1}) atau "weights".`,
      );
    }

    return {
      id: typeof q.id === 'string' && q.id.trim() ? q.id.trim() : `${id}-q${idx + 1}`,
      subtest,
      topic: typeof q.topic === 'string' && q.topic.trim() ? q.topic.trim() : subtest.toUpperCase(),
      stem: cleanDisplayText(q.stem),
      options: q.options.map((o) => cleanDisplayText(String(o))),
      ...(hasWeights ? { weights: q.weights!.map(Number) } : { key: Number(q.key) }),
      hints: Array.isArray(q.hints)
        ? q.hints.map((h) => ({ ...h, text: cleanDisplayText(String(h.text ?? '')) }))
        : [],
      explain:
        typeof q.explain === 'string'
          ? cleanDisplayText(q.explain)
          : 'Lihat pembahasan pada kunci jawaban.',
      targetSec: typeof q.targetSec === 'number' && q.targetSec > 0 ? q.targetSec : 50,
      source: typeof q.source === 'string' ? q.source : obj.source || 'Impor Kustom Pengguna',
    };
  });

  // Bangun config subtest otomatis bila tidak disediakan.
  const subtestIds = [...new Set(questions.map((q) => q.subtest))];
  const existingSubtests = Array.isArray(obj.config?.subtests) ? obj.config!.subtests : [];
  const subtests: SubtestConfig[] = subtestIds.map((sid) => {
    const found = existingSubtests.find((s) => s.id === sid);
    if (found) return found;
    const isWeighted = questions.some((q) => q.subtest === sid && Array.isArray(q.weights));
    const count = questions.filter((q) => q.subtest === sid).length;
    return {
      id: sid,
      name: sid.toUpperCase(),
      scheme: isWeighted ? 'weighted' : 'binary',
      ...(isWeighted ? {} : { perCorrect: 5 }),
      passMin: isWeighted ? Math.round(count * 3.6) : Math.round(count * 3),
    };
  });

  const pack: Pack = {
    id,
    name,
    family,
    version: typeof obj.version === 'number' ? obj.version : 1,
    updatedAt: new Date().toISOString(),
    note:
      typeof obj.note === 'string' && obj.note.trim()
        ? obj.note.trim()
        : `Bank soal kustom (${questions.length} soal) yang diimpor langsung di perangkat.`,
    source: typeof obj.source === 'string' && obj.source.trim() ? obj.source.trim() : 'Impor Lokal Pengguna',
    config: {
      durationMin:
        typeof obj.config?.durationMin === 'number' && obj.config.durationMin > 0
          ? obj.config.durationMin
          : Math.max(15, Math.round(questions.length * 0.9)),
      subtests,
    },
    questions,
  };

  await savePack(pack);
  cache.delete(pack.id);
  return pack;
}

export const PACK_TEMPLATE_JSON = JSON.stringify(
  {
    id: 'bank-kustom-cpns-01',
    name: 'Latihan Mandiri SKD (Contoh Template)',
    family: 'cpns',
    version: 1,
    note: 'Ganti "family" menjadi "bumn" jika bank soal ini untuk RBB BUMN.',
    source: 'Catatan Belajar Pribadi',
    config: {
      durationMin: 20,
      subtests: [
        { id: 'twk', name: 'Tes Wawasan Kebangsaan', scheme: 'binary', perCorrect: 5, passMin: 10 },
        { id: 'tkp', name: 'Tes Karakteristik Pribadi', scheme: 'weighted', passMin: 8 },
      ],
    },
    questions: [
      {
        id: 'kustom-1',
        subtest: 'twk',
        topic: 'pancasila',
        stem: 'Tanggal 1 Juni diperingati di Indonesia sebagai hari...',
        options: [
          'Kebangkitan Nasional',
          'Lahirnya Pancasila',
          'Kesaktian Pancasila',
          'Sumpah Pemuda',
          'Kemerdekaan RI',
        ],
        key: 1,
        hints: [
          { lens: 'kilat', text: 'Pidato Ir. Soekarno di sidang BPUPKI pada 1 Juni 1945.' },
          { lens: 'eliminasi', text: 'Buang 20 Mei (Kebangkitan) dan 28 Oktober (Sumpah Pemuda).' },
        ],
        explain: 'Pidato Ir. Soekarno mengenai dasar negara pada 1 Juni 1945 diperingati sebagai Hari Lahir Pancasila.',
        targetSec: 35,
      },
    ],
  },
  null,
  2,
);

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
        if (!p?.id || !Array.isArray(p.questions) || !p.config) continue;
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
