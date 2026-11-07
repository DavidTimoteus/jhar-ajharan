# Jhâr-Ajhârân

**PWA latihan soal CAT CPNS & BUMN — offline-first, hint taktik bertingkat.**

Jhâr-Ajhârân adalah aplikasi latihan ujian berbasis PWA yang berjalan penuh
tanpa internet. Fokus awal: SKD CPNS (TWK, TIU, TKP) dan Rekrutmen Bersama
BUMN (TKD, Core Values AKHLAK, Bahasa Inggris). Desain memakai prinsip
*Achromatic Ledger*: kertas kerja dingin, tinta kontras tinggi, satu warna
data (`#1D5FBF`) khusus ambang batas dan lensa taktik aktif.

## Fitur

- **Mode Latihan** — bebas membuka taktik sebelum menjawab; umpan balik +
  pembahasan muncul seketika.
- **Mode Simulasi CAT** — hint terkunci, hitung mundur ketat, hasil baru dibuka
  setelah ujian selesai.
- **Kotak Taktik 3-Lensa + Radar Jebakan** — *Jalur Kilat (<15 dtk)*,
  *Eliminasi Pengecoh*, *Pola & Logika Inti*, dan *Jebakan Umum*; tidak pernah
  membocorkan huruf kunci sebelum menjawab.
- **Skoring ganda** — `binary` 5/0 untuk TWK/TIU/TKD/Bahasa Inggris, `weighted`
  1–5 transparan untuk TKP dan AKHLAK.
- **Lubang Waktu (Time-Sink)** — soal yang melewati target waktu 1,5× ditandai
  dan masuk antrean remidi otomatis.
- **Antrean Remidi** — soal salah, kosong, ragu, atau lambat dikumpulkan untuk
  latihan ulang terfokus.
- **Pembaruan soal online** — bank soal ditarik dari repo publik ini; saat
  offline paket bawaan tetap dipakai.
- **Mode gelap** — default mengikuti sistem (`prefers-color-scheme`), bisa
  diatur manual (Ikut sistem / Terang / Gelap).
- **Ekspor & Impor Snapshot** — pindah progres antar perangkat tanpa akun,
  berbentuk file `.json`.
- **Pintasan keyboard** — `1–5` / `A–E` pilih jawaban, `H` taktik, `R` ragu,
  `←` `→` pindah soal.

## Teknologi

- [Preact](https://preactjs.com/) — UI (3 kB core, JSX)
- [Vite](https://vite.dev/) + TypeScript — bundler & type-check
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — Service Worker &
  precache penuh
- IndexedDB — penyimpanan progres lokal (tanpa dependensi)

## Struktur

```
src/
  lib/            # engine skoring, db IndexedDB, pemuat paket, tema, format
  components/     # Header, PackCard, HintDeck, QuestionNav
  views/          # Home, Workbench (latihan/simulasi), Review, Settings
public/
  packs/          # bank soal JSON + index (di-precache Service Worker)
  fonts/          # Geist & Geist Mono (self-hosted, offline)
  icons/          # ikon PWA
scripts/
  bank_*.py       # sumber bank soal per subtes
  assemble_packs.py  # generator JSON pack + index.json
  verify-packs.mjs   # verifikasi integritas paket (npm run verify)
```

## Menjalankan

```bash
npm install
npm run dev       # dev server http://127.0.0.1:5174
npm run build     # type-check + produksi ke dist/
npm run preview   # pratinjau build produksi
npm run packs     # regenerasi bank soal (node scripts/…)
npm run verify    # verifikasi integritas paket soal
```

## Menambahkan / memperbarui bank soal

1. Sunting sumber soal di `scripts/bank_*.py` mengikuti skema `Question`
   (`src/lib/types.ts`): 5 opsi A–E, `key` (binary) atau `weights` (weighted),
   4 hint lensa yang tidak membocorkan huruf kunci, `explain`, `targetSec`.
2. Naikkan `version` di `scripts/assemble_packs.py` untuk paket yang berubah.
3. Jalankan `python scripts/assemble_packs.py && npm run verify`.
4. Commit paket JSON baru; aplikasi akan menariknya lewat fitur *Cek pembaruan*.

## Kepatuhan

- Bank soal disusun mengikuti pola kisi resmi Seleksi Kompetensi Dasar
  (BKN/KemenPAN-RB) dan Core Values AKHLAK BUMN, bukan salinan langsung soal
  ujian berhak cipta.
- Ambang batas paket CPNS mengacu KepmenPANRB No. 321 Tahun 2024
  (TWK 65, TIU 80, TKP 166).
