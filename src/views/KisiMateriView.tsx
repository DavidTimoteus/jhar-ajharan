import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Screen } from '../lib/store';
import {
  loadSubmateriIndex,
  SUBMATERI_LIST,
  type DiagramId,
  type SubmateriIndexFile,
  type SubmateriMeta,
} from '../lib/submateri';
import InteractiveDiagram from '../components/InteractiveDiagrams';
import RichText from '../components/RichText';
import ScratchPad from '../components/ScratchPad';

interface Props {
  initialFamily?: 'cpns' | 'bumn';
  initialSubmateriId?: string;
  go: (s: Screen) => void;
}

type FocusTab = 'konsep' | 'visual' | 'uji';

const CERITA_DIAGRAMS: { id: DiagramId; label: string }[] = [
  { id: 'berbalik-nilai', label: 'Pekerja & Libur' },
  { id: 'gerak-temu', label: 'Susul & Papasan' },
];

export default function KisiMateriView({
  initialFamily = 'cpns',
  initialSubmateriId,
  go,
}: Props) {
  const [family, setFamily] = useState<'cpns' | 'bumn'>(initialFamily);
  const [subFilter, setSubFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [indexData, setIndexData] = useState<SubmateriIndexFile | null>(null);
  const [selectedId, setSelectedId] = useState<string>(
    initialSubmateriId ?? 'cpns-tiu-silogisme',
  );
  const [focusTab, setFocusTab] = useState<FocusTab>('konsep');
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const [activeDiagram, setActiveDiagram] = useState<DiagramId>('berbalik-nilai');
  const [scratchOpen, setScratchOpen] = useState(false);

  useEffect(() => {
    loadSubmateriIndex()
      .then((d) => setIndexData(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setFamily(initialFamily);
    setSubFilter('ALL');
  }, [initialFamily]);

  const familyItems = useMemo(
    () => SUBMATERI_LIST.filter((s) => s.family === family),
    [family],
  );

  const subtestTabs = useMemo(() => {
    const ids = Array.from(new Set(familyItems.map((s) => s.subtestId)));
    return [
      { id: 'ALL', label: 'Semua' },
      ...ids.map((id) => ({ id, label: id === 'twk_bumn' ? 'TWK BUMN' : id.toUpperCase() })),
    ];
  }, [familyItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return familyItems.filter((item) => {
      if (subFilter !== 'ALL' && item.subtestId !== subFilter) return false;
      if (q) {
        return `${item.title} ${item.group} ${item.goal}`.toLowerCase().includes(q);
      }
      return true;
    });
  }, [familyItems, subFilter, search]);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((s) => s.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const activeItem: SubmateriMeta | undefined =
    filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? familyItems[0];

  useEffect(() => {
    setPickedOption(null);
    setFocusTab('konsep');
    if (activeItem) {
      setActiveDiagram(activeItem.diagramId);
    }
  }, [activeItem?.id]);

  const countFor = (id: string) => indexData?.submateris[id]?.count ?? 0;
  const activeCount = activeItem ? countFor(activeItem.id) : 0;

  return (
    <div className={`view kisi-page track-${family}`}>
      {/* Header Fokus Ringkas (Bebas Beban Kognitif Berlebih) */}
      <header className="kisi-topbar">
        <div className="kisi-topbar-title">
          <div className="kisi-topbar-eyebrow">
            <span className={`pill pill-${family}`}>
              {family === 'cpns' ? '21 SUBMATERI SKD CPNS' : '8 KOMPETENSI RBB BUMN'}
            </span>
            <span className="kisi-total-chip num">
              {indexData ? indexData.totalMapped.toLocaleString('id-ID') : '2.857'} soal terpetakan
            </span>
          </div>
          <h1>Kisi-Kisi &amp; Materi Bertahap</h1>
        </div>

        <div className="kisi-family-segmented" role="group" aria-label="Pilih jalur materi">
          <button
            type="button"
            className={`kisi-seg-btn ${family === 'cpns' ? 'is-active' : ''}`}
            onClick={() => {
              setFamily('cpns');
              setSubFilter('ALL');
            }}
          >
            CPNS · 21
          </button>
          <button
            type="button"
            className={`kisi-seg-btn ${family === 'bumn' ? 'is-active' : ''}`}
            onClick={() => {
              setFamily('bumn');
              setSubFilter('ALL');
            }}
          >
            BUMN · 8
          </button>
        </div>
      </header>

      {/* Tata Letak Asimetris (Rel Topik Ramping 30% + Kanvas Fokus Materi 70%) */}
      <div className="kisi-split">
        <aside className="kisi-rail" aria-label="Navigasi daftar submateri">
          <div className="kisi-rail-controls">
            <input
              type="search"
              className="kisi-rail-search"
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
              placeholder="Cari submateri…"
              aria-label="Cari submateri"
            />
            <div className="kisi-tabs-row">
              {subtestTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`chip-btn is-compact ${subFilter === t.id ? 'is-active' : ''}`}
                  onClick={() => setSubFilter(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="kisi-rail-list" role="listbox" aria-label="Daftar submateri kisi-kisi">
            {filtered.length === 0 ? (
              <div className="kisi-rail-empty">
                Tidak ada submateri yang cocok dengan kata kunci <strong>“{search}”</strong>.
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isSel = activeItem?.id === item.id;
                const cnt = countFor(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    className={`kisi-rail-item ${isSel ? 'is-selected' : ''}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="kisi-rail-item-top">
                      <span className="kisi-rail-num num">
                        {String(idx + 1).padStart(2, '0')} · {item.subtestLabel}
                      </span>
                      <span className="kisi-rail-count num">{cnt} soal</span>
                    </div>
                    <strong className="kisi-rail-title">{item.title}</strong>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {activeItem && (
          <article className="pack-stage kisi-stage">
            <div className="kisi-stage-head">
              <div className="kisi-stage-heading">
                <span className={`pill pill-${activeItem.family}`}>{activeItem.group}</span>
                <h2>{activeItem.title}</h2>
                <p className="kisi-stage-goal">
                  <RichText text={activeItem.goal} inline />
                </p>
              </div>
              <div className="kisi-head-actions">
                <button
                  type="button"
                  className={`btn btn-sm ${scratchOpen ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setScratchOpen((v) => !v)}
                  aria-pressed={scratchOpen}
                >
                  ✎ Coretan Pintar
                </button>
                <div className="kisi-count-pill num" title="Total soal terpetakan di submateri ini">
                  <strong>{activeCount}</strong>
                  <small>soal</small>
                </div>
              </div>
            </div>

            {/* Stepper Progres 3 Tahap: chunking kognitif agar hanya 1 beban fokus tampil per layar */}
            <div className="kisi-stepper-tabs" role="tablist" aria-label="Tahap belajar submateri">
              <button
                type="button"
                role="tab"
                aria-selected={focusTab === 'konsep'}
                className={`kisi-step-tab ${focusTab === 'konsep' ? 'is-active' : ''}`}
                onClick={() => setFocusTab('konsep')}
              >
                <span className="kisi-step-badge num">1</span>
                <span>Konsep &amp; Trik Cepat</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={focusTab === 'visual'}
                className={`kisi-step-tab ${focusTab === 'visual' ? 'is-active' : ''}`}
                onClick={() => setFocusTab('visual')}
              >
                <span className="kisi-step-badge num">2</span>
                <span>Gambar Interaktif</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={focusTab === 'uji'}
                className={`kisi-step-tab ${focusTab === 'uji' ? 'is-active' : ''}`}
                onClick={() => setFocusTab('uji')}
              >
                <span className="kisi-step-badge num">3</span>
                <span>Tes Paham (10 dtk)</span>
              </button>
            </div>

            {focusTab === 'konsep' && (
              <div className="kisi-focus-pane">
                <section className="psych-card is-analogy">
                  <span className="psych-step-num">Analogi Sederhana</span>
                  <p><RichText text={activeItem.analogy} /></p>
                </section>

                <section className="psych-card is-core">
                  <span className="psych-step-num">Rumus Inti &amp; 3 Langkah Eksekusi</span>
                  <p><RichText text={activeItem.coreRule} /></p>
                  <ol className="psych-steps-list">
                    {activeItem.fastSteps.map((st, i) => (
                      <li key={i}>
                        <RichText text={st} inline />
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="psych-card is-trap">
                  <span className="psych-step-num">Waspada Jebakan</span>
                  <p><RichText text={activeItem.commonTrap} /></p>
                </section>

                <div className="kisi-next-cue">
                  <button
                    type="button"
                    className="kisi-next-link"
                    onClick={() => setFocusTab('visual')}
                  >
                    Lanjut ke Tahap 2: Lihat Gambar Interaktif →
                  </button>
                </div>
              </div>
            )}

            {focusTab === 'visual' && (
              <div className="kisi-focus-pane">
                {activeItem.id === 'cpns-tiu-cerita' && (
                  <div className="visual-switcher-row">
                    {CERITA_DIAGRAMS.map((dl) => (
                      <button
                        key={dl.id}
                        type="button"
                        className={`chip-btn ${activeDiagram === dl.id ? 'is-active' : ''}`}
                        onClick={() => setActiveDiagram(dl.id)}
                      >
                        {dl.label}
                      </button>
                    ))}
                  </div>
                )}
                <InteractiveDiagram
                  diagramId={
                    activeItem.id === 'cpns-tiu-cerita' ? activeDiagram : activeItem.diagramId
                  }
                  submateriId={activeItem.id}
                />
                <div className="kisi-next-cue">
                  <button
                    type="button"
                    className="kisi-next-link"
                    onClick={() => setFocusTab('uji')}
                  >
                    Lanjut ke Tahap 3: Tes Pemahaman 10 Detik →
                  </button>
                </div>
              </div>
            )}

            {focusTab === 'uji' && (
              <div className="kisi-focus-pane">
                <section className="psych-card is-recall">
                  <span className="psych-step-num">Uji Pemahaman Singkat</span>
                  <p className="recall-prompt">
                    <RichText text={activeItem.microCheck.prompt} />
                  </p>
                  <div className="recall-options">
                    {activeItem.microCheck.options.map((opt, idx) => {
                      const answered = pickedOption !== null;
                      const isRight = idx === activeItem.microCheck.answerIndex;
                      const isMine = idx === pickedOption;
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`recall-opt-btn ${
                            answered && isRight
                              ? 'is-correct'
                              : answered && isMine && !isRight
                                ? 'is-wrong'
                                : ''
                          }`}
                          onClick={() => setPickedOption(idx)}
                        >
                          <span className="recall-letter">{String.fromCharCode(65 + idx)}</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {pickedOption !== null && (
                    <div
                      className={`recall-feedback ${
                        pickedOption === activeItem.microCheck.answerIndex ? 'is-ok' : 'is-retry'
                      }`}
                    >
                      <RichText text={activeItem.microCheck.feedback} />
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* Satu Baris Aksi Utama */}
            <div className="stage-primary-actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={activeCount === 0}
                onClick={() =>
                  go({
                    name: 'workbench',
                    packId: `submateri:${activeItem.id}`,
                    mode: 'latihan',
                    limit: 15,
                  })
                }
              >
                Latih 15 Soal Submateri Ini →
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                disabled={activeCount === 0}
                onClick={() =>
                  go({
                    name: 'workbench',
                    packId: `submateri:${activeItem.id}`,
                    mode: 'latihan',
                  })
                }
              >
                Semua ({activeCount} Soal)
              </button>
            </div>
          </article>
        )}
      </div>

      {activeItem && (
        <ScratchPad
          open={scratchOpen}
          scopeKey={`materi:${activeItem.id}`}
          subtitle={activeItem.title}
          dockMode="floating"
          canToggleDock={false}
          onClose={() => setScratchOpen(false)}
        />
      )}
    </div>
  );
}
