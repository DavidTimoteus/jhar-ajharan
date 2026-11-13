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

interface Props {
  initialFamily?: 'cpns' | 'bumn';
  initialSubmateriId?: string;
  go: (s: Screen) => void;
}

type FocusTab = 'konsep' | 'visual' | 'uji';

const DIAGRAM_LABELS: { id: DiagramId; label: string }[] = [
  { id: 'berbalik-nilai', label: 'Pekerja & Libur' },
  { id: 'gerak-temu', label: 'Susul & Papasan' },
  { id: 'silogisme-venn', label: 'Venn Silogisme' },
  { id: 'persen-tangki', label: 'Diskon 100 Petak' },
  { id: 'deret-scanner', label: 'Scanner Deret' },
  { id: 'tkp-akhlak-radar', label: 'Filter Poin 5' },
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
    if (activeItem?.diagramId) {
      setActiveDiagram(activeItem.diagramId);
    }
  }, [activeItem?.id]);

  const countFor = (id: string) => indexData?.submateris[id]?.count ?? 0;
  const activeCount = activeItem ? countFor(activeItem.id) : 0;

  return (
    <div className={`view kisi-page track-${family}`}>
      {/* Header Kisi Ringkas & Fokus */}
      <section className="track-banner is-compact">
        <div className="track-banner-main">
          <div className="track-banner-top">
            <span className={`pill pill-${family}`}>
              {family === 'cpns' ? '21 SUBMATERI SKD CPNS' : '8 KOMPETENSI RBB BUMN'}
            </span>
            <div className="kisi-family-switch">
              <button
                type="button"
                className={`chip-btn ${family === 'cpns' ? 'is-active' : ''}`}
                onClick={() => {
                  setFamily('cpns');
                  setSubFilter('ALL');
                }}
              >
                CPNS (21)
              </button>
              <button
                type="button"
                className={`chip-btn ${family === 'bumn' ? 'is-active' : ''}`}
                onClick={() => {
                  setFamily('bumn');
                  setSubFilter('ALL');
                }}
              >
                BUMN (8)
              </button>
            </div>
          </div>

          <h1>Kisi-Kisi &amp; Materi Bertahap</h1>
          <p className="track-banner-desc">
            Pilih satu submateri di sebelah kiri, pelajari satu tahap dalam satu waktu, lalu langsung uji dengan latihan soal terfokus.
          </p>
        </div>

        <aside className="track-banner-stat">
          <div className="banner-stat-num num">
            {indexData ? indexData.totalMapped.toLocaleString('id-ID') : '2.857'}
          </div>
          <div className="banner-stat-label">Soal Terpetakan</div>
        </aside>
      </section>

      <div className="catalog-toolbar">
        <div className="kisi-tabs-row">
          {subtestTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`chip-btn ${subFilter === t.id ? 'is-active' : ''}`}
              onClick={() => setSubFilter(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="toolbar-search">
          <input
            type="search"
            className="search-input"
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            placeholder="Cari submateri…"
            aria-label="Cari submateri"
          />
        </div>
      </div>

      {/* Master-Detail: Daftar Kiri Ringkas + Stage Fokus Bertahap (1 Tab Aktif Sekali Lihat) */}
      <div className="arena-split kisi-split">
        <div className="pack-list" role="listbox" aria-label="Daftar submateri kisi-kisi">
          {filtered.map((item, idx) => {
            const isSel = activeItem?.id === item.id;
            const cnt = countFor(item.id);
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isSel}
                className={`pack-row is-calm ${isSel ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                <div className="pack-row-top">
                  <span className="pack-row-index num">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="subtest-chip">{item.subtestLabel}</span>
                </div>
                <h3 className="pack-row-title">{item.title}</h3>
                <div className="pack-row-meta num">
                  <span>{cnt} soal</span>
                  {item.diagramId && <span>· Gambar Interaktif</span>}
                </div>
              </button>
            );
          })}
        </div>

        {activeItem && (
          <article className="pack-stage kisi-stage">
            <div className="kisi-stage-head">
              <div>
                <span className={`pill pill-${activeItem.family}`}>{activeItem.group}</span>
                <h2>{activeItem.title}</h2>
                <p className="muted small">
                  <RichText text={activeItem.goal} inline />
                </p>
              </div>
              <div className="kisi-count-pill num">
                <strong>{activeCount}</strong>
                <small>soal</small>
              </div>
            </div>

            {/* Stepper Fokus: Hanya 1 Konteks Visual Ditampilkan Sekali Waktu */}
            <div className="kisi-stepper-tabs" role="tablist" aria-label="Tahap belajar submateri">
              <button
                type="button"
                role="tab"
                aria-selected={focusTab === 'konsep'}
                className={`kisi-step-tab ${focusTab === 'konsep' ? 'is-active' : ''}`}
                onClick={() => setFocusTab('konsep')}
              >
                1. Konsep &amp; Trik Cepat
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={focusTab === 'visual'}
                className={`kisi-step-tab ${focusTab === 'visual' ? 'is-active' : ''}`}
                onClick={() => setFocusTab('visual')}
              >
                2. Gambar Interaktif
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={focusTab === 'uji'}
                className={`kisi-step-tab ${focusTab === 'uji' ? 'is-active' : ''}`}
                onClick={() => setFocusTab('uji')}
              >
                3. Tes Paham (10 dtk)
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
              </div>
            )}

            {focusTab === 'visual' && (
              <div className="kisi-focus-pane">
                {(activeItem.id === 'cpns-tiu-cerita' || !activeItem.diagramId) && (
                  <div className="visual-switcher-row">
                    {(activeItem.id === 'cpns-tiu-cerita'
                      ? DIAGRAM_LABELS.slice(0, 2)
                      : DIAGRAM_LABELS
                    ).map((dl) => (
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
                    activeItem.diagramId && activeItem.id !== 'cpns-tiu-cerita'
                      ? activeItem.diagramId
                      : activeDiagram
                  }
                />
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
    </div>
  );
}
