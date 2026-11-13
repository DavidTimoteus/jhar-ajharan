import { useEffect, useState } from 'preact/hooks';
import type { PackMeta, Attempt } from '../lib/types';
import { loadMetas } from '../lib/packs';
import { listAttempts, requestPersist } from '../lib/db';
import { fmtDate } from '../lib/format';
import type { Screen } from '../lib/store';
import { useSessionState } from '../lib/session';
import { SUBMATERI_LIST } from '../lib/submateri';
import RadialGauge from '../components/RadialGauge';
import TipsDrawer from '../components/TipsDrawer';

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const dur = 520;
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

  useEffect(() => {
    Promise.all([loadMetas(), listAttempts(session.id)]).then(([m, a]) => {
      setMetas(m);
      setAttempts(a);
    });
    requestPersist().catch(() => {});
  }, [session.id]);

  const cpnsMetas = metas.filter((m) => m.family === 'cpns');
  const bumnMetas = metas.filter((m) => m.family === 'bumn');
  const cpnsQuestions = cpnsMetas.reduce((acc, m) => acc + m.count, 0);
  const bumnQuestions = bumnMetas.reduce((acc, m) => acc + m.count, 0);
  const totalQuestions = cpnsQuestions + bumnQuestions;
  const totalAnswered = attempts.reduce(
    (acc, a) => acc + Object.keys(a.answers).length,
    0,
  );
  const streak = calcStreak(attempts);

  const metaById = new Map(metas.map((m) => [m.id, m]));
  const uniqueCpns = new Set<string>();
  const uniqueBumn = new Set<string>();
  const uniqueKisi = new Set<string>();
  const uniqueEng = new Set<string>();

  for (const a of attempts) {
    const fam = metaById.get(a.packId)?.family;
    for (const k of Object.keys(a.answers)) {
      if (fam === 'cpns') uniqueCpns.add(k);
      if (fam === 'bumn') uniqueBumn.add(k);
      if (a.packId === 'cpns-skd-kisi-terbaru') uniqueKisi.add(k);
      if (a.packId === 'rbb-bumn-english-drill') uniqueEng.add(k);
    }
  }

  const pctCpns =
    cpnsQuestions > 0 ? Math.min(100, Math.round((uniqueCpns.size / cpnsQuestions) * 100)) : 0;
  const pctBumn =
    bumnQuestions > 0 ? Math.min(100, Math.round((uniqueBumn.size / bumnQuestions) * 100)) : 0;
  const kisiCount = metaById.get('cpns-skd-kisi-terbaru')?.count ?? 248;
  const pctKisi = Math.min(100, Math.round((uniqueKisi.size / Math.max(1, kisiCount)) * 100));
  const engCount = metaById.get('rbb-bumn-english-drill')?.count ?? 85;
  const pctEng = Math.min(100, Math.round((uniqueEng.size / Math.max(1, engCount)) * 100));

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

  return (
    <div className="view neu-dashboard">
      <div className="neu-dash-grid">
        {/* CENTER WORKSPACE COLUMN */}
        <section className="dash-center">
          <div className="dash-header-row">
            <div>
              <h1>AKTIVITAS BELAJAR</h1>
              <p className="dash-subtitle">
                Sesi <strong>{session.name}</strong> · <CountUp value={totalQuestions} /> soal aktif di {metas.length} paket
              </p>
            </div>
            <button
              type="button"
              className="neu-square-action"
              onClick={() => setTipsFamily('cpns')}
              title="Buka Panduan Rumus, Glosarium & Target 450+"
              aria-label="Buka panduan strategi dan target skor"
            >
              ✦
            </button>
          </div>

          <div className="dash-cards-head">
            <span className="dash-section-label">ARENA UJIAN &amp; LATIHAN</span>
            <div className="dash-quick-switch">
              <button
                type="button"
                className="neu-mini-btn"
                onClick={() => go({ name: 'cpns' })}
              >
                Menu CPNS
              </button>
              <button
                type="button"
                className="neu-mini-btn"
                onClick={() => go({ name: 'bumn' })}
              >
                Menu BUMN
              </button>
              <button
                type="button"
                className="neu-mini-btn"
                onClick={() => go({ name: 'materi' })}
              >
                ◫ Kisi &amp; Materi
              </button>
            </div>
          </div>

          {/* Wordly Alternating Sky-Blue & Deep Navy Course Cards */}
          <div className="course-stack">
            {/* Card 1: TES CPNS (Sky Blue) */}
            <article
              className="course-card is-sky"
              onClick={() => go({ name: 'cpns' })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && go({ name: 'cpns' })}
            >
              <div className="course-icon-box" aria-hidden="true">
                🏛
              </div>
              <div className="course-body">
                <h3>TES CPNS · SKD CAT</h3>
                <p>TWK, TIU, TKP sesuai KepmenPANRB 321/2024 ({cpnsMetas.length} paket try out)</p>
                <div className="course-progress-row">
                  <div className="course-track">
                    <div className="course-fill" style={{ width: `${Math.max(8, pctCpns)}%` }} />
                  </div>
                  <span className="course-go">buka arena →</span>
                </div>
              </div>
              <div className="course-count-badge num" title="Total soal CPNS">
                {cpnsQuestions}
              </div>
            </article>

            {/* Card 2: TES BUMN (Deep Navy) */}
            <article
              className="course-card is-navy"
              onClick={() => go({ name: 'bumn' })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && go({ name: 'bumn' })}
            >
              <div className="course-icon-box" aria-hidden="true">
                ⚡
              </div>
              <div className="course-body">
                <h3>TES BUMN · RBB FHCI</h3>
                <p>Tahap 1 (TKD · AKHLAK · TWK) &amp; Tahap 2 (B.Inggris · Learning Agility)</p>
                <div className="course-progress-row">
                  <div className="course-track">
                    <div className="course-fill" style={{ width: `${Math.max(8, pctBumn)}%` }} />
                  </div>
                  <span className="course-go">buka arena →</span>
                </div>
              </div>
              <div className="course-count-badge num" title="Total soal BUMN">
                {bumnQuestions}
              </div>
            </article>

            {/* Card 3: Kisi Terbaru 21 Subtes (Sky Blue) */}
            <article
              className="course-card is-sky"
              onClick={() =>
                go({ name: 'workbench', packId: 'cpns-skd-kisi-terbaru', mode: 'latihan' })
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                go({ name: 'workbench', packId: 'cpns-skd-kisi-terbaru', mode: 'latihan' })
              }
            >
              <div className="course-icon-box" aria-hidden="true">
                ✦
              </div>
              <div className="course-body">
                <h3>KISI TERBARU · 21 SUBTES</h3>
                <p>Kecukupan Data (P vs Q), Penguatan Argumen, Tabel &amp; Cara Mudah</p>
                <div className="course-progress-row">
                  <div className="course-track">
                    <div className="course-fill" style={{ width: `${Math.max(8, pctKisi)}%` }} />
                  </div>
                  <span className="course-go">mulai latihan →</span>
                </div>
              </div>
              <div className="course-count-badge num">{kisiCount}</div>
            </article>

            {/* Card 4: BUMN English & Agility Drill (Deep Navy) */}
            <article
              className="course-card is-navy"
              onClick={() =>
                go({ name: 'workbench', packId: 'rbb-bumn-english-drill', mode: 'latihan' })
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                go({ name: 'workbench', packId: 'rbb-bumn-english-drill', mode: 'latihan' })
              }
            >
              <div className="course-icon-box" aria-hidden="true">
                Aa
              </div>
              <div className="course-body">
                <h3>BUMN ENGLISH INTENSIVE</h3>
                <p>Structure, Error Identification &amp; Reading dengan Tips &amp; Trik instan</p>
                <div className="course-progress-row">
                  <div className="course-track">
                    <div className="course-fill" style={{ width: `${Math.max(8, pctEng)}%` }} />
                  </div>
                  <span className="course-go">mulai latihan →</span>
                </div>
              </div>
              <div className="course-count-badge num">{engCount}</div>
            </article>
          </div>
        </section>

        {/* RIGHT TELEMETRY / MY LEARNING COLUMN */}
        <aside className="dash-right">
          <div className="dash-right-head">
            <h2>PROGRES BELAJAR</h2>
            <button
              type="button"
              className="btn-text-link"
              onClick={() => setTipsFamily('bumn')}
            >
              Tips RBB →
            </button>
          </div>

          <div className="learning-rows">
            <button
              type="button"
              className="learning-row"
              onClick={() =>
                go({ name: 'workbench', packId: 'cpns-skd-2026-p1', mode: 'latihan', subtest: 'twk' })
              }
            >
              <span className="lr-icon" aria-hidden="true">⚖</span>
              <span className="lr-copy">
                <strong>TWK · Kebangsaan</strong>
                <span>Pancasila, UUD, Integritas (PG 65)</span>
              </span>
              <RadialGauge
                value={pctCpns}
                size={46}
                stroke={4}
                accent="var(--navy)"
                label={`${pctCpns}%`}
              />
            </button>

            <button
              type="button"
              className="learning-row"
              onClick={() =>
                go({ name: 'workbench', packId: 'cpns-tiu-hots-drill', mode: 'latihan', subtest: 'tiu' })
              }
            >
              <span className="lr-icon" aria-hidden="true">∑</span>
              <span className="lr-copy">
                <strong>TIU · Penalaran &amp; Hitung</strong>
                <span>Silogisme, Analitik, Deret (PG 80)</span>
              </span>
              <RadialGauge
                value={pctKisi}
                size={46}
                stroke={4}
                accent="var(--accent-cpns)"
                label={`${pctKisi}%`}
              />
            </button>

            <button
              type="button"
              className="learning-row"
              onClick={() =>
                go({ name: 'workbench', packId: 'cpns-skd-2026-p1', mode: 'latihan', subtest: 'tkp' })
              }
            >
              <span className="lr-icon" aria-hidden="true">★</span>
              <span className="lr-copy">
                <strong>TKP · 6 Aspek Layanan</strong>
                <span>Bobot 1–5 tanpa nol (PG 166)</span>
              </span>
              <RadialGauge
                value={Math.min(100, pctCpns + (finishedCount > 0 ? 15 : 0))}
                size={46}
                stroke={4}
                accent="var(--navy)"
                label={`${Math.min(100, pctCpns + (finishedCount > 0 ? 15 : 0))}%`}
              />
            </button>

            <button
              type="button"
              className="learning-row"
              onClick={() =>
                go({ name: 'workbench', packId: 'rbb-bumn-2026-tahap1', mode: 'latihan', subtest: 'akhlak' })
              }
            >
              <span className="lr-icon" aria-hidden="true">◈</span>
              <span className="lr-copy">
                <strong>BUMN · TKD &amp; AKHLAK</strong>
                <span>Core Values &amp; Learning Agility</span>
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

          {/* Signature Deep Navy Activity Card */}
          <div className="activity-dark-card">
            <div className="activity-dark-copy">
              <span className="activity-dark-eyebrow">AKTIVITAS DI PLATFORM</span>
              <div className="activity-dark-time num">
                {hrs} JAM {mins} MNT
              </div>
              <p className="activity-dark-sub num">
                {totalAnswered} soal dijawab · {streak} hari streak latihan
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
        </aside>
      </div>

      {/* Recent Attempts Strip */}
      {attempts.length > 0 && (
        <section className="history-section">
          <div className="section-head-inline">
            <h2>Riwayat Sesi Terakhir</h2>
            <span className="muted small num">{attempts.length} sesi tersimpan offline</span>
          </div>
          <div className="history-grid">
            {attempts.slice(0, 6).map((a) => {
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
                    <span className={`pill pill-${fam}`}>{fam.toUpperCase()}</span>
                    <span className={`history-state ${a.finishedAt ? 'is-done' : 'is-wip'}`}>
                      {a.finishedAt ? 'Selesai' : 'Lanjutkan'}
                    </span>
                  </div>
                  <strong className="history-title">{packName}</strong>
                  <div className="history-meta num">
                    <span>{a.mode === 'simulasi' ? 'Simulasi CAT' : 'Latihan'}</span>
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
