import type { AnswerRec } from '../lib/types';
import { LETTERS } from '../lib/engine';

interface Props {
  order: string[];
  answers: Record<string, AnswerRec>;
  cursor: number;
  onJump: (idx: number) => void;
}

export default function QuestionNav({ order, answers, cursor, onJump }: Props) {
  return (
    <div className="question-nav">
      <h3>Peta Nomor</h3>
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
          <i className="dot dot-answered" /> Dijawab
        </span>
        <span className="legend-item">
          <i className="dot dot-doubt" /> Ragu
        </span>
        <span className="legend-item">
          <i className="dot dot-current" /> Sedang
        </span>
      </div>
      <p className="qnav-hint">Pintasan: 1-5 / A-E pilih, H hint, R ragu, panah kiri-kanan pindah.</p>
    </div>
  );
}
