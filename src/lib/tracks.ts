// Registri Jalur Pembelajaran Multi-Domain.
// Arsitektur terbuka agar platform mudah berkembang ke TOEFL, TOEIC, Programming, dan Data Analysis
// cukup dengan mendaftarkan jalur baru dan menambahkan paket JSON.
import type { PackMeta, TrackId } from './types';

export interface TrackSpec {
  code: string;
  name: string;
  detail: string;
}

export interface TrackConfig {
  id: TrackId;
  title: string;
  shortLabel: string;
  pill: string;
  tagline: string;
  description: string;
  icon: string;
  cardTone: 'sky' | 'navy';
  defaultPack?: string;
  supportsKisi: boolean;
  subtestLabels: Record<string, string>;
  specs: TrackSpec[];
}

export const TRACK_REGISTRY: TrackConfig[] = [
  {
    id: 'cpns',
    title: 'Tes CPNS · SKD CAT',
    shortLabel: 'Tes CPNS',
    pill: 'SKD CPNS · CAT BKN',
    tagline: 'TWK, TIU, TKP sesuai KepmenPANRB No. 321/2024',
    description:
      'Simulasi dan latihan bertingkat untuk 110 soal SKD CPNS dalam 100 menit (TWK, TIU, TKP bobot 1–5).',
    icon: '🏛',
    cardTone: 'sky',
    defaultPack: 'cpns-skd-2026-p1',
    supportsKisi: true,
    subtestLabels: { twk: 'TWK', tiu: 'TIU', tkp: 'TKP' },
    specs: [
      { code: 'TWK', name: 'Wawasan Kebangsaan', detail: '30 soal · PG 65 / 150' },
      { code: 'TIU', name: 'Intelegensi Umum', detail: '35 soal · PG 80 / 175' },
      { code: 'TKP', name: 'Karakteristik Pribadi', detail: '45 soal · PG 166 / 225' },
    ],
  },
  {
    id: 'bumn',
    title: 'Tes BUMN · RBB FHCI',
    shortLabel: 'Tes BUMN',
    pill: 'REKRUTMEN BERSAMA BUMN · FHCI',
    tagline: 'Tahap 1 (TKD, AKHLAK, TWK) & Tahap 2 (B. Inggris, Agility)',
    description:
      'Persiapan menyeluruh seleksi RBB BUMN mencakup kemampuan dasar, nilai inti AKHLAK, Bahasa Inggris, dan Learning Agility.',
    icon: '⚡',
    cardTone: 'navy',
    defaultPack: 'rbb-bumn-2026-tahap1',
    supportsKisi: true,
    subtestLabels: {
      tkd: 'TKD',
      akhlak: 'AKHLAK',
      twk_bumn: 'TWK BUMN',
      bhs: 'Bahasa Inggris',
      agility: 'Learning Agility',
    },
    specs: [
      { code: 'TKD & TWK', name: 'Kemampuan Dasar & Kebangsaan', detail: 'Verbal · Deret · Diagram · TWK' },
      { code: 'AKHLAK', name: 'Core Values BUMN', detail: 'Amanah · Kompeten · Harmonis · Loyal · Adaptif · Kolaboratif' },
      { code: 'Tahap 2', name: 'Bahasa Inggris & Agility', detail: 'Grammar · Error ID · Reading · Learning Agility' },
    ],
  },
  {
    id: 'toefl',
    title: 'TOEFL (ITP & iBT)',
    shortLabel: 'TOEFL',
    pill: 'ACADEMIC ENGLISH · TOEFL',
    tagline: 'Structure, Written Expression & Academic Reading',
    description:
      'Jalur persiapan TOEFL fokus pada pola kalimat akademik, deteksi error tata bahasa, dan pemahaman bacaan ilmiah.',
    icon: 'Aa',
    cardTone: 'sky',
    supportsKisi: false,
    subtestLabels: {
      structure: 'Structure',
      written: 'Written Expression',
      reading: 'Reading Academic',
    },
    specs: [
      { code: 'Structure', name: 'Sentence Completion', detail: 'Klausa · Inversi · Agreement' },
      { code: 'Error ID', name: 'Written Expression', detail: 'Deteksi kesalahan kata cepat' },
      { code: 'Reading', name: 'Academic Passage', detail: 'Main idea · Inference · Vocab' },
    ],
  },
  {
    id: 'toeic',
    title: 'TOEIC Workplace English',
    shortLabel: 'TOEIC',
    pill: 'BUSINESS ENGLISH · TOEIC',
    tagline: 'Incomplete Sentences, Error Recognition & Business Reading',
    description:
      'Latihan bahasa Inggris dunia kerja dan korespondensi bisnis internasional berstandar skor TOEIC.',
    icon: '💼',
    cardTone: 'navy',
    supportsKisi: false,
    subtestLabels: {
      incomplete: 'Part 5 · Incomplete',
      textcomp: 'Part 6 · Text Completion',
      reading: 'Part 7 · Business Reading',
    },
    specs: [
      { code: 'Part 5', name: 'Incomplete Sentences', detail: 'Grammar bisnis & kolokasi' },
      { code: 'Part 6', name: 'Text Completion', detail: 'Konteks email & memo kantor' },
      { code: 'Part 7', name: 'Reading Comprehension', detail: 'Single & double passages' },
    ],
  },
  {
    id: 'programming',
    title: 'Programming & Algorithms',
    shortLabel: 'Programming',
    pill: 'SOFTWARE ENGINEERING',
    tagline: 'Logika Algoritma, Struktur Data, Debugging & Web/API',
    description:
      'Latihan problem solving pemrograman, kompleksitas waktu Big-O, desain sistem, serta debugging kode.',
    icon: '</>',
    cardTone: 'sky',
    supportsKisi: false,
    subtestLabels: {
      algo: 'Algoritma & Struktur Data',
      debug: 'Code Tracing & Debug',
      system: 'Web, API & Arsitektur',
    },
    specs: [
      { code: 'Algo', name: 'Algoritma & Logika', detail: 'Array · Graph · Dynamic Programming' },
      { code: 'Trace', name: 'Prediksi Output & Bug', detail: 'Membaca alur eksekusi & edge case' },
      { code: 'System', name: 'Backend, Security & API', detail: 'REST · Concurrency · Caching' },
    ],
  },
  {
    id: 'data',
    title: 'Data Analysis & SQL/Python',
    shortLabel: 'Data Analysis',
    pill: 'DATA ANALYTICS & BI',
    tagline: 'SQL Query, Statistik Terapan, Eksplorasi Data & Metrik',
    description:
      'Uji kemampuan menulis kueri SQL, interpretasi metrik bisnis, uji statistik dasar, dan manipulasi data.',
    icon: '📊',
    cardTone: 'navy',
    supportsKisi: false,
    subtestLabels: {
      sql: 'SQL & Relational Query',
      stats: 'Statistik & Probabilitas',
      python: 'Python / Pandas Logic',
    },
    specs: [
      { code: 'SQL', name: 'Query & Agregasi Data', detail: 'JOIN · Window Function · CTE' },
      { code: 'Stats', name: 'Statistik & A/B Testing', detail: 'Distribusi · p-value · Bias' },
      { code: 'Python', name: 'Data Wrangling', detail: 'Cleaning · Grouping · Pipeline' },
    ],
  },
];

