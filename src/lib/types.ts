// Tipe data inti Jhâr-Ajhârân. Semua aturan ujian hidup di Pack.config, bukan di kode.

export type BuiltinTrackId = 'cpns' | 'bumn' | 'toefl' | 'toeic' | 'programming' | 'data';
export type TrackId = BuiltinTrackId | (string & {});

export type Scheme = 'binary' | 'weighted';
export type LensId = 'kilat' | 'eliminasi' | 'logika' | 'jebakan';

export interface Hint {
  lens: LensId;
  text: string; // DILARANG menyebut huruf kunci jawaban
}

export interface Question {
  id: string;
  subtest: string; // id subtes, mis. TWK / TIU / TKP
  topic: string;
  stem: string;
  options: string[]; // selalu 5 opsi A-E
  key?: number; // indeks 0-4, untuk skema binary
  weights?: number[]; // 5 bobot, untuk skema weighted
  hints: Hint[];
  explain: string; // pembahasan lengkap, hanya tampil setelah menjawab
  targetSec: number; // target waktu ideal
  source?: string; // atribusi sumber soal (untuk soal yang diambil dari publikasi eksternal)
}

export interface SubtestConfig {
  id: string;
  name: string;
  scheme: Scheme;
  perCorrect?: number; // poin benar (binary)
  passMin: number; // ambang batas
}

export interface Pack {
  id: string;
  name: string;
  family: TrackId;
  version: number;
  updatedAt: string; // ISO
  note?: string;
  source: string; // asal soal, jujur
  config: { durationMin: number; subtests: SubtestConfig[] };
  questions: Question[];
}

export interface PackMeta {
  id: string;
  name: string;
  family: TrackId;
  version: number;
  updatedAt: string;
  file: string;
  count: number;
  durationMin?: number;
  subtests?: string[];
  note?: string;
  custom?: boolean;
}

export interface AnswerRec {
  choice: number | null;
  doubt: boolean;
  ms: number; // akumulasi waktu di soal ini
  hints: number; // jumlah lensa hint yang dibuka
}

export type Mode = 'simulasi' | 'latihan';

export interface Attempt {
  id: string;
  sessionId?: string; // isolasi riwayat per pengguna/sesi di browser
  packId: string;
  packVersion: number;
  mode: Mode;
  startedAt: number;
  endAt: number | null; // waktu absolut; null untuk latihan
  order: string[]; // urutan id soal
  answers: Record<string, AnswerRec>;
  cursor: number;
  finishedAt: number | null;
}

export interface SubtestScore {
  id: string;
  name: string;
  score: number;
  max: number;
  passMin: number;
  passed: boolean;
  correct: number;
  total: number;
}

export interface ScoreResult {
  perSubtest: SubtestScore[];
  total: number;
  passedAll: boolean;
}
