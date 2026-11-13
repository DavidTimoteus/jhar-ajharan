import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Attempt, PackMeta } from '../lib/types';
import { loadMetas } from '../lib/packs';
import { listAttempts } from '../lib/db';
import type { Screen } from '../lib/store';
import { useSessionState } from '../lib/session';
import SlidingTabs, { type TabOption } from '../components/SlidingTabs';
import RadialGauge from '../components/RadialGauge';
import TipsDrawer from '../components/TipsDrawer';

interface Props {
  family: 'cpns' | 'bumn';
  go: (s: Screen) => void;
}

type FilterId = 'all' | 'full' | 'focused' | 'stage1' | 'stage2';

const SUBTEST_LABELS: Record<string, string> = {
  twk: 'TWK',
  tiu: 'TIU',
  tkp: 'TKP',
  tkd: 'TKD',
  akhlak: 'AKHLAK',
  twk_bumn: 'TWK BUMN',
  bhs: 'Bahasa Inggris',
  agility: 'Learning Agility',
};

const TRACK_COPY = {
  cpns: {
    pill: 'SKD CPNS · CAT BKN',
    title: 'Persiapan Seleksi Kompetensi Dasar',
    desc: 'Mengacu KepmenPANRB No. 321 Tahun 2024: 110 soal dalam 100 menit (30 TWK, 35 TIU, 45 TKP bobot 1–5). Pilih mode Latihan untuk melihat Tips & Trik per soal, atau Simulasi untuk ujian penuh berbatas waktu.',
    defaultPack: 'cpns-skd-2026-p1',
    quickDrills: [
      { pack: 'cpns-skd-kisi-terbaru', subtest: undefined, label: 'Kisi 21 Subtes' },
      { pack: 'cpns-skd-2026-p1', subtest: 'twk', label: 'Fokus TWK' },
      { pack: 'cpns-skd-2026-p1', subtest: 'tiu', label: 'Fokus TIU' },
      { pack: 'cpns-skd-2026-p1', subtest: 'tkp', label: 'Fokus TKP' },
      { pack: 'cpns-tiu-hots-drill', subtest: 'tiu', label: 'TIU HOTS' },
    ],
    subtestSpecs: [
      { code: 'TWK', name: 'Wawasan Kebangsaan', detail: '30 soal · PG 65 / 150' },
      { code: 'TIU', name: 'Intelegensi Umum', detail: '35 soal · PG 80 / 175' },
      { code: 'TKP', name: 'Karakteristik Pribadi', detail: '45 soal · PG 166 / 225' },
    ],
  },
  bumn: {
    pill: 'REKRUTMEN BERSAMA BUMN · FHCI',
    title: 'Persiapan Tes Online RBB BUMN',
    desc: 'Mencakup lengkap materi seleksi BUMN: Tahap 1 (TKD Verbal/Deret/Klasifikasi/Diagram, AKHLAK, TWK BUMN) dan Tahap 2 (Bahasa Inggris & Learning Agility).',
    defaultPack: 'rbb-bumn-2026-tahap1',
    quickDrills: [
      { pack: 'rbb-bumn-2026-tahap1', subtest: 'tkd', label: 'Fokus TKD' },
      { pack: 'rbb-bumn-2026-tahap1', subtest: 'akhlak', label: 'Fokus AKHLAK' },
      { pack: 'rbb-bumn-2026-tahap1', subtest: 'twk_bumn', label: 'TWK BUMN' },
      { pack: 'rbb-bumn-2026-tahap2', subtest: 'bhs', label: 'B. Inggris' },
      { pack: 'rbb-bumn-2026-tahap2', subtest: 'agility', label: 'Learning Agility' },
    ],
    subtestSpecs: [
      { code: 'TKD & TWK', name: 'Kemampuan Dasar & Kebangsaan', detail: 'Verbal · Deret · Diagram · TWK' },
      { code: 'AKHLAK', name: 'Core Values BUMN', detail: 'Amanah · Kompeten · Harmonis · Loyal · Adaptif · Kolaboratif' },
      { code: 'Tahap 2', name: 'Bahasa Inggris & Agility', detail: 'Grammar · Error ID · Reading · Learning Agility' },
    ],
  },
} as const;

