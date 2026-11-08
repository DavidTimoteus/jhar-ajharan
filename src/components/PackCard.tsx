import { useState } from 'preact/hooks';
import type { PackMeta, Attempt } from '../lib/types';
import type { Screen } from '../lib/store';

interface Props {
  meta: PackMeta;
  attempts: Attempt[]; // riwayat untuk paket ini (dari IndexedDB, data riil)
  go: (s: Screen) => void;
}

function familyClass(meta: PackMeta): string {
  if (meta.id.startsWith('taktis')) return 'family-kilat';
  if (meta.family === 'bumn') return 'family-bumn';
  return 'family-cpns';
}

function familyLabel(meta: PackMeta): string {
  if (meta.id.startsWith('taktis')) return 'Kilat';
  if (meta.family === 'bumn') return 'BUMN';
  return 'CPNS';
}

export default function PackCard({ meta, attempts, go }: Props) {
  const [showOptions, setShowOptions] = useState(false);

  // Progres riil: soal unik yang pernah dijawab dari total soal paket.
  const answered = new Set<string>();
  for (const a of attempts) {
    for (const id of Object.keys(a.answers)) answered.add(id);
  }
  const pct = meta.count > 0 ? Math.min(100, Math.round((answered.size / meta.count) * 100)) : 0;

  const start = (mode: 'latihan' | 'simulasi') => {
    go({ name: 'workbench', packId: meta.id, mode });
  };

  return (
    <div className={`path-card ${familyClass(meta)}`}>
      <div className="path-card-head">
        <span className="pack-badge">{familyLabel(meta)}</span>
        <span className="path-count num">v{meta.version}</span>
      </div>
      <h3 className="path-title">{meta.name}</h3>
      <p className="path-meta">{meta.count} soal</p>

      <div className="path-progress">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-note">
          <span>{answered.size} soal pernah dikerjakan</span>
          <span className="num">{pct}%</span>
        </div>
      </div>

      {!showOptions ? (
        <button className="btn btn-primary btn-block" onClick={() => setShowOptions(true)}>
          Mulai Latihan
        </button>
      ) : (
        <div className="path-actions">
          <button className="btn btn-primary" onClick={() => start('latihan')}>
            Mode Latihan
          </button>
          <button className="btn btn-secondary" onClick={() => start('simulasi')}>
            Mode Simulasi
          </button>
          <button className="btn btn-ghost" onClick={() => setShowOptions(false)}>
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
