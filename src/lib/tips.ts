import knowledge from './knowledge.json' with { type: 'json' };
import { cleanDisplayText } from './sanitize';

function makeLaypersonFriendly(txt: string): string {
  return cleanDisplayText(txt)
    .replace(/\bUₙ\b/g, 'Nilai urutan ke-n (Uₙ)')
    .replace(/\bUₘ\b/g, 'Nilai urutan tujuan (Uₘ)')
    .replace(/\bUₖ\b/g, 'Nilai yang sudah diketahui (Uₖ)')
    .replace(/\bO₁\s*[×x]\s*W₁\s*=\s*O₂\s*[×x]\s*W₂\b/g, 'Orang awal × Hari awal = Orang baru × Hari baru');
}

export interface TipCard {
  id: string;
  subtest: string;
  tag: string;
  title: string;
  standard?: string;
  shortcut: string;
  example?: string;
  trap?: string;
}

export interface GlossaryItem {
  term: string;
  def: string;
  subtest: string;
}

export const CPNS_TIPS: TipCard[] = [
  {
    id: 'tkp-judul',
    subtest: 'TKP',
    tag: 'Bongkar TKP · Poin 5',
    title: 'Kunci Emas: Baca Judul Submateri',
    standard: 'Menimbang kepantasan moral dan dampak kelima opsi satu per satu secara umum.',
    shortcut:
      'Setiap soal TKP menguji 1 dari 6 aspek: **Pelayanan Publik**, **Jejaring Kerja**, **Sosial Budaya**, **TIK**, **Profesionalisme**, atau **Anti-Radikalisme**. Pilih opsi yang langsung mempraktikkan kata kunci aspek dengan sikap ==proaktif, tenang, dan taat SOP==.',
    example:
      'Aspek Pelayanan Publik → prioritaskan **kepuasan & kemudahan warga** meski jam sibuk, __tanpa melanggar aturan antrean__.',
    trap: '~~Opsi yang terdengar heroik tapi menyalahkan pihak lain, menunda ("menunggu arahan nanti"), atau melompati SOP~~ biasanya jatuh ke poin 2–3.',
  },
  {
    id: 'tiu-berbalik',
    subtest: 'TIU',
    tag: 'Rumus Cepat · Teruji',
    title: 'Perbandingan Berbalik Nilai (Pekerja & Hari)',
    standard: 'Menghitung kemampuan kerja 1 orang per hari (`1 ÷ (Orang × Hari)`), lalu menghitung sisa beban kerja.',
    shortcut:
      'Kalikan saja **Orang × Hari**! Jika proyek terhenti di tengah: ==(Orang awal × Sisa hari rencana) = (Total pekerja baru × Sisa hari sebenarnya)==. Jika hasil koma (misal `22,5 orang`), __wajib bulatkan ke atas__ jadi ==23 orang==.',
    example:
      'Target 20 hari oleh 15 orang. Sudah kerja 8 hari, libur 4 hari (`sisa waktu = 20 − 8 − 4 = 8 hari`): `15 × (20 − 8) = 180 ÷ 8 = 22,5` → ==23 orang== (tambah ==8 pekerja==).',
    trap: '~~Lupa mengurangi hari yang sudah dikerjakan~~ sebelum mengalikan beban sisa pekerjaan.',
  },
  {
    id: 'tiu-susul',
    subtest: 'TIU',
    tag: 'Rumus Cepat · Teruji',
    title: 'Jarak, Susul-Menyusul & Berpapasan',
    standard: 'Menyusun persamaan jarak tempuh keduanya lalu mencari waktu temu `t`.',
    shortcut:
      '**Berpapasan (berangkat bareng)**: ==Waktu = Jarak Total ÷ (Kecepatan 1 + Kecepatan 2)==. **Susul-menyusul**: hitung ==Jarak duluan = V₁ × selisih jam==, lalu ==Waktu susul = Jarak duluan ÷ (V penyusul − V disusul)==. Rata-rata pergi-pulang jarak sama: `(2 × V₁ × V₂) ÷ (V₁ + V₂)`.',
    example:
      'A berangkat 06.40 (`60 km/jam`), B menyusul 07.00 (`70 km/jam`). Jarak duluan = `1/3 × 60 = 20 km`. Waktu susul = `20 ÷ (70 − 60) =` ==2 jam dari jam B (07.00)== → ketemu pukul ==09.00==.',
    trap: '~~Menambahkan waktu susul ke jam berangkat orang pertama~~, padahal wajib dihitung dari __jam berangkat orang KEDUA__.',
  },
  {
    id: 'tiu-aljabar',
    subtest: 'TIU',
    tag: 'Rumus Cepat · Teruji',
    title: 'Trik Kuadrat, Akar Berulang & Persen Istimewa',
    standard: 'Menghitung bilangan kuadrat atau persentase satu per satu secara manual.',
    shortcut:
      '1) `a² − b² =` ==(a + b) × (a − b)==. 2) Akar bertingkat `√(k + √(k + ...))`: cari 2 angka berurutan hasil kali `k` → tanda **+** ambil ==angka besar==, **−** ambil ==angka kecil==. 3) Hafal pecahan: `12,5% = 1/8`, `25% = 1/4`, `37,5% = 3/8`, `66,7% = 2/3`.',
    example:
      '`(786/3)² − (714/3)² = 500 × 24 =` ==12.000==. Untuk `√(30 + √(30 + ...))`: `30 = 5 × 6`, tanda **+** ambil ==6==.',
    trap: 'Diskon bertingkat `50% + 20%` ~~BUKAN potongan 70%~~! Hitung sisa bayar: `50% × 80% = 40%`, total diskon ==60%==.',
  },
];

