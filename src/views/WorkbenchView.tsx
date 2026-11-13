import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Attempt, Pack, Question, Mode, AnswerRec } from '../lib/types';
import { loadPack } from '../lib/packs';
import { saveAttempt } from '../lib/db';
import { buildOrder, newAttempt, remainingMs, fmtClock, LETTERS } from '../lib/engine';
import { useNow } from '../lib/store';
import type { Screen } from '../lib/store';
import type { ThemePref } from '../lib/theme';
import { cleanDisplayText } from '../lib/sanitize';
import { getActiveSessionId } from '../lib/session';
import HintDeck from '../components/HintDeck';
import QuestionNav from '../components/QuestionNav';
import TipsDrawer from '../components/TipsDrawer';
import RichText from '../components/RichText';

interface Props {
  packId: string;
  mode: Mode;
  subtest?: string;
  questionIds?: string[];
  limit?: number;
  go: (s: Screen) => void;
  theme: ThemePref;
  onTheme: (t: ThemePref) => void;
}

const SUBTEST_LABELS: Record<string, string> = {
  twk: 'TWK',
  tiu: 'TIU',
  tkp: 'TKP',
  tkd: 'TKD',
  akhlak: 'AKHLAK',
  twk_bumn: 'TWK BUMN',
  bhs: 'B. Inggris',
  agility: 'Learning Agility',
};

