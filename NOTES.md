# Jhâr-Ajhârân — NOTES.md

> PWA latihan CAT CPNS & BUMN offline-first dengan hint taktik bertingkat.
> Repo publik: https://github.com/DavidTimoteus/jhar-ajharan (branch `master`).

## Ringkas Sistem
- **Stack:** Preact 10 + Vite 6 + TypeScript strict + vite-plugin-pwa (generateSW). Tanpa router eksternal (state-based di `src/lib/store.ts`), tanpa UI framework — CSS variable achromatic ledger.
- **Skoring:** `binary` 5/0 (TWK, TIU, TKD, BHS) & `weighted` 1-5 (TKP, AKHLAK). Ambang CPNS: TWK 65, TIU 80, TKP 166 (KepmenPANRB 321/2024). Ambang BUMN: TKD 40, AKHLAK 30, BHS 30 (skala proporsional).
- **Bank soal:** 189 soal — `cpns-skd-2024` (119: TWK 32/TIU 40/TKP 47), `rbb-bumn-2024` (40: TKD 20/AKHLAK 10/BHS 10), `taktis-kilat` (30 HOTS). Semua soal punya 4 lensa hint (kilat/eliminasi/logika/jebakan) yang DILARANG membocorkan huruf kunci sebelum menjawab.
- **Penyimpanan:** IndexedDB (`jhar-ajharan` DB; stores `attempts`, `packs`, `kv`). Snapshot ekspor/impor `.json` untuk pindah perangkat tanpa akun.
- **Tema:** default ikut sistem (`prefers-color-scheme`), override manual via localStorage `ja-theme` (system/light/dark).

## Alur Operasional
1. **Generate/update soal:** sunting `scripts/bank_*.py` → naikkan `version` di `scripts/assemble_packs.py` → `python scripts/assemble_packs.py` → `npm run verify` → commit.
2. **Update online:** app tarik dari `https://raw.githubusercontent.com/DavidTimoteus/jhar-ajharan/master/public/packs/index.json` (branch **master**, bukan main — pernah 404, sudah difix di commit 691d7a0).
3. **Build:** `npm run build` (tsc --noEmit + vite build). **Verifikasi:** `npm run verify`.

## Aturan Keras
- Hint 1 & 2 DILARANG menyebut huruf kunci (A-E) — cek `scripts/verify-packs.mjs` memberi warning bila melanggar.
- Opsi TKP/AKHLAK wajib `weights[5]` dengan nilai terbaik = 5; pembahasan menampilkan bobot 5 opsi.
- Perubahan soal wajib menaikkan `version` pack agar `checkUpdates()` di aplikasi mendeteksi pembaruan.
- Jangan commit `dist/`, `node_modules/`, `logs/`, `snapshots/` (sudah di `.gitignore`).
- Commit wajib Conventional Commits bahasa Indonesia kaya konteks (contoh: `feat(app):`, `fix(packs):`).

## Catatan Uji (smoke test 2026-11-07)
- Build: 25 modul, JS 41.77 kB (gzip 14.92 kB), PWA precache 22 entri (~334 KiB).
- Headless browser: beranda render 3 kartu paket → workbench soal+hint+nav+timer jalan → jawab salah menampilkan feedback benar/salah → hasil menampilkan rincian subtes + verdict + 30 pembahasan.
- Remote check `raw/master/public/packs/index.json`: HTTP 200 (3 paket terdeteksi).
