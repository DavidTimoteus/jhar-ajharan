import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Attempt, PackMeta, TrackId } from '../lib/types';
import { loadMetas } from '../lib/packs';
import { listAttempts } from '../lib/db';
import type { Screen } from '../lib/store';
import { useSessionState } from '../lib/session';
import { getTrackConfig } from '../lib/tracks';
import SlidingTabs, { type TabOption } from '../components/SlidingTabs';
import TipsDrawer from '../components/TipsDrawer';

interface Props {
  family: TrackId;
  go: (s: Screen) => void;
}

type FilterId = 'all' | 'full' | 'focused' | 'stage1' | 'stage2';

export default function TrackView({ family, go }: Props) {
  const { active: session } = useSessionState();
  const [metas, setMetas] = useState<PackMeta[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [filter, setFilter] = useState<FilterId>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [tipsOpen, setTipsOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);

  const track = useMemo(() => getTrackConfig(family), [family]);
  const tipsFamily: 'cpns' | 'bumn' = family === 'bumn' ? 'bumn' : 'cpns';

  useEffect(() => {
    setFilter('all');
    setSearch('');
    setSpecsOpen(false);
    Promise.all([loadMetas(), listAttempts(session.id)]).then(([m, a]) => {
      const fam = m.filter((x) => x.family === family);
      setMetas(fam);
      setAttempts(a);
      const preferred =
        (track.defaultPack && fam.find((x) => x.id === track.defaultPack)?.id) ||
        fam[0]?.id ||
        '';
      setSelectedId(preferred);
    });
  }, [family, session.id, track.defaultPack]);

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
        { id: 'full', label: 'Simulasi Penuh (90+)', count: fullCount },
        { id: 'focused', label: 'Fokus & Kilat', count: focusedCount },
      ];
    }
    if (family === 'bumn') {
      const s1 = metas.filter(
        (m) => m.subtests?.some((s) => s === 'tkd' || s === 'akhlak' || s === 'twk_bumn'),
      ).length;
      const s2 = metas.filter(
        (m) => m.subtests?.some((s) => s === 'bhs' || s === 'agility'),
      ).length;
      return [
        { id: 'all', label: 'Semua Paket', count: metas.length },
        { id: 'stage1', label: 'Tahap 1', count: s1 },
        { id: 'stage2', label: 'Tahap 2', count: s2 },
      ];
    }
    return [{ id: 'all', label: 'Semua Paket', count: metas.length }];
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

  return (
    <div className={`view track-page track-${family === 'bumn' ? 'bumn' : 'cpns'}`}>
      {/* Header Arena Tenang: Fokus pada jalur & aksi utama tanpa tumpukan kotak */}
      <section className="track-banner is-compact">
        <div className="track-banner-main">
          <div className="track-banner-top">
            <span className={`pill pill-${family === 'bumn' ? 'bumn' : 'cpns'}`}>
              {track.pill}
            </span>
            <div className="track-banner-actions">
              {track.supportsKisi && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    go({ name: 'materi', family: family === 'bumn' ? 'bumn' : 'cpns' })
                  }
                >
                  ◫ Kisi Submateri
                </button>
              )}
              {track.specs.length > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSpecsOpen((v) => !v)}
                  aria-expanded={specsOpen}
                >
                  {specsOpen ? 'Tutup Info Kisi ▴' : 'Struktur & Kisi ▾'}
                </button>
              )}
            </div>
          </div>

          <h1>{track.title}</h1>
          <p className="track-banner-desc">{track.description}</p>

          {specsOpen && track.specs.length > 0 && (
            <div className="track-specs-row">
              {track.specs.map((spec) => (
                <div key={spec.code} className="spec-item">
                  <span className="spec-code">{spec.code}</span>
                  <strong className="spec-name">{spec.name}</strong>
                  <span className="spec-detail">{spec.detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="track-banner-stat">
          <div className="banner-stat-num num">{totalQ.toLocaleString('id-ID')}</div>
          <div className="banner-stat-label">Soal Tersedia</div>
          <div className="banner-stat-sub">{metas.length} paket di jalur ini</div>
        </aside>
      </section>

      {metas.length === 0 ? (
        <div className="empty-state-card">
          <h3>Jalur {track.shortLabel} Siap Digunakan dengan Bank Soal Kustom</h3>
          <p className="muted">
            Paket bawaan untuk jalur ini sedang dipersiapkan pada pembaruan kurikulum berikutnya. Anda tetap bisa langsung mengimpor file soal JSON berformat standar ke jalur ini sekarang.
          </p>
          <div className="stage-primary-actions" style={{ marginTop: 14 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => go({ name: 'settings' })}
            >
              + Impor Paket Soal (.json) ke {track.shortLabel}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => go({ name: 'home' })}
            >
              ← Kembali ke Beranda
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="catalog-toolbar">
            <SlidingTabs value={filter} items={tabs} onChange={setFilter} />
            <div className="toolbar-search">
              <input
                type="search"
                className="search-input"
                value={search}
                onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
                placeholder={`Cari paket ${track.shortLabel}…`}
                aria-label={`Cari paket ${track.shortLabel}`}
              />
            </div>
          </div>

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
              {/* Daftar Paket Ringkas: Hanya Judul, Jumlah Soal, Durasi & Progres */}
              <div className="pack-list" role="listbox" aria-label={`Daftar paket ${track.shortLabel}`}>
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
                      className={`pack-row is-calm ${selected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedId(meta.id)}
                    >
                      <div className="pack-row-top">
                        <span className="pack-row-index num">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="pack-row-pct num">
                          {pct > 0 ? `${pct}%` : `${meta.durationMin ?? 60} mnt`}
                        </span>
                      </div>

                      <h3 className="pack-row-title">{meta.name}</h3>

                      <div className="pack-row-meta num">
                        <span>{meta.count} soal</span>
                        {meta.custom && <span>· Kustom</span>}
                      </div>

                      <div className="pack-row-bar">
                        <div className="pack-row-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Panggung Aksi Fokus: 1 Judul + 2 Tombol Utama */}
              {activePack && (
                <aside className="pack-stage">
                  <div className="stage-header-text">
                    <div className="stage-chips">
                      <span className={`pill pill-${family === 'bumn' ? 'bumn' : 'cpns'}`}>
                        {track.shortLabel.toUpperCase()}
                      </span>
                      <span className="stage-duration num">
                        {activePack.count} soal · {activePack.durationMin ?? 60} menit
                      </span>
                    </div>
                    <h2>{activePack.name}</h2>
                  </div>

                  <p className="stage-note">
                    {activePack.note ||
                      `Paket ${activePack.name} dilengkapi koreksi instan & tips di Mode Latihan, serta timer penuh di Simulasi.`}
                  </p>

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
                      Simulasi Ujian ({activePack.durationMin ?? 60} mnt)
                    </button>
                  </div>

                  {activePack.subtests && activePack.subtests.length > 1 && (
                    <div className="stage-subtest-drill">
                      <span className="stage-sub-title">Atau pilih subtes spesifik:</span>
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
                            {track.subtestLabels[st] ?? st.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {track.supportsKisi && (
                    <div className="stage-bottom-row">
                      <button
                        type="button"
                        className="btn-text-link"
                        onClick={() => setTipsOpen(true)}
                      >
                        ✦ Buka Panduan Rumus &amp; Lab Visual
                      </button>
                    </div>
                  )}
                </aside>
              )}
            </div>
          )}
        </>
      )}

      <TipsDrawer
        open={tipsOpen}
        family={tipsFamily}
        onClose={() => setTipsOpen(false)}
      />
    </div>
  );
}
