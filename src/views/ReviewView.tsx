import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Attempt, Pack, ScoreResult } from '../lib/types';
import { listStoredPacks, listAttempts } from '../lib/db';
import { loadPack } from '../lib/packs';
import { score, fmtClock, LETTERS, remedialIds, isCorrect } from '../lib/engine';
import { fmtDate } from '../lib/format';
import type { Screen } from '../lib/store';
import { cleanDisplayText } from '../lib/sanitize';
import SlidingTabs, { type TabOption } from '../components/SlidingTabs';
import RichText from '../components/RichText';

interface Props {
  attemptId: string;
  go: (s: Screen) => void;
}

type ReviewFilter = 'all' | 'wrong' | 'doubt' | 'slow';

export default function ReviewView({ attemptId, go }: Props) {
  const [pack, setPack] = useState<Pack | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReviewFilter>('all');

  useEffect(() => {
    (async () => {
      try {
        const [packs, attempts] = await Promise.all([
          listStoredPacks(),
          listAttempts(),
        ]);
        const a = attempts.find((x) => x.id === attemptId) ?? null;
        if (!a) throw new Error('Ujian tidak ditemukan.');

        let p: Pack | null = packs.find((x) => x.id === a.packId) ?? null;
        try {
          p = await loadPack(a.packId);
        } catch {
          /* fallback ke stored jika ada */
        }
        if (!p) throw new Error('Paket soal tidak ditemukan.');
        setPack(p);
        setAttempt(a);
        setResult(score(a, p));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [attemptId]);

  const items = useMemo(() => {
    if (!pack || !attempt) return [];
    const byId = new Map(pack.questions.map((q) => [q.id, q]));
    return attempt.order
      .map((id, idx) => {
        const q = byId.get(id);
        if (!q) return null;
        const a = attempt.answers[id];
        const right = isCorrect(q, a?.choice ?? null, pack);
        const slow = (a?.ms ?? 0) > q.targetSec * 1000 * 1.5;
        return { q, a, idx, right, slow, doubt: !!a?.doubt };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [pack, attempt]);

  if (error) {
    return (
      <div className="view">
        <div className="empty-state">
          <p>Gagal memuat hasil: {error}</p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={() => go({ name: 'home' })}
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (!pack || !attempt || !result) {
    return <div className="view loading">Menghitung skor &amp; analisis…</div>;
  }

  const remedial = remedialIds(attempt, pack);
  const elapsed = (attempt.finishedAt ?? Date.now()) - attempt.startedAt;

  const filterTabs: TabOption<ReviewFilter>[] = [
    { id: 'all', label: 'Semua', count: items.length },
    {
      id: 'wrong',
      label: 'Salah / Kosong',
      count: items.filter((x) => !x.right).length,
    },
    {
      id: 'doubt',
      label: 'Ragu',
      count: items.filter((x) => x.doubt).length,
    },
    {
      id: 'slow',
      label: 'Lubang Waktu',
      count: items.filter((x) => x.slow).length,
    },
  ];

  const visibleItems = items.filter((item) => {
    if (filter === 'wrong') return !item.right;
    if (filter === 'doubt') return item.doubt;
    if (filter === 'slow') return item.slow;
    return true;
  });

  return (
    <div className={`view view-review track-${pack.family}`}>
      <div className="review-head">
        <div>
          <span className="section-eyebrow mono">
            EVALUASI {pack.family.toUpperCase()} · {attempt.mode.toUpperCase()}
          </span>
          <h1>Hasil &amp; Bedah Soal</h1>
          <p className="muted">
            {pack.name} · {fmtDate(attempt.startedAt)}
          </p>
        </div>
        <div className="review-duration">
          <span className="stat-value tabular-nums mono">{fmtClock(elapsed)}</span>
          <span className="stat-label mono">DURASI DIPAKAI</span>
        </div>
      </div>

      <div className={`verdict ${result.passedAll ? 'pass' : 'fail'}`}>
        <span className="verdict-badge mono">
          {result.passedAll ? 'MEMENUHI AMBANG BATAS' : 'PERLU PENGUATAN'}
        </span>
        <span>
          {result.passedAll
            ? 'Semua subtes melampaui passing grade target paket ini.'
            : 'Ada subtes di bawah ambang batas. Gunakan tombol Latih Soal Remidi di bawah.'}
        </span>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Rincian per Subtes</h2>
          <span className="mono small">
            Total Skor: <strong className="num">{result.total}</strong>
          </span>
        </div>
        <div className="subtest-strip">
          {result.perSubtest.map((s) => {
            const pctScore = Math.min(100, Math.round((s.score / Math.max(1, s.max)) * 100));
            const pgPct = Math.min(100, Math.round((s.passMin / Math.max(1, s.max)) * 100));
            return (
              <div key={s.id} className="subtest-cell">
                <div className="subtest-cell-head">
                  <span className="subtest-name">{s.name}</span>
                  <span className={`badge ${s.passed ? 'badge-pass' : 'badge-fail'}`}>
                    {s.passed ? 'Lulus PG' : 'Di bawah PG'}
                  </span>
                </div>
                <div className="subtest-score num">
                  {s.score} <span className="muted">/ {s.max}</span>
                </div>
                <div className="subtest-bar" title={`Ambang batas: ${s.passMin}`}>
                  <div className="subtest-bar-fill" style={{ width: `${pctScore}%` }} />
                  <span
                    className="subtest-pg-marker"
                    style={{ left: `${pgPct}%` }}
                    aria-hidden="true"
                  />
                </div>
                <p className="subtest-meta mono">
                  PG {s.passMin} · Benar {s.correct}/{s.total}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {remedial.length > 0 && (
        <section className="remedial-banner">
          <div>
            <span className="mono section-eyebrow">ANTREAN REMIDI OTOMATIS</span>
            <h2>{remedial.length} Soal Butuh Pengulangan</h2>
            <p className="muted small">
              Berisi soal yang salah, kosong, ditandai ragu, atau melebihi 1,5× target waktu.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-magnetic"
            onClick={() =>
              go({
                name: 'workbench',
                packId: attempt.packId,
                mode: 'latihan',
                questionIds: remedial,
              })
            }
          >
            Latih {remedial.length} Soal Remidi →
          </button>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Pembahasan Soal</h2>
          <SlidingTabs
            items={filterTabs}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter pembahasan soal"
          />
        </div>

        <div className="question-list">
          {visibleItems.map(({ q, a, idx, right, slow }) => {
            const st = pack.config.subtests.find((s) => s.id === q.subtest);
            const open = selectedId === q.id;
            return (
              <div key={q.id} className={`q-review ${open ? 'open' : ''}`}>
                <button
                  type="button"
                  className="q-review-toggle"
                  onClick={() => setSelectedId(open ? null : q.id)}
                  aria-expanded={open}
                >
                  <span className="q-review-num num mono">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`badge ${right ? 'badge-pass' : 'badge-fail'}`}>
                    {a?.choice == null ? 'Kosong' : right ? 'Benar' : 'Salah'}
                  </span>
                  {slow && <span className="badge badge-warning">Lambat</span>}
                  <span className="q-review-topic">
                    <strong className="mono">{q.subtest.toUpperCase()}</strong> · {q.topic}
                  </span>
                  <span className="chev mono">{open ? '−' : '+'}</span>
                </button>
                <div className={`drawer ${open ? 'is-open' : ''}`}>
                  <div className="drawer-inner">
                    <div className="q-review-body">
                      <div className="question-stem">{cleanDisplayText(q.stem)}</div>
                      <div className="option-list compact">
                        {q.options.map((opt, oi) => {
                          let cls = 'option-row';
                          if (st?.scheme === 'weighted') {
                            const best = Math.max(...(q.weights ?? [0]));
                            if ((q.weights?.[oi] ?? 0) === best) cls += ' right';
                            if (a?.choice === oi && (q.weights?.[oi] ?? 0) !== best)
                              cls += ' wrong';
                          } else {
                            if (q.key === oi) cls += ' right';
                            if (a?.choice === oi && q.key !== oi) cls += ' wrong';
                          }
                          return (
                            <div key={oi} className={cls}>
                              <span className="option-letter">{LETTERS[oi]}</span>
                              <span className="option-text">{cleanDisplayText(opt)}</span>
                              {st?.scheme === 'weighted' && (
                                <span className="option-weight tabular-nums mono">
                                  {q.weights?.[oi] ?? 0} poin
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="feedback correct">
                        <strong>Pembahasan:</strong>
                        <p><RichText text={q.explain} /></p>
                        {q.source && (
                          <p className="muted small" style={{ marginTop: 6 }}>
                            Sumber: {q.source}
                          </p>
                        )}
                      </div>
                      <p className="muted small mono">
                        Waktu: {fmtClock(a?.ms ?? 0)} · Target: {q.targetSec} dtk
                        {a?.doubt ? ' · Ditandai ragu' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="review-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => go({ name: pack.family })}
        >
          ← Menu {pack.family.toUpperCase()}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-magnetic"
          onClick={() =>
            go({ name: 'workbench', packId: attempt.packId, mode: 'latihan' })
          }
        >
          Ulangi Paket Ini
        </button>
      </div>
    </div>
  );
}
