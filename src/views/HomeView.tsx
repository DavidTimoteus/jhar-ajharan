import { useEffect, useState } from 'preact/hooks';
import type { PackMeta, Attempt } from '../lib/types';
import { loadMetas } from '../lib/packs';
import { listAttempts, requestPersist } from '../lib/db';
import { fmtDate } from '../lib/format';
import type { Screen } from '../lib/store';
import { useSessionState } from '../lib/session';
import { SUBMATERI_LIST } from '../lib/submateri';
import { partitionTracks } from '../lib/tracks';
import RadialGauge from '../components/RadialGauge';
import TipsDrawer from '../components/TipsDrawer';

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const dur = 480;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="num">{n.toLocaleString('id-ID')}</span>;
}

interface Props {
  go: (s: Screen) => void;
}

function localDay(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function dayOffset(day: string): number {
  const today = localDay(Date.now());
  const a = new Date(`${day}T00:00:00`);
  const b = new Date(`${today}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function calcStreak(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  const days = new Set(attempts.map((a) => localDay(a.startedAt)));
  const sorted = [...days].sort().reverse();
  const first = sorted[0];
  if (dayOffset(first) > 1) return 0;
  let streak = 1;
  const cursor = new Date(`${first}T00:00:00`);
  for (let i = 1; i < sorted.length; i++) {
    cursor.setDate(cursor.getDate() - 1);
    if (sorted[i] === localDay(cursor.getTime())) streak++;
    else break;
  }
  return streak;
}

export default function HomeView({ go }: Props) {
  const { active: session } = useSessionState();
  const [metas, setMetas] = useState<PackMeta[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [tipsFamily, setTipsFamily] = useState<'cpns' | 'bumn' | null>(null);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    Promise.all([loadMetas(), listAttempts(session.id)]).then(([m, a]) => {
      setMetas(m);
      setAttempts(a);
    });
    requestPersist().catch(() => {});
  }, [session.id]);

  const { active: activeTracks, upcoming: upcomingTracks } = partitionTracks(metas);
  const totalQuestions = metas.reduce((acc, m) => acc + m.count, 0);
  const totalAnswered = attempts.reduce(
    (acc, a) => acc + Object.keys(a.answers).length,
    0,
  );
  const streak = calcStreak(attempts);

  const metaById = new Map(metas.map((m) => [m.id, m]));
  const uniqueByTrack = new Map<string, Set<string>>();

  for (const a of attempts) {
    const fam = metaById.get(a.packId)?.family ?? 'cpns';
    if (!uniqueByTrack.has(fam)) uniqueByTrack.set(fam, new Set());
    const set = uniqueByTrack.get(fam)!;
    for (const k of Object.keys(a.answers)) set.add(k);
  }

  const cpnsQuestions = metas
    .filter((m) => m.family === 'cpns')
    .reduce((acc, m) => acc + m.count, 0);
  const bumnQuestions = metas
    .filter((m) => m.family === 'bumn')
    .reduce((acc, m) => acc + m.count, 0);

  const pctCpns =
    cpnsQuestions > 0
      ? Math.min(100, Math.round(((uniqueByTrack.get('cpns')?.size ?? 0) / cpnsQuestions) * 100))
      : 0;
  const pctBumn =
    bumnQuestions > 0
      ? Math.min(100, Math.round(((uniqueByTrack.get('bumn')?.size ?? 0) / bumnQuestions) * 100))
      : 0;

  const finishedCount = attempts.filter((a) => !!a.finishedAt).length;
  const totalMins = Math.max(
    0,
    Math.round(
      attempts.reduce((sum, a) => {
        const end = a.finishedAt ?? a.startedAt + Object.keys(a.answers).length * 42_000;
        return sum + Math.max(0, end - a.startedAt);
      }, 0) / 60_000,
    ),
  );
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  const visibleHistory = showAllHistory ? attempts.slice(0, 12) : attempts.slice(0, 3);

  return (
    <div className="view neu-dashboard">
      <div className="neu-dash-grid">
        {/* FOKUS UTAMA: Pilih Jalur Belajar */}
        <section className="dash-center">
          <div className="dash-header-row">
            <div>
              <h1>RUANG BELAJAR</h1>
              <p className="dash-subtitle">
                Sesi <strong>{session.name}</strong> · <CountUp value={totalQuestions} /> soal aktif di {metas.length} paket
              </p>
            </div>
            <button
              type="button"
              className="neu-square-action"
              onClick={() => setTipsFamily('cpns')}
              title="Buka Panduan Rumus & Lab Visual"
              aria-label="Buka panduan strategi"
            >
              ✦
            </button>
          </div>

          <div className="dash-cards-head">
            <span className="dash-section-label">PILIH JALUR UJIAN &amp; LATIHAN</span>
            <button
              type="button"
              className="neu-mini-btn"
              onClick={() => go({ name: 'materi' })}
            >
              ◫ Kisi &amp; Materi →
            </button>
          </div>

          <div className="course-stack">
            {activeTracks.map((t) => {
              const done = uniqueByTrack.get(t.config.id)?.size ?? 0;
              const pct =
                t.questionCount > 0
                  ? Math.min(100, Math.round((done / t.questionCount) * 100))
                  : 0;
              return (
                <article
                  key={t.config.id}
                  className={`course-card is-${t.config.cardTone}`}
                  onClick={() => go({ name: 'track', family: t.config.id })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && go({ name: 'track', family: t.config.id })
                  }
                >
                  <div className="course-icon-box" aria-hidden="true">
                    {t.config.icon}
                  </div>
                  <div className="course-body">
                    <h3>{t.config.title}</h3>
                    <p>{t.config.tagline} ({t.packCount} paket)</p>
                    <div className="course-progress-row">
                      <div className="course-track">
                        <div className="course-fill" style={{ width: `${Math.max(8, pct)}%` }} />
                      </div>
                      <span className="course-go">buka →</span>
                    </div>
                  </div>
                  <div className="course-count-badge num" title={`Total soal ${t.config.shortLabel}`}>
                    {t.questionCount}
                  </div>
                </article>
              );
            })}
          </div>

          {/* JALUR EKSPANSI MENDATANG (TOEFL, TOEIC, PROGRAMMING, DATA) — Ringkas & Dapat Dibuka */}
          {upcomingTracks.length > 0 && (
            <div className="upcoming-tracks-wrap">
              <button
                type="button"
                className="upcoming-toggle-btn"
                onClick={() => setShowUpcoming((v) => !v)}
                aria-expanded={showUpcoming}
              >
                <span>
                  + Jalur Ekspansi Platform ({upcomingTracks.map((u) => u.config.shortLabel).join(' · ')})
                </span>
                <span>{showUpcoming ? 'Tutup ▴' : 'Lihat ▾'}</span>
              </button>

              {showUpcoming && (
                <div className="upcoming-tracks-grid">
                  {upcomingTracks.map((u) => (
                    <button
                      key={u.config.id}
                      type="button"
                      className="upcoming-track-card"
                      onClick={() => go({ name: 'track', family: u.config.id })}
                    >
                      <div className="upcoming-track-head">
                        <strong>
                          {u.config.icon} {u.config.shortLabel}
                        </strong>
                        <span className="chip-soon">Siap Impor JSON</span>
                      </div>
                      <p className="muted small">{u.config.tagline}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* PANEL KANAN: Ringkasan Tenang (Tanpa Menyesaki Layar) */}
        <aside className="dash-right">
          <div className="dash-right-head">
            <h2>RINGKASAN PROGRES</h2>
            <button
              type="button"
              className="btn-text-link"
              onClick={() => go({ name: 'materi' })}
            >
              Pelajari Materi →
            </button>
          </div>

          <div className="activity-dark-card">
            <div className="activity-dark-copy">
              <span className="activity-dark-eyebrow">WAKTU &amp; KONSISTENSI</span>
              <div className="activity-dark-time num">
                {hrs} JAM {mins} MNT
              </div>
              <p className="activity-dark-sub num">
                {totalAnswered} soal dijawab · {streak} hari beruntun
              </p>
            </div>
            <div className="activity-bars" aria-hidden="true">
              <div className="abar-track">
                <div
                  className="abar-fill"
                  style={{ height: `${Math.min(100, Math.max(25, pctCpns + 22))}%` }}
                />
              </div>
              <div className="abar-track">
                <div
                  className="abar-fill"
                  style={{ height: `${Math.min(100, Math.max(35, finishedCount * 18 + 30))}%` }}
                />
              </div>
              <div className="abar-track">
                <div
                  className="abar-fill"
                  style={{ height: `${Math.min(100, Math.max(20, streak * 25 + 20))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="learning-rows">
            <button
              type="button"
              className="learning-row"
              onClick={() => go({ name: 'materi', family: 'cpns' })}
            >
              <span className="lr-icon" aria-hidden="true">◫</span>
              <span className="lr-copy">
                <strong>21 Submateri CPNS</strong>
                <span>TWK, TIU &amp; TKP dengan Lab Visual</span>
              </span>
              <RadialGauge
                value={pctCpns}
                size={46}
                stroke={4}
                accent="var(--accent-cpns)"
                label={`${pctCpns}%`}
              />
            </button>

            <button
              type="button"
              className="learning-row"
              onClick={() => go({ name: 'materi', family: 'bumn' })}
            >
              <span className="lr-icon" aria-hidden="true">⚡</span>
              <span className="lr-copy">
                <strong>Materi RBB BUMN</strong>
                <span>TKD, AKHLAK, B. Inggris &amp; Agility</span>
              </span>
              <RadialGauge
                value={pctBumn}
                size={46}
                stroke={4}
                accent="var(--accent-bumn)"
                label={`${pctBumn}%`}
              />
            </button>
          </div>
        </aside>
      </div>

      {/* Riwayat Terakhir (Maksimal 3 kartu secara default supaya layar lega) */}
      {attempts.length > 0 && (
        <section className="history-section">
          <div className="section-head-inline">
            <h2>Riwayat Latihan Terakhir</h2>
            {attempts.length > 3 && (
              <button
                type="button"
                className="btn-text-link"
                onClick={() => setShowAllHistory((v) => !v)}
              >
                {showAllHistory ? 'Ringkas (3 terbaru)' : `Lihat semua (${attempts.length})`}
              </button>
            )}
          </div>
          <div className="history-grid">
            {visibleHistory.map((a) => {
              const meta = metaById.get(a.packId);
              const subMeta = a.packId.startsWith('submateri:')
                ? SUBMATERI_LIST.find((s) => s.id === a.packId.slice('submateri:'.length))
                : undefined;
              const packName =
                meta?.name ?? (subMeta ? `Kisi · ${subMeta.title}` : a.packId);
              const fam = meta?.family ?? subMeta?.family ?? 'cpns';
              const answered = Object.keys(a.answers).length;
              return (
                <button
                  key={a.id}
                  type="button"
                  className="history-card"
                  onClick={() =>
                    a.finishedAt
                      ? go({ name: 'review', attemptId: a.id })
                      : go({ name: 'workbench', packId: a.packId, mode: a.mode })
                  }
                >
                  <div className="history-card-top">
                    <span className={`pill pill-${fam === 'bumn' ? 'bumn' : 'cpns'}`}>
                      {String(fam).toUpperCase()}
                    </span>
                    <span className={`history-state ${a.finishedAt ? 'is-done' : 'is-wip'}`}>
                      {a.finishedAt ? 'Selesai' : 'Lanjutkan'}
                    </span>
                  </div>
                  <strong className="history-title">{packName}</strong>
                  <div className="history-meta num">
                    <span>{a.mode === 'simulasi' ? 'Simulasi' : 'Latihan'}</span>
                    <span>·</span>
                    <span>
                      {answered}/{a.order.length} soal
                    </span>
                    <span>·</span>
                    <span>{fmtDate(a.startedAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {tipsFamily && (
        <TipsDrawer
          open={true}
          family={tipsFamily}
          onClose={() => setTipsFamily(null)}
        />
      )}
    </div>
  );
}
