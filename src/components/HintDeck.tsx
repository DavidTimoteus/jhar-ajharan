import type { Question } from '../lib/types';

interface Props {
  question: Question;
  openHints: string[];
  onToggle: (lens: string) => void;
}

const LENS_META: Record<string, { label: string; short: string }> = {
  kilat: { label: 'Taktik 1 · Jalur Kilat', short: '< 15 detik' },
  eliminasi: { label: 'Taktik 2 · Eliminasi Pengecoh', short: 'buang opsi lemah' },
  logika: { label: 'Taktik 3 · Pola & Logika Inti', short: 'kerangka konsep' },
  jebakan: { label: 'Radar Jebakan', short: 'jebakan pembuat soal' },
};

export default function HintDeck({ question, openHints, onToggle }: Props) {
  if (!question.hints || question.hints.length === 0) {
    return (
      <div className="hint-deck">
        <h3>Kotak Taktik</h3>
        <p className="muted">Belum ada taktik untuk soal ini.</p>
      </div>
    );
  }

  return (
    <div className="hint-deck">
      <div className="hint-deck-head">
        <h3>Kotak Taktik</h3>
        <span className="muted">Huruf kunci tidak dibocorkan di sini.</span>
      </div>
      {question.hints.map((h) => {
        const meta = LENS_META[h.lens] ?? { label: h.lens, short: '' };
        const open = openHints.includes(h.lens);
        return (
          <div key={h.lens} className={`hint-item ${open ? 'open' : ''}`}>
            <button className="hint-tab" onClick={() => onToggle(h.lens)}>
              <span>{meta.label}</span>
              <span className="hint-short">{open ? 'Tutup' : meta.short}</span>
            </button>
            {open && <p className="hint-body">{h.text}</p>}
          </div>
        );
      })}
    </div>
  );
}
