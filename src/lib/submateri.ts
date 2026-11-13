// Katalog Kisi-Kisi Submateri (SmartCASN CPNS 21 Submateri + RBB BUMN)
// Disusun berdasar psikologi belajar: Concrete Analogy -> Dual Coding Visual -> Chunking 3 Detik -> Alarm Jebakan -> Active Recall.

export type DiagramId =
  | 'berbalik-nilai'
  | 'gerak-temu'
  | 'silogisme-venn'
  | 'persen-tangki'
  | 'deret-scanner'
  | 'tkp-akhlak-radar'
  | 'integritas-detektor'
  | 'pilar-lembaga'
  | 'kebangsaan-timeline'
  | 'kalimat-efektif-xray'
  | 'analogi-jembatan'
  | 'analitis-slot'
  | 'kuantitatif-uji3'
  | 'figural-transform'
  | 'tkd-verbal-filter'
  | 'bumn-english-xray';

export interface MicroCheck {
  prompt: string;
  options: string[];
  answerIndex: number;
  feedback: string;
}

export interface SubmateriMeta {
  id: string;
  family: 'cpns' | 'bumn';
  subtestId: string;
  subtestLabel: string;
  group: string;
  title: string;
  goal: string;
  psychTechnique: string;
  analogy: string;
  coreRule: string;
  fastSteps: string[];
  commonTrap: string;
  diagramId: DiagramId;
  microCheck: MicroCheck;
}

export interface SubmateriPackRef {
  packId: string;
  qIds: string[];
}

export interface SubmateriBucket {
  id: string;
  family: 'cpns' | 'bumn';
  subtest: string;
  count: number;
  packs: SubmateriPackRef[];
}

export interface SubmateriIndexFile {
  version: number;
  totalMapped: number;
  submateris: Record<string, SubmateriBucket>;
}

