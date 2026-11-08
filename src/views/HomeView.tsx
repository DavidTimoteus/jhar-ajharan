import { useEffect, useState } from 'preact/hooks';
import type { PackMeta, Attempt } from '../lib/types';
import { loadMetas, checkUpdates, type UpdateResult } from '../lib/packs';
import { listAttempts, requestPersist } from '../lib/db';
import { fmtDate } from '../lib/format';
import type { Screen } from '../lib/store';
import PackCard from '../components/PackCard';

interface Props {
  go: (s: Screen) => void;
}

const FAMILY_LABEL: Record<string, string> = {
  cpns: 'CPNS',
  bumn: 'BUMN',
};

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

  return (
    <div className="view view-home">
      <div className="title-row">
        <div>
          <h1>Beranda</h1>
          <p className="title-sub">
            Latihan CAT tanpa sinyal. Pilih paket soal, bongkar taktik, dan lacak
            progresmu — semua tersimpan di perangkat.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onCheckUpdates} disabled={checking}>
          {checking ? 'Memeriksa…' : 'Cek pembaruan soal'}
        </button>
      </div>

      <div className="kpi-strip">
        <div className="kpi-cell">
          <span className="kpi-value num">{metas.length}</span>
          <span className="kpi-label">Paket soal</span>
        </div>
        <div className="kpi-cell">
          <span className="kpi-value num">{attempts.length}</span>
          <span className="kpi-label">Riwayat ujian</span>
        </div>
        <div className="kpi-cell">
          <span className="kpi-value num">{totalAnswered}</span>
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
          <h2>Paket Soal</h2>
        </div>

        {metas.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada paket soal. Cek pembaruan atau pastikan berkas paket tersedia.</p>
          </div>
        ) : (
          <div className="pack-grid">
            {metas.map((m) => (
              <PackCard key={m.id} meta={m} go={go} />
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