export const BUMN_TIPS: TipCard[] = [
  {
    id: 'bumn-akhlak',
    subtest: 'AKHLAK',
    tag: 'Tahap 1 · Core Values',
    title: 'Kode Etik 6 Pilar AKHLAK BUMN',
    standard: 'Memilih jawaban yang terdengar paling sopan atau normatif secara umum.',
    shortcut:
      '**AMANAH** (__integritas/tepati janji__), **KOMPETEN** (__terus belajar & mutu__), **HARMONIS** (__peduli & hargai beda__), **LOYAL** (__utamakan bangsa/BUMN__), **ADAPTIF** (__inovasi & siap berubah__), **KOLABORATIF** (==sinergi lintas tim==).',
    example:
      'Sistem ERP baru lambat diadopsi tim → pilih ==memfasilitasi sesi belajar bersama & umpan balik konstruktif== (**Adaptif + Kolaboratif**).',
    trap: '~~Menegur rekan keras di forum umum~~ atau ~~mengerjakan tugas tim sendirian~~ melanggar **Harmonis & Kolaboratif**.',
  },
  {
    id: 'bumn-deret',
    subtest: 'TKD',
    tag: 'Tahap 1 · Number Sequence',
    title: 'Scan 3 Detik Pola Deret RBB BUMN',
    standard: 'Mencoba satu per satu operasi (+, −, ×, ÷) antara suku ke-1 dan suku ke-2 saja.',
    shortcut:
      'Uji berurutan: **(1)** Selisih 1 tingkat, **(2)** Pola ==lompat-1 / lompat-2== (__dua deret terpisah__), **(3)** Selisih tingkat-2 atau rasio `×/÷`, **(4)** Fibonacci / kuadrat ± k.',
    example:
      'Deret `3, 10, 6, 20, 12, 40, ...` → pisah posisi **ganjil** (`3, 6, 12 = ×2`) dan **genap** (`10, 20, 40 = ×2`) → berikutnya ==24==.',
    trap: '~~Terpaku mencari selisih antar suku berdekatan~~ saat sebenarnya ada **2 sub-deret berselang-seling**.',
  },
  {
    id: 'bumn-diagram',
    subtest: 'TKD',
    tag: 'Tahap 1 · Verbal & Diagram',
    title: 'Word Classification & Diagram Reasoning',
    standard: 'Mencocokkan seluruh elemen gambar sekaligus di kepala.',
    shortcut:
      '**Word Classification**: kelompokkan 4 kata berdasar __fungsi/sifat spesifik__ lalu buang 1 yang ganjil. **Diagram Reasoning**: lacak ==1 aturan per simpul operator== (rotasi, balik warna, tukar posisi) dari **kiri ke kanan**.',
    example:
      'Jika `▲` memutar `90° searah jarum jam` dan `■` menukar dalam-luar, jalankan ==kiri-ke-kanan satu per satu==.',
    trap: '~~Menilai seluruh perubahan gambar sekaligus~~ sehingga tertukar antara **rotasi 90° CW** dan **pencerminan vertikal**.',
  },
  {
    id: 'bumn-grammar',
    subtest: 'B. Inggris',
    tag: 'Tahap 2 · Structure & Error ID',
    title: '5 Aturan Grammar Langganan RBB BUMN',
    standard: 'Menerjemahkan kalimat secara penuh kata demi kata ke bahasa Indonesia.',
    shortcut:
      '1) **Subject–Verb Agreement**: abaikan frasa `"along with / as well as / of ..."` — ==Each / Every / Neither / The number of = Verb tunggal==. 2) Conditional Type 2/3. 3) Parallelism (`and/or/but`). 4) Preposition + `V-ing`. 5) `Its` vs `It\'s`.',
    example:
      '`The number of applicants` ==IS== `increasing`, sedangkan `A number of applicants` ==ARE== `waiting`.',
    trap: '~~Tertarik oleh kata benda jamak tepat sebelum verb~~ (mis. `The quality [of these products]` ~~ARE~~ → wajib ==IS==!).',
  },
  {
    id: 'bumn-reading',
    subtest: 'B. Inggris',
    tag: 'Tahap 2 · Reading Comprehension',
    title: 'Teknik Skimming Soal Bacaan Panjang',
    standard: 'Membaca seluruh teks panjang dari awal sampai akhir sebelum melihat soal.',
    shortcut:
      'Baca **PERTANYAAN lebih dulu**! **Main Idea/Purpose** → cek ==kalimat pertama & terakhir tiap paragraf==. **Detail/Inference** → cari kata kunci unik (nama, angka, istilah) lalu baca __1 kalimat sebelum & sesudahnya__.',
    example:
      'Soal `except / NOT mentioned` → cek 3 opsi yang __jelas ada__ di bacaan, sisanya yang melenceng atau terbalik adalah ==jawabannya==.',
    trap: '~~Opsi jebakan yang menyalin kata persis dari paragraf tapi membalik sebab-akibat~~ atau menyelipkan kata mutlak (`always`, `never`, `only`).',
  },
  {
    id: 'bumn-agility',
    subtest: 'Learning Agility',
    tag: 'Tahap 2 · SJT Agility',
    title: '5 Dimensi Learning Agility (Mental, People, Change, Results, Self)',
    standard: 'Memilih tindakan paling hati-hati atau menunggu instruksi atasan sepenuhnya.',
    shortcut:
      'Nilai tertinggi selalu diberikan pada sikap: **penasaran konstruktif**, ==cepat belajar dari kegagalan==, **terbuka menerima kritik**, __adaptasi saat target berubah__, dan tetap berkolaborasi mengeksekusi hasil.',
    example:
      'Diminta memegang teknologi baru dengan tenggat ketat → ==petakan gap skill, cari mentor/dokumentasi resmi, dan uji prototipe kecil==.',
    trap: 'Memilih ~~"menerobos tanpa diskusi risiko"~~ atau ~~"menolak tugas hingga diberi pelatihan penuh"~~.',
  },
];