export default function WorkbenchView({
  packId,
  mode,
  subtest,
  questionIds,
  limit,
  go,
  theme,
  onTheme,
}: Props) {
  const [pack, setPack] = useState<Pack | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);

  const startMsRef = useRef(0);
  const qStartRef = useRef(0);
  const savedTimerRef = useRef(0);
  const now = useNow(mode === 'simulasi' ? 1000 : 250);

  useEffect(() => {
    let alive = true;
    loadPack(packId)
      .then((p) => {
        if (!alive) return;
        const order = buildOrder(p, subtest, limit, questionIds);
        if (order.length === 0) {
          throw new Error('Tidak ada soal yang sesuai filter subtes/remidi.');
        }
        const att = newAttempt(p, mode, order, getActiveSessionId());
        setPack(p);
        setAttempt(att);
        setShowFeedback(false);
        startMsRef.current = att.startedAt;
        qStartRef.current = Date.now();
        if (mode === 'latihan') savedTimerRef.current = 0;
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, [packId, mode, subtest, questionIds, limit]);

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

  if (!pack || !attempt || !question) {
    return <div className="view loading">Menyiapkan ruang ujian…</div>;
  }

  const rec = attempt.answers[question.id];
  const answer: AnswerRec = rec ?? { choice: null, doubt: false, ms: 0, hints: 0 };

  const commit = (next: Attempt, persist = true) => {
    setAttempt(next);
    if (persist) saveAttempt(next).catch(() => {});
  };

  const updateRec = (patch: Partial<AnswerRec>) => {
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

  const choose = (choice: number) => {
    if (choice < 0 || choice >= question.options.length) return;
    const ms =
      mode === 'simulasi' ? Date.now() - qStartRef.current : savedTimerRef.current;
    updateRec({ choice, ms: Math.max(answer.ms, ms) });
    if (mode === 'latihan') setShowFeedback(true);
  };

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, attempt.order.length - 1));
    if (clamped === qIndex) return;
    const ms = Date.now() - qStartRef.current;
    const curRec = attempt.answers[question.id];
    const nextAnswers = curRec
      ? { ...attempt.answers, [question.id]: { ...curRec, ms: curRec.ms + ms } }
      : attempt.answers;

    commit({ ...attempt, answers: nextAnswers, cursor: clamped });
    savedTimerRef.current = 0;
    qStartRef.current = Date.now();
    setShowFeedback(mode === 'latihan' && attempt.answers[attempt.order[clamped]]?.choice != null);
  };

  const finish = async () => {
    if (submitting) return;
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
    if (mode === 'simulasi' && attempt.endAt && now >= attempt.endAt) {
      finish();
    }
  }, [now, mode, attempt]);

  // Keyboard: 1-5 / A-E pilih, T buka rumus, R ragu, ←/→ navigasi.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      const k = e.key.toLowerCase();
      if (k >= '1' && k <= '5') choose(Number(k) - 1);
      else if (k >= 'a' && k <= 'e') choose(k.charCodeAt(0) - 97);
      else if (k === 'r') toggleDoubt();
      else if (k === 't' && mode === 'latihan') setTipsOpen((v) => !v);
      else if (k === 'arrowleft') goTo(qIndex - 1);
      else if (k === 'arrowright') goTo(qIndex + 1);
      else if (
        k === 'enter' &&
        mode === 'simulasi' &&
        qIndex === attempt.order.length - 1
      ) {
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question, answer, attempt, qIndex, mode]);

  const remaining = remainingMs(attempt, now);
  const elapsed = now - attempt.startedAt;
  const timeSink = answer.ms > question.targetSec * 1000 * 1.5;
  const st = pack.config.subtests.find((s) => s.id === question.subtest);
  const isCorrectNow =
    st?.scheme === 'weighted'
      ? (question.weights?.[answer.choice ?? -1] ?? 0) ===
        Math.max(...(question.weights ?? [0]))
      : question.key === answer.choice;

  const answeredCount = Object.keys(attempt.answers).length;
  const progressPct =
    attempt.order.length > 0
      ? Math.round((answeredCount / attempt.order.length) * 100)
      : 0;
  const hasAsciiDiagram = /[┌┐└┘│─┬┴┼●○▲△■□]/.test(question.stem);
  const subLabel = SUBTEST_LABELS[question.subtest] ?? question.subtest.toUpperCase();

  const nextTheme = (): ThemePref => {
    if (theme === 'system') return 'light';
    if (theme === 'light') return 'dark';
    return 'system';
  };

  return (
    <div className={`exam-shell track-${pack.family}`}>
      {/* IELTS / TOEFL-inspired distraction-free top bar */}
      <header className="exam-topbar">
        <div className="exam-topbar-inner">
          <div className="exam-top-left">
            <button
              type="button"
              className="btn-exit-exam"
              onClick={() => go({ name: pack.family })}
            >
              ← Keluar
            </button>
            <div className="exam-session-info">
              <div className="exam-badges">
                <span className={`pill pill-${pack.family}`}>
                  {mode === 'simulasi' ? 'Simulasi CAT' : 'Mode Latihan'}
                </span>
                {questionIds && <span className="pill pill-warn">Remidi</span>}
                <span className="exam-q-counter num">
                  Soal {qIndex + 1} dari {attempt.order.length}
                </span>
              </div>
              <span className="exam-pack-title">{pack.name}</span>
            </div>
          </div>

          <div className="exam-top-right">
            {mode === 'latihan' && (
              <button
                type="button"
                className="btn btn-tips-guide btn-sm"
                onClick={() => setTipsOpen(true)}
              >
                ✦ Rumus &amp; Tips Cepat
              </button>
            )}

            <div className="exam-timer-box">
              <span className="exam-timer-label">
                {mode === 'simulasi' ? 'Sisa Waktu' : 'Durasi'}
              </span>
              <span
                className={`exam-timer-val num mono ${
                  mode === 'simulasi' && remaining < 300_000 ? 'danger' : ''
                }`}
              >
                {mode === 'simulasi' ? fmtClock(remaining) : fmtClock(elapsed)}
              </span>
            </div>

            <button
              type="button"
              className="btn-icon-quiet"
              onClick={() => onTheme(nextTheme())}
              title="Ganti tema terang/gelap"
              aria-label="Ganti tema tampilan"
            >
              {theme === 'light' ? '☀' : theme === 'dark' ? '◐' : '◑'}
            </button>

            {answeredCount > 0 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={finish}
                disabled={submitting}
              >
                {mode === 'simulasi' ? 'Kumpulkan' : 'Selesai & Nilai'}
              </button>
            )}
          </div>
        </div>

        <div className="exam-progress-bar">
          <div className="exam-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      {/* Main Split Assessment Stage */}
      <div className="exam-grid">
        <section key={question.id} className="exam-paper">
          <div className="exam-paper-head">
            <div className="exam-meta-tags">
              <span className="subtest-tag">{subLabel}</span>
              <span className="topic-tag">{question.topic}</span>
              <span className="pace-tag num">Target {question.targetSec} dtk</span>
              {timeSink && mode === 'latihan' && (
                <span className="pace-warn">Melebihi target waktu</span>
              )}
            </div>

            <button
              type="button"
              className={`flag-btn ${answer.doubt ? 'is-flagged' : ''}`}
              onClick={toggleDoubt}
            >
              <span aria-hidden="true">{answer.doubt ? '⚑' : '⚐'}</span>
              <span>{answer.doubt ? 'Ditandai Ragu' : 'Tandai Ragu'}</span>
            </button>
          </div>

          <div className={`exam-stem ${hasAsciiDiagram ? 'is-diagram' : ''}`}>
            {cleanDisplayText(question.stem)}
          </div>

          <div className="exam-options" role="radiogroup" aria-label="Pilihan jawaban">
            {question.options.map((opt, i) => {
              const chosen = answer.choice === i;
              const reveal =
                mode === 'latihan' && showFeedback && answer.choice != null;
              let cls = 'exam-option';
              if (chosen) cls += ' is-chosen';
              if (reveal) {
                const isRight =
                  st?.scheme === 'weighted'
                    ? (question.weights?.[i] ?? 0) ===
                      Math.max(...(question.weights ?? [0]))
                    : question.key === i;
                if (isRight) cls += ' is-right';
                else if (chosen) cls += ' is-wrong';
              }
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={chosen}
                  className={cls}
                  onClick={() => choose(i)}
                >
                  <span className="option-badge">{LETTERS[i]}</span>
                  <span className="option-label">{cleanDisplayText(opt)}</span>
                  {reveal && st?.scheme === 'weighted' && (
                    <span className="option-points num">
                      {question.weights?.[i] ?? 0} poin
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {mode === 'latihan' && showFeedback && answer.choice != null && (
            <div className={`exam-feedback ${isCorrectNow ? 'is-correct' : 'is-incorrect'}`}>
              <div className="feedback-head">
                <strong>
                  {isCorrectNow
                    ? '✓ Jawaban Tepat!'
                    : '✕ Belum tepat — simak pembahasannya'}
                </strong>
              </div>
              <p><RichText text={question.explain} /></p>
            </div>
          )}

          <div className="exam-footer-nav">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => goTo(qIndex - 1)}
              disabled={qIndex === 0}
            >
              ← Sebelumnya
            </button>

            <span className="exam-footer-status muted small num">
              {answeredCount}/{attempt.order.length} terjawab
            </span>

            {qIndex < attempt.order.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => goTo(qIndex + 1)}
              >
                Berikutnya →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={finish}
                disabled={submitting}
              >
                Selesai &amp; Lihat Skor →
              </button>
            )}
          </div>
        </section>

        <aside className="exam-companion">
          {mode === 'latihan' && (
            <HintDeck
              question={question}
              subtestLabel={subLabel}
              onOpenGuide={() => setTipsOpen(true)}
              onPeekTip={() => updateRec({ hints: answer.hints + 1 })}
            />
          )}

          <QuestionNav
            order={attempt.order}
            answers={attempt.answers}
            cursor={qIndex}
            onJump={goTo}
          />
        </aside>
      </div>

      <TipsDrawer
        open={tipsOpen}
        family={pack.family}
        initialSubtest={subLabel}
        onClose={() => setTipsOpen(false)}
      />
    </div>
  );
}
