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
      { id: 'ALL', label: 'Semua Submateri' },
      ...ids.map((id) => ({ id, label: id === 'twk_bumn' ? 'TWK BUMN' : id.toUpperCase() })),
    ];
  }, [familyItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return familyItems.filter((item) => {
      if (subFilter !== 'ALL' && item.subtestId !== subFilter) return false;
      if (q) {
        return `${item.title} ${item.group} ${item.goal} ${item.analogy}`
          .toLowerCase()
          .includes(q);
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
    if (activeItem?.diagramId) {
      setActiveDiagram(activeItem.diagramId);
    }
  }, [activeItem?.id]);

  const countFor = (id: string) => indexData?.submateris[id]?.count ?? 0;
  const activeCount = activeItem ? countFor(activeItem.id) : 0;

  return (
    <div className={`view kisi-page track-${family}`}>
      {/* Banner Psikologi Belajar & Navigasi Kisi-Kisi */}
      <section className="track-banner kisi-banner">
        <div className="track-banner-main">
          <div className="track-banner-top">
            <span className={`pill pill-${family}`}>
              {family === 'cpns' ? 'KISI-KISI 21 SUBMATERI SKD CPNS' : 'KISI-KISI KOMPETENSI RBB BUMN'}
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
                Jalur CPNS (21 Submateri)
              </button>
              <button
                type="button"
                className={`chip-btn ${family === 'bumn' ? 'is-active' : ''}`}
                onClick={() => {
                  setFamily('bumn');
                  setSubFilter('ALL');
                }}
              >
                Jalur BUMN (8 Kompetensi)
              </button>
            </div>
          </div>

          <h1>Pusat Kisi-Kisi, Materi Psikologis &amp; Lab Visual</h1>
          <p className="track-banner-desc">
            Dirancang memakai metode <strong>Dual Coding (Visual + Bahasa Sehari-hari)</strong> dan{' '}
            <strong>Chunking 3 Detik</strong> agar konsep sulit bisa dipahami siapa saja, lalu langsung diuji lewat latihan terfokus per submateri.
          </p>

          <div className="psych-legend-strip">
            <span className="psych-key">
              <strong className="rt-bold">Tebal</strong> = Konsep Inti
            </span>
            <span className="psych-key">
              <u className="rt-underline">Garis Bawah</u> = Syarat Wajib / Pembalik
            </span>
            <span className="psych-key">
              <del className="rt-strike">Coret</del> = Jebakan / Cara Keliru
            </span>
            <span className="psych-key">
              <mark className="rt-highlight">Sorotan</mark> = Rumus Kunci / Poin 5
            </span>
          </div>
        </div>

        <aside className="track-banner-stat">
          <div className="banner-stat-num num">
            {indexData ? indexData.totalMapped.toLocaleString('id-ID') : '2.857'}
          </div>
          <div className="banner-stat-label">Soal Terindeks per Submateri</div>
          <div className="banner-stat-sub">Akses instan lintas seluruh paket</div>
        </aside>
      </section>

      {/* Filter Subtes & Pencarian Kisi-Kisi */}
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
            placeholder="Cari submateri (mis. Silogisme, UUD, TIK, Deret)…"
            aria-label="Cari submateri kisi-kisi"
          />
        </div>
      </div>

      {/* Master-Detail: Daftar Kisi-Kisi Kiri + Studio Materi Psikologi Kanan */}
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
                className={`pack-row kisi-row ${isSel ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                <div className="pack-row-top">
                  <span className="pack-row-index num">{String(idx + 1).padStart(2, '0')}</span>
                  <div className="pack-row-badges">
                    <span className="subtest-chip">{item.subtestLabel}</span>
                    {item.diagramId && <span className="subtest-chip is-visual">✦ Lab Visual</span>}
                  </div>
                </div>
                <h3 className="pack-row-title">{item.title}</h3>
                <div className="pack-row-meta num">
                  <span>{cnt} soal siap latih</span>
                  <span>·</span>
                  <span>{item.psychTechnique}</span>
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
                <span className="psych-pill">🧠 Teknik Otak: {activeItem.psychTechnique}</span>
              </div>
              <div className="kisi-count-pill num">
                <strong>{activeCount}</strong>
                <small>soal tersedia</small>
              </div>
            </div>

            {/* Tahap 1: Apa yang Diuji */}
            <section className="psych-card is-goal">
              <span className="psych-step-num">1 · Gambaran Besar</span>
              <p><RichText text={activeItem.goal} /></p>
            </section>

            {/* Tahap 2: Analogi Kehidupan Nyata (Concrete Anchoring / Feynman) */}
            <section className="psych-card is-analogy">
              <span className="psych-step-num">2 · Analogi Sederhana (Orang Awam Pasti Paham)</span>
              <p><RichText text={activeItem.analogy} /></p>
            </section>

            {/* Tahap 3: Lab Visual Interaktif */}
            <section className="psych-visual-slot">
              {activeItem.id === 'cpns-tiu-cerita' ? (
                <div className="visual-switcher-row">
                  <span className="small muted">Pilih Lab Visual Soal Cerita:</span>
                  <button
                    type="button"
                    className={`chip-btn ${activeDiagram === 'berbalik-nilai' ? 'is-active' : ''}`}
                    onClick={() => setActiveDiagram('berbalik-nilai')}
                  >
                    Pekerja &amp; Libur
                  </button>
                  <button
                    type="button"
                    className={`chip-btn ${activeDiagram === 'gerak-temu' ? 'is-active' : ''}`}
                    onClick={() => setActiveDiagram('gerak-temu')}
                  >
                    Susul &amp; Papasan
                  </button>
                </div>
              ) : !activeItem.diagramId ? (
                <div className="visual-switcher-row">
                  <span className="small muted">Jelajahi Lab Visual Interaktif:</span>
                  {DIAGRAM_LABELS.map((dl) => (
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
              ) : null}
              <InteractiveDiagram diagramId={activeItem.diagramId ? (activeItem.id === 'cpns-tiu-cerita' ? activeDiagram : activeItem.diagramId) : activeDiagram} />
            </section>

            {/* Tahap 4: Rumus / Aturan Kunci & Langkah 3 Detik (Chunking) */}
            <section className="psych-card is-core">
              <span className="psych-step-num">3 · Aturan Emas &amp; Langkah 3 Detik</span>
              <p><RichText text={activeItem.coreRule} /></p>
              <ol className="psych-steps-list">
                {activeItem.fastSteps.map((st, i) => (
                  <li key={i}>
                    <RichText text={st} inline />
                  </li>
                ))}
              </ol>
            </section>

            {/* Tahap 5: Alarm Anti-Jebakan */}
            <section className="psych-card is-trap">
              <span className="psych-step-num">4 · Alarm Jebakan (Coret Kebiasaan Salah Ini!)</span>
              <p><RichText text={activeItem.commonTrap} /></p>
            </section>

            {/* Tahap 6: Active Recall 10 Detik */}
            <section className="psych-card is-recall">
              <span className="psych-step-num">5 · Tes Paham 10 Detik (Active Recall)</span>
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

            {/* Tombol Latihan Terfokus Submateri */}
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
                Latih 15 Soal Submateri Ini + Tips →
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
                Buka Semua ({activeCount} Soal)
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