export const BUMN_GLOSSARY: GlossaryItem[] = [
  { term: 'AMANAH (AKHLAK)', def: 'Memegang teguh kepercayaan yang diberikan: memenuhi janji/komitmen, bertanggung jawab atas tugas, dan berpegang teguh pada nilai moral/etika.', subtest: 'AKHLAK' },
  { term: 'KOMPETEN (AKHLAK)', def: 'Terus belajar dan mengembangkan kapabilitas: meningkatkan kompetensi diri, membantu orang lain belajar, dan menyelesaikan tugas dengan kualitas terbaik.', subtest: 'AKHLAK' },
  { term: 'HARMONIS (AKHLAK)', def: 'Saling peduli dan menghargai perbedaan: menghormati setiap orang apa pun latar belakangnya dan membangun lingkungan kerja kondusif.', subtest: 'AKHLAK' },
  { term: 'LOYAL (AKHLAK)', def: 'Berdedikasi dan mengutamakan kepentingan Bangsa dan Negara: menjaga nama baik sesama karyawan, pimpinan, BUMN, dan Negara.', subtest: 'AKHLAK' },
  { term: 'ADAPTIF (AKHLAK)', def: 'Terus berinovasi dan antusias dalam menggerakkan maupun menghadapi perubahan secara proaktif.', subtest: 'AKHLAK' },
  { term: 'KOLABORATIF (AKHLAK)', def: 'Membangun kerja sama yang sinergis: memberi kesempatan berbagai pihak berkontribusi dan terbuka dalam bekerja sama.', subtest: 'AKHLAK' },
  { term: 'Change Agility', def: 'Kesiapan bereksperimen, belajar dari kesalahan, dan tetap nyaman bekerja di tengah perubahan atau ketidakpastian baru.', subtest: 'Learning Agility' },
  { term: 'Mental Agility', def: 'Kemampuan berpikir kritis, nyaman menghadapi kompleksitas masalah baru, serta mencari akar persoalan dari banyak sudut pandang.', subtest: 'Learning Agility' },
  { term: 'People Agility', def: 'Terbuka terhadap sudut pandang beragam, mampu memotivasi tim berbeda karakter, dan membangun relasi produktif.', subtest: 'Learning Agility' },
  { term: 'Results Agility', def: 'Mampu mengeksekusi target ambisius pada situasi yang belum pernah dihadapi sambil menginspirasi kepercayaan tim.', subtest: 'Learning Agility' },
  { term: 'Self-Awareness', def: 'Kesadaran jujur atas kekuatan dan titik lemah diri serta keterbukaan menerima umpan balik.', subtest: 'Learning Agility' },
  { term: 'Subject–Verb Agreement', def: 'Keselarasan tunggal/jamak antara subjek inti kalimat (mengabaikan frasa preposisi di tengah) dengan kata kerja utama.', subtest: 'B. Inggris' },
  { term: 'Its vs It’s', def: '"Its" menunjukkan kepemilikan (possessive pronoun), sedangkan "It’s" adalah singkatan dari "it is" atau "it has".', subtest: 'B. Inggris' },
  { term: 'Fewer vs Less', def: '"Fewer" dipakai untuk benda dapat dihitung jamak (fewer applicants), "less" untuk benda tak terhitung (less time).', subtest: 'B. Inggris' },
];

