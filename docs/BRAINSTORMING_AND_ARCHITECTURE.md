# Brainstorming & Arsitektur Produk: TAKTIS (PWA Latihan Ujian Offline)

## 1. Rekomendasi Nama Aplikasi (Anti-AI-Slop Naming)

Lima nama klise yang **ditolak** sejak awal karena terdengar generik atau terkunci pada satu jenis ujian: *PintarCAT, LulusCPNS, TryoutKu, SmartASN, ExamMaster*.

Berikut **5 kandidat nama pilihan** yang dirancang agar kuat di layar HP/PC dan relevan saat aplikasi berkembang dari **CPNS & BUMN** menuju **TOEIC & IELTS**:

1. **TAKTIS** (`taktis` — **Dipilih sebagai Nama Utama Build v1.0**)
   - **Alasan:** Ujian CAT CPNS (110 soal / 100 menit) dan RBB BUMN (TKD 100 soal / 73 menit) bukan sekadar ujian kepintaran, melainkan ujian **taktik membaca celah soal di bawah tekanan detik**. Nama *Jhâr-Ajhârân* langsung mewakili fitur utama aplikasi (Multi-Hint penyelesaian cepat), hanya 6 huruf (tidak terpotong di bawah ikon PWA Android/iOS), dan tetap relevan saat modul TOEIC/IELTS dibuka.
2. **CELAH** (`celah`)
   - **Alasan:** Menekankan filosofi bahwa setiap soal standar memiliki "celah" (angka ekor, kata kunci kuantor, pola eliminasi) yang bisa ditembus dalam 10–15 detik tanpa coretan panjang.
3. **BIDIK** (`bidik`)
   - **Alasan:** Tegas, berorientasi target ambang batas (*passing grade*), mudah diingat.
4. **TEMPA** (`tempa`)
   - **Alasan:** Bermakna ruang menempa refleks dan ketahanan mental sebelum hari-H ujian.
5. **KILAS** (`kilas`)
   - **Alasan:** Menonjolkan gaya belajar kilat di sela waktu luang (di KRL/bus tanpa sinyal internet).

---

## 2. Audit 6 Pilar Kognisi: Mengapa Aplikasi Tryout Biasa Gagal?

1. **Kejujuran Tanpa Basa-Basi (Brutal Honesty):**
   - Mayoritas aplikasi latihan CPNS/BUMN hanya memindahkan soal PDF ke layar web lalu menempelkan pembahasan sepanjang 1 halaman penuh. Di ujian asli, cara penyelesaian buku teks yang memakan waktu 3 menit sama saja dengan gagal karena jatah waktu riil hanya **43–54 detik per soal**.
2. **Tantang Asumsi (Challenge Thinking — Sistem Hint):**
   - *Masalah desain umum:* Saat pengguna menekan tombol "Hint", aplikasi biasa langsung memunculkan pembahasan atau membocorkan kunci jawaban (*"Jawaban: C"*). Begitu melihat huruf kunci, otak berhenti berpikir (*illusion of competence*).
   - *Solusi Arsitektur Jhâr-Ajhârân:* **Deck Hint Bertingkat (3 Lensa Penyelesaian + 1 Radar Jebakan)** yang **TIDAK membocorkan huruf jawaban** sampai pengguna benar-benar menekan salah satu opsi A–E:
     - **Taktik 1 · Jalur Kilat (< 15 Detik):** Cara potong kompas (cek digit ekor, taksiran pecahan istimewa, tebang kuantor silogisme, atau pindai kalimat terakhir sebelum tanya).
     - **Taktik 2 · Eliminasi Pengecoh:** Cara membuang 3 opsi terlemah dalam sekali lirik sehingga tersisa 2 kandidat terkuat.
     - **Taktik 3 · Pola & Logika Inti:** Kerangka konsep dasar jika pembuat soal memutar angka atau konteks cerita.
     - **Radar Jebakan (*Trap Alert*):** Mengungkap opsi mana yang sengaja dipasang pembuat soal untuk menjebak peserta yang terburu-buru.
