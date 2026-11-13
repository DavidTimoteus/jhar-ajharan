import { useEffect, useState } from 'preact/hooks';
import {
  clearAllBrowserCache,
  clearSessionAttempts,
  exportSnapshot,
  importSnapshot,
} from '../lib/db';
import {
  createSession,
  removeSessionProfile,
  renameSession,
  switchSession,
  useSessionState,
} from '../lib/session';
import {
  checkUpdates,
  importCustomPack,
  loadMetas,
  PACK_TEMPLATE_JSON,
  removeCustomPack,
} from '../lib/packs';
import type { PackMeta, TrackId } from '../lib/types';
import { TRACK_REGISTRY } from '../lib/tracks';
import type { Screen } from '../lib/store';

interface Props {
  go: (s: Screen) => void;
}

export default function SettingsView({ go }: Props) {
  const { sessions, active } = useSessionState();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [renameText, setRenameText] = useState(active.name);
  const [familyChoice, setFamilyChoice] = useState<'auto' | TrackId>('auto');
  const [customPacks, setCustomPacks] = useState<PackMeta[]>([]);

  useEffect(() => {
    setRenameText(active.name);
  }, [active.id, active.name]);

  const loadCustom = async () => {
    const metas = await loadMetas();
    setCustomPacks(metas.filter((m) => m.custom));
  };

  useEffect(() => {
    loadCustom();
  }, []);

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
      setMsg(`Berhasil mengimpor ${n} riwayat ujian ke perangkat.`);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setMsg(null);
    }
  };

  const doImportBank = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const pack = await importCustomPack(text, familyChoice);
      await loadCustom();
      setMsg(
        `Bank soal "${pack.name}" (${pack.questions.length} soal) berhasil ditambahkan ke menu Tes ${pack.family.toUpperCase()}!`,
      );
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setMsg(null);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([PACK_TEMPLATE_JSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-bank-soal-jhar-ajharan.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteCustom = async (id: string, name: string) => {
    await removeCustomPack(id);
    await loadCustom();
    setMsg(`Bank soal kustom "${name}" dihapus.`);
    setErr(null);
  };

  const handleCreateSession = (e: Event) => {
    e.preventDefault();
    const created = createSession(newProfileName);
    setNewProfileName('');
    setMsg(`Sesi baru "${created.name}" dibuat & diaktifkan. Riwayat dan progres dimulai dari nol.`);
    setErr(null);
  };

  const handleRenameActive = (e: Event) => {
    e.preventDefault();
    if (!renameText.trim()) return;
    renameSession(active.id, renameText);
    setMsg(`Nama sesi diperbarui menjadi "${renameText.trim()}".`);
    setErr(null);
  };

  const handleClearActiveHistory = async () => {
    const removed = await clearSessionAttempts(active.id);
    setMsg(`Riwayat & cache sesi "${active.name}" dibersihkan (${removed} sesi ujian dihapus).`);
    setErr(null);
  };

  const handleDeleteProfile = async (id: string, name: string) => {
    await clearSessionAttempts(id);
    removeSessionProfile(id);
    setMsg(`Profil "${name}" beserta riwayatnya dihapus dari cache browser.`);
    setErr(null);
  };

  const handleClearAllCache = async () => {
    await clearAllBrowserCache();
    await loadCustom();
    setMsg('Seluruh cache browser, sesi peserta, dan bank kustom telah dibersihkan.');
    setErr(null);
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
      <div className="settings-head">
        <h1>Pengaturan &amp; Bank Soal</h1>
        <p className="muted">
          Semua riwayat latihan dan bank soal tambahan tersimpan aman di perangkat Anda agar tetap bisa dipakai tanpa koneksi internet.
        </p>
      </div>

      {msg && <div className="update-note ok">{msg}</div>}
      {err && <div className="update-note fail">{err}</div>}

      <section className="settings-card">
        <h2>Sesi Peserta &amp; Penyimpanan Cache Browser</h2>
        <p className="muted small">
          Setiap orang dapat memakai browser ini dengan <strong>sesi &amp; riwayat terpisah</strong>. Seluruh data tersimpan di cache browser (IndexedDB + localStorage), sehingga jika cache/data situs browser dihapus, seluruh riwayat ikut terhapus.
        </p>

        <div className="session-cards-grid">
          {sessions.map((s) => {
            const isCurrent = s.id === active.id;
            return (
              <div
                key={s.id}
                className={`session-pill-card ${isCurrent ? 'is-current' : ''}`}
              >
                <div className="session-pill-meta">
                  <strong>{s.name}</strong>
                  <span className="muted small">
                    {isCurrent ? 'Sedang Aktif' : 'Tersimpan'}
                  </span>
                </div>
                <div className="custom-pack-actions">
                  {!isCurrent && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        switchSession(s.id);
                        setMsg(`Beralih ke sesi "${s.name}".`);
                        setErr(null);
                      }}
                    >
                      Aktifkan
                    </button>
                  )}
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDeleteProfile(s.id, s.name)}
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="session-forms-row">
          <form className="inline-input-form" onSubmit={handleCreateSession}>
            <input
              type="text"
              className="search-input"
              value={newProfileName}
              maxLength={32}
              placeholder="Nama sesi peserta baru (mis. Budi · CPNS)…"
              onInput={(e) => setNewProfileName((e.target as HTMLInputElement).value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              + Buat Sesi Baru
            </button>
          </form>

          <form className="inline-input-form" onSubmit={handleRenameActive}>
            <input
              type="text"
              className="search-input"
              value={renameText}
              maxLength={32}
              placeholder="Ubah nama sesi aktif…"
              onInput={(e) => setRenameText((e.target as HTMLInputElement).value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Simpan Nama
            </button>
          </form>
        </div>

        <div className="setting-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleClearActiveHistory}
          >
            Hapus Riwayat Sesi Ini
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleClearAllCache}
          >
            Bersihkan Semua Cache Browser
          </button>
        </div>
      </section>

      <section className="settings-card">
        <h2>Tambah Bank Soal Sendiri (.json)</h2>
        <p className="muted small">
          Impor file JSON bank soal baru agar langsung tersedia di menu{' '}
          <strong>Tes CPNS</strong> atau <strong>Tes BUMN</strong>. Gunakan format aplikasi atau unduh template di bawah.
        </p>

        <div className="import-controls">
          <label className="select-label">
            <span className="small muted">Target Menu Ujian:</span>
            <select
              value={familyChoice}
              onChange={(e) =>
                setFamilyChoice((e.target as HTMLSelectElement).value as 'auto' | TrackId)
              }
            >
              <option value="auto">Otomatis dari properti "family" JSON</option>
              {TRACK_REGISTRY.map((t) => (
                <option key={t.id} value={t.id}>
                  Masukkan ke Jalur {t.shortLabel}
                </option>
              ))}
            </select>
          </label>

          <div className="setting-actions">
            <label className="btn btn-primary btn-magnetic">
              + Pilih File Bank Soal (.json)
              <input
                type="file"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={(e) => doImportBank((e.target as HTMLInputElement).files?.[0])}
              />
            </label>
            <button type="button" className="btn btn-secondary" onClick={downloadTemplate}>
              Unduh Template JSON
            </button>
          </div>
        </div>

        {customPacks.length > 0 && (
          <div className="custom-pack-list">
            <span className="mono small muted">BANK SOAL KUSTOM TERSIMPAN ({customPacks.length})</span>
            {customPacks.map((p) => (
              <div key={p.id} className="custom-pack-row">
                <div>
                  <strong>{p.name}</strong>
                  <span className="muted small">
                    {' '}
                    · {p.family.toUpperCase()} · {p.count} soal
                  </span>
                </div>
                <div className="custom-pack-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => go({ name: 'workbench', packId: p.id, mode: 'latihan' })}
                  >
                    Buka
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDeleteCustom(p.id, p.name)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="settings-card">
        <h2>Cadangan Progres &amp; Pembaruan</h2>
        <div className="setting-actions">
          <button type="button" className="btn btn-primary" onClick={doExport}>
            Ekspor Cadangan (.json)
          </button>
          <label className="btn btn-secondary">
            Impor Cadangan
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => doImport((e.target as HTMLInputElement).files?.[0])}
            />
          </label>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={doUpdate}
            disabled={checking}
          >
            {checking ? 'Memeriksa…' : 'Cek Pembaruan Paket'}
          </button>
        </div>
        <p className="muted small">
          Pindahkan riwayat latihan antar perangkat menggunakan berkas cadangan JSON.
        </p>
      </section>

      <div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => go({ name: 'home' })}
        >
          ← Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
