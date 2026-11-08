import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Attempt, Pack, Question, Mode, AnswerRec } from '../lib/types';
import { loadPack } from '../lib/packs';
import { saveAttempt } from '../lib/db';
import { buildOrder, newAttempt, remainingMs, fmtClock, LETTERS } from '../lib/engine';
import { useNow } from '../lib/store';
import type { Screen } from '../lib/store';
import HintDeck from '../components/HintDeck';
import QuestionNav from '../components/QuestionNav';

interface Props {
  packId: string;
  mode: Mode;
  subtest?: string;
  go: (s: Screen) => void;
}

export default function WorkbenchView({ packId, mode, subtest, go }: Props) {
  const [pack, setPack] = useState<Pack | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openHints, setOpenHints] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const startMsRef = useRef(0);
  const qStartRef = useRef(0);
  const savedTimerRef = useRef(0);
  const now = useNow(mode === 'simulasi' ? 1000 : 250);

  useEffect(() => {
    let alive = true;
    loadPack(packId)
      .then((p) => {
        if (!alive) return;
        const order = subtest ? buildOrder(p, subtest) : buildOrder(p);
        const att = newAttempt(p, mode, order);
        setPack(p);
        setAttempt(att);
        startMsRef.current = att.startedAt;
        qStartRef.current = Date.now();
        if (mode === 'latihan') savedTimerRef.current = 0;
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, [packId, mode, subtest]);

  const qIndex = attempt?.cursor ?? 0;
  const question: Question | null = useMemo(() => {
    if (!pack || !attempt) return null;
    const id = attempt.order[qIndex];
    return pack.questions.find((q) => q.id === id) ?? null;
  }, [pack, attempt, qIndex]);

  if (error) {
    return (
      <div className="view">
        <div className="empty-state">
          <p>Gagal memuat paket: {error}</p>
          <button className="btn btn-primary" onClick={() => go({ name: 'home' })}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!pack || !attempt || !question) {
    return <div className="view loading">Memuat soal…</div>;
  }

  const rec = attempt.answers[question.id];
  const answer: AnswerRec = rec ?? { choice: null, doubt: false, ms: 0, hints: 0 };

  const commit = (next: Attempt, persist = true) => {
    setAttempt(next);
    if (persist) saveAttempt(next).catch(() => {});
  };

  const updateRec = (patch: Partial<AnswerRec>) => {
    if (!attempt || !question) return;
    const base: AnswerRec = {
      choice: answer.choice,
      doubt: answer.doubt,
      ms: answer.ms,
      hints: answer.hints,
      ...patch,
    };
    const next = {
      ...attempt,
      answers: { ...attempt.answers, [question.id]: base },
    };
    commit(next);
  };

  const toggleDoubt = () => updateRec({ doubt: !answer.doubt });

  const revealHint = (lens: string) => {
    if (mode === 'simulasi') return; // hint terkunci di simulasi
    if (openHints.includes(lens)) {
      setOpenHints(openHints.filter((l) => l !== lens));
      return;
    }
    setOpenHints([...openHints, lens]);
    updateRec({ hints: answer.hints + 1 });
  };

  const choose = (choice: number) => {
    if (!attempt || !question) return;
    const ms = mode === 'simulasi' ? Date.now() - qStartRef.current : savedTimerRef.current;
    updateRec({ choice, ms });
    if (mode === 'latihan') setShowFeedback(true);
  };

  const goTo = (idx: number) => {
    if (!attempt) return;
    // simpan waktu tersisa di soal sebelumnya
    const ms = Date.now() - qStartRef.current;
    if (mode === 'latihan' && rec) {
      const next = {
        ...attempt,
        answers: { ...attempt.answers, [question.id]: { ...rec, ms: rec.ms + ms } },
        cursor: Math.max(0, Math.min(idx, attempt.order.length - 1)),
      };
      commit(next);
      savedTimerRef.current = 0;
    } else {
      const next = { ...attempt, cursor: Math.max(0, Math.min(idx, attempt.order.length - 1)) };
      commit(next);
    }
    qStartRef.current = Date.now();
    setShowFeedback(false);
  };

  const finish = async () => {
    if (!attempt) return;
    setSubmitting(true);
    const finished = { ...attempt, finishedAt: Date.now() };
    try {
      await saveAttempt(finished);
      go({ name: 'review', attemptId: finished.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  };

  // Auto-finish saat waktu simulasi habis.
  useEffect(() => {
    if (mode === 'simulasi' && attempt && attempt.endAt && now >= attempt.endAt) {
      finish();
    }
  }, [now, mode, attempt]);

  // Keyboard: 1-5 / A-E pilih, H hint, R ragu, ←/→ navigasi.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)
        return;
      const k = e.key.toLowerCase();
      if (k >= '1' && k <= '5') choose(Number(k) - 1);
      else if (k >= 'a' && k <= 'e') choose(k.charCodeAt(0) - 97);
      else if (k === 'h') revealHint('kilat');
      else if (k === 'r') toggleDoubt();
      else if (k === 'arrowleft') goTo(qIndex - 1);
      else if (k === 'arrowright') goTo(qIndex + 1);
      else if (k === 'enter' && mode === 'simulasi' && qIndex === attempt.order.length - 1)
        finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question, answer, attempt, qIndex, mode, openHints]);

  const remaining = remainingMs(attempt, now);
  const elapsed = now - attempt.startedAt;
  const timeSink = answer.ms > question.targetSec * 1000 * 1.5;
  const st = pack.config.subtests.find((s) => s.id === question.subtest);
  const isCorrectNow =
    st?.scheme === 'weighted'
      ? (question.weights?.[answer.choice ?? -1] ?? 0) ===
        Math.max(...(question.weights ?? [0]))
      : question.key === answer.choice;

  return (
    <div className="view view-workbench">
      <div className="wb-progress">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${attempt.order.length > 0 ? Math.round((Object.keys(attempt.answers).length / attempt.order.length) * 100) : 0}%`,
            }}
          />
        </div>
        <span className="wb-progress-label num">
          {Object.keys(attempt.answers).length}/{attempt.order.length} dijawab
        </span>
      </div>

      <div className="workbench-top">
        <div className="wb-info">
          <span className="pack-badge">{mode === 'simulasi' ? 'Simulasi' : 'Latihan'}</span>
          <span className="wb-pack-name">{pack.name}</span>
          <span className="wb-question-count">
            {qIndex + 1} / {attempt.order.length}
          </span>
        </div>
        <div className="wb-timer">
          {mode === 'simulasi' ? (
            <>
              <span className="timer-label">Waktu tersisa</span>
              <span className={`timer num ${remaining < 60_000 ? 'danger' : ''}`}>
                {fmtClock(remaining)}
              </span>
            </>
          ) : (
            <>
              <span className="timer-label">Waktu berjalan</span>
              <span className="timer num">{fmtClock(elapsed)}</span>
            </>
          )}
        </div>
      </div>

      <div className="workbench-grid">
        <section className="question-sheet">
          <div className="question-meta">
            <span className="q-subtest">{question.subtest.toUpperCase()}</span>
            <span className="q-topic">{question.topic}</span>
            {timeSink && mode === 'latihan' && (
              <span className="badge badge-warning">Lubang waktu</span>
            )}
          </div>
          <p className="question-stem">{question.stem}</p>

          <div className="option-list">
            {question.options.map((opt, i) => {
              const chosen = answer.choice === i;
              const reveal = showFeedback || (mode === 'simulasi' && attempt.finishedAt != null);
              let cls = 'option-row';
              if (chosen) cls += ' chosen';
              if (reveal) {
                const isRight =
                  st?.scheme === 'weighted'
                    ? (question.weights?.[i] ?? 0) === Math.max(...(question.weights ?? [0]))
                    : question.key === i;
                if (isRight) cls += ' right';
                else if (chosen) cls += ' wrong';
              }
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => {
                    if (mode === 'latihan' && !answer.choice) choose(i);
                    else if (mode === 'latihan' && answer.choice !== i) choose(i);
                  }}
                  disabled={mode === 'simulasi'}
                >
                  <span className="option-letter">{LETTERS[i]}</span>
                  <span className="option-text">{opt}</span>
                  {reveal && st?.scheme === 'weighted' && (
                    <span className="option-weight tabular-nums">
                      {question.weights?.[i] ?? 0} poin
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {mode === 'latihan' && showFeedback && (
            <div className={`feedback ${answer.choice != null && isCorrectNow ? 'correct' : 'incorrect'}`}>
              <strong>
                {answer.choice != null && isCorrectNow ? 'Benar.' : 'Kurang tepat.'}
              </strong>
              <p>{question.explain}</p>
            </div>
          )}

          <div className="workbench-actions">
            <button className="btn btn-secondary" onClick={() => goTo(qIndex - 1)} disabled={qIndex === 0}>
              Sebelumnya
            </button>
            {mode === 'latihan' && (
              <button
                className={`btn ${answer.doubt ? 'btn-warning' : 'btn-secondary'}`}
                onClick={toggleDoubt}
              >
                {answer.doubt ? 'Tandai ragu (aktif)' : 'Tandai ragu'}
              </button>
            )}
            {qIndex < attempt.order.length - 1 ? (
              <button className="btn btn-primary" onClick={() => goTo(qIndex + 1)}>
                Berikutnya
              </button>
            ) : (
              <button className="btn btn-primary" onClick={finish} disabled={submitting}>
                {mode === 'simulasi' ? 'Selesaikan Ujian' : 'Selesai & Lihat Skor'}
              </button>
            )}
          </div>
        </section>

        <aside className="workbench-side">
          {mode === 'latihan' ? (
            <HintDeck
              question={question}
              openHints={openHints}
              onToggle={revealHint}
            />
          ) : (
            <div className="hint-locked">
              <p>Hint terkunci dalam mode simulasi.</p>
              <p className="muted">Selesaikan ujian untuk membuka taktik & pembahasan.</p>
            </div>
          )}
          <QuestionNav
            order={attempt.order}
            answers={attempt.answers}
            cursor={qIndex}
            onJump={goTo}
          />
        </aside>
      </div>
    </div>
  );
}
