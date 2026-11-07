// Mesin ujian: skoring, timer absolut, antrean remidi. Murni fungsi, mudah diuji.
import type { Attempt, Mode, Pack, Question, ScoreResult, SubtestScore } from './types';

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Urutan soal simulasi: per subtes sesuai urutan config (seperti CAT asli), acak di dalam subtes. */
export function buildOrder(pack: Pack, subtest?: string, limit?: number): string[] {
  const out: string[] = [];
  for (const st of pack.config.subtests) {
    if (subtest && st.id !== subtest) continue;
    out.push(...shuffle(pack.questions.filter((q) => q.subtest === st.id)).map((q) => q.id));
  }
  return limit ? out.slice(0, limit) : out;
}

export function newAttempt(pack: Pack, mode: Mode, order: string[]): Attempt {
  const now = Date.now();
  const durMs = pack.config.durationMin * 60_000;
  // Durasi proporsional bila hanya sebagian soal dikerjakan.
  const frac = order.length / Math.max(1, pack.questions.length);
  return {
    id: uid(),
    packId: pack.id,
    packVersion: pack.version,
    mode,
    startedAt: now,
    endAt: mode === 'simulasi' ? now + Math.round(durMs * Math.min(1, frac)) : null,
    order,
    answers: {},
    cursor: 0,
    finishedAt: null,
  };
}

export const remainingMs = (a: Attempt, now = Date.now()) => (a.endAt ? Math.max(0, a.endAt - now) : Infinity);

export function questionPoints(q: Question, choice: number | null, pack: Pack): number {
  if (choice == null) return 0;
  const st = pack.config.subtests.find((s) => s.id === q.subtest);
  if (st?.scheme === 'weighted') return q.weights?.[choice] ?? 0;
  return choice === q.key ? (st?.perCorrect ?? 5) : 0;
}

export function isCorrect(q: Question, choice: number | null, pack: Pack): boolean {
  if (choice == null) return false;
  const st = pack.config.subtests.find((s) => s.id === q.subtest);
  if (st?.scheme === 'weighted') return (q.weights?.[choice] ?? 0) === Math.max(...(q.weights ?? [0]));
  return choice === q.key;
}

export function score(a: Attempt, pack: Pack): ScoreResult {
  const byId = new Map(pack.questions.map((q) => [q.id, q]));
  const per: SubtestScore[] = [];
  for (const st of pack.config.subtests) {
    const qs = a.order.map((id) => byId.get(id)).filter((q): q is Question => !!q && q.subtest === st.id);
    if (!qs.length) continue;
    let s = 0;
    let max = 0;
    let correct = 0;
    for (const q of qs) {
      const ch = a.answers[q.id]?.choice ?? null;
      s += questionPoints(q, ch, pack);
      max += st.scheme === 'weighted' ? Math.max(...(q.weights ?? [5])) : (st.perCorrect ?? 5);
      if (isCorrect(q, ch, pack)) correct++;
    }
    // Ambang batas hanya berlaku utuh bila seluruh soal subtes dikerjakan; jika sebagian, skala proporsional.
    const full = pack.questions.filter((q) => q.subtest === st.id).length;
    const passMin = Math.round(st.passMin * (qs.length / Math.max(1, full)));
    per.push({ id: st.id, name: st.name, score: s, max, passMin, passed: s >= passMin, correct, total: qs.length });
  }
  return { perSubtest: per, total: per.reduce((x, p) => x + p.score, 0), passedAll: per.every((p) => p.passed) };
}

/** Soal yang masuk antrean remidi dari satu attempt: salah, kosong, ragu, atau melebihi target waktu 1,5x. */
export function remedialIds(a: Attempt, pack: Pack): string[] {
  const byId = new Map(pack.questions.map((q) => [q.id, q]));
  const out: string[] = [];
  for (const id of a.order) {
    const q = byId.get(id);
    if (!q) continue;
    const r = a.answers[id];
    const wrong = !isCorrect(q, r?.choice ?? null, pack);
    const slow = (r?.ms ?? 0) > q.targetSec * 1000 * 1.5;
    if (wrong || r?.doubt || slow) out.push(id);
  }
  return out;
}

export const fmtClock = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  return (h ? h + ':' : '') + mm + ':' + String(ss).padStart(2, '0');
};

export const LETTERS = ['A', 'B', 'C', 'D', 'E'];
