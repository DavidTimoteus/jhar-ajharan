import { useState } from 'preact/hooks';
import { exportSnapshot, importSnapshot } from '../lib/db';
import { checkUpdates } from '../lib/packs';
import type { Screen } from '../lib/store';

interface Props {
  go: (s: Screen) => void;
}

export default function SettingsView({ go }: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const doExport = async () => {
    try {
      const text = await exportSnapshot();
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jhar-ajharan-progres-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Snapshot progres diunduh. Simpan berkasnya di tempat aman.');
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setMsg(null);
    }
  };

  const doImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const n = await importSnapshot(text);
      setMsg(`Berhasil mengimpor ${n} ujian. Data lama tidak ditimpa bila id sama? Snapshot baru ditambahkan.`);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setMsg(null);
    }
  };

  const doUpdate = async () => {
    setChecking(true);
    const res = await checkUpdates();
    setChecking(false);
    if (res.error) {
      setErr(`Pembaruan gagal: ${res.error}`);
      setMsg(null);
    } else if (res.updated.length > 0) {
      setMsg(`Paket diperbarui: ${res.updated.join(', ')}`);
      setErr(null);
    } else {
      setMsg('Semua paket sudah versi terbaru.');
      setErr(null);
    }
  };

  return (
    <div className="view view-settings">
      <h1>Pengaturan</h1>
      <p className="muted">
        Semua data tersimpan di perangkat ini (IndexedDB). Tidak ada akun, tidak ada server.
      </p>

      {msg && <div className="update-note ok">{msg}</div>}
      {err && <div className="update-note fail">{err}</div>}

      <section className="section">
        <h2>Progres & Cadangan</h2>
        <div className="setting-actions">
          <button className="btn btn-primary" onClick={doExport}>
            Ekspor Snapshot (.json)
          </button>
          <label className="btn btn-secondary">
            Impor Snapshot
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => doImport((e.target as HTMLInputElement).files?.[0])}
            />
          </label>
        </div>
        <p className="muted small">
          Pindahkan progres antar perangkat: ekspor di PC, impor di HP — tanpa cloud.
        </p>
      </section>

      <section className="section">
        <h2>Bank Soal</h2>
        <button className="btn btn-primary" onClick={doUpdate} disabled={checking}>
          {checking ? 'Memeriksa…' : 'Cek Pembaruan Soal'}
        </button>
        <p className="muted small">
          Pembaruan ditarik dari repo publik Jhâr-Ajhârân. Saat offline, paket bawaan tetap dipakai.
        </p>
      </section>

      <section className="section">
        <h2>Kebijakan Penyimpanan</h2>
        <p className="muted small">
          Aplikasi meminta penyimpanan permanen browser agar data tidak terhapus saat ruang perangkat menipis.
        </p>
      </section>

      <button className="btn btn-secondary" onClick={() => go({ name: 'home' })}>
        ← Ke Beranda
      </button>
    </div>
  );
}
