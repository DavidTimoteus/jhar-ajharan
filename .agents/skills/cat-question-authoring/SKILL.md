---
name: cat-question-authoring
description: >-
  Author original, standardized, mathematically verified CAT CPNS SKD (KepmenPANRB
  No. 321/2024 & 21 Submateri 2026) and RBB BUMN (FHCI Tahap 1 & Tahap 2)
  question banks for Jhâr-Ajhârân. Activate when asked to write new original
  CPNS/BUMN questions, build JSON packs, craft layperson-friendly fast formulas,
  or audit question packs for HTML, math, or spoiler bugs.
---

# CAT Question Authoring (SKD CPNS & RBB BUMN Standar Terbaru)

Skill ini memandu agen AI menyusun **bank soal original 100% baru** tanpa menyalin soal lama, sesuai standar resmi **SKD CPNS (KepmenPANRB No. 321 Tahun 2024 / 21 submateri terbaru)** dan **RBB BUMN FHCI (Tahap 1 & Tahap 2)**, sekaligus memastikan rumus cepat mudah dipahami orang awam, teruji matematis, dan bebas tag HTML mentah.

## Referensi Standar

Baca referensi sesuai jalur ujian yang dibuat:
- SKD CPNS terbaru (TWK, TIU HOTS + Kecukupan Data/Argumen/Pola Tabel, TKP 6 aspek bobot 1–5): [references/cpns-skd-2026.md](./references/cpns-skd-2026.md)
- RBB BUMN terbaru (TKD, AKHLAK, TWK BUMN, Bahasa Inggris kerja, Learning Agility): [references/rbb-bumn-2026.md](./references/rbb-bumn-2026.md)

## Aturan Wajib Kualitas Soal & Rumus

1. **Original & Kontekstual**: Buat skenario baru yang relevan dengan dunia kerja ASN/BUMN masa kini (layanan digital, integritas pengadaan, transformasi BUMN, literasi data), jangan menyalin mentah dari repositori publik.
2. **Skema 5 Opsi Seimbang (A–E)**:
   - Untuk skema `binary` (`twk`, `tiu`, `tkd`, `twk_bumn`, `bhs`, `akhlak` CBT, `agility`): tepat **1 kunci benar** (`key: 0..4`), seluruh 4 pengecoh masuk akal, panjang opsi relatif seimbang, dan posisi kunci benar diacak merata.
   - Untuk skema `weighted` (`tkp` dan SJT berbobot): gunakan `weights` berperingkat `[5, 4, 3, 2, 1]` yang diacak posisinya; opsi bernilai **5** wajib proaktif, taat aturan/SOP, menjaga etika publik, dan langsung menyelesaikan akar masalah.
3. **Bahasa Awam & Verifikasi Matematis**:
   - Setiap soal hitung atau logika wajib diverifikasi secara matematis lebih dulu sebelum kunci dan pembahasannya ditulis.
   - Saat menulis `hints` (lensa `kilat`) dan `explain`, pakai **bahasa Indonesia sederhana untuk orang awam**: terangkan arti simbol atau langsung tulis `"Orang awal × Hari awal"`, `"Selisih jarak awal ÷ Selisih kecepatan"`, beserta syarat berlakunya (mis. rata-rata kecepatan `2·v1·v2 ÷ (v1+v2)` hanya berlaku bila jarak pergi = jarak pulang).
4. **4 Lensa Hint Non-Spoiler**:
   - Setiap soal wajib punya 4 lensa: `kilat` (cara cepat teruji), `eliminasi` (cara menyoret pengecoh), `logika` (konsep inti), `jebakan` (kesalahan umum peserta).
   - **DILARANG** menyebut huruf jawaban (`A`/`B`/`C`/`D`/`E`) atau teks kunci verbatim di dalam `hints`.
5. **Bebas HTML & Bug Rumus**:
   - **DILARANG** menyisipkan `<p>`, `<br>`, `<div>`, `<b>`, `&nbsp;`, `&amp;`, atau sintaks LaTeX mentah (`\frac`, `\sqrt`, `$$`). Gunakan teks UTF-8 polos (`²`, `³`, `×`, `÷`, `−`, `≤`, `≥`, `→`) dan baris baru `\n` bila perlu tabel/bacaan.

## Langkah Eksekusi & Validasi

1. Pilih standar subtes & target jumlah soal dari file referensi.
2. Tulis atau hasilkan paket JSON mengikuti skema `Pack` (`id`, `name`, `family`, `version`, `updatedAt`, `source`, `config`, `questions`).
3. Uji matematis setiap soal numerik secara programatik, lalu jalankan validator:
   `node .agents/skills/cat-question-authoring/scripts/validate_pack.mjs <path-ke-pack.json>`
4. Pastikan status keluar `0` tanpa warning HTML/spoiler/skoring.

