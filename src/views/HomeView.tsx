import { useEffect, useState } from 'preact/hooks';
import type { PackMeta, Attempt } from '../lib/types';
import { loadMetas, checkUpdates, type UpdateResult } from '../lib/packs';
import { listAttempts, requestPersist } from '../lib/db';
import { fmtDate } from '../lib/format';
import type { Screen } from '../lib/store';
import PackCard from '../components/PackCard';

/** Angka yang berhitung naik saat mount (600ms, ease-out). */
function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const dur = 600;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="kpi-value num">{n}</span>;
}

interface Props {
  go: (s: Screen) => void;
}

const FAMILY_LABEL: Record<string, string> = {
  cpns: 'CPNS',
  bumn: 'BUMN',
};

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

/** Streak harian: hari-hari berurutan dengan aktivitas ujian, dihitung dari
 *  hari ini (atau kemarin bila hari ini belum berlatih) ke belakang. */
function calcStreak(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  const days = new Set(attempts.map((a) => localDay(a.startedAt)));
  const sorted = [...days].sort().reverse();
  const first = sorted[0];
  const off = dayOffset(first);
  if (off > 1) return 0; // jeda lebih dari sehari sejak aktivitas terakhir
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
  const [metas, setMetas] = useState<PackMeta[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [update, setUpdate] = useState<UpdateResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [persist, setPersist] = useState(false);

  const refresh = async () => {
    const [m, a] = await Promise.all([loadMetas(), listAttempts()]);
    setMetas(m);
    setAttempts(a);
  };

  useEffect(() => {
    refresh();
    requestPersist().then(setPersist);
  }, []);

  const onCheckUpdates = async () => {
    setChecking(true);
    const res = await checkUpdates();
    setUpdate(res);
    setChecking(false);
    if (res.updated.length > 0) await refresh();
  };

  const totalAnswered = attempts.reduce(
    (acc, a) => acc + Object.keys(a.answers).length,
    0,
  );
  const streak = calcStreak(attempts);

  return (
    <div className="view view-home">
      <div className="hero-learning">
        <h1>Kuasi soal CAT, taktik demi taktik.</h1>
        <p className="hero-sub">
          Latihan CPNS &amp; BUMN berjalan penuh offline. Pilih jalur belajar,
          kerjakan soal, lalu bongkar pola lewat tiga lensa taktik — progresmu
          tersimpan di perangkat.
        </p>
        <div className="home-actions">
          {streak > 0 && (
            <span className="streak-chip">
              <span className="flame" aria-hidden="true">
                ▸
              </span>
              Rutin {streak} hari berturut-turut
            </span>
          )}
          <button className="btn btn-secondary" onClick={onCheckUpdates} disabled={checking}>
            {checking ? 'Memeriksa…' : 'Cek pembaruan soal'}
          </button>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi-cell">
          <CountUp value={metas.length} />
          <span className="kpi-label">Jalur belajar</span>
        </div>
        <div className="kpi-cell">
          <CountUp value={attempts.length} />
          <span className="kpi-label">Ujian dikerjakan</span>
        </div>
        <div className="kpi-cell">
          <CountUp value={totalAnswered} />
          <span className="kpi-label">Soal terjawab</span>
        </div>
      </div>

      {update && (
        <div className={`update-note ${update.updated.length ? 'ok' : 'muted'}`}>
          {update.error
            ? `Pembaruan gagal: ${update.error} (paket lokal tetap dipakai)`
            : update.updated.length
              ? `Paket diperbarui: ${update.updated.join(', ')}`
              : 'Semua paket sudah versi terbaru.'}
        </div>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Jalur Belajar</h2>
          <p className="section-sub">Pilih paket, kerjakan, lacak progres.</p>
        </div>

        {metas.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada paket soal. Cek pembaruan atau pastikan berkas paket tersedia.</p>
          </div>
        ) : (
          <div className="path-grid">
            {metas.map((m) => (
              <PackCard
                key={m.id}
                meta={m}
                attempts={attempts.filter((a) => a.packId === m.id)}
                go={go}
              />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Riwayat Terakhir</h2>
        </div>
        {attempts.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada ujian. Pilih paket di atas untuk mulai berlatih.</p>
          </div>
        ) : (
          <div className="attempt-list">
            {attempts.slice(0, 8).map((a) => (
              <button
                key={a.id}
                className="attempt-row"
                onClick={() => go({ name: 'review', attemptId: a.id })}
              >
                <div className="attempt-main">
                  <span className="attempt-title">{a.packId}</span>
                  <span className="attempt-meta">
                    {FAMILY_LABEL[a.packId.split('-')[0]] ?? 'Latihan'} ·{' '}
                    {a.mode === 'simulasi' ? 'Simulasi' : 'Latihan'} ·{' '}
                    {fmtDate(a.startedAt)}
                  </span>
                </div>
                <span className="attempt-score num">
                  {Object.keys(a.answers).length}/{a.order.length} dijawab
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {persist && (
        <div className="update-note muted">Penyimpanan permanen aktif di perangkat ini.</div>
      )}
    </div>
  );
}