export function tipsForFamily(family: 'cpns' | 'bumn'): TipCard[] {
  if (family === 'bumn') return BUMN_TIPS;

  const extraFromLib: TipCard[] = [];
  const rawLib = (knowledge as {
    bakuMudah?: Record<string, { title: string; standard: string; shortcut: string; example: string }[]>;
  }).bakuMudah ?? {};

  for (const [stKey, rows] of Object.entries(rawLib)) {
    const subLabel = stKey.toUpperCase();
    rows.forEach((r, idx) => {
      extraFromLib.push({
        id: `lib-${stKey}-${idx}`,
        subtest: subLabel,
        tag: 'Cara Baku vs Mudah',
        title: makeLaypersonFriendly(r.title),
        standard: makeLaypersonFriendly(r.standard),
        shortcut: makeLaypersonFriendly(r.shortcut),
        example: makeLaypersonFriendly(r.example),
      });
    });
  }

  return [...CPNS_TIPS, ...extraFromLib];
}

export function glossaryForFamily(family: 'cpns' | 'bumn'): GlossaryItem[] {
  if (family === 'bumn') return BUMN_GLOSSARY;
  const raw = (knowledge as { glossary?: GlossaryItem[] }).glossary ?? [];
  return raw.map((g) => ({
    ...g,
    term: cleanDisplayText(g.term),
    def: cleanDisplayText(g.def),
  }));
}