export const SUBMATERI_LIST: SubmateriMeta[] = [
  // ================= CPNS — TWK (5 Submateri Resmi) =================
  {
    id: 'cpns-twk-nasionalisme',
    family: 'cpns',
    subtestId: 'twk',
    subtestLabel: 'TWK',
    group: 'TWK · Wawasan Kebangsaan',
    title: 'Nasionalisme & Sejarah Kebangsaan',
    goal: 'Menguji kemampuan menempatkan **kepentingan bangsa** di atas golongan sambil mempertahankan __identitas nasional__ dalam kehidupan sehari-hari.',
    psychTechnique: 'Jangkar Kronologi + Filter Kepentingan Publik',
    analogy:
      'Bayangkan Anda menjadi **kapten tim sepak bola antarkampung**: meski punya sahabat akrab, saat bertanding Anda tetap ==memprioritaskan kemenangan tim di atas rasa suka pribadi==.',
    coreRule:
      'Pegang 4 jangkar sejarah: ==1908 Budi Utomo== (pendidikan) → ==1912 Indische Partij== (politik) → ==1928 Sumpah Pemuda== (persatuan) → ==1945 Merdeka==. Dalam soal kasus, pilih sikap yang __merangkul keberagaman__ dan menjaga produk/bahasa/martabat bangsa.',
    fastSteps: [
      'Cari kata **persatuan**, **bahasa Indonesia**, **cinta produk dalam negeri**, atau **mendahulukan negara**.',
      'Untuk soal sejarah, bedakan tugas: `BPUPKI = merumuskan`, `PPKI = mengesahkan`.',
      'Pilih aksi ==aktif & inklusif== yang merangkul semua suku tanpa membeda-bedakan.',
    ],
    commonTrap:
      'Memilih jawaban yang terlihat **patriotik tapi ~~eksklusif / chauvinistis~~** (merendahkan budaya daerah lain atau menolak kerja sama internasional).',
    diagramId: 'kebangsaan-timeline',
    microCheck: {
      prompt: 'Rekan dari daerah berbeda mengusulkan istilah lokal untuk program layanan nasional. Sikap nasionalisme paling tepat adalah…',
      options: [
        'Menolak langsung karena harus memakai istilah pusat',
        'Memakai bahasa Indonesia sebagai induk, sambil menghargai usulan bila selaras',
        'Membiarkan tanpa keputusan agar tidak ada konflik',
      ],
      answerIndex: 1,
      feedback: '==Tepat!== Nasionalisme memelihara **bahasa persatuan** tanpa memadamkan __kebhinekaan budaya daerah__.',
    },
  },
  {
    id: 'cpns-twk-integritas',
    family: 'cpns',
    subtestId: 'twk',
    subtestLabel: 'TWK',
    group: 'TWK · Wawasan Kebangsaan',
    title: 'Integritas & Antikorupsi',
    goal: 'Mengukur konsistensi **kejujuran, keteguhan hati**, menolak suap/gratifikasi, serta mencegah __benturan kepentingan__.',
    psychTechnique: 'Detektor Kata "Meskipun / Justru" + Tes Cermin Publik',
    analogy:
      'Integritas itu seperti **rem mobil saat turunan sepi malam hari**: tidak ada polisi yang melihat, tapi Anda tetap ==patuh batas aman karena prinsip diri==.',
    coreRule:
      'Bedakan 3 pelanggaran: ==Suap== (__kesepakatan 2 arah__), ==Gratifikasi== (__pemberian terkait jabatan tanpa deal, wajib lapor KPK max 30 hari kerja__), ==Pemerasan== (__pejabat memaksa meminta__). Bila ada keluarga ikut tender unit Anda → __wajib mundur dari tim penilai__.',
    fastSteps: [
      'Baca kata penghubung **meski** atau **justru** pada soal tokoh teladan untuk menemukan ==godaan yang dilawan==.',
      'Jika ada uang terima kasih / parsel jabatan → jawab ==tolak tegas atau laporkan ke UPG/KPK==.',
      'Pisahkan **kepintaran/prestasi kerja** dari **kejujuran**.',
    ],
    commonTrap:
      '~~Memilih prestasi akademik/jabatan tinggi tokoh~~ padahal yang ditanya adalah **nilai integritas/kesederhanaan**nya.',
    diagramId: 'integritas-detektor',
    microCheck: {
      prompt: 'Seorang pemohon izin mengirim parcel lebaran ke rumah Anda tanpa perjanjian apa pun sebelumnya. Kategori & sikap paling tepat?',
      options: [
        'Suap — boleh diterima asalkan izin sudah selesai',
        'Gratifikasi terkait jabatan — tolak sopan atau laporkan ke UPG/KPK',
        'Hadiah pribadi — sah karena diterima di rumah',
      ],
      answerIndex: 1,
      feedback: '==Benar!== Pemberian terkait jabatan tanpa kesepakatan awal termasuk **gratifikasi** dan __wajib ditolak/dilaporkan__.',
    },
  },
  {
    id: 'cpns-twk-bela-negara',
    family: 'cpns',
    subtestId: 'twk',
    subtestLabel: 'TWK',
    group: 'TWK · Wawasan Kebangsaan',
    title: 'Bela Negara & Ketahanan Nasional',
    goal: 'Menilai peran aktif warga negara menghadapi **ancaman militer dan non-militer** sesuai profesi masing-masing.',
    psychTechnique: 'Pemetaan 3 Lapis Pertahanan (UU 23/2019)',
    analogy:
      'Negara itu seperti rumah bersama: **satpam berseragam adalah TNI**, sedangkan ==Anda yang mengunci pagar, menyaring berita hoaks, dan bayar iuran keamanan adalah Bela Negara non-militer==.',
    coreRule:
      'UU 23/2019 PSDN membagi 3 komponen: ==Komponen Utama = TNI==, ==Komponen Cadangan = warga/sumber daya sukarela yang dilatih militer==, ==Komponen Pendukung = profesi/fasilitas sipil==. Tanggal bersejarah: ==19 Desember 1948== Agresi II / PDRI → **Hari Bela Negara**.',
    fastSteps: [
      'Cek profesi di soal: guru mengajar di 3T, dokter tangani wabah, atau IT cegah siber = ==Bela Negara non-militer==.',
      'Ancaman **ideologi/ekonomi/hoaks/siber** diatasi lewat literasi & ketahanan profesi, bukan senjata.',
      'Ingat dasar konstitusi: __Pasal 27 ayat (3)__ hak & kewajiban bela negara; __Pasal 30__ hankam.',
    ],
    commonTrap:
      '~~Mengira Bela Negara hanya wajib angkat senjata / perang fisik~~ — padahal mayoritas soal menguji aksi sipil sehari-hari.',
    diagramId: 'kebangsaan-timeline',
    microCheck: {
      prompt: 'Dokter yang secara sukarela mengabdi menanggulangi wabah di wilayah perbatasan mewujudkan Bela Negara sebagai…',
      options: [
        'Komponen Utama pertahanan',
        'Pengabdian sesuai profesi menghadapi ancaman non-militer',
        'Pelaksanaan wajib militer',
      ],
      answerIndex: 1,
      feedback: '==Tepat!== Mengabdi sesuai keahlian profesi adalah bentuk nyata **Bela Negara non-militer** (UU 3/2002 & UU 23/2019).',
    },
  },
  {
    id: 'cpns-twk-pilar-negara',
    family: 'cpns',
    subtestId: 'twk',
    subtestLabel: 'TWK',
    group: 'TWK · Wawasan Kebangsaan',
    title: 'Pilar Negara (Pancasila · UUD · NKRI · Bhinneka)',
    goal: 'Menguji pengamalan nilai **4 Pilar Kebangsaan**, hubungan antarlembaga negara, serta pasal kunci UUD 1945.',
    psychTechnique: 'Kamus Cepat 5 Sila + Peta Pasal 27–34',
    analogy:
      '4 Pilar adalah **rangka bangunan rumah**: Pancasila itu **fondasi nilai**, UUD 1945 **denah aturan**, NKRI **dinding persatuan**, dan Bhinneka Tunggal Ika **perekat keberagaman**.',
    coreRule:
      'Kunci Sila: ==Sila 1 = Ibadah/Toleransi Agama== · ==Sila 2 = Kemanusiaan/HAM/Adil-Beradab== · ==Sila 3 = Persatuan/Cinta Tanah Air== · ==Sila 4 = Musyawarah/Demokrasi/Tidak Paksa Kehendak== · ==Sila 5 = Keadilan Sosial/Kerja Keras/Anti-Gaya Mewah==. Lembaga: **MK** uji UU thd UUD & bubarkan parpol; **MA** kasasi & uji aturan di bawah UU; **BPK** periksa keuangan.',
    fastSteps: [
      'Soal kasus Pancasila: tanya **inti tindakannya** (misal: bantu korban bencana antarnegara → `Sila 2`; hargai pendapat rapat → `Sila 4`; antre & hemat → `Sila 5`).',
      'Hafal tema pasal: `27` warga & bela negara, `28` HAM, `29` agama, `30` hankam, `31` pendidikan, `32` budaya, `33` ekonomi, `34` fakir miskin.',
      'Hierarki UU 12/2011: aturan di bawah __tidak boleh__ bertentangan dengan aturan di atas.',
    ],
    commonTrap:
      '~~Tertukar antara Sila 2 (kemanusiaan/martabat individu) dan Sila 5 (pemerataan kesejahteraan/hak-kewajiban sosial)~~ serta tertukar wewenang ~~MK vs MA~~.',
    diagramId: 'pilar-lembaga',
    microCheck: {
      prompt: 'Peraturan Daerah (Perda) dianggap bertentangan dengan Undang-Undang di atasnya. Lembaga yang berwenang menguji adalah…',
      options: ['Mahkamah Konstitusi (MK)', 'Mahkamah Agung (MA)', 'Komisi Yudisial (KY)'],
      answerIndex: 1,
      feedback: '==Benar!== ==MK== menguji UU terhadap UUD 1945, sedangkan ==MA== menguji aturan **di bawah UU** (PP/Perpres/Perda) terhadap UU.',
    },
  },
  {
    id: 'cpns-twk-bahasa',
    family: 'cpns',
    subtestId: 'twk',
    subtestLabel: 'TWK',
    group: 'TWK · Wawasan Kebangsaan',
    title: 'Bahasa Indonesia (Kalimat Efektif & EYD)',
    goal: 'Menguji kemampuan menyunting kalimat **efektif, baku, ejaan EYD V**, serta menemukan __ide pokok__ bacaan cepat.',
    psychTechnique: 'Teknik Coret Kata Mubazir + Cek Subjek-Predikat',
    analogy:
      'Kalimat efektif itu seperti **mengemas koper kabin**: keluarkan barang ganda yang tidak perlu (`agar supaya`, `para hadirin sekalian`, `di mana`) supaya langsung padat dan jelas.',
    coreRule:
      'Syarat kalimat efektif: **Ada Subjek + Predikat jelas** (__jangan diawali preposisi "Bagi/Untuk/Dalam" sebelum Subjek__), **Hemat** (hapus sinonim ganda), **Sejajar** (imbuhan setara: `me-..., me-..., bukan ter-`), **Baku** (`analisis`, `risiko`, `izin`, `sistem`, `napas`).',
    fastSteps: [
      '~~Coret kalimat yang diawali "Bagi para siswa diharapkan…"~~ karena subjeknya hilang tertelan preposisi.',
      'Coret kata boros ganda: `sangat sekali`, `naik ke atas`, `demi untuk`, `para tamu-tamu`.',
      'Cari ide pokok paragraf di **kalimat pertama (deduktif)** atau **kalimat terakhir (induktif)** terlebih dahulu.',
    ],
    commonTrap:
      '~~Menganggap kata populer sehari-hari (analisa, resiko, ijin, kwalitas, praktek) sebagai kata baku KBBI~~.',
    diagramId: 'kalimat-efektif-xray',
    microCheck: {
      prompt: 'Manakah penulisan kata baku & kalimat paling efektif?',
      options: [
        'Bagi para peserta dimohon mengumpulkan berkas analisa resiko.',
        'Para peserta dimohon mengumpulkan berkas analisis risiko.',
        'Semua para peserta-peserta mengumpulkan berkas ijin praktek.',
      ],
      answerIndex: 1,
      feedback: '==Tepat!== Tanpa kata depan mubazir di awal subjek, serta menggunakan kata baku ==analisis== & ==risiko==.',
    },
  },

  // ================= CPNS — TIU (10 Submateri Resmi) =================
  {
    id: 'cpns-tiu-analogi',
    family: 'cpns',
    subtestId: 'tiu',
    subtestLabel: 'TIU · Verbal',
    group: 'TIU · Kemampuan Verbal',
    title: 'Analogi Kata & Hubungan Makna',
    goal: 'Menguji kejelian menemukan **pola hubungan identik** antara dua pasang kata dalam hitungan detik.',
    psychTechnique: 'Kalimat Jembatan 1 Arah (Verb Connector)',
    analogy:
      'Jangan menebak arti kata satu per satu—buatlah **kalimat penghubung pendek**. Misal `Gergaji : Kayu` → *"Gergaji adalah **alat untuk memotong** kayu"*, lalu uji kalimat yang persis sama ke pilihan A–E!',
    coreRule:
      '__Urutan kiri-kanan tidak boleh terbalik!__ Jika ruas kiri `Alat : Objek`, maka jawaban __wajib__ `Alat : Objek` (~~jangan pilih `Objek : Alat`~~).',
    fastSteps: [
      'Buat **kalimat jembatan aktif** paling spesifik (`X berfungsi untuk Y`, `X menghasilkan Y`, `X bagian dari Y`).',
      'Cek __arah urutan__ (sebab→akibat vs akibat→sebab).',
      'Jika 2 opsi mirip, persempit kalimat jembatan hingga menyisakan 1 pasangan identik.',
    ],
    commonTrap:
      '~~Memilih pasangan kata yang topiknya sama tapi hubungannya terbalik arah~~ (misal: `Dokter : Pasien` disamakan dengan `Murid : Guru`).',
    diagramId: 'analogi-jembatan',
    microCheck: {
      prompt: 'Kompas : Arah = Termometer : …',
      options: ['Panas', 'Suhu', 'Demam'],
      answerIndex: 1,
      feedback: '==Benar!== Kalimat jembatan: *"Kompas alat untuk mengukur **arah**"* → *"Termometer alat untuk mengukur ==suhu=="* (bukan cuma panas/demam).',
    },
  },
  {
    id: 'cpns-tiu-silogisme',
    family: 'cpns',
    subtestId: 'tiu',
    subtestLabel: 'TIU · Verbal',
    group: 'TIU · Kemampuan Verbal',
    title: 'Silogisme & Penalaran Logis (Semua / Sebagian)',
    goal: 'Menarik kesimpulan **pasti benar** dari premis bersyarat (`Semua`, `Sebagian/Ada`, `Jika → Maka`) tanpa asumsi luar.',
    psychTechnique: 'Dual Coding Lingkaran Venn + Coret Kata Kembar',
    analogy:
      'Bayangkan **kardus besar berisi kardus kecil**. Jika **semua Apel ada di kardus Buah**, lalu **Sebagian Apel busuk**, maka sudah pasti ==Ada (Sebagian) Buah yang busuk==.',
    coreRule:
      '**Aturan Emas:** 1) `Semua A + Sebagian B` → kesimpulan **pasti diawali** __"Sebagian / Ada"__ (~~coret opsi berawalan "Semua"~~). 2) `Semua X = Y` dan `Tidak ada Y = Z` → `Tidak ada X = Z`. 3) `Jika P maka Q` **setara (ekuivalen)** dengan `Jika Tidak Q maka Tidak P` (__balik posisi & negasikan kedua ruas__).',
    fastSteps: [
      '**Coret istilah kembar** yang muncul di kedua premis untuk menyambungkan ujung ke ujung.',
      'Jika satu premis memakai kata **Sebagian / Ada**, langsung buang semua opsi bertuliskan `Semua`.',
      'Untuk `Jika P → Q` dan `Tidak Q`, jawabannya pasti ==Tidak P (Modus Tollens)==.',
    ],
    commonTrap:
      '~~Mengira "Jika P maka Q" berpasangan dengan "Tidak P" menghasilkan "Tidak Q"~~ — ini sesat pikir terpopuler! Jika hujan maka jalan basah; tidak hujan ≠ jalan kering (bisa disiram!).',
    diagramId: 'silogisme-venn',
    microCheck: {
      prompt: 'Premis 1: Semua peserta ujian memakai kemeja putih. Premis 2: Sebagian peserta memakai kacamata. Simpulan sah?',
      options: [
        'Semua yang berkacamata memakai kemeja putih.',
        'Sebagian yang memakai kacamata adalah peserta yang berkemeja putih.',
        'Sebagian peserta ujian tidak memakai kemeja putih.',
      ],
      answerIndex: 1,
      feedback: '==Tepat!== Ada irisan antara kelompok peserta berkemeja putih dan berkacamata → kesimpulan memakai ==Sebagian==.',
    },
  },
  {
    id: 'cpns-tiu-analitis',
    family: 'cpns',
    subtestId: 'tiu',
    subtestLabel: 'TIU · Verbal',
    group: 'TIU · Kemampuan Verbal',
    title: 'Penalaran Analitis (Urutan, Meja & Jadwal)',
    goal: 'Menyelesaikan teka-teki **posisi duduk, peringkat, atau jadwal** yang memenuhi sejumlah syarat sekaligus.',
    psychTechnique: 'Offloading Memori Kerja (Gambar Slot Kosong di Kertas Buram)',
    analogy:
      'Otak manusia hanya sanggup menahan 4–5 informasi sekaligus. Jadi **jangan hafal di kepala** — langsung gambar **kotak kursi bernomor 1-2-3-4-5** di kertas buram!',
    coreRule:
      'Mulai dari **syarat paling pasti** (misal: *"D duduk di ujung kiri"* atau *"B tepat di sebelah C"*), tulis simbol panah `A > B`, lalu masukkan syarat lunak terakhir.',
    fastSteps: [
      'Gambar `5 kotak` berjajar (atau lingkaran arah jam untuk meja bundar).',
      'Kunci dulu **syarat posisi tetap** (ujung/tengah/depan).',
      'Gunakan **eliminasi opsi** saat ada 2 kemungkinan — cocokkan satu per satu syarat.',
    ],
    commonTrap:
      '~~Membaca kalimat dari atas ke bawah lalu mencoba menyimpannya di kepala~~ sehingga waktu habis membaca ulang teks 4 kali.',
    diagramId: 'analitis-slot',
    microCheck: {
      prompt: 'Dalam antrean 4 orang (A, B, C, D): A tepat di depan B. D di urutan terakhir. C tidak di urutan 1. Siapa di urutan 1?',
      options: ['A', 'B', 'C'],
      answerIndex: 0,
      feedback: '==Mantap!== D = #4. Karena A-B menempel berurutan dan C bukan #1, maka C wajib #3 dan pasangan ==A-B== di #1-#2 → **A di urutan #1**.',
    },
  },
  {
    id: 'cpns-tiu-berhitung',
    family: 'cpns',
    subtestId: 'tiu',
    subtestLabel: 'TIU · Numerik',
    group: 'TIU · Kemampuan Numerik',
    title: 'Berhitung Cepat, Pecahan & Trik Aljabar',
    goal: 'Menghitung soal operasi bilangan besar, **persen istimewa, kuadrat, dan akar bertingkat** tanpa kalkulator.',
    psychTechnique: 'Chunking Pecahan Istimewa + Pemfaktoran Cepat',
    analogy:
      'Menghitung `12,5% × 640` pakai perkalian bersusun itu capek. Tapi kalau tahu `12,5%` itu sama dengan ==seperdelapan (1/8)==, tinggal bagi 640 ÷ 8 = ==80== dalam 2 detik!',
    coreRule:
      'Hafalkan 3 rumus ajaib: 1) `a² − b² =` ==(a + b) × (a − b)==. 2) Akar bertingkat `√(k + √(k + ...))` cari `m × (m+1) = k`: tanda **+** ambil ==angka besar==, tanda **−** ambil ==angka kecil==. 3) `12,5% = 1/8`, `25% = 1/4`, `37,5% = 3/8`, `66,7% = 2/3`.',
    fastSteps: [
      'Ubah desimal berulang/persen menjadi **pecahan sederhana** sebelum mengalikan.',
      'Untuk soal selisih kuadrat, **jangan kuadratkan manual** — jumlahkan lalu kalikan selisihnya.',
      'Untuk soal hitungan panjang di opsi berbeda jauh, cukup cek **taksiran depan** atau **angka satuan terakhir**.',
    ],
    commonTrap:
      '~~Menjumlahkan langsung diskon bertingkat~~ (diskon 50% + 20% bukan 70%, tapi sisa bayar `50% × 80% = 40%`, diskon total ==60%==).',
    diagramId: 'persen-tangki',
    microCheck: {
      prompt: 'Berapakah nilai dari √(42 + √(42 + √(42 + …)))?',
      options: ['6', '7', '21'],
      answerIndex: 1,
      feedback: '==Tepat sekali!== Cari 2 bilangan berurutan hasil kali 42 → `6 × 7 = 42`. Karena tandanya **+**, ambil angka besar = ==7==.',
    },
  },
  {
    id: 'cpns-tiu-deret',
    family: 'cpns',
    subtestId: 'tiu',
    subtestLabel: 'TIU · Numerik',
    group: 'TIU · Kemampuan Numerik',
    title: 'Deret Angka & Pola Bilangan dalam Tabel',
    goal: 'Memprediksi angka kelanjutan dari barisan bilangan maupun **kotak matriks/tabel angka**.',
    psychTechnique: 'Pemindai Visual 3 Lapis (3-Second Pattern Radar)',
    analogy:
      'Lihat deret angka seperti melihat **2 jalur kereta di stasiun yang sama**: kadang gerbong #1, #3, #5 itu kereta cepat (×2), sementara #2, #4, #6 itu kereta reguler (+5).',
    coreRule:
      'Scan selalu urut: **Lapis 1** selisih tetangga (`+ / −`). **Lapis 2** bila naik-turun aneh → pecah jadi **deret lompat-1** (ganjil vs genap). **Lapis 3** selisih tingkat-2 atau rasio (`× / ÷`) / Fibonacci (`a + b = c`).',
    fastSteps: [
      'Tulis selisih di bawah celah antar angka dalam 3 detik pertama.',
      'Bila pola selisih melompat-lompat, tarik lengkungan **lompat-1** atau **lompat-2**.',
      'Pada **pola tabel/segitiga**, uji penjumlahan/perkalian pinggir menuju angka tengah.',
    ],
    commonTrap:
      '~~Terpaku menghitung selisih angka ke-1 dan ke-2 saja~~ pada soal yang sebenarnya berisi **2 deret berselang-seling**.',
    diagramId: 'deret-scanner',
    microCheck: {
      prompt: 'Lanjutkan deret: 4, 15, 8, 20, 16, 25, …',
      options: ['30', '32', '36'],
      answerIndex: 1,
      feedback: '==Betul!== Pisah 2 jalur: ganjil (`4, 8, 16 → ×2` = ==32==) dan genap (`15, 20, 25 → +5`).',
    },
  },
  {
    id: 'cpns-tiu-kuantitatif',
    family: 'cpns',
    subtestId: 'tiu',
    subtestLabel: 'TIU · Numerik',
    group: 'TIU · Kemampuan Numerik',
    title: 'Perbandingan Kuantitatif (P vs Q) & Kecukupan Data',
    goal: 'Membandingkan besar **P vs Q** serta menentukan apakah **Pernyataan (1) & (2)** cukup menjawab pertanyaan.',
    psychTechnique: 'Uji 3 Titik Ekstrem (−2, 0, +2)',
    analogy:
      'Jangan hanya mengetes dengan angka `2`! Angka negatif dan nol sering membalik posisi juara — seperti **ban mobil yang tergelincir di es** (`(-2)² = +4`, tapi `(-2)³ = -8`).',
    coreRule:
      'Saat variabel tidak dibatasi (`x` bilangan real), wajib coba masukkan ==x = 0, x = 2, dan x = −2== (juga pecahan `1/2` bila ada pangkat). Untuk **Kecukupan Data**: uji Pernyataan (1) __sendirian dulu__, tutup pakai jari, lalu uji (2) __sendirian__!',
    fastSteps: [
      'Jika hasil uji `x = 2` menghasilkan `P > Q`, tapi uji `x = −2` menghasilkan `P < Q` → jawab ==Hubungan tidak dapat ditentukan==.',
      'Pada Kecukupan Data: bila (1) cukup dan (2) **tidak**, jawab A; bila masing-masing sendirian cukup, jawab D.',
      '__Jangan terjebak menggabung (1)+(2)__ sebelum membuktikan (1) dan (2) gagal sendirian!',
    ],
    commonTrap:
      '~~Menganggap akar persamaan `x² = 16` pasti hanya `x = 4`~~ — padahal `x` bisa juga `−4`!',
    diagramId: 'kuantitatif-uji3',
    microCheck: {
      prompt: 'Diketahui x adalah bilangan bulat dengan x² = 25. P = 2x dan Q = 8. Manakah hubungan P dan Q?',
      options: ['P > Q', 'P < Q', 'Hubungan P dan Q tidak dapat ditentukan'],
      answerIndex: 2,
      feedback: '==Tepat!== Nilai x bisa **+5** (`P = 10 > Q`) atau **−5** (`P = −10 < Q`), sehingga hubungan ==tidak dapat ditentukan==.',
    },
  },
  {
    id: 'cpns-tiu-cerita',
    family: 'cpns',
    subtestId: 'tiu',
    subtestLabel: 'TIU · Numerik',
    group: 'TIU · Kemampuan Numerik',
    title: 'Soal Cerita Praktis (Pekerja · Jarak · Jual-Beli)',
    goal: 'Mengubah cerita panjang kehidupan nyata menjadi hitungan **berbalik nilai, susul-menyusul, dan untung-rugi**.',
    psychTechnique: 'Visual Timbangan Beban Kerja & Lintasan Gerak',
    analogy:
      'Urusan **pekerja vs hari** itu seperti memakan 1 loyang pizza: semakin ==banyak orang==, semakin ==sedikit hari== selesai. Tapi **total potongan yang dimakan (Orang × Hari) selalu sama!**',
    coreRule:
      '1) Proyek terhenti: ==Orang awal × Sisa hari rencana = Total pekerja baru × Sisa hari efektif== (__hasil koma wajib bulatkan ke atas!__). 2) Berpapasan jam sama: `t = Jarak ÷ (V₁ + V₂)`. 3) Susul-menyusul: ==t susul = Jarak duluan ÷ (V penyusul − V disusul)== dihitung dari jam berangkat __orang kedua__. 4) Harga Beli = ==Harga Jual ÷ (100% ± %Untung/Rugi)==.',
    fastSteps: [
      'Kurangi **hari yang sudah dikerjakan** dulu sebelum menghitung sisa beban pekerja.',
      'Pada susul-menyusul, tambahkan waktu susul ke **jam orang ke-2**.',
      'Coba geser slider pada **Gambar Interaktif di bawah** agar paham 100% tanpa menghafal!',
    ],
    commonTrap:
      '~~Menghitung % untung dari harga jual~~ atau ~~membulatkan ke bawah jumlah tambahan pekerja~~.',
    diagramId: 'berbalik-nilai',
    microCheck: {
      prompt: 'Proyek 10 hari oleh 12 pekerja. Setelah 4 hari kerja, proyek libur 2 hari (sisa waktu 4 hari). Berapa total pekerja dibutuhkan agar tepat waktu?',
      options: ['16 orang', '18 orang', '20 orang'],
      answerIndex: 1,
      feedback: '==Sempurna!== Sisa beban: `12 × (10 − 4) = 72`. Sisa hari = `4`. Pekerja total = `72 ÷ 4` = ==18 orang== (tambah 6 orang).',
    },
  },
  {
    id: 'cpns-tiu-figural-analogi',
    family: 'cpns',
    subtestId: 'tiu',
    subtestLabel: 'TIU · Figural',
    group: 'TIU · Kemampuan Figural',
    title: 'Figural: Analogi Perubahan Gambar',
    goal: 'Menemukan **aturan transformasi** (rotasi, cermin, warna, jumlah sisi) dari pasangan Gambar 1 → 2 untuk diterapkan ke Gambar 3 → 4.',
    psychTechnique: 'Teknik Kunci 1 Sudut Elemen (Single-Anchor Tracking)',
    analogy:
      'Jangan memelototi seluruh gambar sekaligus karena mata akan pusing! Pilih **1 elemen kecil** (misal panah atau titik hitam), lalu lacak ke mana ia berpindah.',
    coreRule:
      'Perubahan standar figural hanya 5 jenis: ==Rotasi (45°/90°/180°)==, ==Pencerminan (kiri-kanan/atas-bawah)==, ==Inversi warna (hitam ↔ putih)==, ==Tambah/Kurang jumlah sisi==, dan ==Tukar ukuran dalam ↔ luar==.',
    fastSteps: [
      'Kunci **arah jarum/ujung runcing** elemen utama: berputar searah (CW) atau lawan jarum jam (CCW)?',
      'Periksa perubahan **jumlah sudut/garis** dari gambar kiri ke kanan.',
      'Eliminasi langsung opsi yang salah warna/isi terlebih dahulu.',
    ],
    commonTrap:
      '~~Menggabungkan semua detail di kepala~~ sehingga tertukar antara pencerminan vertikal dengan rotasi 180°.',
    diagramId: 'figural-transform',
    microCheck: {
      prompt: 'Gambar A (segitiga putih luar + kotak hitam di dalam) menjadi B (kotak putih di luar + segitiga hitam di dalam). Aturan yang terjadi?',
      options: [
        'Rotasi 90° dan tambah 1 sisi',
        'Tukar posisi dalam-luar + balik warna (hitam ↔ putih)',
        'Pencerminan horizontal saja',
      ],
      answerIndex: 1,
      feedback: '==Benar!== Ada 2 aturan paralel: **tukar ukuran dalam-luar** dan **inversi warna**.',
    },
  },
  {
    id: 'cpns-tiu-figural-seri',
    family: 'cpns',
    subtestId: 'tiu',
    subtestLabel: 'TIU · Figural',
    group: 'TIU · Kemampuan Figural',
    title: 'Figural: Seri & Urutan Irama Gambar',
    goal: 'Menentukan **gambar berikutnya** dari rangkaian 3–5 kotak yang bergerak mengikuti pola berurutan.',
    psychTechnique: 'Lacak Lintasan Seperti Jarum Jam (Orbit Tracking)',
    analogy:
      'Setiap simbol di dalam kotak figural sebenarnya sedang **berjalan di lintasan lari** (searah atau berlawanan jarum jam) 1 langkah atau ½ langkah tiap kotak.',
    coreRule:
      'Lacak **1 elemen per waktu**: lihat posisi di Kotak 1 → 2 → 3 → 4 untuk menentukan posisi Kotak 5, lalu langsung **coret 3 opsi** yang posisinya salah.',
    fastSteps: [
      'Abaikan elemen yang membingungkan dulu — pilih titik/lingkaran yang paling kontras.',
      'Tulis langkahnya di tepi (misal: `poin geser 1 sudut searah jarum jam`).',
      'Cocokkan elemen ke-2 hanya pada opsi yang masih tersisa.',
    ],
    commonTrap:
      '~~Melihat gambar 4 dan 5 tanpa memeriksa lompatan di kotak 1 → 2 → 3~~.',
    diagramId: 'figural-transform',
    microCheck: {
      prompt: 'Titik hitam berada di sudut kiri-atas (1), kanan-atas (2), kanan-bawah (3). Di manakah posisi di kotak ke-4?',
      options: ['Kiri-bawah', 'Tengah kotak', 'Kiri-atas'],
      answerIndex: 0,
      feedback: '==Tepat!== Titik berputar `90°` searah jarum jam tiap langkah → urutan ke-4 pasti di ==kiri-bawah==.',
    },
  },
  {
    id: 'cpns-tiu-figural-beda',
    family: 'cpns',
    subtestId: 'tiu',
    subtestLabel: 'TIU · Figural',
    group: 'TIU · Kemampuan Figural',
    title: 'Figural: Ketidaksamaan Gambar (Odd One Out)',
    goal: 'Menemukan **1 gambar ganjil** di antara 5 pilihan berdasarkan jumlah elemen, rotasi, atau hasil pencerminan.',
    psychTechnique: 'Tes Jam Putar Kepala vs Cermin (Chirality Check)',
    analogy:
      'Bayangkan **kertas transparan diputar** di atas meja: bentuk huruf `b` yang diputar tidak akan pernah jadi huruf `d` — harus dibalik (dicerminkan)! Gambar yang __berbeda sendiri hasil cerminnya__ itulah jawabannya.',
    coreRule:
      'Cek berurutan: 1) **Jumlah bagian/garis/titik**, 2) **Posisi dalam/luar**, 3) **Hasil rotasi murni vs pencerminan**.',
    fastSteps: [
      'Hitung dulu jumlah sudut/titik dari 5 pilihan (sering 4 sama, 1 beda!).',
      'Jika bentuknya identik tapi hadapnya beda: putar mental searah jarum jam — __mana yang tidak bisa menimpa gambar lain tanpa dibalik?__',
      'Periksa kesejajaran garis atau isi warna arsiran.',
    ],
    commonTrap:
      '~~Memilih gambar yang posisinya tampak miring saja~~ padahal kalau diputar 90° masih identik dengan 3 gambar lainnya.',
    diagramId: 'figural-transform',
    microCheck: {
      prompt: 'Empat gambar menunjukkan huruf F yang diputar 0°, 90°, 180°, dan 270°. Satu gambar menunjukkan huruf F terbalik seperti di cermin. Manakah yang ganjil?',
      options: ['Yang diputar 180°', 'Yang diputar 270°', 'Yang hasil pencerminan (terbalik)'],
      answerIndex: 2,
      feedback: '==Benar!== Keempat lainnya hanya **rotasi** di bidang yang sama, sedangkan hasil **pencerminan** punya orientasi berbeda.',
    },
  },

  // ================= CPNS — TKP (6 Submateri Resmi) =================
  {
    id: 'cpns-tkp-pelayanan',
    family: 'cpns',
    subtestId: 'tkp',
    subtestLabel: 'TKP',
    group: 'TKP · Karakteristik Pribadi',
    title: 'Pelayanan Publik',
    goal: 'Mengukur **empati, kecepatan tanggap, keramahan**, dan komitmen kepuasan masyarakat **tanpa melanggar aturan**.',
    psychTechnique: 'Aturan Emas: "Warga Terbantu + Tetap Taat SOP"',
    analogy:
      'Anda adalah **petugas loket terbaik**: ketika antrean panjang atau warga bingung mengisi formulir, Anda tidak menunduk diam atau membentak, melainkan ==turun tangan memberi solusi tercepat yang sah==.',
    coreRule:
      'Poin 5 selalu memadukan **3 unsur**: `Ramah/Tenang` + `Proaktif memberi solusi saat itu juga` + `__Tetap sesuai prosedur (tidak pungli/tidak menerobos aturan)__`.',
    fastSteps: [
      'Buang opsi yang **melempar tanggung jawab** (`"itu bukan bagian saya"`).',
      'Buang opsi yang melanggar aturan demi cepat (`"memotong antrean teman"`).',
      'Pilih opsi ==melayani langsung dengan tenang, memberi penjelasan jelas, atau alternatif solusi resmi==.',
    ],
    commonTrap:
      '~~Memilih opsi yang terdengar membantu tapi melanggar antrean/SOP~~, atau ~~menyuruh warga membaca papan pengumuman sendiri~~.',
    diagramId: 'tkp-akhlak-radar',
    microCheck: {
      prompt: 'Pemohon lansia kesulitan mengisi formulir online di ruang tunggu sementara antrean mulai ramai. Sikap poin 5?',
      options: [
        'Menyuruhnya pulang dan minta dibantu cucunya',
        'Memandunya singkat atau menghubungkannya ke petugas pendamping tanpa menghentikan antrean lain',
        'Mengisi sembarangan agar cepat selesai',
      ],
      answerIndex: 1,
      feedback: '==Poin 5!== Solutif bagi lansia sekaligus menjaga kelancaran antrean lain.',
    },
  },
  {
    id: 'cpns-tkp-jejaring',
    family: 'cpns',
    subtestId: 'tkp',
    subtestLabel: 'TKP',
    group: 'TKP · Karakteristik Pribadi',
    title: 'Jejaring Kerja & Kolaborasi',
    goal: 'Menguji kemampuan **sinergi lintas tim**, membangun relasi kerja sehat, dan **menengahi konflik** tanpa memihak.',
    psychTechnique: 'Prinsip Jembatan Musyawarah + Anti-Silo',
    analogy:
      'Kerja tim bukan lomba balap karung sendirian—jika satu bagian tertinggal atau berselisih, Anda ==menjadi jembatan yang menyatukan komunikasi agar target tim tercapai==.',
    coreRule:
      'Opsi poin 5 menunjukkan sikap **terbuka terhadap kritik**, **aktif berbagi informasi/membantu divisi lain**, dan **memfasilitasi dialog 2 arah** saat terjadi perbedaan pendapat.',
    fastSteps: [
      'Saat ada konflik antarrekan: pilih ==dengarkan kedua belah pihak & ajak diskusi cari titik temu==.',
      'Saat diminta bekerja lintas divisi/rekan baru: pilih ==antusias menyamakan visi & berbagi peran==.',
      '~~Tolak opsi kerja diam-diam sendiri atau bergosip menyalahkan rekan di belakang~~.',
    ],
    commonTrap:
      '~~Memilih opsi "mengerjakan semua tugas tim sendirian agar cepat beres"~~ — padahal poin Jejaring Kerja justru melarang sikap individualistis!',
    diagramId: 'tkp-akhlak-radar',
    microCheck: {
      prompt: 'Dua anggota tim Anda berselisih soal pembagian tugas hingga menghambat rapat. Langkah paling konstruktif?',
      options: [
        'Memihak yang pendapatnya paling dekat dengan kita',
        'Memfasilitasi keduanya berbicara objektif berdasarkan target dan keahlian tim',
        'Keluar dari rapat supaya mereka menyelesaikannya sendiri',
      ],
      answerIndex: 1,
      feedback: '==Poin 5!== Menghadirkan **mediasi objektif berorientasi solusi tim**.',
    },
  },
  {
    id: 'cpns-tkp-sosbud',
    family: 'cpns',
    subtestId: 'tkp',
    subtestLabel: 'TKP',
    group: 'TKP · Karakteristik Pribadi',
    title: 'Sosial Budaya',
    goal: 'Menilai kemampuan **beradaptasi di lingkungan majemuk**, menjaga **toleransi**, dan menghormati adat/budaya lokal.',
    psychTechnique: 'Rumus Adaptasi + Respek Tanpa Mengorbankan Tugas',
    analogy:
      'Saat pindah tugas ke daerah dengan adat baru, jangan memaksa warna baju Anda sendiri — ==pelajari adatnya, bersikap hangat, dan jaga etika profesional bersama warga==.',
    coreRule:
      'Skor tertinggi memilih sikap **aktif mengenal & menghargai budaya/keyakinan berbeda**, ikut kegiatan sosial warga secara wajar, dan tetap __netral dari diskriminasi__.',
    fastSteps: [
      'Jika ditempatkan di lingkungan budaya baru: pilih ==mempelajari bahasa/adat setempat dan bergaul terbuka==.',
      'Jika ada perbedaan kebiasaan/kepercayaan rekan: pilih ==saling menghormati & menyesuaikan jadwal rapat dengan adil==.',
      '~~Hindari sikap kaku ("biar mereka ikut kebiasaan kantor") atau mengasingkan diri~~.',
    ],
    commonTrap:
      '~~Bersikap "netral tapi pasif/menjauh"~~ dari masyarakat sekitar saat ditanya soal penyesuaian lingkungan sosial.',
    diagramId: 'tkp-akhlak-radar',
    microCheck: {
      prompt: 'Anda ditugaskan ke daerah dengan tradisi musyawarah adat yang belum Anda kenal. Pilihan skor 5?',
      options: [
        'Berinteraksi seperlunya untuk urusan kantor saja',
        'Mempelajari tata krama lokal dan aktif membaur dengan warga secara santun',
        'Mengubah tradisi warga dengan gaya kerja kota sesegera mungkin',
      ],
      answerIndex: 1,
      feedback: '==Poin 5!== Aktif belajar & membaur secara santun tanpa meremehkan kearifan lokal.',
    },
  },
  {
    id: 'cpns-tkp-tik',
    family: 'cpns',
    subtestId: 'tkp',
    subtestLabel: 'TKP',
    group: 'TKP · Karakteristik Pribadi',
    title: 'Teknologi Informasi & Komunikasi (TIK)',
    goal: 'Mengukur kesiapan **menguasai aplikasi kerja/AI secara etis**, menjaga **keamanan data/siber**, dan membimbing rekan.',
    psychTechnique: 'Formula 3M Digital: Mau Belajar + Mengajarkan + Mengamankan Data',
    analogy:
      'Saat kantor beralih dari buku tulis ke aplikasi baru, jangan mengeluh *"saya sudah tua/gagap"* — Anda ==mempelajari cepat, memakainya aman, lalu mengajari rekan lain==.',
    coreRule:
      'Poin 5 TIK: 1) **Adaptif belajar sistem baru/AI kerja** secara etis (`tidak copy-paste data rahasia ke alat publik`), 2) **Berbagi ilmu ke rekan senior/tim**, 3) __Waspada phishing, OTP, & menjaga kerahasiaan akses__.',
    fastSteps: [
      'Ada aplikasi baru di kantor → pilih ==pelajari modulnya dan ajak tim berlatih bersama==.',
      'Ada tautan mencurigakan/permintaan password → pilih ==tolak, verifikasi resmi, lapor tim IT==.',
      'Ada rekan gagap teknologi → ~~jangan dikerjakan semua oleh kita selamanya~~, ==bimbing hingga mandiri==.',
    ],
    commonTrap:
      '~~Memilih opsi "minta dibuatkan sistem manual saja sementara"~~ atau ~~memberikan akun pribadi ke rekan agar cepat dibantu~~.',
    diagramId: 'tkp-akhlak-radar',
    microCheck: {
      prompt: 'Instansi meluncurkan aplikasi layanan baru yang belum dikuasai rekan senior di meja sebelah. Sikap terbaik?',
      options: [
        'Mengerjakan tugasnya terus-menerus agar cepat',
        'Mempelajari alurnya dan membuat panduan ringkas / membimbingnya praktik pelan-pelan',
        'Menyarankan ia kembali memakai kertas manual',
      ],
      answerIndex: 1,
      feedback: '==Poin 5!== Menguasai teknologi sekaligus **memberdayakan tim** agar seluruh unit siap bertransformasi.',
    },
  },
  {
    id: 'cpns-tkp-profesionalisme',
    family: 'cpns',
    subtestId: 'tkp',
    subtestLabel: 'TKP',
    group: 'TKP · Karakteristik Pribadi',
    title: 'Profesionalisme & Etos Kerja',
    goal: 'Menguji **tanggung jawab tugas, ketahanan di bawah tenggat, disiplin**, dan pemisahan __urusan pribadi vs dinas__.',
    psychTechnique: 'Prioritas Target + Solusi Terukur Tanpa Menunda',
    analogy:
      'Seorang profesional itu seperti **pilot di tengah cuaca berawan**: ia tetap tenang, mengecek instrumen prioritas lebih dulu, ==menyelesaikan penerbangan aman tepat waktu, dan tidak menyalahkan angin==.',
    coreRule:
      'Saat tugas bertumpuk atau terjadi kesalahan kerja: **akui & perbaiki segera**, susun **skala prioritas** (deadline & dampak terbesar), dan tuntaskan sampai kualitas standar terpenuhi.',
    fastSteps: [
      'Ada 2 tugas mendesak + acara pribadi → ==prioritaskan kewajiban tugas/cari solusi terstruktur tanpa menelantarkan target==.',
      'Terjadi kesalahan laporan → ~~jangan tutupi atau lempar ke bawahan~~, ==perbaiki langsung dan evaluasi proses==.',
      'Target berat diberikan atasan → pilih ==pecah target ke jadwal terukur & jalankan konsisten==.',
    ],
    commonTrap:
      '~~Memilih opsi pasrah ("mengerjakan sebisanya saja nanti dijelaskan jika telat")~~ yang membuat poin jatuh ke 2–3.',
    diagramId: 'tkp-akhlak-radar',
    microCheck: {
      prompt: 'Dua jam sebelum batas waktu laporan bulanan, Anda menemukan data yang keliru di halaman awal. Sikap poin 5?',
      options: [
        'Mengirim saja dulu karena sudah mepet waktu',
        'Memfokuskan waktu memperbaikinya segera, memvalidasi ulang angka, dan menginformasikan progres ke atasan bila perlu',
        'Menunggu sampai atasan menyadari kekeliruannya',
      ],
      answerIndex: 1,
      feedback: '==Poin 5!== Menjaga **kualitas & tanggung jawab** secara proaktif tanpa menyembunyikan kekeliruan.',
    },
  },
  {
    id: 'cpns-tkp-antiradikalisme',
    family: 'cpns',
    subtestId: 'tkp',
    subtestLabel: 'TKP',
    group: 'TKP · Karakteristik Pribadi',
    title: 'Anti-Radikalisme & Moderasi',
    goal: 'Menguji kewaspadaan terhadap **paham intoleran, ekstremisme, kekerasan, serta penyebaran hoaks pemecah belah**.',
    psychTechnique: 'Langkah 3T: Tabayyun (Cek) · Tolak Kekerasan · Tindak Sesuai Jalur Resmi',
    analogy:
      'Saat menerima pesan berantai berisi ujaran kebencian atau ajakan antipemerintah, anggap itu seperti **percikan api dekat bensin**: ==jangan diteruskan, cek faktanya, tenangkan suasana, dan laporkan lewat jalur resmi==.',
    coreRule:
      'Sikap skor 5: **tegas menolak paham antidemokrasi/kekerasan** dengan cara ==persuasif, dialog terbuka, edukatif==, serta **melapor pihak berwenang/atasan** bila berpotensi membahayakan.',
    fastSteps: [
      'Melihat konten/rekan mulai ekstrem → pilih ==ajak diskusi jernih berbasis fakta & regulasi resmi, laporkan bila berlanjut==.',
      'Mendapat kabar provokatif di grup WA → ~~jangan diam membiarkan atau membalas dengan makian~~ → ==klarifikasi santun + ingatkan verifikasi fakta==.',
      'Utamakan **persatuan NKRI & moderasi** dalam tiap skenario.',
    ],
    commonTrap:
      '~~Memilih diam saja ("asal tidak ikut campur")~~ atau sebaliknya ~~main hakim sendiri dengan membentak/mengucilkan tanpa klarifikasi~~.',
    diagramId: 'tkp-akhlak-radar',
    microCheck: {
      prompt: 'Di grup kantor ada rekan membagikan berita bohong bernada kebencian terhadap kelompok minoritas. Langkah skor 5?',
      options: [
        'Diam saja agar tidak dianggap ikut campur',
        'Menyampaikan klarifikasi fakta secara santun dan mengingatkan etika informasi ASN, serta melapor ke atasan bila berulang',
        'Memaki di grup dan mengeluarkannya paksa tanpa komunikasi',
      ],
      answerIndex: 1,
      feedback: '==Poin 5!== Memadukan **ketegasan menolak intoleransi** dengan cara **edukatif & prosedur resmi**.',
    },
  },

  // ================= RBB BUMN (8 Kompetensi Tahap 1 & Tahap 2) =================
  {
    id: 'bumn-tkd-verbal',
    family: 'bumn',
    subtestId: 'tkd',
    subtestLabel: 'TKD Verbal',
    group: 'BUMN Tahap 1 · Tes Kemampuan Dasar',
    title: 'Verbal Logical Reasoning & Word Classification',
    goal: 'Mengukur logika kesimpulan pernyataan (**True / False / Cannot Say**) serta mencari **1 kata yang tidak satu kelompok**.',
    psychTechnique: 'Tes Ketat Bukti Teks + Filter 4-vs-1 Ciri Spesifik',
    analogy:
      'Di *Verbal Logical Reasoning*, bertindaklah seperti **hakim pengadilan**: jangan gunakan pengetahuan dari koran luar — hanya akui ==fakta yang tertulis persis di paragraf==!',
    coreRule:
      '1) **Word Classification**: kelompokkan 4 kata berdasarkan __fungsi, bahan, atau sifat paling spesifik__, cari 1 yang keluar barisan. 2) **Verbal Reasoning**: jika teks tidak menyebut rincian tersebut secara eksplisit → ==Cannot Say / Tidak Dapat Disimpulkan==.',
    fastSteps: [
      'Cari **sifat bersama paling sempit** dari 4 kata (contoh: semuanya hewan menyusui vs 1 bertelur).',
      'Pisahkan fakta tersurat dari **asumsi pribadi** saat menjawab *Logical Reasoning*.',
      'Periksa pembalik kalimat seperti `always`, `only`, `never`, `sebagian`.',
    ],
    commonTrap:
      '~~Menganggap pernyataan benar menurut wawasan umum sehari-hari~~ padahal tidak tertulis di premis TKD.',
    diagramId: 'tkd-verbal-filter',
    microCheck: {
      prompt: 'Manakah yang ganjil (Word Classification): Paus · Lumba-lumba · Hiu · Pesut · Dugong?',
      options: ['Paus', 'Hiu', 'Dugong'],
      answerIndex: 1,
      feedback: '==Benar!== Paus, lumba-lumba, pesut, dan dugong adalah **mamalia laut**, sedangkan ==Hiu== adalah ikan bertulang rawan (insang).',
    },
  },
  {
    id: 'bumn-tkd-angka',
    family: 'bumn',
    subtestId: 'tkd',
    subtestLabel: 'TKD Angka',
    group: 'BUMN Tahap 1 · Tes Kemampuan Dasar',
    title: 'Number Sequence & Numerik Dasar RBB',
    goal: 'Menemukan **pola deret bilangan RBB BUMN** dengan durasi sangat ketat (kurang dari 35 detik per soal).',
    psychTechnique: 'Pola Lompat & Selisih Tingkat-2 dalam 3 Detik',
    analogy:
      'Deret BUMN sering memakai **2 tangga berjalan bersamaan** atau selisih yang membesar teratur (+2, +4, +6). Tandai lompatannya langsung dengan lengkungan di layar pikiran.',
    coreRule:
      'Cek berurutan: `1) Selisih tetap`, `2) Lompat-1 (ganjil vs genap)`, `3) Tingkat-2 (selisih dari selisih)`, `4) Perkalian/Fibonacci/Kuadrat ± k`.',
    fastSteps: [
      'Jika angka naik-turun, langsung pisah suku **posisi ganjil & genap**.',
      'Jika angka melonjak tajam, uji **perkalian (×2, ×3)** atau **bilangan kuadrat**.',
      'Lakukan hitung belakang (angka akhir dulu) untuk menghemat waktu.',
    ],
    commonTrap:
      '~~Menghabiskan lebih dari 1 menit di satu deret rumit~~ sementara 5 soal mudah di belakang menunggu.',
    diagramId: 'deret-scanner',
    microCheck: {
      prompt: 'Tentukan suku berikutnya: 2, 5, 10, 17, 26, …',
      options: ['35', '37', '39'],
      answerIndex: 1,
      feedback: '==Tepat!== Selisihnya membentuk bilangan ganjil berturut-turut: `+3, +5, +7, +9` → lanjut `+11` = ==37== (atau `n² + 1`: `6² + 1 = 37`).',
    },
  },
  {
    id: 'bumn-tkd-diagram',
    family: 'bumn',
    subtestId: 'tkd',
    subtestLabel: 'TKD Diagram',
    group: 'BUMN Tahap 1 · Tes Kemampuan Dasar',
    title: 'Diagram Reasoning (Alur Operator Simbol)',
    goal: 'Melacak **perubahan gambar secara bertahap** melewati kotak-kotak operator logika (segitiga, lingkaran, panah).',
    psychTechnique: 'Eksekusi Pipeline Kiri-ke-Kanan 1 Operator Sekali Jalan',
    analogy:
      'Anggap kotak operator seperti **mesin cuci mobil otomatis**: pos 1 *menyemprot air* (putar 90°), pos 2 *mengganti warna* (inversi). Jangan langsung menebak hasil keluar — jalankan 1 mesin per 1 langkah!',
    coreRule:
      'Baca **legend aturan tiap operator** dengan cermat. Terapkan **urut dari kiri ke kanan** pada 1 elemen kunci (ujung runcing/warna) terlebih dulu untuk memangkas opsi salah.',
    fastSteps: [
      'Pahami tiap simbol fungsi (`▲ = rotasi 90° CW`, `■ = balik warna`, `● = tukar kiri-kanan`).',
      'Terapkan operator ke **1 titik patokan** dan catat kondisi perantara di kertas.',
      'Gugurkan opsi jawaban berdasarkan bentuk paling kentara.',
    ],
    commonTrap:
      '~~Melompati urutan operator dari kanan ke kiri~~ atau lupa membalik warna setelah melakukan rotasi.',
    diagramId: 'figural-transform',
    microCheck: {
      prompt: 'Jika operator X memutar 90° searah jarum jam dan Y membalik warna hitam ↔ putih, gambar panah putih ke atas setelah melewati [X → Y] menjadi…',
      options: ['Panah hitam ke kanan', 'Panah putih ke bawah', 'Panah hitam ke kiri'],
      answerIndex: 0,
      feedback: '==Benar!== Langkah X: panah putih ke atas → **ke kanan**. Langkah Y: putih → ==hitam==. Hasil: **Panah hitam ke kanan**.',
    },
  },
  {
    id: 'bumn-akhlak',
    family: 'bumn',
    subtestId: 'akhlak',
    subtestLabel: 'AKHLAK',
    group: 'BUMN Tahap 1 · Core Values BUMN',
    title: 'Core Values AKHLAK (Situational Judgment Test)',
    goal: 'Menguji konsistensi perilaku kerja berbasis **Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif**.',
    psychTechnique: 'Peta 6 Kata Aksi AKHLAK + Anti-Mengeluh',
    analogy:
      'Bayangkan Anda pegawai BUMN teladan yang memegang **6 alat tukang**: pegang janji (**Amanah**), asah skill (**Kompeten**), rukun (**Harmonis**), bela perusahaan & bangsa (**Loyal**), gesit teknologi (**Adaptif**), dan ajak sinergi (**Kolaboratif**).',
    coreRule:
      'Kunci nilai maksimal: ==Amanah== = jujur & tanggung jawab; ==Kompeten== = bantu tim belajar & tingkatkan mutu; ==Harmonis== = hargai beda tanpa menyudutkan; ==Loyal== = jaga nama & rahasia BUMN; ==Adaptif== = proaktif inovasi saat krisis; ==Kolaboratif== = libatkan lintas unit.',
    fastSteps: [
      'Kenali **pilar mana** yang sedang diuji dari masalah di cerita soal.',
      'Pilih jawaban yang **proaktif memberi solusi bersama** dan terbuka terhadap perubahan.',
      '~~Buang opsi yang defensif, menunda, atau menyalahkan rekan di depan umum~~.',
    ],
    commonTrap:
      '~~Memilih opsi yang terlihat sangat pintar tapi dikerjakan tertutup sendirian~~ (menabrak **Kolaboratif** & **Harmonis**).',
    diagramId: 'tkp-akhlak-radar',
    microCheck: {
      prompt: 'Sistem ERP BUMN baru sering dikeluhkan lambat diadopsi oleh tim Anda. Sikap yang paling mencerminkan Adaptif + Kolaboratif?',
      options: [
        'Mengusulkan kembali ke pencatatan Excel lama saja',
        'Membuka sesi belajar bersama dan mencatat kendala teknis untuk perbaikan IT',
        'Membiarkan tim mencari tahu sendiri pelan-pelan',
      ],
      answerIndex: 1,
      feedback: '==Tepat!== Mengajak belajar bersama sekaligus menyampaikan masukan konstruktif mewujudkan **Adaptif + Kolaboratif**.',
    },
  },
  {
    id: 'bumn-twk',
    family: 'bumn',
    subtestId: 'twk_bumn',
    subtestLabel: 'TWK BUMN',
    group: 'BUMN Tahap 1 · Wawasan Kebangsaan',
    title: 'Wawasan Kebangsaan Konteks BUMN',
    goal: 'Menguji pemahaman **Pasal 33 UUD 1945**, peran BUMN sebagai *agent of development*, Pancasila, dan tata kelola bersih.',
    psychTechnique: 'Peta Fungsi Ganda BUMN (Laba + Layanan Publik)',
    analogy:
      'BUMN punya **dua kaki berjalan**: kaki pertama **mencetak keuntungan sehat (korporasi)**, kaki kedua ==melayani hajat hidup rakyat & membangun daerah terpencil (PSO / Agent of Development)==.',
    coreRule:
      'Pegang ==Pasal 33 UUD 1945== (cabang produksi penting dikuasai negara), prinsip **GCG (TARIF: Transparency, Accountability, Responsibility, Independency, Fairness)**, dan nilai kebangsaan NKRI.',
    fastSteps: [
      'Kaitkan soal peran BUMN dengan **kesejahteraan rakyat (Pasal 33)** & prinsip **GCG**.',
      'Utamakan kepentingan publik, transparansi, dan anti-suap pada pengadaan.',
      'Bedakan peran **BUMN Persero** (orientasi laba) vs **Perum** (kemanfaatan umum).',
    ],
    commonTrap:
      '~~Menganggap BUMN hanya mengejar profit maksimal semata~~ tanpa mempertimbangkan tanggung jawab sosial & pelayanan publik.',
    diagramId: 'kebangsaan-timeline',
    microCheck: {
      prompt: 'Landasan konstitusional utama pengelolaan cabang produksi penting oleh BUMN untuk kemakmuran rakyat termuat dalam…',
      options: ['Pasal 28 UUD 1945', 'Pasal 33 UUD 1945', 'Pasal 31 UUD 1945'],
      answerIndex: 1,
      feedback: '==Benar!== **Pasal 33 UUD 1945** mengatur perekonomian nasional dan penguasaan negara atas sumber daya strategis bagi kemakmuran rakyat.',
    },
  },
  {
    id: 'bumn-bhs-grammar',
    family: 'bumn',
    subtestId: 'bhs',
    subtestLabel: 'English Grammar',
    group: 'BUMN Tahap 2 · Bahasa Inggris',
    title: 'Structure, Grammar & Error Identification',
    goal: 'Menemukan struktur kalimat tepat & mendeteksi **kesalahan kata (A/B/C/D)** ala TOEFL/RBB dengan super cepat.',
    psychTechnique: 'Cek 4 Titik Wajib: S-V · Parallel · Clause · Word Form',
    analogy:
      'Kalimat Bahasa Inggris itu seperti **gerbong kereta bermesin**: wajib ada minimal **1 Subjek + 1 Kata Kerja (Verb)** yang cocok tunggal/jamaknya, baru periksa gerbong pelengkap lain.',
    coreRule:
      '1) **Subject–Verb Agreement**: periksa kata sebelum `of/in/with` — itulah subjek aslinya! 2) **Parallelism**: setelah `and / or / both ... and`, bentuk kata harus sama. 3) **Error ID**: langsung cek kata kerja, `has/have`, kata sifat `-ed/-ing`, dan preposisi.',
    fastSteps: [
      'Cari **Subjek** dan **Verb utama** dulu — buang frase preposisi (`between..., of...`) di tengahnya.',
      'Untuk soal `___` diikuti keterangan waktu masa lalu/berlangsung, kunci langsung **Tense** yang cocok.',
      'Pada Error ID, curigai kata kerja tanpa `s/es` untuk subjek tunggal.',
    ],
    commonTrap:
      '~~Tertipu kata benda jamak di tengah frase ("The quality of the **reports** [is/are]...")~~ — subjek aslinya `The quality` (tunggal → ==is==!).',
    diagramId: 'bumn-english-xray',
    microCheck: {
      prompt: 'The manager, along with two analysts, _____ the audit report before noon tomorrow.',
      options: ['submit', 'is going to submit', 'are submitting'],
      answerIndex: 1,
      feedback: '==Exact!== Frase `along with two analysts` tidak mengubah subjek tunggal ==The manager==, sehingga memakai bentuk tunggal **is going to submit**.',
    },
  },
  {
    id: 'bumn-bhs-reading',
    family: 'bumn',
    subtestId: 'bhs',
    subtestLabel: 'English Reading',
    group: 'BUMN Tahap 2 · Bahasa Inggris',
    title: 'Reading Comprehension & Vocabulary in Context',
    goal: 'Menangkap **Main Idea, Detail, Inference, dan Synonym** teks bisnis Bahasa Inggris tanpa membaca ulang berkali-kali.',
    psychTechnique: 'Teknik Baca Pertanyaan Dulu + Skimming Kalimat Awal Paragraf',
    analogy:
      'Jangan membaca artikel 4 paragraf dari awal sampai akhir dulu! Lihat dulu **soalnya bertanya apa** — baru menyenter **paragraf & kata kuncinya** dengan mata.',
    coreRule:
      '**Main Idea** = hampir selalu gabungan `topik kalimat pertama tiap paragraf`. **Synonym** = ganti kata yang ditanya dengan masing-masing opsi, lalu baca 1 kalimat utuh untuk merasakan kecocokan makna.',
    fastSteps: [
      'Baca **kalimat pertanyaan** lebih dulu baru menyapu teks (*scanning*).',
      'Untuk soal `EXCEPT / NOT`, coret 4 detail yang benar-benar tertulis di paragraf.',
      '~~Jangan pilih opsi dengan klaim mutlak ("always", "never", "only")~~ jika teks bersifat umum.',
    ],
    commonTrap:
      '~~Terjebak memilih kalimat yang persis tertulis di paragraf ke-3 saat ditanya Main Idea keseluruhan teks~~.',
    diagramId: 'bumn-english-xray',
    microCheck: {
      prompt: 'Saat menemukan soal "Which statement is NOT mentioned in the passage?", strategi paling hemat waktu adalah…',
      options: [
        'Menerjemahkan seluruh kata sulit satu per satu dari atas',
        'Mencocokkan kata kunci dari 5 opsi ke teks lalu mencoret yang ADA di bacaan',
        'Langsung memilih kalimat paling panjang',
      ],
      answerIndex: 1,
      feedback: '==Tepat!== Dengan **scanning kata kunci tiap opsi**, Anda hanya membaca bagian teks yang relevan saja.',
    },
  },
  {
    id: 'bumn-agility',
    family: 'bumn',
    subtestId: 'agility',
    subtestLabel: 'Learning Agility',
    group: 'BUMN Tahap 2 · Kompetensi Digital',
    title: 'Learning Agility (Tahap 2 RBB BUMN)',
    goal: 'Mengukur kelincahan **belajar dari kegagalan, rasa ingin tahu tinggi, adaptasi perubahan cepat**, dan terbuka pada kritik.',
    psychTechnique: 'Formula 3R Agility: Refleksi Cepat → Riset Solusi → Rilis Perbaikan',
    analogy:
      'Learning Agility bukan sekadar pintar teori, melainkan **seberapa cepat Anda bangkit dan mencoba cara lebih cerdas** ketika rencana pertama gagal di hari-H.',
    coreRule:
      'Terdapat 5 dimensi *Learning Agility*: **Mental Agility** (rasa ingin tahu & sudut pandang baru), **People Agility** (terbuka umpan balik), **Change Agility** (nyaman dengan ketidakpastian), **Results Agility** (eksekusi di situasi baru), **Self-Awareness** (sadar kekurangan diri).',
    fastSteps: [
      'Saat gagal/dikritik keras: pilih ==minta masukan spesifik, refleksi, lalu uji perbaikan terukur==.',
      'Saat masuk proyek baru serba tidak pasti: pilih ==proaktif cari referensi & mulai eksperimen kecil lebih dulu==.',
      '~~Hindari opsi membela diri, menunggu instruksi rinci penuh, atau mengulang cara lama mentah-mentah~~.',
    ],
    commonTrap:
      '~~Menganggap sikap "berani mencoba tanpa evaluasi sama sekali" lebih baik daripada "eksperimen cepat + ukur hasil"~~.',
    diagramId: 'tkp-akhlak-radar',
    microCheck: {
      prompt: 'Proyek inovasi digital yang Anda pimpin ditolak pasar pada uji coba awal. Sikap mencerminkan Learning Agility tertinggi?',
      options: [
        'Menyimpan proyek karena tim belum berpengalaman',
        'Mewawancarai pengguna untuk memetakan titik gagal, memperbaiki prototipe, dan menguji ulang lebih cepat',
        'Menyalahkan anggaran promosi yang kurang besar',
      ],
      answerIndex: 1,
      feedback: '==Skor Tertinggi!== Belajar langsung dari umpan balik kegagalan (**Feedback-seeking & Rapid Iteration**) adalah inti Learning Agility.',
    },
  },
];

let indexCache: SubmateriIndexFile | null = null;

export async function loadSubmateriIndex(): Promise<SubmateriIndexFile> {
  if (indexCache) return indexCache;
  const url = new URL('packs/submateri-index.json', document.baseURI).toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal memuat indeks kisi-kisi submateri.');
  indexCache = (await res.json()) as SubmateriIndexFile;
  return indexCache;
}

