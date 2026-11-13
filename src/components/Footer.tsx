import { useEffect, useState } from 'preact/hooks';
import type { Screen } from '../lib/store';

interface Props {
  go: (s: Screen) => void;
}

export default function Footer({ go }: Props) {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <footer className="studio-footer">
      <div className="studio-footer-inner">
        <div className="footer-left">
          <span className={`status-beacon ${online ? 'is-online' : 'is-offline'}`} />
          <span className="footer-status-text">
            {online ? 'Siap Offline · Progres tersimpan di perangkat' : 'Mode Offline Aktif'}
          </span>
        </div>
        <div className="footer-links">
          <button type="button" onClick={() => go({ name: 'cpns' })}>
            Tes CPNS
          </button>
          <button type="button" onClick={() => go({ name: 'bumn' })}>
            Tes BUMN
          </button>
          <button type="button" onClick={() => go({ name: 'settings' })}>
            Tambah Bank Soal &amp; Cadangan
          </button>
        </div>
      </div>
    </footer>
  );
}