3. **5 Kelemahan Terbesar Aplikasi Sejenis & Solusi Teknis di Jhâr-Ajhârân:**
   - **Kelemahan 1 — Menyamakan Skoring TKP/AKHLAK dengan Benar/Salah (5/0):**
     - *Solusi:* Mesin skoring ganda (`binary` 5/0 untuk TWK, TIU, TKD, Bahasa Inggris; `weighted` rentang 1–5 untuk TKP CPNS & AKHLAK BUMN). Saat pembahasan terbuka, aplikasi menampilkan **bobot poin kelima opsi A sampai E secara transparan (5, 4, 3, 2, 1)** agar pengguna paham selisih tipis antara skor 4 dan skor 5.
   - **Kelemahan 2 — Buta Kecepatan per Nomor (*Time-Sink Blindness*):**
     - *Solusi:* *Stopwatch* mikro per nomor yang membandingkan waktu jawab terhadap batas ideal subtes (misal 54 detik di TIU, 45 detik di TKD BUMN). Nomor yang menyedot waktu berlebih otomatis ditandai sebagai **Lubang Waktu (*Time-Sink*)**.
   - **Kelemahan 3 — Mengulang Soal yang Sudah Hafal & Melupakan Soal yang Salah:**
     - *Solusi:* **Kotak Remidi Otomatis** berbasis penyimpanan lokal (`IndexedDB` + `localStorage`). Setiap soal yang dijawab salah, mendapat skor <5 pada TKP/AKHLAK, ditandai ragu-ragu, atau memakan waktu melebihi target otomatis masuk ke antrean Remidi untuk dilatih ulang secara terfokus.
   - **Kelemahan 4 — Klaim Offline Palsu (Masih Bergantung CDN Font/Script):**
     - *Solusi:* Seluruh font (`Geist` & `Geist Mono` `.woff2`), ikon SVG/PNG, stylesheet, mesin grafik SVG, dan bank soal JSON dibundel 100% lokal dan di-precache oleh `sw.js`. Aplikasi berjalan penuh di Mode Pesawat.
   - **Kelemahan 5 — Data Progres Terkunci di Satu Perangkat karena Tanpa Server:**
     - *Solusi:* Fitur **Ekspor & Impor Snapshot Progres (`.json`)**. Pengguna dapat berlatih di PC, mengekspor file cadangan berukuran beberapa kilobyte, lalu mengimpornya di HP tanpa perlu akun cloud atau database eksternal.

---

## 3. Ide Fitur Tambahan yang Langsung Diimplementasikan

- **Dua Mode Latihan Kontras:**
  1. **Mode Latihan Jhâr-Ajhârân (Bongkar Cepat):** Bebas membuka Taktik 1, 2, 3 sebelum menjawab; umpan balik skor dan bedah opsi muncul seketika begitu opsi diklik.
  2. **Mode Simulasi CAT Murni (Tekanan Ujian Asli):** Hint dikunci rapat, hitung mundur ketat, tombol **Ragu-Ragu** aktif, dan hasil beserta audit kebocoran waktu baru dibuka serentak saat ujian diselesaikan.
- **Ergonomi Ganda (PC Keyboard-First + HP Satu Jempol):**
  - **PC/Laptop:** Pintasan keyboard penuh tanpa harus menggeser mouse (`A`–`E` atau `1`–`5` pilih jawaban, `H` buka taktik berikutnya, `R` tandai ragu-ragu, `←`/`→` pindah soal).
  - **HP (Layar Sempit):** Navigasi bawah menempel di jangkauan ibu jari dengan laci *Peta Nomor Soal* instan.
- **Arsitektur Paket Modular (`ExamPack` Schema):**
  - **Fase 1 (Aktif Penuh):** SKD CPNS (TWK, TIU, TKP) & RBB BUMN (TKD, Core Values AKHLAK, English/Learning Agility).
  - **Fase 2 (Ekspansi Siap Pakai):** Modul **TOEIC** & **IELTS** (mendukung teks wacana berdampingan / *reading passage* dan *offline audio cue*).
