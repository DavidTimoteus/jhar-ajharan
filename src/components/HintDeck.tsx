import { useEffect, useState } from 'preact/hooks';
import type { LensId, Question } from '../lib/types';
import RichText from './RichText';

interface Props {
  question: Question;
  subtestLabel: string;
  onOpenGuide: () => void;
  onPeekTip?: () => void;
}

const LENS_LIST: { id: LensId; label: string; short: string }[] = [
  { id: 'kilat', label: 'Jurus Kilat', short: 'Trik cepat' },
  { id: 'eliminasi', label: 'Eliminasi', short: 'Buang salah' },
  { id: 'logika', label: 'Logika Inti', short: 'Konsep' },
  { id: 'jebakan', label: 'Jebakan', short: 'Waspada' },
];

export default function HintDeck({
  question,
  subtestLabel,
  onOpenGuide,
  onPeekTip,
}: Props) {
  const [activeLens, setActiveLens] = useState<LensId>('kilat');
  const [collapsed, setCollapsed] = useState(false);

  // Reset kembali ke Jurus Kilat setiap pindah soal supaya langsung terbaca
  useEffect(() => {
    setActiveLens('kilat');
  }, [question.id]);

  const hints = question.hints ?? [];
  const current =
    hints.find((h) => h.lens === activeLens) ?? hints[0] ?? null;

  const selectLens = (lens: LensId) => {
    if (lens !== activeLens && onPeekTip) onPeekTip();
    setActiveLens(lens);
    if (collapsed) setCollapsed(false);
  };

  return (
    <section className={`tips-panel ${collapsed ? 'is-collapsed' : ''}`} aria-label="Tips dan Trik Cepat">
      <div className="tips-panel-head">
        <div className="tips-panel-title-wrap">
          <span className="tips-spark" aria-hidden="true">✦</span>
          <div>
            <h3>Tips &amp; Trik Cepat</h3>
            <p className="tips-panel-sub">Strategi {subtestLabel} · Tanpa membocorkan huruf kunci</p>
          </div>
        </div>
        <div className="tips-head-actions">
          <button
            type="button"
            className="btn-text-link"
            onClick={onOpenGuide}
            title="Buka rangkuman rumus cepat & teknik subtes"
          >
            Rumus Cepat →
          </button>
          <button
            type="button"
            className="btn-collapse-tip"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Tampilkan' : 'Sembunyikan'}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="tips-panel-body">
          {hints.length > 0 ? (
            <>
              <div className="tips-lens-tabs" role="tablist">
                {LENS_LIST.map((l) => {
                  const exists = hints.some((h) => h.lens === l.id);
                  if (!exists) return null;
                  const active = current?.lens === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={`tips-lens-btn ${active ? 'is-active' : ''}`}
                      onClick={() => selectLens(l.id)}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
              {current && (
                <div className="tips-callout" role="tabpanel">
                  <p><RichText text={current.text} /></p>
                </div>
              )}
            </>
          ) : (
            <div className="tips-callout">
              <p>Identifikasi kata kunci inti pada soal dan eliminasi opsi yang paling bertentangan dengan konteks pertanyaan.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
