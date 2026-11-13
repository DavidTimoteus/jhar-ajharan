import { useEffect, useMemo, useState } from 'preact/hooks';
import { glossaryForFamily, tipsForFamily } from '../lib/tips';
import type { DiagramId } from '../lib/submateri';
import InteractiveDiagram from './InteractiveDiagrams';
import RichText from './RichText';

interface Props {
  open: boolean;
  family: 'cpns' | 'bumn';
  initialSubtest?: string;
  onClose: () => void;
}

type DrawerMode = 'rumus' | 'visual' | 'glosarium' | 'target';

const DRAWER_DIAGRAMS: { id: DiagramId; label: string }[] = [
  { id: 'berbalik-nilai', label: 'Pekerja & Libur' },
  { id: 'gerak-temu', label: 'Susul & Papasan' },
  { id: 'silogisme-venn', label: 'Venn Silogisme' },
  { id: 'persen-tangki', label: 'Diskon 100 Petak' },
  { id: 'deret-scanner', label: 'Scanner Deret' },
  { id: 'kuantitatif-uji3', label: 'Uji P vs Q' },
  { id: 'analogi-jembatan', label: 'Jembatan Analogi' },
  { id: 'analitis-slot', label: 'Slot Kursi' },
  { id: 'figural-transform', label: 'Rotasi Figural' },
  { id: 'integritas-detektor', label: 'TWK Integritas' },
  { id: 'pilar-lembaga', label: 'Sila & Lembaga' },
  { id: 'tkp-akhlak-radar', label: 'Filter Poin 5' },
  { id: 'tkd-verbal-filter', label: 'TKD Verbal BUMN' },
  { id: 'bumn-english-xray', label: 'English X-Ray' },
];

