import { useState } from 'preact/hooks';
import type { PackMeta } from '../lib/types';
import type { Screen } from '../lib/store';

interface Props {
  meta: PackMeta;
  go: (s: Screen) => void;
}

export default function PackCard({ meta, go }: Props) {
  const [showOptions, setShowOptions] = useState(false);

  const familyLabel = meta.family === 'cpns' ? 'CPNS' : 'BUMN';

  const start = (mode: 'latihan' | 'simulasi') => {
    go({ name: 'workbench', packId: meta.id, mode });
  };

  return (
    <div className="pack-card">
      <div className="pack-card-head">
        <span className="pack-badge">{familyLabel}</span>
        <span className="pack-version">v{meta.version}</span>
      </div>
      <h3>{meta.name}</h3>
      <p className="pack-count">{meta.count} soal</p>
      <p className="pack-updated">Diperbarui {new Date(meta.updatedAt).toLocaleDateString('id-ID')}</p>

      {!showOptions ? (
        <button className="btn btn-primary btn-block" onClick={() => setShowOptions(true)}>
          Mulai Latihan
        </button>
      ) : (
        <div className="pack-actions">
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