export default function TrackView({ family, go }: Props) {
  const { active: session } = useSessionState();
  const [metas, setMetas] = useState<PackMeta[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [filter, setFilter] = useState<FilterId>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [tipsOpen, setTipsOpen] = useState(false);

  useEffect(() => {
    setFilter('all');
    setSearch('');
    Promise.all([loadMetas(), listAttempts(session.id)]).then(([m, a]) => {
      const fam = m.filter((x) => x.family === family);
      setMetas(fam);
      setAttempts(a);
      const preferred =
        fam.find((x) => x.id === TRACK_COPY[family].defaultPack)?.id ?? fam[0]?.id ?? '';
      setSelectedId(preferred);
    });
  }, [family, session.id]);

  const copy = TRACK_COPY[family];
  const totalQ = metas.reduce((s, m) => s + m.count, 0);

  const answeredForPack = (packId: string) => {
    const pAttempts = attempts.filter((a) => a.packId === packId);
    const uniqueQ = new Set<string>();
    for (const a of pAttempts) {
      for (const k of Object.keys(a.answers)) uniqueQ.add(k);
    }
    return { count: pAttempts.length, uniqueAnswered: uniqueQ.size };
  };

  const tabs: TabOption<FilterId>[] = useMemo(() => {
    if (family === 'cpns') {
      const fullCount = metas.filter((m) => m.count >= 90).length;
      const focusedCount = metas.filter((m) => m.count < 90).length;
      return [
        { id: 'all', label: 'Semua Paket', count: metas.length },
        { id: 'full', label: 'Simulasi Penuh (90–119 Soal)', count: fullCount },
        { id: 'focused', label: 'Fokus HOTS & Kilat', count: focusedCount },
      ];
    }
    const s1 = metas.filter(
      (m) => m.subtests?.some((s) => s === 'tkd' || s === 'akhlak' || s === 'twk_bumn'),
    ).length;
    const s2 = metas.filter(
      (m) => m.subtests?.some((s) => s === 'bhs' || s === 'agility'),
    ).length;
    return [
      { id: 'all', label: 'Semua Paket', count: metas.length },
      { id: 'stage1', label: 'Tahap 1 (TKD · AKHLAK · TWK)', count: s1 },
      { id: 'stage2', label: 'Tahap 2 (B.Inggris · Agility)', count: s2 },
    ];
  }, [metas, family]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return metas.filter((m) => {
      if (filter === 'full' && m.count < 90) return false;
      if (filter === 'focused' && m.count >= 90) return false;
      if (
        filter === 'stage1' &&
        !m.subtests?.some((s) => s === 'tkd' || s === 'akhlak' || s === 'twk_bumn')
      )
        return false;
      if (
        filter === 'stage2' &&
        !m.subtests?.some((s) => s === 'bhs' || s === 'agility')
      )
        return false;
      if (q) {
        const hay = `${m.name} ${m.note ?? ''} ${(m.subtests ?? []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [metas, filter, search]);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((m) => m.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const activePack = filtered.find((m) => m.id === selectedId) ?? filtered[0] ?? null;
  const activeStats = activePack ? answeredForPack(activePack.id) : { count: 0, uniqueAnswered: 0 };
  const activePct =
    activePack && activePack.count > 0
      ? Math.min(100, Math.round((activeStats.uniqueAnswered / activePack.count) * 100))
      : 0;

  return (
    <div className={`view track-page track-${family}`}>
      {/* Studio Header Card (soft physical elevation, non-flat) */}
      <section className="track-banner">
        <div className="track-banner-main">
          <div className="track-banner-top">
            <span className={`pill pill-${family}`}>{copy.pill}</span>
            <div className="track-banner-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => go({ name: 'materi', family })}
              >
                ◫ Kisi Submateri &amp; Visual
              </button>
              <button
                type="button"
                className="btn btn-tips-guide btn-sm"
                onClick={() => setTipsOpen(true)}
              >
                ✦ Rumus &amp; Lab Cepat
              </button>
            </div>
          </div>
          <h1>{copy.title}</h1>
          <p className="track-banner-desc">{copy.desc}</p>

          <div className="track-specs-row">
            {copy.subtestSpecs.map((spec) => (
              <div key={spec.code} className="spec-item">
                <span className="spec-code">{spec.code}</span>
                <strong className="spec-name">{spec.name}</strong>
                <span className="spec-detail">{spec.detail}</span>
              </div>
            ))}
          </div>

          <div className="quick-drill-bar">
            <span className="quick-drill-label">Mulai Cepat per Subtes:</span>
            <div className="quick-drill-pills">
              {copy.quickDrills.map((d) => (
                <button
                  key={`${d.pack}-${d.subtest}`}
                  type="button"
                  className="chip-btn"
                  onClick={() =>
                    go({ name: 'workbench', packId: d.pack, mode: 'latihan', subtest: d.subtest })
                  }
                >
                  {d.label} →
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="track-banner-stat">
          <div className="banner-stat-num num">{totalQ.toLocaleString('id-ID')}</div>
          <div className="banner-stat-label">Soal Terverifikasi</div>
          <div className="banner-stat-sub">{metas.length} paket latihan &amp; try out</div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 12, width: '100%' }}
            onClick={() => go({ name: 'settings' })}
          >
            + Tambah Bank Soal
          </button>
        </aside>
      </section>

      {/* Filter & Search Bar — Only relevant exam focus */}
      <div className="catalog-toolbar">
        <SlidingTabs value={filter} items={tabs} onChange={setFilter} />
        <div className="toolbar-search">
          <input
            type="search"
            className="search-input"
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            placeholder={`Cari paket ${family.toUpperCase()}…`}
            aria-label={`Cari paket ${family.toUpperCase()}`}
          />
        </div>
      </div>

      {/* Brilliant / IELTS Master-Detail Selector */}
      {filtered.length === 0 ? (
        <div className="empty-state-card">
          <p>Tidak ada paket yang cocok dengan kata kunci "{search}".</p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setFilter('all');
              setSearch('');
            }}
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="arena-split">
          {/* Left: Interactive Package List */}
          <div className="pack-list" role="listbox" aria-label={`Daftar paket ${family.toUpperCase()}`}>
            {filtered.map((meta, idx) => {
              const selected = activePack?.id === meta.id;
              const stats = answeredForPack(meta.id);
              const pct =
                meta.count > 0
                  ? Math.min(100, Math.round((stats.uniqueAnswered / meta.count) * 100))
                  : 0;
              return (
                <button
                  key={meta.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`pack-row ${selected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedId(meta.id)}
                >
                  <div className="pack-row-top">
                    <span className="pack-row-index num">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="pack-row-badges">
                      {(meta.subtests ?? []).map((st) => (
                        <span key={st} className="subtest-chip">
                          {SUBTEST_LABELS[st] ?? st.toUpperCase()}
                        </span>
                      ))}
                      {meta.custom && <span className="subtest-chip is-custom">Kustom</span>}
                    </div>
                  </div>

                  <h3 className="pack-row-title">{meta.name}</h3>

                  <div className="pack-row-meta num">
                    <span>{meta.count} soal</span>
                    <span>·</span>
                    <span>{meta.durationMin ?? 60} menit</span>
                    <span className="pack-row-pct">{pct > 0 ? `${pct}% selesai` : 'Siap dikerjakan'}</span>
                  </div>

                  <div className="pack-row-bar">
                    <div className="pack-row-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Sticky Launch Stage */}
          {activePack && (
            <aside className="pack-stage">
              <div className="stage-header">
                <div className="stage-header-text">
                  <div className="stage-chips">
                    <span className={`pill pill-${family}`}>{family.toUpperCase()}</span>
                    <span className="stage-duration num">
                      {activePack.count} soal · {activePack.durationMin ?? 60} menit
                    </span>
                  </div>
                  <h2>{activePack.name}</h2>
                </div>
                <RadialGauge
                  value={activePct}
                  size={68}
                  stroke={6}
                  accent={family === 'cpns' ? 'var(--accent-cpns)' : 'var(--accent-bumn)'}
                  label={`${activePct}%`}
                  sublabel="selesai"
                />
              </div>

              <p className="stage-note">
                {activePack.note ||
                  `Paket latihan ${activePack.name} lengkap dengan pembahasan dan tips cepat di mode latihan.`}
              </p>

              <div className="stage-modes-info">
                <div className="mode-desc-box">
                  <strong>Mode Latihan + Tips</strong>
                  <span>Tips &amp; Trik tampil di samping soal + koreksi &amp; pembahasan instan tiap menjawab.</span>
                </div>
                <div className="mode-desc-box">
                  <strong>Simulasi CAT Ujian</strong>
                  <span>Waktu hitung mundur standar CAT resmi tanpa bantuan hingga seluruh jawaban dikumpulkan.</span>
                </div>
              </div>

              <div className="stage-primary-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() =>
                    go({ name: 'workbench', packId: activePack.id, mode: 'latihan' })
                  }
                >
                  Mulai Latihan + Tips →
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() =>
                    go({ name: 'workbench', packId: activePack.id, mode: 'simulasi' })
                  }
                >
                  Simulasi CAT ({activePack.durationMin ?? 60} mnt)
                </button>
              </div>

              {activePack.subtests && activePack.subtests.length > 1 && (
                <div className="stage-subtest-drill">
                  <span className="stage-sub-title">Atau kerjakan per subtes saja (Mode Latihan):</span>
                  <div className="stage-sub-pills">
                    {activePack.subtests.map((st) => (
                      <button
                        key={st}
                        type="button"
                        className="chip-btn"
                        onClick={() =>
                          go({
                            name: 'workbench',
                            packId: activePack.id,
                            mode: 'latihan',
                            subtest: st,
                          })
                        }
                      >
                        Latih {SUBTEST_LABELS[st] ?? st.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="stage-bottom-row">
                <button
                  type="button"
                  className="btn-text-link"
                  onClick={() => setTipsOpen(true)}
                >
                  ✦ Baca Panduan Rumus &amp; Jurus Cepat {family.toUpperCase()}
                </button>
              </div>
            </aside>
          )}
        </div>
      )}

      <TipsDrawer
        open={tipsOpen}
        family={family}
        onClose={() => setTipsOpen(false)}
      />
    </div>
  );
}