export default function TipsDrawer({ open, family, initialSubtest, onClose }: Props) {
  const tips = useMemo(() => tipsForFamily(family), [family]);
  const glossary = useMemo(() => glossaryForFamily(family), [family]);
  const subtests = useMemo(
    () => ['Semua', ...Array.from(new Set(tips.map((t) => t.subtest)))],
    [tips],
  );

  const [mode, setMode] = useState<DrawerMode>('rumus');
  const [activeSub, setActiveSub] = useState('Semua');
  const [query, setQuery] = useState('');
  const [activeDiagram, setActiveDiagram] = useState<DiagramId>(
    family === 'bumn' ? 'deret-scanner' : 'berbalik-nilai',
  );

  // State Simulasi Target Skor CPNS (default peta aman 450: 130 + 140 + 180)
  const [twkTarget, setTwkTarget] = useState(130);
  const [tiuTarget, setTiuTarget] = useState(140);
  const [tkpTarget, setTkpTarget] = useState(180);

  // State Simulasi Target BUMN
  const [tkdTarget, setTkdTarget] = useState(360);
  const [akhlakTarget, setAkhlakTarget] = useState(120);
  const [bhsTarget, setBhsTarget] = useState(365);

  useEffect(() => {
    if (!open) return;
    setMode('rumus');
    setQuery('');
    if (initialSubtest) {
      const match = subtests.find((s) => s.toLowerCase() === initialSubtest.toLowerCase());
      setActiveSub(match ?? 'Semua');
    } else {
      setActiveSub('Semua');
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, initialSubtest, family, subtests]);

  if (!open) return null;

  const qLower = query.trim().toLowerCase();

  const shownTips = tips.filter((t) => {
    if (activeSub !== 'Semua' && t.subtest !== activeSub) return false;
    if (qLower) {
      return `${t.title} ${t.shortcut} ${t.standard ?? ''} ${t.example ?? ''}`
        .toLowerCase()
        .includes(qLower);
    }
    return true;
  });

  const shownGlossary = glossary.filter((g) => {
    if (qLower) {
      return `${g.term} ${g.def} ${g.subtest}`.toLowerCase().includes(qLower);
    }
    return true;
  });

  const cpnsTotal = twkTarget + tiuTarget + tkpTarget;
  const cpnsPgOk = twkTarget >= 65 && tiuTarget >= 80 && tkpTarget >= 166;
  const twkBenar = Math.ceil(twkTarget / 5);
  const tiuBenar = Math.ceil(tiuTarget / 5);
  const tkpAvg = (tkpTarget / 45).toFixed(2);

  const bumnOk = tkdTarget >= 300 && akhlakTarget >= 95 && bhsTarget >= 300;

  return (
    <div
      className="tips-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Panduan Rumus, Glosarium, dan Target Skor"
      onClick={onClose}
    >
      <div className="tips-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="tips-drawer-head">
          <div>
            <span className={`pill pill-${family}`}>
              {family === 'cpns' ? 'SKD CPNS' : 'RBB BUMN'}
            </span>
            <h2>Pusat Strategi &amp; Target Belajar</h2>
            <p className="muted small">
              Bandingkan Cara Baku vs Cara Mudah, cari istilah penting di Glosarium Kilat, atau simulasikan target skor kelulusan.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-icon"
            onClick={onClose}
            aria-label="Tutup panduan"
          >
            ✕
          </button>
        </div>

        {/* 4 Core Mode Tabs */}
        <div className="drawer-mode-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'rumus'}
            className={`drawer-mode-btn ${mode === 'rumus' ? 'is-active' : ''}`}
            onClick={() => setMode('rumus')}
          >
            ✦ Baku vs Mudah ({tips.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'visual'}
            className={`drawer-mode-btn ${mode === 'visual' ? 'is-active' : ''}`}
            onClick={() => setMode('visual')}
          >
            ◈ Lab Visual
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'glosarium'}
            className={`drawer-mode-btn ${mode === 'glosarium' ? 'is-active' : ''}`}
            onClick={() => setMode('glosarium')}
          >
            Glosarium ({glossary.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'target'}
            className={`drawer-mode-btn ${mode === 'target' ? 'is-active' : ''}`}
            onClick={() => setMode('target')}
          >
            {family === 'cpns' ? 'Target 450+' : 'Target RBB'}
          </button>
        </div>

        {(mode === 'rumus' || mode === 'glosarium') && (
          <div className="tips-controls-stack">
            <input
              type="search"
              className="search-input drawer-search"
              value={query}
              onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
              placeholder={
                mode === 'rumus'
                  ? 'Cari rumus atau topik (mis. silogisme, pasal, diskon)…'
                  : 'Cari istilah atau konsep (mis. BPUPKI, gratifikasi, AKHLAK)…'
              }
            />
            {mode === 'rumus' && (
              <div className="tips-filter-row">
                {subtests.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    className={`chip-btn ${activeSub === sub ? 'is-active' : ''}`}
                    onClick={() => setActiveSub(sub)}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="tips-drawer-list">
          {mode === 'rumus' &&
            shownTips.map((tip) => (
              <article key={tip.id} className="tip-guide-card">
                <div className="tip-guide-meta">
                  <span className="tip-guide-sub">{tip.subtest}</span>
                  <span className="tip-guide-tag">{tip.tag}</span>
                </div>
                <h3>{tip.title}</h3>

                {tip.standard && (
                  <div className="tip-compare-baku">
                    <strong>Cara Baku:</strong> <RichText text={tip.standard} inline />
                  </div>
                )}

                <div className="tip-compare-mudah">
                  <strong>Cara Mudah / Jurus Cepat:</strong> <RichText text={tip.shortcut} inline />
                </div>

                {tip.example && (
                  <div className="tip-guide-example">
                    <strong>Contoh Nyata:</strong> <RichText text={tip.example} inline />
                  </div>
                )}
                {tip.trap && (
                  <div className="tip-guide-trap">
                    <strong>Waspada Jebakan:</strong> <RichText text={tip.trap} inline />
                  </div>
                )}
              </article>
            ))}

          {mode === 'visual' && (
            <div className="drawer-visual-box">
              <div className="tips-filter-row" style={{ marginBottom: 12 }}>
                {DRAWER_DIAGRAMS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`chip-btn ${activeDiagram === d.id ? 'is-active' : ''}`}
                    onClick={() => setActiveDiagram(d.id)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <InteractiveDiagram diagramId={activeDiagram} />
            </div>
          )}

          {mode === 'glosarium' && (
            <div className="glosarium-list">
              {shownGlossary.map((item, idx) => (
                <div key={`${item.term}-${idx}`} className="glosarium-item">
                  <div className="glosarium-head">
                    <strong>{item.term}</strong>
                    <span className="subtest-chip">{item.subtest}</span>
                  </div>
                  <p>{item.def}</p>
                </div>
              ))}
              {shownGlossary.length === 0 && (
                <p className="muted small">Tidak ada istilah yang cocok dengan "{query}".</p>
              )}
            </div>
          )}

          {mode === 'target' && family === 'cpns' && (
            <div className="target-calc-box">
              <div className="target-summary-card">
                <div>
                  <span className="muted small">Simulasi Total Skor SKD</span>
                  <div className="target-score-big num">
                    {cpnsTotal} <span className="muted">/ 550</span>
                  </div>
                </div>
                <span
                  className={`badge ${
                    cpnsTotal >= 450 && cpnsPgOk
                      ? 'badge-pass'
                      : cpnsPgOk
                        ? 'badge-warning'
                        : 'badge-fail'
                  }`}
                >
                  {cpnsTotal >= 450 && cpnsPgOk
                    ? 'Zona Aman Kompetitif 450+'
                    : cpnsPgOk
                      ? 'Lulus PG · Naikkan Skor'
                      : 'Di Bawah Ambang Batas'}
                </span>
              </div>

              <div className="target-presets">
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => {
                    setTwkTarget(65);
                    setTiuTarget(80);
                    setTkpTarget(170);
                  }}
                >
                  Batas Minimal PG (315)
                </button>
                <button
                  type="button"
                  className="chip-btn is-active"
                  onClick={() => {
                    setTwkTarget(130);
                    setTiuTarget(140);
                    setTkpTarget(180);
                  }}
                >
                  Peta Aman 450
                </button>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => {
                    setTwkTarget(135);
                    setTiuTarget(155);
                    setTkpTarget(195);
                  }}
                >
                  Top Instansi (485)
                </button>
              </div>

              <div className="target-sliders">
                <label className="slider-row">
                  <div className="slider-head">
                    <strong>TWK (Ambang Batas: 65 / 150)</strong>
                    <span className="num">
                      {twkTarget} ({twkBenar}/30 benar)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    step={5}
                    value={twkTarget}
                    onInput={(e) => setTwkTarget(Number((e.target as HTMLInputElement).value))}
                  />
                </label>

                <label className="slider-row">
                  <div className="slider-head">
                    <strong>TIU (Ambang Batas: 80 / 175)</strong>
                    <span className="num">
                      {tiuTarget} ({tiuBenar}/35 benar)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={175}
                    step={5}
                    value={tiuTarget}
                    onInput={(e) => setTiuTarget(Number((e.target as HTMLInputElement).value))}
                  />
                </label>

                <label className="slider-row">
                  <div className="slider-head">
                    <strong>TKP (Ambang Batas: 166 / 225)</strong>
                    <span className="num">
                      {tkpTarget} (rata-rata {tkpAvg} poin/soal)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={45}
                    max={225}
                    step={1}
                    value={tkpTarget}
                    onInput={(e) => setTkpTarget(Number((e.target as HTMLInputElement).value))}
                  />
                </label>
              </div>

              <div className="tip-guide-example">
                <strong>Strategi Eksekusi:</strong> Untuk menembus skor{' '}
                <strong>{cpnsTotal}</strong>, fokus kunci <strong>{tiuBenar} soal TIU</strong>{' '}
                lebih dulu karena hitungan pasti tidak bias, amankan poin 4–5 di TKP dengan membaca aspek submateri, dan hindari terpaku lebih dari 50 detik di 1 soal TWK kasus.
              </div>
            </div>
          )}

          {mode === 'target' && family === 'bumn' && (
            <div className="target-calc-box">
              <div className="target-summary-card">
                <div>
                  <span className="muted small">Proyeksi Kesiapan RBB BUMN</span>
                  <div className="target-score-big num">
                    {tkdTarget + akhlakTarget + bhsTarget}{' '}
                    <span className="muted">/ 1.150 poin inti</span>
                  </div>
                </div>
                <span className={`badge ${bumnOk ? 'badge-pass' : 'badge-warning'}`}>
                  {bumnOk ? 'Target Kompetitif Lolos Tahap' : 'Perlu Penguatan Subtes'}
                </span>
              </div>

              <div className="target-sliders">
                <label className="slider-row">
                  <div className="slider-head">
                    <strong>Tahap 1 · TKD (100 soal, target ≥ 300/500)</strong>
                    <span className="num">
                      {tkdTarget} ({Math.ceil(tkdTarget / 5)}/100 benar)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={500}
                    step={5}
                    value={tkdTarget}
                    onInput={(e) => setTkdTarget(Number((e.target as HTMLInputElement).value))}
                  />
                </label>

                <label className="slider-row">
                  <div className="slider-head">
                    <strong>Tahap 1 · AKHLAK (30 soal, target ≥ 95/150)</strong>
                    <span className="num">
                      {akhlakTarget} ({Math.ceil(akhlakTarget / 5)}/30 tepat)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    step={5}
                    value={akhlakTarget}
                    onInput={(e) => setAkhlakTarget(Number((e.target as HTMLInputElement).value))}
                  />
                </label>

                <label className="slider-row">
                  <div className="slider-head">
                    <strong>Tahap 2 · Bahasa Inggris (100 soal, target ≥ 300/500)</strong>
                    <span className="num">
                      {bhsTarget} ({Math.ceil(bhsTarget / 5)}/100 benar)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={500}
                    step={5}
                    value={bhsTarget}
                    onInput={(e) => setBhsTarget(Number((e.target as HTMLInputElement).value))}
                  />
                </label>
              </div>

              <div className="tip-guide-example">
                <strong>Strategi Eksekusi:</strong> Pada Tahap 1, jaga kecepatan di TKD Number Sequence &amp; Diagram Reasoning (≤ 45 detik/soal) agar poin AKHLAK tetap stabil. Pada Tahap 2, selesaikan soal Structure/Grammar lebih cepat sebagai cadangan waktu Reading panjang.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
