import type { AnswerRec } from '../lib/types';

interface Props {
  order: string[];
  answers: Record<string, AnswerRec>;
  cursor: number;
  onJump: (idx: number) => void;
}

export default function QuestionNav({ order, answers, cursor, onJump }: Props) {
  const answeredCount = order.filter((id) => answers[id]?.choice != null).length;
  const doubtCount = order.filter((id) => answers[id]?.doubt).length;

  return (
    <div className="question-nav">
      <div className="qnav-head">
        <h3>Peta Nomor</h3>
        <span className="mono small muted num">
          {answeredCount}/{order.length}
        </span>
      </div>
      <div className="qnav-grid">
        {order.map((id, i) => {
          const a = answers[id];
          let cls = 'qnav-cell';
          if (i === cursor) cls += ' current';
          if (a?.choice != null) cls += ' answered';
          if (a?.doubt) cls += ' doubt';
          return (
            <button
              key={id}
              type="button"
              className={cls}
              onClick={() => onJump(i)}
              aria-label={`Lompat ke soal ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="qnav-legend">
        <span className="legend-item">
          <i className="dot dot-answered" /> Dijawab ({answeredCount})
        </span>
        <span className="legend-item">
          <i className="dot dot-doubt" /> Ragu ({doubtCount})
        </span>
        <span className="legend-item">
          <i className="dot dot-current" /> Aktif
        </span>
      </div>
      <p className="qnav-hint">
        Pintasan: <kbd className="mono">1-5</kbd> / <kbd className="mono">A-E</kbd> pilih,{' '}
        <kbd className="mono">H</kbd> taktik, <kbd className="mono">R</kbd> ragu,{' '}
        <kbd className="mono">←</kbd> <kbd className="mono">→</kbd> pindah.
      </p>
    </div>
  );
}