export function getTrackConfig(id: TrackId): TrackConfig {
  const found = TRACK_REGISTRY.find((t) => t.id === id);
  if (found) return found;
  return {
    id,
    title: `Jalur ${String(id).toUpperCase()}`,
    shortLabel: String(id).toUpperCase(),
    pill: `JALUR KUSTOM · ${String(id).toUpperCase()}`,
    tagline: 'Bank soal impor pengguna',
    description: `Paket soal kustom untuk topik ${String(id).toUpperCase()}.`,
    icon: '◈',
    cardTone: 'sky',
    supportsKisi: false,
    subtestLabels: {},
    specs: [],
  };
}

export interface TrackSummary {
  config: TrackConfig;
  packCount: number;
  questionCount: number;
  isActive: boolean;
}

/** Pisahkan jalur yang sudah punya bank soal aktif dan jalur ekspansi mendatang. */
export function partitionTracks(metas: PackMeta[]): {
  active: TrackSummary[];
  upcoming: TrackSummary[];
} {
  const counts = new Map<string, { packs: number; questions: number }>();
  for (const m of metas) {
    const cur = counts.get(m.family) ?? { packs: 0, questions: 0 };
    cur.packs += 1;
    cur.questions += m.count;
    counts.set(m.family, cur);
  }

  const seenIds = new Set<string>();
  const allSummaries: TrackSummary[] = [];

  for (const cfg of TRACK_REGISTRY) {
    seenIds.add(cfg.id);
    const c = counts.get(cfg.id) ?? { packs: 0, questions: 0 };
    allSummaries.push({
      config: cfg,
      packCount: c.packs,
      questionCount: c.questions,
      isActive: c.packs > 0,
    });
  }

  // Sertakan jalur kustom di luar registri bila pengguna mengimpor track baru.
  for (const [id, c] of counts.entries()) {
    if (!seenIds.has(id)) {
      allSummaries.push({
        config: getTrackConfig(id),
        packCount: c.packs,
        questionCount: c.questions,
        isActive: true,
      });
    }
  }

  return {
    active: allSummaries.filter((t) => t.isActive),
    upcoming: allSummaries.filter((t) => !t.isActive),
  };
}
