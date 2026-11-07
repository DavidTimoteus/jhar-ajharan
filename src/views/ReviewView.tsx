import { useEffect, useState } from 'preact/hooks';
import type { Attempt, Pack, Question, ScoreResult } from '../lib/types';
import { listStoredPacks, listAttempts } from '../lib/db';
import { loadPack } from '../lib/packs';
import { score, fmtClock, LETTERS, remedialIds } from '../lib/engine';
import { fmtDate } from '../lib/format';
import type { Screen } from '../lib/store';

interface Props {
  attemptId: string;
  go: (s: Screen) => void;
}

export default function ReviewView({ attemptId, go }: Props) {
  const [pack, setPack] = useState<Pack | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const packs = await listStoredPacks();
        // Muat pack berdasarkan packId attempt (attempt menyimpan packId).
        const attempts = await listAttempts();
        const a = attempts.find((x) => x.id === attemptId) ?? null;
        if (!a) throw new Error('Ujian tidak ditemukan.');

        const byId = new Map(packs.map((p) => [p.id, p]));
        let p = byId.get(a.packId) ?? null;

        // fallback: muat dari public/packs via fetch (bawaan)
        if (!p) {
          const metaRes = await fetch(new URL('packs/index.json', document.baseURI).toString());
          const metas = (await metaRes.json()) as { id: string; file: string }[];
          const meta = metas.find((m) => m.id === a.packId);
          if (meta) {
            const packRes = await fetch(new URL(`packs/${meta.file}`, document.baseURI).toString());
            p = (await packRes.json()) as Pack;
          }
        }

        // loadPack punya cache lokal; gunakan untuk konsistensi (dengan fallback di atas).
        try {
          p = await loadPack(a.packId);
        } catch {
          /* pakai p dari fetch manual */
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

  if (error) {
    return (
      <div className="view">
        <div className="empty-state">
          <p>Gagal memuat hasil: {error}</p>
          <button className="btn btn-primary" onClick={() => go({ name: 'home' })}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!pack || !attempt || !result) {
    return <div className="view loading">Memuat hasil…</div>;
  }

  const byId = new Map(pack.questions.map((q) => [q.id, q]));
  const remedial = remedialIds(attempt, pack);
  const elapsed = (attempt.finishedAt ?? Date.now()) - attempt.startedAt;

  const openQuestion = (id: string) => {
    setSelectedId(selectedId === id ? null : id);
  };

  return (
    <div className="view view-review">
      <div className="review-head">
        <div>
          <h1>Hasil Ujian</h1>
          <p className="muted">
            {pack.name} · {attempt.mode === 'simulasi' ? 'Simulasi' : 'Latihan'} ·{' '}
            {fmtDate(attempt.startedAt)}
          </p>
        </div>
        <div className="review-duration">
          <span className="stat-value tabular-nums">{fmtClock(elapsed)}</span>
          <span className="stat-label">waktu dipakai</span>
        </div>
      </div>

      <div className={`verdict ${result.passedAll ? 'pass' : 'fail'}`}>
        {result.passedAll
          ? '✓ Semua subtes melewati ambang batas.'
          : '✗ Ada subtes di bawah ambang batas. Perkuat di antrean remidi.'}
      </div>

      <section className="section">
        <h2>Rincian per Subtes</h2>
        <div className="subtest-cards">
          {result.perSubtest.map((s) => (
            <div key={s.id} className={`subtest-card ${s.passed ? 'pass' : 'fail'}`}>
              <div className="subtest-card-head">
                <span className="subtest-name">{s.name}</span>
                <span className={`badge ${s.passed ? 'badge-pass' : 'badge-fail'}`}>
                  {s.passed ? 'Lulus' : 'Di bawah'}
                </span>
              </div>
              <div className="subtest-score tabular-nums">
                {s.score} <span className="muted">/ {s.max}</span>
              </div>
              <div className="subtest-bar">
                <div
                  className="subtest-bar-fill"
                  style={{ width: `${Math.min(100, (s.score / Math.max(1, s.passMin)) * 100)}%` }}
                />
              </div>
              <p className="muted small">
                Ambang {s.passMin} · benar {s.correct}/{s.total}
              </p>
            </div>
          ))}
        </div>
        <p className="muted small">Total skor: <strong className="tabular-nums">{result.total}</strong></p>
      </section>

      {remedial.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Kotak Remidi ({remedial.length})</h2>
            <button
              className="btn btn-primary"
              onClick={() => go({ name: 'workbench', packId: attempt.packId, mode: 'latihan' })}
            >
              Latih ulang semua
            </button>
          </div>
          <p className="muted">
            Soal salah, kosong, ditandai ragu, atau melebihi target waktu masuk antrean ini.
          </p>
        </section>
      )}

      <section className="section">
        <h2>Pembahasan Soal</h2>
        <div className="question-list">
          {attempt.order.map((id, i) => {
            const q = byId.get(id);
            if (!q) return null;
            const a = attempt.answers[id];
            const st = pack.config.subtests.find((s) => s.id === q.subtest);
            const isRight =
              st?.scheme === 'weighted'
                ? (q.weights?.[a?.choice ?? -1] ?? 0) === Math.max(...(q.weights ?? [0]))
                : q.key === a?.choice;
            const open = selectedId === q.id;
            return (
              <div key={q.id} className={`q-review ${open ? 'open' : ''}`}>
                <button className="q-review-toggle" onClick={() => openQuestion(q.id)}>
                  <span className="q-review-num tabular-nums">{i + 1}</span>
                  <span className={`badge ${isRight ? 'badge-pass' : 'badge-fail'}`}>
                    {a?.choice == null ? 'Kosong' : isRight ? 'Benar' : 'Salah'}
                  </span>
                  <span className="q-review-topic">{q.topic}</span>
                  {open ? <span>▲</span> : <span>▼</span>}
                </button>
                {open && (
                  <div className="q-review-body">
                    <p className="question-stem">{q.stem}</p>
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
                            <span className="option-text">{opt}</span>
                            {st?.scheme === 'weighted' && (
                              <span className="option-weight tabular-nums">
                                {q.weights?.[oi] ?? 0} poin
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="feedback correct">
                      <strong>Pembahasan:</strong>
                      <p>{q.explain}</p>
                      {q.source && (
                        <p className="muted small" style={{ marginTop: 6 }}>
                          Sumber: {q.source}
                        </p>
                      )}
                    </div>
                    <p className="muted small">
                      Waktu Anda {fmtClock(a?.ms ?? 0)} · target {q.targetSec} dtk
                      {a?.doubt ? ' · ditandai ragu' : ''}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="review-actions">
        <button className="btn btn-secondary" onClick={() => go({ name: 'home' })}>
          ← Ke Beranda
        </button>
        <button
          className="btn btn-primary"
          onClick={() => go({ name: 'workbench', packId: attempt.packId, mode: 'latihan' })}
        >
          Ulangi Latihan
        </button>
      </div>
    </div>
  );
}
