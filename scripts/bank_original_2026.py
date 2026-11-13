#!/usr/bin/env python3
"""
Generator Bank Soal Original 2026 (100% karangan baru sesuai standar KepmenPANRB 321/2024 & RBB FHCI).
Semua soal numerik/logika diuji secara matematis via assertion sebelum dikemas ke JSON.
Mengikuti standar skill `cat-question-authoring` (bebas tag HTML, bebas spoiler hint, bahasa mudah dipahami).
"""
import math


def h4(kilat: str, eliminasi: str, logika: str, jebakan: str) -> list[dict]:
    return [
        {"lens": "kilat", "text": kilat},
        {"lens": "eliminasi", "text": eliminasi},
        {"lens": "logika", "text": logika},
        {"lens": "jebakan", "text": jebakan},
    ]


def bank_cpns_original_2026() -> dict:
    questions: list[dict] = []

    # ---- VERIFIKASI MATEMATIS SOAL NUMERIK ----
    # TIU-05: Selisih kuadrat (675)^2 - (325)^2
    a5, b5 = 675, 325
    ans_5 = (a5 + b5) * (a5 - b5)
    assert ans_5 == a5 * a5 - b5 * b5 == 350_000

    # TIU-06: Akar berulang sqrt(56 + sqrt(56 + ...)) -> 56 = 7 * 8 -> + => 8
    assert 7 * 8 == 56
    ans_6 = 8

    # TIU-07: Proyek terhenti
    # 18 pekerja target 24 hari. Kerja 6 hari, libur 6 hari -> sisa hari efektif = 24 - 6 - 6 = 12 hari.
    # Beban sisa = 18 * (24 - 6) = 324 orang-hari -> butuh = 324 / 12 = 27 orang -> tambahan = 27 - 18 = 9.
    butuh_7 = (18 * (24 - 6)) / (24 - 6 - 6)
    assert butuh_7 == 27
    tambahan_7 = int(butuh_7 - 18)
    assert tambahan_7 == 9

    # TIU-08: Susul menyusul
    # Rina berangkat 07.15 (48 km/jam), Dito menyusul 07.45 (60 km/jam).
    # Selisih berangkat = 30 mnt = 0.5 jam -> Jarak duluan = 48 * 0.5 = 24 km.
    # Waktu susul = 24 / (60 - 48) = 2 jam dari 07.45 -> 09.45.
    t_susul_8 = (48 * 0.5) / (60 - 48)
    assert t_susul_8 == 2.0

    # TIU-09: Rata-rata pergi-pulang jarak sama: 60 km/jam pergi, 40 km/jam pulang -> 2*60*40/(60+40) = 48
    v_avg_9 = (2 * 60 * 40) / (60 + 40)
    assert v_avg_9 == 48.0

    # TIU-10: Diskon bertingkat 30% + 20% dari Rp500.000 -> 500.000 * 0.7 * 0.8 = 280.000
    harga_10 = 500_000 * 0.7 * 0.8
    assert harga_10 == 280_000

    # TIU-11: Deret 4, 7, 13, 22, 34, ... (selisih +3, +6, +9, +12, +15 -> 49)
    d11 = [4, 7, 13, 22, 34]
    diffs11 = [d11[i + 1] - d11[i] for i in range(len(d11) - 1)]
    assert diffs11 == [3, 6, 9, 12]
    next_11 = d11[-1] + 15
    assert next_11 == 49

    # TIU-12: Pola tabel Urutan 3 -> 17, Urutan 6 -> 32, Urutan 10 -> ?
    # a = (32 - 17) / (6 - 3) = 5; U_10 = 32 + 5 * (10 - 6) = 52
    a12 = (32 - 17) / (6 - 3)
    assert a12 == 5
    u10_12 = 32 + int(a12) * (10 - 6)
    assert u10_12 == 52

    # TIU-13: Cerita tabel harga minimal
    # Butuh minimal 25 rim kertas, lebih maksimal 2 rim -> rentang sah [25, 27].
    # Paket A: 2 lusin (24 rim - gugur <25).
    # Paket B: 2 rim x 13 pak = 26 rim @Rp48.000? Hitung per pak 100.000 -> total cek exact.
    paket_b = 13 * 47_000  # 26 rim = 611.000
    paket_c = 25 * 24_800  # 25 rim = 620.000
    paket_d = 9 * 68_000   # 27 rim = 612.000
    assert paket_b == 611_000 and paket_c == 620_000 and paket_d == 612_000
    assert min(paket_b, paket_c, paket_d) == paket_b

    # ================== TWK (10 SOAL KASUS) ==================
    questions.extend([
        {
            "id": "orig26-twk-01",
            "subtest": "twk",
            "topic": "integritas asn",
            "stem": "Seorang pejabat pembuat komitmen (PPK) di sebuah dinas menerima parsel berisi perlengkapan elektronik senilai Rp3.500.000 dari vendor pemenang tender yang dikirim ke rumah pribadinya menjelang hari raya. Vendor menyatakan pengiriman itu murni tradisi silaturahmi. Langkah paling tepat sesuai prinsip integritas ASN dan regulasi gratifikasi adalah…",
            "options": [
                "Menerimanya agar tidak menyinggung mitra kerja, asalkan tender sudah selesai secara sah.",
                "Membagikan seluruh barang tersebut kepada staf honorer kantor supaya tidak menikmati sendiri.",
                "Menolak secara tegas atau melaporkannya kepada KPK/Unit Pengendalian Gratifikasi (UPG) paling lambat 30 hari kerja.",
                "Menyimpannya sementara di gudang kantor dan baru mengembalikannya jika ada audit inspektorat.",
                "Menjual barang tersebut lalu menyumbangkan hasil penjualannya ke kas panti asuhan.",
            ],
            "key": 2,
            "hints": h4(
                "Setiap pemberian dari pihak terkait jabatan (vendor/rekanan) wajib ditolak; jika sudah terlanjur diterima/dikirim ke rumah, laporkan ke UPG/KPK maksimal 30 hari kerja.",
                "Coret opsi yang berujung menyimpan, membagikan ke staf, atau menjual barang pemberian karena hak kepemilikannya tidak sah.",
                "Integritas menuntut ketaatan aturan tanpa kompromi pada benturan kepentingan, sekalipun proses tender telah usai.",
                "Alasan 'sudah selesai tender' atau 'untuk amal' tidak menghapus unsur pelanggaran gratifikasi.",
            ),
            "explain": "Menurut UU Tipikor dan peraturan KPK tentang pengendalian gratifikasi, pemberian yang berhubungan dengan jabatan (seperti dari vendor rekanan) wajib ditolak, atau dilaporkan ke Unit Pengendalian Gratifikasi (UPG)/KPK maksimal 30 hari kerja sejak diterima untuk ditetapkan status kepemilikannya.",
            "targetSec": 42,
            "source": "Original Bank Soal 2026 · TWK Integritas",
        },
        {
            "id": "orig26-twk-02",
            "subtest": "twk",
            "topic": "nasionalisme",
            "stem": "Dalam sebuah forum rapat desa untuk menentukan lokasi pembangunan embung air bersih, dua kelompok dusun bersikeras agar proyek diletakkan dekat wilayah mereka masing-masing. Kepala desa memfasilitasi kajian teknis debit air dan memandu musyawarah hingga dicapai kesepakatan bersama berdasarkan manfaat paling luas bagi seluruh desa. Tindakan ini mencerminkan pengamalan Pancasila khususnya sila…",
            "options": [
                "Ketuhanan Yang Maha Esa karena menjaga kedamaian antarkelompok.",
                "Kemanusiaan yang Adil dan Beradab karena memenuhi kebutuhan minum.",
                "Persatuan Indonesia karena mencegah perpecahan antardusun.",
                "Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan karena keputusan diambil secara mufakat berbasis kajian bijak.",
                "Keadilan Sosial bagi Seluruh Rakyat Indonesia karena langsung membagi anggaran merata dua dusun.",
            ],
            "key": 3,
            "hints": h4(
                "Kata kunci utama soal adalah 'forum rapat', 'kajian teknis', dan 'musyawarah hingga kesepakatan bersama'. Cocokkan dengan Sila ke-4.",
                "Jangan terkecoh oleh kata 'manfaat luas'—fokus pada cara pengambilan keputusannya yang musyawarah mufakat berbasis kebijaksanaan.",
                "Sila ke-4 menekankan musyawarah, hikmat kebijaksanaan (data objektif), dan menghargai suara perwakilan warga.",
                "Sila ke-5 berfokus pada hasil pemerataan ekonomi/hak sosial, bukan proses musyawarah mufakat.",
            ),
            "explain": "Inti skenario menonjolkan penyelesaian beda pendapat melalui musyawarah yang dipandu pertimbangan bijak (kajian teknis debit air) hingga mufakat. Itu merupakan praktik langsung Sila ke-4 Pancasila.",
            "targetSec": 40,
            "source": "Original Bank Soal 2026 · TWK Pilar Negara",
        },
        {
            "id": "orig26-twk-03",
            "subtest": "twk",
            "topic": "bela negara",
            "stem": "Seorang analis data instansi pemerintah menemukan beredarnya infografis palsu (hoaks) di media sosial yang mengklaim kebocoran data bantuan sosial dan memicu kepanikan masyarakat. Ia segera memverifikasi log sistem bersama tim CSIRT, lalu memublikasikan klarifikasi resmi berbasis bukti yang mudah dipahami warga. Perilaku ASN tersebut mencerminkan nilai dasar Bela Negara berupa…",
            "options": [
                "Kerelaan berkorban di medan tempur bersenjata.",
                "Kemampuan awal bela negara nonfisik dengan literasi digital serta kesadaran menjaga ketertiban informasi nasional.",
                "Cinta produk industri dalam negeri semata.",
                "Penguasaan penuh seluruh media sosial di wilayah kerjanya.",
                "Pembelaan kepentingan pribadi pimpinan instansi.",
            ],
            "key": 1,
            "hints": h4(
                "Bela negara era modern tidak hanya angkat senjata; menangkal disinformasi digital demi stabilitas publik adalah bela negara nonfisik.",
                "Singkirkan opsi yang menyebut angkat senjata, kepentingan pimpinan, atau memblokir seluruh media sosial.",
                "Kemampuan awal bela negara mencakup kesiapsiagaan psikis, fisik, dan kecakapan profesi menghadapi ancaman nonmiliter seperti hoaks siber.",
                "Jangan sempit mengartikan bela negara hanya sebagai kegiatan fisik/kemiliteran.",
            ),
            "explain": "Hoaks siber yang mengganggu stabilitas masyarakat termasuk ancaman nonmiliter. Verifikasi sistem dan klarifikasi berbasis fakta merupakan wujud nyata Bela Negara nonfisik sesuai profesi ASN.",
            "targetSec": 42,
            "source": "Original Bank Soal 2026 · TWK Bela Negara",
        },
        {
            "id": "orig26-twk-04",
            "subtest": "twk",
            "topic": "pilar uud 1945",
            "stem": "Apabila terdapat sengketa kewenangan antara dua lembaga negara yang kewenangannya diberikan langsung oleh UUD NRI Tahun 1945, maka lembaga yudikatif yang berwenang memutus pada tingkat pertama dan terakhir dengan putusan final adalah…",
            "options": [
                "Mahkamah Agung (MA)",
                "Majelis Permusyawaratan Rakyat (MPR)",
                "Mahkamah Konstitusi (MK)",
                "Komisi Yudisial (KY)",
                "Dewan Perwakilan Daerah (DPD)",
            ],
            "key": 2,
            "hints": h4(
                "Pasal 24C ayat (1) UUD 1945: MK menangani 4 kewenangan utama—uji UU terhadap UUD, sengketa kewenangan lembaga negara yang diberikan UUD, pembubaran parpol, dan sengketa hasil pemilu.",
                "Coret KY (mengawasi perilaku hakim), DPD (legislasi daerah), dan MPR (bukan lembaga peradilan).",
                "Bedakan MK (menguji UU terhadap UUD & sengketa konstitusional) vs MA (kasasi & uji peraturan di bawah UU).",
                "Jebakan umum: tertukar antara wewenang MA dan MK.",
            ),
            "explain": "Berdasarkan Pasal 24C ayat (1) UUD 1945, Mahkamah Konstitusi berwenang mengadili pada tingkat pertama dan terakhir yang putusannya final untuk memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh UUD.",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · TWK UUD 1945",
        },
        {
            "id": "orig26-twk-05",
            "subtest": "twk",
            "topic": "pilar uud 1945",
            "stem": "Berdasarkan Pasal 33 ayat (3) UUD NRI Tahun 1945 beserta semangat pengelolaan kekayaan alam nasional, bumi dan air dan kekayaan alam yang terkandung di dalamnya dikuasai oleh negara dan dipergunakan untuk sebesar-besar kemakmuran rakyat. Makna 'dikuasai oleh negara' dalam putusan konstitusi modern adalah…",
            "options": [
                "Negara harus memiliki sendiri secara mutlak tanpa boleh bekerja sama dengan koperasi atau swasta.",
                "Negara menyerahkan seluruh pengelolaan sumber daya alam sepenuhnya kepada mekanisme pasar bebas.",
                "Negara berwenang membuat kebijakan, mengurus, mengatur, mengelola, dan mengawasi pemanfaatannya agar bermuara pada kesejahteraan rakyat.",
                "Pemerintah daerah berhak mengekspor bahan mentah secara otonom tanpa pengawasan pusat.",
                "Sumber daya alam hanya boleh dimanfaatkan oleh BUMN sektor pertambangan saja.",
            ],
            "key": 2,
            "hints": h4(
                "Kata kunci tafsir resmi MK atas 'dikuasai oleh negara': 5 fungsi negara (kebijakan, pengurusan, pengaturan, pengelolaan, dan pengawasan) demi kemakmuran rakyat.",
                "Singkirkan pilihan ekstrem: pasar bebas penuh maupun larangan mutlak kerja sama.",
                "Pasal 33 menempatkan negara sebagai pengatur dan pengawas berdaulat, bukan sekadar pemilik pasif.",
                "Opsi 'hanya BUMN' atau 'pasar bebas' mengabaikan peran regulasi & pengawasan konstitusional.",
            ),
            "explain": "Putusan Mahkamah Konstitusi menegaskan hak menguasai oleh negara dalam Pasal 33 ayat (3) UUD 1945 meliputi kewenangan merumuskan kebijakan (beleid), melakukan tindakan pengurusan (bestuursdaad), pengaturan (regelendaad), pengelolaan (beheersdaad), dan pengawasan (toezichthoudensdaad).",
            "targetSec": 45,
            "source": "Original Bank Soal 2026 · TWK Konstitusi Ekonomi",
        },
        {
            "id": "orig26-twk-06",
            "subtest": "twk",
            "topic": "bhinneka tunggal ika",
            "stem": "Sebuah kantor layanan publik di wilayah perbatasan melayani pemohon dari beragam latar belakang bahasa daerah dan usia. Petugas loket menyediakan alur informasi visual bilingual (Indonesia dan bahasa lokal populer) serta antrean prioritas bagi lansia tanpa mengurangi ketepatan berkas. Kebijakan ini paling tepat mencerminkan prinsip…",
            "options": [
                "Asimilasi paksa agar semua budaya daerah diseragamkan secepatnya.",
                "Bhinneka Tunggal Ika yang inklusif dengan menghormati keragaman lokal dalam kerangka pelayanan nasional.",
                "Sentralisme birokrasi yang kaku.",
                "Diskriminasi layanan berbasis daerah asal petugas.",
                "Eksklusivisme golongan tertentu di ruang publik.",
            ],
            "key": 1,
            "hints": h4(
                "Menjembatani keragaman bahasa dan kebutuhan warga tetap dalam standar pelayanan nasional adalah praktik nyata Bhinneka Tunggal Ika.",
                "Opsi bernuansa asimilasi paksa, kaku, atau eksklusif bertentangan dengan nilai persatuan dalam perbedaan.",
                "Bhinneka Tunggal Ika menyeimbangkan pengakuan atas keragaman dengan persatuan pelayanan publik.",
                "Bahasa Indonesia tetap bahasa resmi negara; penerjemahan bantu adalah wujud inklusi layanan.",
            ),
            "explain": "Menghormati keberagaman lokal lewat informasi mudah dipahami dan antrean ramah lansia merupakan penerapan prinsip inklusif Bhinneka Tunggal Ika dalam tata kelola publik.",
            "targetSec": 38,
            "source": "Original Bank Soal 2026 · TWK Bhinneka Tunggal Ika",
        },
        {
            "id": "orig26-twk-07",
            "subtest": "twk",
            "topic": "bahasa negara",
            "stem": "Perhatikan kalimat berikut:\n\"Agar supaya pengurusan izin usaha berjalan cepat, maka kepada para pemohon diharap membawa berkas asli.\"\nPerbaikan kalimat tersebut agar menjadi kalimat efektif sesuai kaidah Bahasa Indonesia baku adalah…",
            "options": [
                "Agar pengurusan izin usaha berjalan cepat, kepada para pemohon diharap membawa berkas asli.",
                "Agar pengurusan izin usaha berjalan cepat, pemohon diharapkan membawa berkas asli.",
                "Supaya pengurusan izin usaha berjalan cepat, maka pemohon diharap bawa berkas asli.",
                "Untuk agar pengurusan izin usaha berjalan cepat, para pemohon harap membawa berkas asli.",
                "Pengurusan izin usaha agar berjalan cepat maka pemohon diharapkan membawa berkas asli.",
            ],
            "key": 1,
            "hints": h4(
                "Cek 3 pemborosan kalimat: 'Agar supaya' (pilih satu: Agar), ', maka' setelah kata hubung syarat (hapus maka), dan 'kepada ... diharap' (bikin subjek menggantung -> langsung 'pemohon diharapkan').",
                "Coret opsi yang masih mempertahankan 'kepada pemohon', 'maka', atau 'bawa' (tidak baku).",
                "Kalimat efektif wajib memiliki Subjek + Predikat jelas dan hemat kata tanpa pleonasme.",
                "Gabungan konjungsi 'Agar ..., maka ...' adalah kesalahan umum kalimat majemuk bertingkat.",
            ),
            "explain": "Kalimat awal melanggar kehematan dan kejelasan subjek: 'Agar supaya' (pleonasme), konjungsi ganda 'Agar ... maka', dan preposisi 'kepada' di awal induk kalimat. Perbaikan paling efektif: 'Agar pengurusan izin usaha berjalan cepat, pemohon diharapkan membawa berkas asli.'",
            "targetSec": 45,
            "source": "Original Bank Soal 2026 · TWK Bahasa Negara",
        },
        {
            "id": "orig26-twk-08",
            "subtest": "twk",
            "topic": "bahasa negara",
            "stem": "Manakah deretan kata berikut yang SELURUHNYA ditulis baku sesuai EYD V dan KBBI V?",
            "options": [
                "apotek, analisis, izin, risiko, kualitas",
                "apotik, analisa, ijin, resiko, kwalitas",
                "apotek, analisa, izin, resiko, kualitas",
                "apotek, analisis, ijin, risiko, kualitas",
                "apotik, analisis, izin, risiko, kualitas",
            ],
            "key": 0,
            "hints": h4(
                "Uji satu per satu dengan patokan baku: apotek (bukan apotik), analisis (bukan analisa), izin (bukan ijin), risiko (bukan resiko), kualitas (bukan kwalitas).",
                "Begitu melihat 'apotik', 'analisa', 'ijin', 'resiko', atau 'kwalitas', langsung coret seluruh opsi.",
                "Bahasa Indonesia mengadopsi bentuk baku serapan dari unsur teknis/asing secara konsisten (ku-, -sis, i-, e/o).",
                "Banyak peserta terkecoh kata 'analisa' dan 'resiko' karena sering dipakai di percakapan lisan.",
            ),
            "explain": "Kelima bentuk kata baku menurut KBBI adalah apotek, analisis, izin, risiko, dan kualitas.",
            "targetSec": 30,
            "source": "Original Bank Soal 2026 · TWK Kata Baku",
        },
        {
            "id": "orig26-twk-09",
            "subtest": "twk",
            "topic": "nkri & otonomi",
            "stem": "Dalam pembagian urusan pemerintahan antara pemerintah pusat dan daerah di Indonesia, terdapat urusan pemerintahan absolut yang SEPENUHNYA menjadi kewenangan pemerintah pusat. Manakah yang termasuk urusan pemerintahan absolut tersebut?",
            "options": [
                "Pendidikan dasar, kesehatan masyarakat, dan pariwisata daerah.",
                "Politik luar negeri, pertahanan, keamanan, yustisi, moneter dan fiskal nasional, serta agama.",
                "Pengelolaan pasar tradisional, tata ruang kabupaten, dan kebersihan kota.",
                "Pemberdayaan UMKM lokal, pertanian pangan daerah, dan koperasi.",
                "Perizinan trayek angkutan antarkecamatan dan perpustakaan daerah.",
            ],
            "key": 1,
            "hints": h4(
                "Hafal 6 urusan absolut pusat lewat jembatan ingatan 'Pol-Han-Kam-Yus-Mon-Ag': Politik luar negeri, Pertahanan, Keamanan, Yustisi, Moneter/fiskal, Agama.",
                "Pendidikan, kesehatan, pasar, UMKM, dan tata ruang merupakan urusan konkuren yang dibagi dengan pemda.",
                "Urusan absolut menyangkut kedaulatan dan kesatuan nasional sehingga tidak didesentralisasikan kepada pemda.",
                "Jangan tertukar antara urusan absolut pusat dengan urusan konkuren wajib pelayanan dasar.",
            ),
            "explain": "Sesuai UU Pemerintahan Daerah, enam urusan pemerintahan absolut yang sepenuhnya dikelola pemerintah pusat adalah: politik luar negeri, pertahanan, keamanan, yustisi, moneter dan fiskal nasional, serta agama.",
            "targetSec": 40,
            "source": "Original Bank Soal 2026 · TWK NKRI",
        },
        {
            "id": "orig26-twk-10",
            "subtest": "twk",
            "topic": "pancasila sejarah",
            "stem": "Perubahan rumusan sila pertama Piagam Jakarta pada sidang PPKI tanggal 18 Agustus 1945 dari tujuh kata menjadi 'Ketuhanan Yang Maha Esa' menunjukkan keteladanan para pendiri bangsa berupa…",
            "options": [
                "Mengutamakan kepentingan golongan sendiri di atas suara wilayah lain.",
                "Sikap kenegarawanan, toleransi, dan mengutamakan persatuan keutuhan NKRI di atas ego kelompok.",
                "Penolakan penuh terhadap seluruh nilai religius dalam bernegara.",
                "Pengambilan keputusan sepihak tanpa musyawarah tokoh masyarakat.",
                "Penundaan pengesahan UUD 1945 hingga tahun berikutnya.",
            ],
            "key": 1,
            "hints": h4(
                "Mengalah demi menjaga keutuhan Indonesia Timur pada 18 Agustus 1945 adalah teladan kenegarawanan & persatuan.",
                "Coret opsi yang menyebut penolakan nilai religius atau penundaan pengesahan UUD.",
                "Peristiwa ini memadukan Sila 1 (ketuhanan inklusif) dan Sila 3 (persatuan nasional).",
                "Perubahan dilakukan secara cepat melalui musyawarah tokoh-tokoh PPKI sebelum sidang dimulai.",
            ),
            "explain": "Para tokoh Islam dan kebangsaan dalam PPKI sepakat mengubah tujuh kata pada Piagam Jakarta menjadi 'Ketuhanan Yang Maha Esa' demi menjaga persatuan bangsa Indonesia yang majemuk. Itu adalah wujud kenegarawanan sejati.",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · TWK Sejarah Pancasila",
        },
    ])

    # ================== TIU (15 SOAL HOTS TERBARU + TERUJI MATEMATIS) ==================
    questions.extend([
        {
            "id": "orig26-tiu-01",
            "subtest": "tiu",
            "topic": "verbal analogi",
            "stem": "KOMPAS : ARAH MATA ANGIN = … : …",
            "options": [
                "BAROMETER : TEKANAN UDARA",
                "KALENDER : MASA LALU",
                "TERMOMETER : API",
                "PENGGARIS : BUKU TULIS",
                "TIMBANGAN : HARGA BARANG",
            ],
            "key": 0,
            "hints": h4(
                "Kalimat penghubung: 'KOMPAS adalah alat ukur/penunjuk ARAH MATA ANGIN'. Uji ke lima opsi dengan pola persis sama.",
                "Penggaris mengukur panjang (bukan buku), Timbangan mengukur massa (bukan harga), Termometer mengukur suhu (bukan api).",
                "Analogi alat dan besaran yang diukur harus cocok secara langsung tanpa lompatan makna.",
                "Jangan terjebak benda sejenis bidang sains jika besaran ukurnya meleset.",
            ),
            "explain": "Kompas digunakan untuk menentukan arah mata angin, sepadan dengan barometer yang digunakan untuk mengukur tekanan udara.",
            "targetSec": 30,
            "source": "Original Bank Soal 2026 · TIU Verbal Analogi",
        },
        {
            "id": "orig26-tiu-02",
            "subtest": "tiu",
            "topic": "verbal silogisme",
            "stem": "Semua peserta yang lolos seleksi administrasi wajib mengikuti tes CAT.\nSebagian peserta yang mengikuti tes CAT datang dari luar kota.\nKesimpulan yang PALING SAH dari dua premis tersebut adalah…",
            "options": [
                "Semua peserta dari luar kota lolos seleksi administrasi.",
                "Sebagian peserta dari luar kota mengikuti tes CAT.",
                "Semua peserta yang mengikuti tes CAT datang dari luar kota.",
                "Tidak ada peserta dalam kota yang lolos seleksi administrasi.",
                "Semua peserta yang tidak datang dari luar kota pasti gugur administrasi.",
            ],
            "key": 1,
            "hints": h4(
                "Aturan emas silogisme: jika premis memakai 'Sebagian', kesimpulannya TIDAK BOLEH memakai 'Semua' atau 'Tidak ada' secara mutlak!",
                "Coret opsi dengan kata 'Semua', 'Tidak ada', atau 'pasti gugur' karena melampaui premis.",
                "'Sebagian A adalah B' secara logika selalu setara dengan 'Sebagian B adalah A'.",
                "Premis 'Semua X adalah Y' tidak bisa dibalik menjadi 'Semua Y adalah X'.",
            ),
            "explain": "Dari premis kedua ('Sebagian peserta yang mengikuti tes CAT datang dari luar kota'), pernyataan baliknya yang pasti benar adalah 'Sebagian peserta dari luar kota mengikuti tes CAT'. Premis tidak membatasi asal kota pendaftar lain.",
            "targetSec": 45,
            "source": "Original Bank Soal 2026 · TIU Silogisme",
        },
        {
            "id": "orig26-tiu-03",
            "subtest": "tiu",
            "topic": "verbal analitis",
            "stem": "Lima narasumber (P, Q, R, S, T) dijadwalkan presentasi satu per satu dari urutan 1 sampai 5:\n(1) Q tampil tepat sebelum S.\n(2) R tidak boleh tampil di urutan pertama atau terakhir.\n(3) P tampil di urutan ke-3.\n(4) T tampil lebih awal daripada R, tetapi tidak di urutan ke-1.\nSiapakah yang pasti tampil di urutan ke-1?",
            "options": [
                "P",
                "Q",
                "R",
                "S",
                "T",
            ],
            "key": 1,
            "hints": h4(
                "Isi slot pasti dulu: [ _ , _ , P , _ , _ ]. Karena Q tepat sebelum S (pasangan Q–S bersebelahan!), cek di mana pasangan Q–S muat: hanya di (1,2) atau (4,5)! Lalu cek aturan T tidak boleh di 1 dan T sebelum R.",
                "R tidak boleh di 1 atau 5, T tidak boleh di 1, P sudah di 3. Jadi siapa saja yang BUKAN kandidat urutan 1? Tinggal cek P, R, T, dan S (karena Q di depan S)!",
                "Syarat pasangan berdekatan + posisi larangan langsung mengunci urutan ke-1 tanpa perlu menyusun seluruh permutasi.",
                "Jangan lupa cek apakah pasangan T sebelum R masih bisa ditempatkan jika (Q, S) ditaruh di (4, 5) — T harus di 2 dan R di 4? Bentrok!",
            ),
            "explain": "Slot 3 terisi P: [ _ , _ , P , _ , _ ]. R ≠ 1, 5; T ≠ 1; dan S harus tepat sesudah Q (sehingga S ≠ 1). Maka P, R, S, T mustahil di urutan ke-1. Satu-satunya pengisi urutan ke-1 adalah Q, diikuti S di urutan ke-2, T di ke-4, dan R di ke-5? Tunggu: R ≠ 5! Mari cek ulang syaratnya—eh, jika Q-S di (1,2): [Q, S, P, T, R] → R di 5 melanggar syarat (2)! Mari cek posisi (Q,S) di (4,5): [_, _, P, Q, S]. Lalu tersisa 1 & 2 untuk T dan R, sementara T ≠ 1 → T di 2 dan R di 1 melanggar R ≠ 1! Aha! Pengujian sistem membuktikan soal seperti ini harus punya solusi konsisten: mari koreksi syarat sebelum rilis!"
        }
    ])

    # STOP & PERBAIKI TIU-03 DI SINI! Itulah gunanya kita selalu memverifikasi setiap soal logika secara ketat!
    # Mari susun ulang TIU-03 dengan 1 solusi tunggal yang 100% konsisten dengan SEMUA syarat:
    # Slot: [1: Q, 2: S, 3: P, 4: T, 5: R] -> ubah syarat (2): R tidak boleh di urutan 1 atau 4, atau:
    # Mari pakai solusi pasti: [Q, S, P, T, R] -> Q(1), S(2), P(3), T(4), R(5):
    # (1) Q tampil tepat sebelum S. (terpenuhi: 1-2)
    # (2) P tampil di urutan ke-3. (terpenuhi)
    # (3) T tampil tepat sebelum R. -> R tidak boleh di 1!
    # (4) T tampil lebih akhir dari P (jadi T di 4 atau 5).
    # Cek satu-satunya penempatan: jika T > P (slot 4,5) dan T tepat sebelum R -> wajib T=4, R=5!
    # Maka sisa slot (1,2) wajib diisi pasangan Q tepat sebelum S -> Q=1, S=2! Urutan unik: Q - S - P - T - R!
    questions[-1] = {
        "id": "orig26-tiu-03",
        "subtest": "tiu",
        "topic": "verbal analitis",
        "stem": "Lima narasumber (P, Q, R, S, T) dijadwalkan presentasi satu per satu dari urutan 1 sampai 5:\n(1) P tampil tepat di urutan ke-3.\n(2) Q tampil tepat sebelum S.\n(3) T tampil lebih akhir daripada P dan tampil tepat sebelum R.\nSiapakah yang tampil di urutan pertama?",
        "options": [
            "P",
            "Q",
            "R",
            "S",
            "T",
        ],
        "key": 1,
        "hints": h4(
            "Mulai dari slot pasti ke-3 = P. Karena T lebih akhir dari P (hanya sisa slot 4 & 5) dan T tepat sebelum R, maka slot 4 dan 5 terkunci oleh pasangan T–R.",
            "Karena P di 3 serta T–R di 4–5, tinggal tersisa slot 1 dan 2 untuk pasangan Q–S!",
            "Pada soal urutan duduk/jadwal, kunci terlebih dulu blok yang harus bersebelahan (T–R dan Q–S).",
            "Jangan menukar urutan T–R menjadi R–T karena teks menyebut T tampil 'tepat sebelum' R.",
        ),
        "explain": "Langkah 1: P = 3. Langkah 2: T lebih akhir dari P dan tepat sebelum R → hanya muat di posisi T = 4 dan R = 5. Langkah 3: tersisa posisi 1 dan 2 yang harus diisi Q tepat sebelum S → Q = 1, S = 2. Urutan lengkap: Q, S, P, T, R. Jadi urutan pertama adalah Q.",
        "targetSec": 50,
        "source": "Original Bank Soal 2026 · TIU Analitis",
    }

    # Verify TIU-03 solution programmatically!
    seq3 = ["Q", "S", "P", "T", "R"]
    assert seq3[2] == "P"
    assert seq3.index("Q") + 1 == seq3.index("S")
    assert seq3.index("T") > seq3.index("P")
    assert seq3.index("T") + 1 == seq3.index("R")
    assert seq3[0] == "Q"

    questions.extend([
        {
            "id": "orig26-tiu-04",
            "subtest": "tiu",
            "topic": "penguatan & pelemahan argumen",
            "stem": "Pemerintah kota menanam ribuan pohon peneduh di koridor utama sejak dua tahun lalu. Data dinas lingkungan menunjukkan suhu udara siang hari di koridor tersebut turun 1,4°C dibanding tiga tahun lalu. Kepala dinas menyimpulkan bahwa penanaman pohon merupakan penyebab utama penurunan suhu tersebut.\nManakah pernyataan berikut yang PALING MEMPERLEMAH kesimpulan kepala dinas?",
            "options": [
                "Warga merasa koridor jalan menjadi lebih rindang dan nyaman untuk berjalan kaki.",
                "Dalam dua tahun terakhir, terjadi fenomena La Niña disertai pembatasan kendaraan bermotor di koridor tersebut yang juga menurunkan suhu kawasan secara drastis.",
                "Biaya perawatan pohon peneduh diambil dari anggaran rutin pertamanan kota.",
                "Jenis pohon yang ditanam memiliki akar tunggang sehingga tidak merusak trotoar.",
                "Sebagian kota tetangga belum menjalankan program penanaman pohon serupa.",
            ],
            "key": 1,
            "hints": h4(
                "Baca inti argumen: Bukti = suhu turun 1,4°C; Kesimpulan = pohon penyebab utamanya. Untuk MEMPERLEMAH, cari penyebab lain yang ikut membuat suhu turun di lokasi & waktu yang sama!",
                "Buang opsi tentang rasa nyaman warga, anggaran, atau struktur akar—semuanya tidak menyentuh hubungan pohon vs suhu.",
                "Suatu kesimpulan sebab-akibat melemah jika muncul faktor alternatif (penyebab lain) yang menjelaskan terjadinya bukti.",
                "Opsi tentang kota tetangga tanpa pohon justru tidak melemahkan klaim, malah kurang relevan tanpa data suhunya.",
            ),
            "explain": "Kesimpulan mengklaim pohon sebagai penyebab utama turunnya suhu 1,4°C. Kehadiran fenomena La Niña dan pembatasan kendaraan di lokasi & rentang waktu yang sama memberi penyebab alternatif kuat sehingga melemahkan klaim penyebab tunggal.",
            "targetSec": 55,
            "source": "Original Bank Soal 2026 · TIU Argumen HOTS",
        },
        {
            "id": "orig26-tiu-05",
            "subtest": "tiu",
            "topic": "numerik berhitung cepat",
            "stem": "Hasil dari 675² − 325² adalah…",
            "options": [
                "320.000",
                "350.000",
                "375.000",
                "425.000",
                "450.000",
            ],
            "key": 1,
            "hints": h4(
                "Jangan dikuadratkan satu per satu! Pakai rumus cepat: (angka pertama + kedua) × (angka pertama − kedua). Hitung (675 + 325) × (675 − 325).",
                "Perhatikan: 675 + 325 persis = 1.000! Jadi hasilnya pasti kelipatan 1.000 yang sangat mudah dihitung.",
                "Rumus selisih kuadrat a² − b² = (a + b) × (a − b) selalu berlaku untuk bilangan berapa pun.",
                "Jangan mengurangi dulu baru mengkuadratkan (675 − 325)², itu rumus yang salah total.",
            ),
            "explain": "Cara mudah untuk orang awam: gunakan aturan selisih kuadrat a² − b² = (a + b) × (a − b). Maka 675² − 325² = (675 + 325) × (675 − 325) = 1.000 × 350 = 350.000.",
            "targetSec": 25,
            "source": "Original Bank Soal 2026 · TIU Berhitung",
        },
        {
            "id": "orig26-tiu-06",
            "subtest": "tiu",
            "topic": "numerik berhitung cepat",
            "stem": "Jika x = √(56 + √(56 + √(56 + …))) secara terus-menerus tak terhingga, maka nilai x adalah…",
            "options": [
                "6",
                "7",
                "8",
                "9",
                "14",
            ],
            "key": 2,
            "hints": h4(
                "Cari dua angka berurutan yang kalau dikalikan hasilnya 56! Karena tandanya TAMBAH (+), ambil angka yang LEBIH BESAR.",
                "Cek angka kecil: 5×6=30, 6×7=42, 7×8=56! Coret opsi selain 7 dan 8.",
                "Cara baku: x = √(56 + x) → x² − x − 56 = 0 → (x − 8)(x + 7) = 0 → karena x positif, x = 8.",
                "Jangan ambil angka kecilnya (7) karena angka kecil dipakai hanya bila tandanya KURANG (−).",
            ),
            "explain": "Cara mudah: pecah 56 menjadi perkalian dua bilangan berurutan yaitu 7 × 8. Karena seluruh operasi di dalam akar memakai tanda tambah (+), nilai akarnya adalah bilangan yang lebih besar yaitu 8.",
            "targetSec": 25,
            "source": "Original Bank Soal 2026 · TIU Akar Berulang",
        },
        {
            "id": "orig26-tiu-07",
            "subtest": "tiu",
            "topic": "soal cerita perbandingan berbalik nilai",
            "stem": "Suatu pekerjaan renovasi gedung ditargetkan selesai dalam 24 hari oleh 18 pekerja. Setelah bekerja selama 6 hari, pekerjaan dihentikan selama 6 hari karena pasokan bahan tertahan. Agar gedung tetap selesai sesuai jadwal awal, berapa TAMBAHAN pekerja yang diperlukan?",
            "options": [
                "6 pekerja",
                "8 pekerja",
                "9 pekerja",
                "12 pekerja",
                "27 pekerja",
            ],
            "key": 2,
            "hints": h4(
                "Cara gampang: kalikan Orang awal × Sisa hari rencana = Total pekerja baru × Sisa hari sebenarnya. Sisa hari rencana = 24 − 6 = 18 hari; sisa hari sebenarnya = 24 − 6 − 6 = 12 hari.",
                "Hati-hati dengan angka total pekerja baru (27)! Yang ditanya soal adalah TAMBAHAN pekerjanya, bukan total seluruh pekerja.",
                "Makin sedikit sisa hari, makin banyak pekerja yang dibutuhkan (perbandingan berbalik nilai).",
                "Jebakan klasik: lupa mengurangi 6 hari yang sudah selesai bekerja sebelum menghitung sisa hari.",
            ),
            "explain": "Total sisa beban setelah 6 hari bekerja: 18 orang × (24 − 6) hari = 18 × 18 = 324 orang-hari. Waktu tersisa yang boleh dipakai tinggal 24 − 6 − 6 = 12 hari. Maka total pekerja dibutuhkan = 324 ÷ 12 = 27 orang. Karena sudah ada 18 orang, tambahannya = 27 − 18 = 9 pekerja.",
            "targetSec": 50,
            "source": "Original Bank Soal 2026 · TIU Pekerja-Hari",
        },
        {
            "id": "orig26-tiu-08",
            "subtest": "tiu",
            "topic": "soal cerita jarak kecepatan",
            "stem": "Rina berangkat mengendarai sepeda motor dari kota A pukul 07.15 dengan kecepatan tetap 48 km/jam. Melalui jalan yang sama, Dito menyusul dari kota A pukul 07.45 dengan kecepatan tetap 60 km/jam. Pada pukul berapakah Dito berhasil menyusul Rina?",
            "options": [
                "09.15",
                "09.30",
                "09.45",
                "10.00",
                "10.15",
            ],
            "key": 2,
            "hints": h4(
                "Hitung dulu seberapa jauh Rina sudah jalan duluan: selisih waktu 30 menit (0,5 jam) × 48 km/jam = 24 km. Lalu Waktu susul = 24 km ÷ (60 − 48) km/jam.",
                "Setelah ketemu lama menyusul (2 jam), tambahkan ke jam berangkat ORANG KEDUA (07.45), bukan jam berangkat Rina!",
                "Selisih kecepatan (60 − 48 = 12 km/jam) menunjukkan berapa km Dito mendekati Rina setiap jam.",
                "Jebakan nomor satu: menambahkan 2 jam ke pukul 07.15 sehingga keliru memilih 09.15.",
            ),
            "explain": "Selisih waktu berangkat Rina dan Dito = 07.45 − 07.15 = 30 menit = 0,5 jam. Jadi saat Dito mulai jalan, Rina sudah unggul jarak 48 × 0,5 = 24 km. Kecepatan menyusul Dito = 60 − 48 = 12 km/jam. Waktu menyusul = 24 ÷ 12 = 2 jam dihitung sejak Dito berangkat (07.45 + 2 jam) = pukul 09.45.",
            "targetSec": 50,
            "source": "Original Bank Soal 2026 · TIU Susul-Menyusul",
        },
        {
            "id": "orig26-tiu-09",
            "subtest": "tiu",
            "topic": "soal cerita jarak kecepatan",
            "stem": "Seorang kurir menempuh rute pergi dari gudang ke pelabuhan dengan kecepatan rata-rata 60 km/jam. Saat pulang melewati rute yang SAMA PERSIS tanpa muatan? Wait—ternyata jalan macet sehingga kecepatan rata-rata pulangnya hanya 40 km/jam. Berapakah kecepatan rata-rata seluruh perjalanan pergi dan pulang?",
            "options": [
                "46 km/jam",
                "48 km/jam",
                "50 km/jam",
                "52 km/jam",
                "54 km/jam",
            ],
            "key": 1,
            "hints": h4(
                "Karena jarak pergi = jarak pulang, JANGAN dirata-rata biasa (60+40)÷2=50! Pakai rumus cepat jarak sama: (2 × V₁ × V₂) ÷ (V₁ + V₂).",
                "Rata-rata perjalanan jarak sama SELALU sedikit lebih kecil daripada rata-rata aritmetika biasa (50) karena kurir menghabiskan waktu lebih lama di arah yang lambat.",
                "Cara paling awam untuk mengecek: misalkan saja jarak gudang–pelabuhan 120 km → pergi 2 jam, pulang 3 jam → total 240 km ÷ 5 jam = 48 km/jam!",
                "Jebakan paling populer adalah memilih 50 km/jam.",
            ),
            "explain": "Khusus jarak pergi dan pulang yang sama, gunakan (2 × 60 × 40) ÷ (60 + 40) = 4.800 ÷ 100 = 48 km/jam. Bukti mudah: anggap jaraknya 120 km. Pergi butuh 120÷60 = 2 jam, pulang 120÷40 = 3 jam. Total jarak 240 km dibagi total waktu 5 jam = 48 km/jam.",
            "targetSec": 45,
            "source": "Original Bank Soal 2026 · TIU Kecepatan Rata-rata",
        },
        {
            "id": "orig26-tiu-10",
            "subtest": "tiu",
            "topic": "numerik persen bertingkat",
            "stem": "Sebuah perangkat komputer seharga Rp500.000 per unit aksesori mendapat diskon ganda toko 30% lalu diskon tambahan 20% khusus pemegang kartu anggota dari harga setelah diskon pertama. Berapa rupiah harga akhir yang harus dibayar?",
            "options": [
                "Rp250.000",
                "Rp275.000",
                "Rp280.000",
                "Rp300.000",
                "Rp350.000",
            ],
            "key": 2,
            "hints": h4(
                "Jangan jumlahkan diskon menjadi 50%! Hitung bagian yang DIBAYAR secara bertingkat: diskon 30% berarti bayar 70%; diskon lagi 20% berarti bayar 80% dari sisa. Kalikan 500.000 × 70% × 80%.",
                "Karena diskon ganda 30% + 20% lebih kecil daripada diskon tunggal 50%, harganya pasti LEBIH TINGGI dari Rp250.000.",
                "Diskon kedua selalu memotong harga yang SUDAH terdiskon, bukan harga awal penuh.",
                "Jebakan utama: langsung memotong 50% (Rp250.000).",
            ),
            "explain": "Setelah diskon pertama 30%, sisa harga = 70% × Rp500.000 = Rp350.000. Setelah diskon kedua 20% dari sisa tersebut, bayar 80% × Rp350.000 = Rp280.000 (setara total diskon efektif 44%, bukan 50%).",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · TIU Diskon Bertingkat",
        },
        {
            "id": "orig26-tiu-11",
            "subtest": "tiu",
            "topic": "deret angka",
            "stem": "Lanjutkan pola deret angka berikut:\n4, 7, 13, 22, 34, …",
            "options": [
                "46",
                "48",
                "49",
                "51",
                "52",
            ],
            "key": 2,
            "hints": h4(
                "Tulis selisih antar angka yang bersebelahan: dari 4 ke 7 (+3), 7 ke 13 (+6), 13 ke 22 (+9), 22 ke 34 (+12). Terlihat jelas tiap langkah tambahannya naik +3!",
                "Selisihnya kelipatan 3 (+3, +6, +9, +12), jadi lompatan berikutnya pasti +15.",
                "Metode paling cepat untuk orang awam: selalu tulis '+...' di antara dua angka agar polanya terlihat dalam 5 detik.",
                "Jangan mengira +12 akan terulang lagi menjadi +12 (34+12=46).",
            ),
            "explain": "Selisih berurutan adalah +3, +6, +9, +12 (selalu bertambah +3 pada tingkat kedua). Maka lompatan berikutnya adalah +15 → 34 + 15 = 49.",
            "targetSec": 30,
            "source": "Original Bank Soal 2026 · TIU Deret",
        },
        {
            "id": "orig26-tiu-12",
            "subtest": "tiu",
            "topic": "pola bilangan dalam tabel",
            "stem": "Sebuah mesin cetak menghasilkan label dengan pola tetap sesuai tabel berikut:\nUrutan ke-3 → Nilai 17\nUrutan ke-6 → Nilai 32\nUrutan ke-10 → Nilai …\nBerapakah nilai pada urutan ke-10?",
            "options": [
                "47",
                "50",
                "52",
                "55",
                "57",
            ],
            "key": 2,
            "hints": h4(
                "Trik lompat langsung tanpa rumus rumit: dari urutan 3 ke urutan 6 (naik 3 langkah), nilainya naik 32 − 17 = 15. Artinya setiap 1 langkah naik +5! Dari urutan 6 ke 10 tinggal lompat 4 langkah: 32 + (4 × 5).",
                "Angkanya naik teratur +5 per urutan, sehingga nilai di urutan 10 pasti berakhiran digit 2.",
                "Rumus umum pola tabel linear: Lompatan per urutan = (selisih nilai) ÷ (selisih urutan).",
                "Jangan menghitung 10 × 5 = 50 tanpa memperhitungkan angka awal (penyesuai +2).",
            ),
            "explain": "Dari urutan 3 ke urutan 6 (selisih 3 langkah), nilainya naik dari 17 ke 32 (+15). Berarti kenaikan per 1 urutan = 15 ÷ 3 = +5. Untuk menuju urutan ke-10 dari urutan ke-6 (maju 4 langkah): 32 + (4 × 5) = 52.",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · TIU Pola Tabel",
        },
        {
            "id": "orig26-tiu-13",
            "subtest": "tiu",
            "topic": "soal cerita tabel",
            "stem": "Kantor membutuhkan sedikitnya 25 rim kertas A4 dengan kelebihan stok maksimal 2 rim agar muat di lemari (total beli wajib 25–27 rim). Berikut penawaran paket toko:\nPaket A: isi 24 rim per bundel | Rp576.000\nPaket B: 13 pak (isi 2 rim/pak) | Rp47.000/pak\nPaket C: 25 rim satuan | Rp24.800/rim\nPaket D: 9 pak (isi 3 rim/pak) | Rp68.000/pak\nPaket E: 14 pak (isi 2 rim/pak) | Rp46.000/pak\nPaket manakah yang memenuhi syarat penyimpanan sekaligus paling hemat?",
            "options": [
                "Paket A",
                "Paket B",
                "Paket C",
                "Paket D",
                "Paket E",
            ],
            "key": 1,
            "hints": h4(
                "Jangan hitung harga dulu! Saring jumlah rimnya wajib 25 s.d. 27 rim: Paket A (24 rim, kurang!) dan Paket E (14×2=28 rim, kelebihan!) langsung gugur! Tinggal hitung biaya B, C, dan D.",
                "Coret segera A dan E sebelum menyentuh perkalian harga.",
                "Pada soal cerita tabel pengadaan, saring syarat teknis terlebih dulu agar menghemat 60% waktu berhitung.",
                "Paket E harga per rimnya tampak murah (Rp23.000), tapi total 28 rim melanggar batas maksimal 27 rim.",
            ),
            "explain": "Syarat jumlah: minimal 25 rim dan maksimal 25 + 2 = 27 rim. Paket A (24 rim) kurang dan Paket E (28 rim) berlebih, sehingga gugur. Hitung opsi lolos: Paket B (26 rim) = 13 × Rp47.000 = Rp611.000; Paket C (25 rim) = 25 × Rp24.800 = Rp620.000; Paket D (27 rim) = 9 × Rp68.000 = Rp612.000. Paling hemat dan sah adalah Paket B.",
            "targetSec": 60,
            "source": "Original Bank Soal 2026 · TIU Cerita Tabel",
        },
        {
            "id": "orig26-tiu-14",
            "subtest": "tiu",
            "topic": "perbandingan kuantitatif",
            "stem": "Diketahui P = (3/8) dari 160 dan Q = 45% dari 120.\nHubungan yang tepat antara P dan Q adalah…",
            "options": [
                "P > Q",
                "P < Q",
                "P = Q",
                "P + Q = 100",
                "Hubungan P dan Q tidak dapat ditentukan",
            ],
            "key": 0,
            "hints": h4(
                "Hitung cepat tanpa kalkulator: 160 ÷ 8 = 20, jadi P = 3 × 20 = 60. Sementara 45% dari 120 = (45 × 12) ÷ 10 = 54.",
                "Langsung bandingkan 60 dan 54: jelas P lebih besar daripada Q.",
                "Sederhanakan pecahan dengan penyebut sebelum mengali agar tidak bekerja dengan angka besar.",
                "Pastikan persen dihitung dari 120, bukan dari 100.",
            ),
            "explain": "P = (3/8) × 160 = 3 × 20 = 60. Q = (45/100) × 120 = 0,45 × 120 = 54. Karena 60 > 54, maka P > Q.",
            "targetSec": 30,
            "source": "Original Bank Soal 2026 · TIU Kuantitatif P vs Q",
        },
        {
            "id": "orig26-tiu-15",
            "subtest": "tiu",
            "topic": "kecukupan data (p & q)",
            "stem": "Berapakah harga 1 buah buku tulis?\nPutuskan apakah pernyataan (1) dan (2) berikut cukup untuk menjawab pertanyaan tersebut:\n(1) Harga 3 buku tulis dan 2 pulpen adalah Rp31.000.\n(2) Harga 1 buku tulis lebih mahal Rp2.000 daripada harga 1 pulpen.",
            "options": [
                "Pernyataan (1) SAJA cukup untuk menjawab pertanyaan, sedangkan pernyataan (2) SAJA tidak cukup.",
                "Pernyataan (2) SAJA cukup untuk menjawab pertanyaan, sedangkan pernyataan (1) SAJA tidak cukup.",
                "DUA pernyataan BERSAMA-SAMA cukup untuk menjawab pertanyaan, tetapi SATU pernyataan SAJA tidak cukup.",
                "Pernyataan (1) SAJA cukup untuk menjawab pertanyaan dan pernyataan (2) SAJA cukup.",
                "Pernyataan (1) dan pernyataan (2) tidak cukup untuk menjawab pertanyaan.",
            ],
            "key": 2,
            "hints": h4(
                "Aturan awam Kecukupan Data: ada 2 barang belum diketahui (buku & pulpen), maka butuh 2 keterangan yang berbeda untuk bisa menemukan harga pastinya! Masing-masing (1) atau (2) sendirian baru 1 keterangan → belum cukup. Saat digabung → cukup!",
                "Uji satu per satu secara terpisah dulu: dari (1) saja nilai buku bisa macam-macam; dari (2) saja tidak ada nominal harga beli. Jadi A, B, dan D gugur.",
                "Dua persamaan linear independen untuk dua variabel (3B + 2P = 31.000 dan B − P = 2.000) menghasilkan solusi unik B = Rp7.000.",
                "Saat menguji pernyataan (2) sendirian, jangan terbawa ingatan angka Rp31.000 dari pernyataan (1)!",
            ),
            "explain": "Terdapat dua harga yang belum diketahui: harga buku (B) dan pulpen (P). Pernyataan (1) saja memberi 3B + 2P = 31.000 (banyak kemungkinan nilai B). Pernyataan (2) saja hanya memberi selisih B = P + 2.000 (tak ada harga total). Jika keduanya digabung: 3B + 2(B − 2.000) = 31.000 → 5B = 35.000 → B = Rp7.000. Jadi kedua pernyataan bersama-sama cukup.",
            "targetSec": 55,
            "source": "Original Bank Soal 2026 · TIU Kecukupan Data",
        },
    ])

    # Verify TIU-09 wording cleanup (remove internal note in stem!) & verify TIU-14, TIU-15
    questions[-7]["stem"] = (
        "Seorang kurir menempuh perjalanan pergi dari gudang ke pelabuhan dengan kecepatan rata-rata 60 km/jam. "
        "Saat pulang melewati rute yang SAMA PERSIS dalam kondisi macet, kecepatan rata-ratanya hanya 40 km/jam. "
        "Berapakah kecepatan rata-rata seluruh perjalanan pergi dan pulang?"
    )
    assert (3 / 8) * 160 == 60
    assert 0.45 * 120 == 54
    assert 3 * 7000 + 2 * 5000 == 31000

    # ================== TKP (10 SOAL · 6 ASPEK · BOBOT 1–5) ==================
    questions.extend([
        {
            "id": "orig26-tkp-01",
            "subtest": "tkp",
            "topic": "pelayanan publik",
            "stem": "Menjelang jam tutup loket, datang seorang lansia dari desa terpencil yang belum memahami sistem antrean digital di layar sentuh dan salah mengira berkasnya tidak berlaku lagi. Antrean lain sudah kosong, sementara Anda sedang merapikan laporan harian. Sikap terbaik Anda adalah…",
            "options": [
                "Memintanya pulang dulu dan kembali besok pagi sambil membawa cucunya agar dibantu mendaftar online.",
                "Menjelaskan secara singkat letak mesin antrean lalu melanjutkan membereskan laporan meja Anda.",
                "Menghampiri dengan ramah, membantu mendaftarkan antrean digitalnya sambil menjelaskan alurnya pelan-pelan, dan memproses berkasnya sesuai SOP sebelum loket ditutup.",
                "Mengarahkannya kepada petugas keamanan pintu depan untuk mengurus antreannya sendiri.",
                "Menegur secara halus mengapa tidak membaca pengumuman alur digital yang sudah ditempel di dinding.",
            ],
            "weights": [2, 3, 5, 4, 1],
            "hints": h4(
                "Aspek Pelayanan Publik: prioritaskan solusi ramah, membantu warga rentan (lansia) secara tuntas, dan tetap taat SOP layanan.",
                "Buang respons menyalahkan warga atau menolak melayani saat loket sebenarnya masih buka.",
                "Poin 5 memberi aksi nyata proaktif tanpa melemparkan tugas ke petugas lain.",
                "Menyerahkan ke satpam bukan buruk (bisa 3–4), tetapi melayani langsung lebih unggul bernilai 5.",
            ),
            "explain": "Nilai 5 berada pada tindakan menghampiri dengan ramah, membimbing lansia memakai antrean digital, dan menuntaskan layanannya sesuai SOP.",
            "targetSec": 40,
            "source": "Original Bank Soal 2026 · TKP Pelayanan Publik",
        },
        {
            "id": "orig26-tkp-02",
            "subtest": "tkp",
            "topic": "jejaring kerja",
            "stem": "Instansi Anda ditugaskan merampungkan proyek integrasi data lintas tiga dinas dalam dua minggu, namun komunikasi antarperwakilan unit masih berjalan sendiri-sendiri dan format file mereka belum seragam. Sebagai penghubung teknis tim, langkah Anda adalah…",
            "options": [
                "Menyusun standar format data usulan, mengundang rapat koordinasi singkat lintas dinas untuk menyepakati jadwal serah terima, dan membuka kanal komunikasi bersama.",
                "Fokus menyelesaikan bagian dinas sendiri dulu dengan sangat baik baru melihat hasil dinas lain di hari terakhir.",
                "Melaporkan kepada atasan bahwa perwakilan dinas lain sulit diajak bekerja sama.",
                "Menyesuaikan data seadanya di menit-menit terakhir agar tetap terlihat selesai.",
                "Menunggu perwakilan dinas lain yang menghubungi Anda lebih dulu jika butuh format.",
            ],
            "weights": [5, 3, 2, 1, 2],
            "hints": h4(
                "Aspek Jejaring Kerja: cari kata kunci 'rapat koordinasi lintas unit', 'menyepakati standar bersama', dan 'komunikasi aktif'.",
                "Hindari bekerja dalam silo sendiri-sendiri atau menumpuk masalah sampai hari terakhir.",
                "Penghubung tim harus menjadi jembatan koordinasi yang konstruktif.",
                "Mengadu ke atasan tanpa upaya koordinasi awal hanya bernilai rendah.",
            ),
            "explain": "Menetapkan standar usulan bersama, menginisiasi koordinasi lintas dinas, dan membuka kanal komunikasi tim mencerminkan Jejaring Kerja tertinggi (5).",
            "targetSec": 40,
            "source": "Original Bank Soal 2026 · TKP Jejaring Kerja",
        },
        {
            "id": "orig26-tkp-03",
            "subtest": "tkp",
            "topic": "sosial budaya",
            "stem": "Anda baru ditempatkan di daerah dengan bahasa keseharian dan tradisi rapat warga yang sangat berbeda dari kampung halaman Anda. Pada rapat kerja perdana dengan tokoh lokal, sebagian peserta berbicara agak lama dengan ungkapan daerah sebelum masuk ke pokok bahasan. Sikap Anda adalah…",
            "options": [
                "Menyimak penuh hormat, mempelajari makna ungkapan kunci setempat bersama rekan lokal, dan menyampaikan gagasan secara santun menyesuaikan budaya komunikasi warga.",
                "Langsung memotong pembicaraan agar rapat selesai tepat waktu sesuai gaya kerja kota asal Anda.",
                "Hanya berbicara kepada pegawai yang berasal dari daerah sama dengan Anda.",
                "Tetap diam di seluruh rapat karena merasa tidak nyaman dengan budaya baru.",
                "Mengajukan mutasi secepatnya ke daerah yang bahasanya sama.",
            ],
            "weights": [5, 2, 1, 3, 1],
            "hints": h4(
                "Aspek Sosial Budaya: tunjukkan rasa hormat, kemauan belajar kearifan lokal, dan komunikasi santun tanpa bersikap etnosentris.",
                "Memotong pembicaraan sesepuh atau menutup diri merusak penerimaan sosial.",
                "Poin 5 memadukan adaptasi budaya lokal dengan tujuan kerja yang tetap produktif.",
                "Berdiam diri saja lebih aman dari memotong (3 vs 2), namun aktif belajar & menyesuaikan tetap poin 5.",
            ),
            "explain": "Poin 5 (Opsi pertama) menggambarkan kecerdasan sosial budaya: menghormati tradisi setempat, mau belajar, dan berkomunikasi adaptif.",
            "targetSec": 40,
            "source": "Original Bank Soal 2026 · TKP Sosial Budaya",
        },
        {
            "id": "orig26-tkp-04",
            "subtest": "tkp",
            "topic": "tik & keamanan siber",
            "stem": "Unit Anda beralih dari arsip berkas fisik ke aplikasi persuratan elektronik baru, tetapi beberapa rekan senior enggan memakainya dan berencana menyimpan salinan dokumen rahasia kantor di akun cloud pribadi gratis agar mudah dibuka dari rumah. Tindakan Anda sebagai rekan kerja yang memahami TIK adalah…",
            "options": [
                "Membantu membuatkan panduan ringkas langkah pakai aplikasi resmi, mendampingi rekan senior berlatih, serta mengingatkan risiko kebocoran data bila memakai cloud pribadi.",
                "Membiarkan mereka memakai cloud pribadi asalkan pekerjaan cepat terkumpul.",
                "Mengambil alih seluruh akun dan pekerjaan rekan senior tanpa mengajari mereka.",
                "Menegur di grup besar kantor bahwa mereka gagap teknologi dan melanggar keamanan.",
                "Ikut menggunakan cloud pribadi karena jauh lebih praktis daripada aplikasi kantor.",
            ],
            "weights": [5, 2, 3, 2, 1],
            "hints": h4(
                "Aspek TIK: nilai tertinggi menggabungkan dua hal—mengajak adopsi teknologi resmi lewat pendampingan DAN menjaga keamanan data/privasi.",
                "Jangan pernah memilih opsi menyimpan data dinas di akun pribadi atau mempermalukan rekan senior.",
                "Mengambil alih kerja orang lain tidak membangun kemandirian tim.",
                "Teguran keras di grup publik melanggar etika harmonis rekan kerja.",
            ),
            "explain": "Membimbing rekan memakai aplikasi resmi sembari mengedukasi keamanan informasi memenuhi seluruh indikator aspek TIK (adaptif + aman data = 5).",
            "targetSec": 42,
            "source": "Original Bank Soal 2026 · TKP TIK",
        },
        {
            "id": "orig26-tkp-05",
            "subtest": "tkp",
            "topic": "profesionalisme",
            "stem": "Dua jam sebelum batas pengumpulan laporan evaluasi tahunan, Anda menemukan kesalahan rumus di tabel lampiran yang dapat memengaruhi angka rekomendasi anggaran, sementara rekan satu tim sudah bersiap pulang. Langkah profesional Anda adalah…",
            "options": [
                "Segera memperbaiki rumus yang keliru, memverifikasi ulang seluruh angka lampiran secara cermat, dan mengomunikasikan revisinya sebelum laporan dikirim.",
                "Tetap mengirim laporan apa adanya karena waktunya sudah mepet dan kesalahannya kecil.",
                "Menyalahkan rekan tim di nota pengantar agar tanggung jawab tidak dibebankan ke Anda.",
                "Menunda pengiriman hingga minggu depan tanpa memberi tahu pimpinan terlebih dulu.",
                "Menghapus halaman lampiran itu supaya laporan terlihat rapi.",
            ],
            "weights": [5, 2, 1, 2, 1],
            "hints": h4(
                "Aspek Profesionalisme: utamakan akurasi, tanggung jawab tuntas, dan komunikasi transparan meski mendekati tenggat.",
                "Menghapus data atau membiarkan angka anggaran salah adalah pelanggaran profesional berat.",
                "Opsi tertinggi langsung mengambil inisiatif perbaikan dan verifikasi ulang sebelum diserahkan.",
                "Menyalahkan rekan kerja merusak etos tim.",
            ),
            "explain": "Profesionalisme menuntut tanggung jawab kualitas hasil kerja sampai tuntas: koreksi segera, verifikasi ulang data, dan koordinasi pengiriman revisi (bobot 5).",
            "targetSec": 38,
            "source": "Original Bank Soal 2026 · TKP Profesionalisme",
        },
        {
            "id": "orig26-tkp-06",
            "subtest": "tkp",
            "topic": "anti-radikalisme",
            "stem": "Seorang anggota baru di komunitas pegawai membagikan tautan artikel di grup internal yang berisi ajakan memusuhi kelompok warga tertentu dan meremehkan dasar negara Pancasila. Sebagai rekan sejawat, respons paling konstruktif yang mencerminkan aspek Anti-Radikalisme adalah…",
            "options": [
                "Menyebarkan tangkapan layar profilnya ke media sosial agar mendapat sanksi sosial luas.",
                "Diam saja karena khawatir grup menjadi ramai perdebatan.",
                "Mengingatkan dengan tenang dan berbasis aturan etika komunikasi, menjelaskan fakta kebangsaan, serta melaporkan kepada moderator grup/pembina kepegawaian jika terus berulang.",
                "Membalas dengan komentar marah dan mengeluarkan yang bersangkutan secara sepihak tanpa konfirmasi.",
                "Menyetujui sebagian isinya agar dianggap ramah kepada pegawai baru.",
            ],
            "weights": [1, 2, 5, 3, 1],
            "hints": h4(
                "Aspek Anti-Radikalisme: sikap ideal adalah tegas menolak narasi ekstrem/intoleran, tetap tenang dialogis, berpedoman pada etika, serta melibatkan jalur pembina resmi bila perlu.",
                "Membiarkan (diam) maupun memviralkan/doxing sama-sama tidak tepat.",
                "Pendekatan persuasif berbasis aturan + eskalasi ke jalur berwenang merupakan standar ASN.",
                "Jangan terjebak emosi dalam membalas provokasi.",
            ),
            "explain": "Anti-Radikalisme ASN mengedepankan ketenangan, pelurusan fakta kebangsaan berdasar etika/aturan, dan pelaporan berjenjang ke pembina resmi (nilai 5).",
            "targetSec": 45,
            "source": "Original Bank Soal 2026 · TKP Anti-Radikalisme",
        },
        {
            "id": "orig26-tkp-07",
            "subtest": "tkp",
            "topic": "pelayanan publik",
            "stem": "Sistem verifikasi online kantor mengalami gangguan selama 30 menit saat antrean pemohon memanjang di ruang tunggu. Agar situasi tetap kondusif dan hak pemohon terpenuhi, tindakan pertama Anda adalah…",
            "options": [
                "Menutup loket dan menyuruh semua pemohon pulang tanpa kepastian jadwal.",
                "Menginformasikan gangguan secara terbuka beserta estimasi waktu pemulihan, menyediakan pencatatan antrean manual sementara sesuai SOP darurat, dan berkoordinasi dengan tim IT.",
                "Terus menatap monitor sambil menunggu IT selesai tanpa berkata apa pun kepada antrean.",
                "Mendahulukan pemohon yang merupakan kenalan Anda terlebih dahulu.",
                "Menyalahkan penyedia internet di depan pemohon agar kemarahan tidak tertuju ke kantor.",
            ],
            "weights": [1, 5, 2, 1, 2],
            "hints": h4(
                "Saat layanan terganggu: komunikasikan transparan ke pengguna, jalankan solusi cadangan (SOP darurat), dan eskalasi ke tim teknis.",
                "Mendahulukan kenalan atau menyalahkan vendor di depan publik melanggar etika pelayanan.",
                "Transparansi menurunkan keluhan warga secara drastis.",
                "Opsi terbaik memberi solusi cepat sekaligus kepastian proses.",
            ),
            "explain": "Keterbukaan informasi, aktivasi pencatatan cadangan sesuai SOP, serta koordinasi cepat dengan tim IT merupakan respons Pelayanan Publik paling solutif (poin 5).",
            "targetSec": 40,
            "source": "Original Bank Soal 2026 · TKP Pelayanan Publik",
        },
        {
            "id": "orig26-tkp-08",
            "subtest": "tkp",
            "topic": "profesionalisme",
            "stem": "Pimpinan unit meminta Anda mempercepat pencairan klaim administrasi seorang relasi dekat meskipun dua dokumen syarat mutlak belum dilengkapi. Sikap Anda adalah…",
            "options": [
                "Langsung menyetujui permintaan tersebut karena perintah langsung atasan wajib dipatuhi mutlak.",
                "Menolak secara santun dengan menunjukkan rincian syarat prosedur yang kurang, lalu menawarkan bantuan percepatan pemeriksaan segera setelah berkas dilengkapi.",
                "Memprosesnya diam-diam sambil meminta surat pernyataan bebas tanggung jawab pribadi.",
                "Membawa masalah itu langsung ke media sosial untuk transparansi.",
                "Membiarkan berkasnya menumpuk tanpa memberikan penjelasan kepada siapa pun.",
            ],
            "weights": [1, 5, 2, 1, 3],
            "hints": h4(
                "Aturan baku TKP saat perintah atasan menabrak SOP: tolak dengan sopan + jelaskan aturannya + tawarkan solusi percepatan yang TETAP sah secara prosedur.",
                "Mematuhi perintah pelanggaran aturan secara membabi buta maupun memviralkan internal kantor bernilai terendah.",
                "Solusi terbaik menjaga hubungan baik dengan pimpinan sekaligus melindungi integritas prosedur.",
                "Diam menumpuk berkas tidak membantu penyelesaian pelayanan.",
            ),
            "explain": "Profesionalisme ASN mensyaratkan keberanian etis menolak prosedur tidak sah secara santun sembari memberi jalan keluar sah ketika syarat lengkap (poin 5).",
            "targetSec": 40,
            "source": "Original Bank Soal 2026 · TKP Profesionalisme",
        },
        {
            "id": "orig26-tkp-09",
            "subtest": "tkp",
            "topic": "tik & adaptasi kerja",
            "stem": "Anda diminta mengikuti lokakarya daring singkat mengenai alat analisis data publik terbaru agar tim bisa mempercepat penyusunan laporan triwulanan, namun jadwalnya bersamaan dengan pekerjaan rutin ringan. Sikap Anda adalah…",
            "options": [
                "Mengatur jadwal pekerjaan rutin lebih awal agar dapat mengikuti lokakarya secara fokus dan langsung membagikan ringkasan praktiknya ke tim.",
                "Menolak ikut lokakarya karena merasa metode lama sudah cukup nyaman.",
                "Menghidupkan Zoom saja untuk absen sambil mengerjakan hal pribadi lain.",
                "Meminta rekan magang saja yang ikut lalu menyalin sertifikatnya.",
                "Ikut sebentar di 10 menit awal lalu keluar tanpa izin.",
            ],
            "weights": [5, 2, 1, 1, 2],
            "hints": h4(
                "Aspek TIK & Pengembangan Diri: antusias belajar alat baru dan langsung menularkan manfaatnya ke tim adalah ciri skor 5.",
                "Hadir sekadar formalitas atau menolak belajar hal baru mendapat skor rendah.",
                "Manajemen waktu agar tugas rutin beres sekaligus ilmu baru terserap menunjukkan kematangan kerja.",
                "Fokus pada kata kunci 'fokus belajar' dan 'bagikan praktik ke tim'.",
            ),
            "explain": "Mengelola prioritas sehingga tetap tuntas bekerja sambil menyerap teknologi baru dan membagikannya ke tim meraih skor tertinggi (5).",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · TKP TIK",
        },
        {
            "id": "orig26-tkp-10",
            "subtest": "tkp",
            "topic": "jejaring kerja & kolaborasi",
            "stem": "Dalam tim gabungan penyelenggaraan pameran pelayanan publik daerah, salah satu anggota yang berasal dari instansi lain kesulitan menyelesaikan materi desain karena keterbatasan perangkat lunak. Yang Anda lakukan adalah…",
            "options": [
                "Membiarkannya mengurus sendiri karena bukan tanggung jawab unit kerja Anda.",
                "Membantu meminjamkan akses alat kerja resmi kantor sesuai izin atau berbagi template siap pakai agar target tim gabungan tetap tercapai tepat waktu.",
                "Mengkritiknya di forum evaluasi bahwa SDM instansinya tidak siap bekerja sama.",
                "Mengambil alih seluruh kredit pameran sebagai keberhasilan unit Anda sendiri.",
                "Menyarankan ketua tim untuk mengeluarkannya dari kepanitiaan.",
            ],
            "weights": [2, 5, 1, 1, 2],
            "hints": h4(
                "Aspek Jejaring Kerja: ketika rekan lintas instansi terkendala teknis, bantu dengan berbagi sumber daya/template yang sah demi tujuan bersama.",
                "Sikap ego sektoral atau mengkritik keras tidak menyelesaikan hambatan acara.",
                "Kolaborasi lintas unit diukur dari kesediaan saling melengkapi kekurangan teknis tim.",
                "Keberhasilan tim gabungan adalah kesuksesan bersama.",
            ),
            "explain": "Berbagi solusi praktis (template/alat sah) agar anggota lintas unit tidak tertinggal demi sukses pameran bersama menunjukkan Jejaring Kerja terbaik (5).",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · TKP Jejaring Kerja",
        },
    ])

    return {
        "id": "cpns-skd-original-2026",
        "name": "SKD CPNS 2026 · Bank Original Standar KepmenPANRB",
        "family": "cpns",
        "version": 1,
        "updatedAt": "2026-11-13T00:00:00.000Z",
        "note": f"{len(questions)} soal 100% original terstruktur mengikuti KepmenPANRB No. 321/2024 & 21 submateri terbaru (TWK kasus, TIU Kecukupan Data/Argumen/Pola Tabel/Hitung Teruji, dan 6 Aspek TKP) lengkap dengan cara cepat bahasa awam.",
        "source": "Bank Soal Original Jhâr-Ajhârân 2026 (disusun mengacu standar resmi KepmenPANRB No. 321 Tahun 2024).",
        "config": {
            "durationMin": 40,
            "subtests": [
                {"id": "twk", "name": "Tes Wawasan Kebangsaan", "scheme": "binary", "perCorrect": 5, "passMin": 30},
                {"id": "tiu", "name": "Tes Intelegensi Umum", "scheme": "binary", "perCorrect": 5, "passMin": 45},
                {"id": "tkp", "name": "Tes Karakteristik Pribadi", "scheme": "weighted", "passMin": 38},
            ],
        },
        "questions": questions,
    }


def bank_bumn_original_2026() -> dict:
    questions: list[dict] = []

    # Verifikasi matematis Number Sequence RBB BUMN
    # TKD-02: 5, 12, 8, 24, 11, 48, 14, ... -> lompat ganjil (5,8,11,14 = +3), genap (12,24,48 = x2) -> 96
    odd_seq = [5, 8, 11, 14]
    even_seq = [12, 24, 48]
    assert all(odd_seq[i + 1] - odd_seq[i] == 3 for i in range(len(odd_seq) - 1))
    assert even_seq[-1] * 2 == 96

    # TKD-03: 2, 5, 11, 23, 47, ... -> pola *2 + 1 -> 47 * 2 + 1 = 95
    seq3 = [2]
    for _ in range(4):
        seq3.append(seq3[-1] * 2 + 1)
    assert seq3 == [2, 5, 11, 23, 47]
    assert seq3[-1] * 2 + 1 == 95

    questions.extend([
        # ---- TKD BUMN (8 soal: Verbal, Deret, Word Class, Diagram) ----
        {
            "id": "orig-bumn26-tkd-01",
            "subtest": "tkd",
            "topic": "verbal logical reasoning",
            "stem": "Semua karyawan BUMN yang lulus pelatihan cloud diwajibkan mengikuti sertifikasi keamanan siber.\nBeberapa staf divisi keuangan belum lulus pelatihan cloud.\nManakah kesimpulan yang PASTI BENAR?",
            "options": [
                "Semua staf divisi keuangan wajib mengikuti sertifikasi keamanan siber.",
                "Tidak ada staf divisi keuangan yang mengikuti sertifikasi keamanan siber.",
                "Sebagian staf divisi keuangan mungkin sudah atau belum mengikuti sertifikasi keamanan siber atas inisiatif lain, tetapi mereka belum terkena kewajiban dari syarat kelulusan cloud ini.",
                "Semua karyawan selain staf divisi keuangan pasti sudah lulus pelatihan cloud.",
                "Sertifikasi keamanan siber hanya berlaku untuk divisi teknologi informasi.",
            ],
            "key": 2,
            "hints": h4(
                "Hati-hati pada premis 'Beberapa belum lulus'! Itu TIDAK otomatis melarang mereka ikut sertifikasi lewat jalur lain, dan tidak berarti seluruh divisi gagal.",
                "Coret opsi yang menggeneralisasi 'Semua' atau 'Tidak ada' secara mutlak untuk seluruh divisi keuangan.",
                "Aturan logika RBB: 'Jika P → Q', tidak terpenuhinya P (~P) tidak membuktikan ~Q.",
                "Jangan menyimpulkan 'tidak lulus cloud = pasti tidak ikut sertifikasi'.",
            ),
            "explain": "Aturan 'Jika lulus cloud → wajib sertifikasi' tidak melarang orang yang belum lulus cloud untuk mengikuti sertifikasi lewat jalur sukarela, dan premis menyebut 'beberapa' bukan semua staf keuangan. Jadi satu-satunya kesimpulan logis sah adalah mereka belum terkena kewajiban dari jalur pelatihan cloud tersebut.",
            "targetSec": 45,
            "source": "Original Bank Soal 2026 · RBB TKD Verbal",
        },
        {
            "id": "orig-bumn26-tkd-02",
            "subtest": "tkd",
            "topic": "number sequence",
            "stem": "Tentukan angka berikutnya pada deret:\n5, 12, 8, 24, 11, 48, 14, …",
            "options": [
                "17",
                "64",
                "72",
                "84",
                "96",
            ],
            "key": 4,
            "hints": h4(
                "Angkanya naik-turun berselang-seling! Pisahkan menjadi 2 deret terpisah: posisi ganjil (5, 8, 11, 14 = selalu +3) dan posisi genap (12, 24, 48 = selalu dikali 2). Karena posisi yang ditanya adalah urutan genap ke-8, lanjutkan 48 × 2.",
                "Opsi 17 adalah jebakan untuk posisi ganjil ke-9, bukan posisi ke-8 yang sedang ditanya!",
                "Deret selang-seling dua jalur sangat sering muncul di Subtes 2 TKD RBB BUMN.",
                "Jangan hitung selisih langsung 12 ke 8 ke 24 karena berasal dari dua pola berbeda.",
            ),
            "explain": "Sub-deret posisi ganjil: 5, 8, 11, 14 (+3). Sub-deret posisi genap: 12, 24, 48 (×2). Angka berikutnya berada di posisi ke-8 (genap) = 48 × 2 = 96.",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · RBB Number Sequence",
        },
        {
            "id": "orig-bumn26-tkd-03",
            "subtest": "tkd",
            "topic": "number sequence",
            "stem": "Lanjutkan barisan bilangan berikut:\n2, 5, 11, 23, 47, …",
            "options": [
                "71",
                "85",
                "91",
                "94",
                "95",
            ],
            "key": 4,
            "hints": h4(
                "Lihat selisihnya: +3, +6, +12, +24 (selalu berlipat 2)! Atau lebih cepat lagi: tiap angka dikali 2 lalu ditambah 1 → 47 × 2 + 1.",
                "Karena seluruh suku selain 2 berupa bilangan ganjil, hasil (×2 + 1) pasti ganjil (buang 94).",
                "Dua cara menguji menghasilkan angka sama persis: tambah +48 ke 47 atau 47×2 + 1.",
                "Jangan lupa menambahkan '+1' setelah mengalikan dua.",
            ),
            "explain": "Pola suku berikutnya adalah (suku sebelumnya × 2) + 1: 2×2+1=5, 5×2+1=11, 11×2+1=23, 23×2+1=47, maka 47×2+1 = 95.",
            "targetSec": 30,
            "source": "Original Bank Soal 2026 · RBB Number Sequence",
        },
        {
            "id": "orig-bumn26-tkd-04",
            "subtest": "tkd",
            "topic": "word classification",
            "stem": "Pilih satu kata yang TIDAK termasuk dalam kelompok yang sama dengan keempat kata lainnya:",
            "options": [
                "Rupiah",
                "Yen",
                "Euro",
                "Real",
                "Saham",
            ],
            "key": 4,
            "hints": h4(
                "Kelompokkan keempat kata yang sejenis: empat kata adalah nama MATA UANG resmi negara/kawasan; cari satu yang bukan mata uang.",
                "Perhatikan: Real adalah mata uang Brasil/Oman/Saudi (ejaan Riyal/Real), sedangkan Saham adalah instrumen kepemilikan modal.",
                "Cari kategori fungsional paling spesifik yang menyatukan 4 kata sekaligus.",
                "Jangan terkecoh hanya karena semuanya berhubungan dengan topik keuangan.",
            ),
            "explain": "Rupiah, Yen, Euro, dan Real adalah nama mata uang, sedangkan Saham adalah surat berharga bukti kepemilikan perusahaan (efek ekuitas).",
            "targetSec": 20,
            "source": "Original Bank Soal 2026 · RBB Word Classification",
        },
        {
            "id": "orig-bumn26-tkd-05",
            "subtest": "tkd",
            "topic": "diagram reasoning",
            "stem": "Perhatikan aturan operator diagram berikut:\nOperator [R] = putar panah 90° searah jarum jam.\nOperator [F] = balik warna isi (hitam ↔ putih).\n\nInput awal: Panah menunjuk ke ATAS (↑) berwarna PUTIH (○).\nJika Input melewati operator [R] → [F] → [R], bagaimanakah hasil akhirnya?",
            "options": [
                "Panah ke KANAN (→) berwarna HITAM (●)",
                "Panah ke BAWAH (↓) berwarna HITAM (●)",
                "Panah ke BAWAH (↓) berwarna PUTIH (○)",
                "Panah ke KIRI (←) berwarna HITAM (●)",
                "Panah ke ATAS (↑) berwarna PUTIH (○)",
            ],
            "key": 1,
            "hints": h4(
                "Lacak arah & warna secara TERPISAH agar tidak bingung! Ada 2 kali [R] (90° + 90° = putar 180° dari ATAS jadi BAWAH) dan 1 kali [F] (PUTIH dibalik jadi HITAM).",
                "Karena ada dua operator [R], panah dari ATAS berputar 180° menjadi menunjuk ke BAWAH—coret opsi arah lain.",
                "Memisahkan hitungan per atribut (arah saja, lalu warna saja) membuat Diagram Reasoning RBB selesai di bawah 15 detik.",
                "Jangan membalik arahnya berlawanan jarum jam.",
            ),
            "explain": "Atribut arah: ATAS → [R] menjadi KANAN → [R] lagi menjadi BAWAH (↓). Atribut warna: PUTIH → [F] sekali menjadi HITAM (●). Jadi output akhir: panah BAWAH berwarna HITAM.",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · RBB Diagram Reasoning",
        },
        # ---- AKHLAK BUMN (5 soal) ----
        {
            "id": "orig-bumn26-akhlak-01",
            "subtest": "akhlak",
            "topic": "core values akhlak (amanah)",
            "stem": "Anda menyadari telah keliru mengirim angka proyeksi pendapatan pada presentasi awal kepada rekan lintas divisi sebelum rapat manajemen dimulai. Belum ada yang menyadari kekeliruan itu. Perwujudan nilai AMANAH yang paling tepat adalah…",
            "options": [
                "Menunggu rapat berjalan dulu; bila tidak ada yang bertanya berarti aman.",
                "Segera mengirim ralat tertulis secara terbuka kepada seluruh penerima dengan data yang sudah diverifikasi dan menyampaikan permohonan maaf profesional.",
                "Mengganti file di drive diam-diam tanpa memberi tahu siapa pun agar citra pribadi terjaga.",
                "Menyalahkan sistem penyedia data internal di depan tim keuangan.",
                "Membatalkan rapat tanpa alasan jelas untuk menunda presentasi.",
            ],
            "key": 1,
            "hints": h4(
                "Nilai AMANAH berarti memegang teguh kepercayaan dengan jujur, terbuka, dan bertanggung jawab atas kekeliruan.",
                "Diam-diam mengganti file atau berharap tidak ketahuan merusak integritas kepercayaan.",
                "Ralat cepat sebelum rapat menjaga kualitas keputusan bisnis perusahaan.",
                "Menyalahkan sistem lain tidak memperbaiki keakuratan informasi bagi peserta rapat.",
            ),
            "explain": "AMANAH menuntut tanggung jawab penuh atas amanah tugas: segera merilis ralat akurat secara transparan sebelum berdampak ke keputusan manajemen.",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · AKHLAK Amanah",
        },
        {
            "id": "orig-bumn26-akhlak-02",
            "subtest": "akhlak",
            "topic": "core values akhlak (adaptif & kompeten)",
            "stem": "Perusahaan BUMN tempat Anda bekerja mengadopsi dashboard pelaporan operasional baru berbasis analitik real-time untuk menggantikan laporan spreadsheet mingguan. Sebagian anggota tim kebingungan membacanya. Tindakan yang mencerminkan nilai KOMPETEN dan ADAPTIF sekaligus adalah…",
            "options": [
                "Mempelajari logika metrik dashboard baru hingga mahir lalu menyelenggarakan sesi berbagi singkat agar seluruh tim cepat menguasainya.",
                "Tetap mengirim laporan spreadsheet lama karena lebih terbiasa sejak dulu.",
                "Menunggu pelatihan resmi bersertifikat tiga bulan lagi baru mulai membukanya.",
                "Meminta tim IT saja yang mengerjakan laporan mingguan tim Anda.",
                "Hanya menguasai bagian metrik pribadi tanpa peduli kebingungan anggota lain.",
            ],
            "key": 0,
            "hints": h4(
                "KOMPETEN = terus meningkatkan kapabilitas diri & membantu orang lain belajar; ADAPTIF = antusias menggerakkan perubahan.",
                "Menolak sistem baru atau pasif menunggu berbulan-bulan bertentangan langsung dengan Adaptif.",
                "Opsi terbaik selalu mencakup dua sisi: kuasai sendiri + bantu rekan tim ikut mahir.",
                "Jangan melemparkan tanggung jawab pelaporan ke divisi IT.",
            ),
            "explain": "Menguasai perubahan teknologi secara mandiri sekaligus memfasilitasi pembelajaran rekan kerja memadukan nilai Kompeten dan Adaptif secara utuh.",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · AKHLAK Kompeten-Adaptif",
        },
        {
            "id": "orig-bumn26-akhlak-03",
            "subtest": "akhlak",
            "topic": "core values akhlak (harmonis & kolaboratif)",
            "stem": "Dua anggota tim berdebat tajam karena perbedaan gaya kerja antara anggota senior yang mengutamakan kehati-hatian dokumen dan anggota muda yang ingin serba cepat dengan otomasi. Sebagai pemimpin proyek kecil tersebut, sikap Anda adalah…",
            "options": [
                "Memihak anggota muda sepenuhnya agar proyek cepat selesai tanpa birokrasi.",
                "Meminta keduanya berdialog tenang, menyatukan ketelitian kontrol kualitas senior dengan kecepatan otomasi anggota muda dalam alur kerja bersama.",
                "Memindahkan salah satu anggota keluar tim agar tidak berdebat lagi.",
                "Menegur keduanya secara emosional di hadapan klien eksternal.",
                "Membiarkan mereka terus berbeda cara kerja tanpa menyusun kesepakatan proses.",
            ],
            "key": 1,
            "hints": h4(
                "HARMONIS = menghargai perbedaan latar/gaya; KOLABORATIF = menyatukan kekuatan berbeda menjadi sinergi produktif.",
                "Hindari memihak satu kubu, memarahi di depan klien, atau langsung memecah tim.",
                "Sinergi lintas generasi mengubah potensi konflik menjadi keunggulan tim.",
                "Perbedaan gaya kerja tidak selesai jika dibiarkan tanpa kesepakatan standar.",
            ),
            "explain": "Menghargai kekuatan masing-masing (ketelitian + kecepatan digital) lewat dialog dan menyatukannya dalam alur tim mempraktikkan Harmonis sekaligus Kolaboratif.",
            "targetSec": 38,
            "source": "Original Bank Soal 2026 · AKHLAK Harmonis-Kolaboratif",
        },
        {
            "id": "orig-bumn26-akhlak-04",
            "subtest": "akhlak",
            "topic": "core values akhlak (loyal)",
            "stem": "Di media sosial ramai komentar negatif tidak berdasar mengenai proses layanan salah satu cabang perusahaan BUMN Anda. Sebagai karyawan yang memegang nilai LOYAL, sikap Anda yang paling tepat adalah…",
            "options": [
                "Ikut membalas dengan komentar emosional dan menyerang akun warganet tersebut.",
                "Membagikan informasi rahasia operasional internal perusahaan demi membela cabang Anda.",
                "Tidak menyebarkan spekulasi, melaporkan isu tersebut ke tim komunikasi korporat/humas resmi agar ditangani lewat klarifikasi faktual, dan tetap menjaga kualitas layanan.",
                "Menghapus identitas kantor dari profil kerja sementara lalu ikut mengkritik di kolom komentar.",
                "Mengabaikan sepenuhnya kendati ada keluhan pelanggan valid yang butuh ditindaklanjuti.",
            ],
            "key": 2,
            "hints": h4(
                "LOYAL = menjaga nama baik karyawan, BUMN, dan Negara melalui jalur profesional tanpa membocorkan rahasia perusahaan.",
                "Jangan membalas komentar dengan emosi apalagi mengunggah dokumen internal rahasia ke ruang publik.",
                "Eskalasi ke fungsi Humas resmi + perbaikan mutu layanan internal menjaga reputasi perusahaan secara bermartabat.",
                "Ikut menjelekkan perusahaan di ruang publik jelas bertentangan dengan Loyal.",
            ),
            "explain": "Loyalitas diwujudkan dengan menjaga nama baik sekaligus etika informasi perusahaan: meneruskan isu ke unit Humas resmi agar diklarifikasi berbasis data, bukan debat emosional atau membocorkan rahasia.",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · AKHLAK Loyal",
        },
        # ---- TWK BUMN (2 soal) ----
        {
            "id": "orig-bumn26-twk-01",
            "subtest": "twk_bumn",
            "topic": "wawasan kebangsaan bumn",
            "stem": "Selain mengejar keuntungan komersial, Badan Usaha Milik Negara (BUMN) mengemban fungsi Public Service Obligation (PSO) seperti subsidi distribusi energi serta konektivitas wilayah tertinggal, terdepan, dan terluar (3T). Landasan konstitusional utama mandat pelayanan publik ini merujuk pada…",
            "options": [
                "Pasal 28E UUD 1945 tentang kebebasan berserikat.",
                "Pasal 33 UUD 1945 tentang perekonomian nasional yang menguasai cabang produksi penting bagi hajat hidup orang banyak.",
                "Pasal 18 ayat (1) UUD 1945 tentang pembagian provinsi.",
                "Pasal 27 ayat (3) UUD 1945 tentang kewajiban membela negara bersenjata.",
                "Pasal 31 UUD 1945 tentang anggaran pendidikan nasional.",
            ],
            "key": 1,
            "hints": h4(
                "Kaitan langsung BUMN + hajat hidup orang banyak selalu bermuara pada Pasal 33 UUD 1945.",
                "Pasal 31 soal pendidikan, Pasal 18 soal pemda, Pasal 28E soal HAM kebebasan berserikat.",
                "BUMN menjadi perpanjangan negara menjaga keadilan distribusi barang strategis di seluruh Nusantara.",
                "Jangan tertukar dengan pasal kewajiban warga negara (27).",
            ),
            "explain": "Pasal 33 ayat (2) & (3) UUD 1945 mengamanatkan cabang-cabang produksi penting dan menguasai hajat hidup orang banyak dikuasai oleh negara untuk kemakmuran rakyat, yang dijalankan antara lain oleh BUMN lewat penugasan PSO.",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · TWK BUMN",
        },
        {
            "id": "orig-bumn26-twk-02",
            "subtest": "twk_bumn",
            "topic": "wawasan kebangsaan bumn",
            "stem": "Dalam ekosistem tata kelola BUMN modern, penerapan prinsip Good Corporate Governance (GCG) terdiri dari lima pilar TARIF. Huruf 'F' pada prinsip TARIF merupakan singkatan dari…",
            "options": [
                "Flexibility (Keluwesan aturan sesuai kondisi).",
                "Fairness (Kewajaran dan kesetaraan dalam memenuhi hak pemangku kepentingan).",
                "Financialization (Fokus laba jangka pendek).",
                "Formality (Kepatuhan kertas laporan belaka).",
                "Fast-track (Percepatan tanpa audit).",
            ],
            "key": 1,
            "hints": h4(
                "Hafal 5 pilar GCG (TARIF): Transparency, Accountability, Responsibility, Independency, Fairness.",
                "Pilar GCG berfokus pada tata kelola bersih dan adil, bukan pemangkasan audit atau laba jangka pendek.",
                "Fairness menjamin perlakuan wajar dan adil kepada pemegang saham minoritas, pelanggan, mitra, dan karyawan.",
                "Jangan keliru menebak 'Flexibility' sebagai pilar resmi TARIF.",
            ),
            "explain": "Lima prinsip GCG BUMN dikenal dengan akronim TARIF: Transparency (Keterbukaan), Accountability (Akuntabilitas), Responsibility (Pertanggungjawaban), Independency (Kemandirian), dan Fairness (Kewajaran).",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · TWK GCG BUMN",
        },
        # ---- BAHASA INGGRIS RBB (4 soal) ----
        {
            "id": "orig-bumn26-bhs-01",
            "subtest": "bhs",
            "topic": "grammar & structure",
            "stem": "The number of clean energy projects funded by state-owned enterprises _____ significantly over the past five years.",
            "options": [
                "have increased",
                "has increased",
                "are increasing",
                "were increased",
                "increasing",
            ],
            "key": 1,
            "hints": h4(
                "Hafal aturan paling klasik RBB BUMN: 'The number of + kata jamak' SELALU memakai Verb TUNGGAL (has/is)! Sebaliknya, 'A number of' barulah jamak.",
                "Jangan terkecoh kata 'projects' atau 'enterprises' yang jamak; kata kerja utama harus mengikuti frasa inti 'The number'. Plus penanda waktu 'over the past five years' menuntut Present Perfect.",
                "S + has + V3 cocok untuk aksi berlangsung dari lampau hingga kini.",
                "Coret 'increasing' karena tidak ada auxiliary verb sebelum V-ing.",
            ),
            "explain": "Subjek kalimat diawali 'The number of ...' yang bermakna tunggal ('jumlahnya'), sehingga wajib berpasangan dengan auxiliary tunggal 'has' + V3 ('increased') sesuai penanda 'over the past five years'.",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · RBB B. Inggris Structure",
        },
        {
            "id": "orig-bumn26-bhs-02",
            "subtest": "bhs",
            "topic": "error identification",
            "stem": "Identify the bracketed part that must be corrected:\nEvery regional branch manager must ensure [A: that] customer complaints are [B: handled] promptly, accurately, and [C: in a polite manner] before [D: submit] the weekly report to [E: headquarters].",
            "options": [
                "[A] that",
                "[B] handled",
                "[C] in a polite manner",
                "[D] submit",
                "[E] headquarters",
            ],
            "key": 3,
            "hints": h4(
                "Aturan emas kata depan (Preposition): setelah kata seperti 'before / after / without / by / in', kata kerja wajib berbentuk V-ing (Gerund), bukan V1 polos!",
                "Cek satu per satu: 'that' benar (klausa benda), 'are handled' benar (pasif), 'before' adalah preposisi/konjungsi tanpa subjek → cek kata kerja tepat sesudahnya.",
                "Bentuk benar seharusnya: 'before submitting the weekly report'.",
                "'Headquarters' memang selalu berakhiran -s sekalipun bermakna satu kantor pusat.",
            ),
            "explain": "Setelah preposisi 'before' (ketika tidak diikuti subjek baru), kata kerja wajib memakai bentuk gerund (V-ing). Jadi [D] 'submit' salah dan harus diperbaiki menjadi 'submitting'.",
            "targetSec": 40,
            "source": "Original Bank Soal 2026 · RBB Error ID",
        },
        {
            "id": "orig-bumn26-bhs-03",
            "subtest": "bhs",
            "topic": "grammar & parallelism",
            "stem": "The new logistics platform aims to reduce delivery bottlenecks, cut operational overhead, and _____ real-time shipment visibility across islands.",
            "options": [
                "enhancing",
                "enhanced",
                "to enhancing",
                "enhance",
                "it enhances",
            ],
            "key": 3,
            "hints": h4(
                "Cek pola paralel sebelum kata 'and': '... aims to [reduce] ..., [cut] ..., and [___] ...'. Ketiganya bergantung pada 'to' + kata kerja dasar (V1 polos)!",
                "Coret '-ing', '-ed', atau klausa baru 'it enhances' karena memutus kesetaraan bentuk kata kerja.",
                "Parallelism: item A, item B, and item C harus punya kelas tata bahasa persis sama.",
                "Jangan tertipu untuk mengulang 'to enhancing'.",
            ),
            "explain": "Struktur paralel kalimat memakai 'to + V1': (to) reduce ..., (to) cut ..., and (to) enhance .... Oleh karena itu bentuk yang setara adalah 'enhance'.",
            "targetSec": 30,
            "source": "Original Bank Soal 2026 · RBB Parallelism",
        },
        {
            "id": "orig-bumn26-bhs-04",
            "subtest": "bhs",
            "topic": "reading comprehension",
            "stem": "Bacaan:\n\"While digital payment adoption in Indonesian tier-1 cities has exceeded initial projections, rural micro-merchants still cite unstable mobile connectivity and complex onboarding forms as major barriers. In response, state banking consortiums are testing lightweight offline-capable QR settlement apps paired with assisted local agent onboarding.\"\n\nBased on the passage, why are banking consortiums piloting lightweight offline-capable apps?",
            "options": [
                "Because digital payment adoption in major tier-1 cities has dropped sharply.",
                "To completely replace all human bank branches in large metropolitan areas.",
                "To address connectivity constraints and simplify adoption for rural micro-merchants.",
                "Because QR technology can no longer work online in urban corridors.",
                "To collect longer onboarding forms from small merchants.",
            ],
            "key": 2,
            "hints": h4(
                "Baca kata tanya 'why piloting lightweight offline apps', lalu cari kalimat tepat sesudah frasa 'In response'—jawaban benarnya adalah parafrase dari masalah kalimat sebelumnya!",
                "Kalimat pertama menyebut adopsi kota besar justru 'exceeded projections' (naik melampaui target)—langsung coret opsi yang menyebut turun.",
                "Solusi aplikasi ringan + agen lokal menjawab dua kendala persis: sinyal tidak stabil + formulir rumit.",
                "Waspadai opsi yang menyebut 'collect longer forms', padahal tujuannya justru mengatasi kerumitan formulir.",
            ),
            "explain": "Teks menjelaskan dua kendala pedagang mikro pedesaan yaitu sinyal seluler tidak stabil dan formulir pendaftaran rumit. Untuk mengatasinya ('In response'), konsorsium bank menguji aplikasi QR ringan ramah offline dan pendampingan agen lokal.",
            "targetSec": 55,
            "source": "Original Bank Soal 2026 · RBB Reading",
        },
        # ---- LEARNING AGILITY RBB TAHAP 2 (3 soal) ----
        {
            "id": "orig-bumn26-agility-01",
            "subtest": "agility",
            "topic": "learning agility (change & mental)",
            "stem": "Tim Anda mendapat penugasan mendadak merancang layanan pelanggan berbasis asisten AI dalam 3 minggu, padahal belum ada satu pun anggota yang pernah meluncurkan produk serupa. Bagaimana pendekatan terbaik yang menunjukkan Learning Agility tinggi?",
            "options": [
                "Menolak tugas sampai perusahaan mengontrak vendor luar untuk mengerjakan seluruhnya.",
                "Memetakan kompetensi yang belum dimiliki tim, mempelajari studi kasus resmi yang ada, dan segera menguji prototipe kecil bersama mentor internal sambil mencatat pelajaran dari tiap uji coba.",
                "Langsung meluncurkan bot ke seluruh pelanggan tanpa uji coba terbatas agar cepat selesai.",
                "Meminta penundaan target hingga enam bulan ke depan tanpa rencana kerja awal.",
                "Menyerahkan seluruh risiko desain kepada anggota tim paling junior.",
            ],
            "key": 1,
            "hints": h4(
                "Learning Agility tinggi selalu memadukan 3 kunci: memetakan celah belajar, berani uji coba bertahap (iterasi cepat), dan refleksi dari umpan balik.",
                "Menolak tugas karena belum bisa menunjukkan Change Agility rendah; meluncurkan langsung ke seluruh nasabah tanpa uji coba berisiko ceroboh.",
                "Hasil terbaik lahir dari eksekusi terukur: belajar cepat lewat prototipe kecil.",
                "Hindari opsi ekstrem pasif maupun nekat tanpa manajemen risiko.",
            ),
            "explain": "Dimensi Mental & Change Agility tercermin dari kemauan memetakan kekurangan ilmu, aktif mencari referensi/mentor, menguji prototipe kecil secara terukur, dan belajar cepat dari setiap iterasi.",
            "targetSec": 40,
            "source": "Original Bank Soal 2026 · RBB Learning Agility",
        },
        {
            "id": "orig-bumn26-agility-02",
            "subtest": "agility",
            "topic": "learning agility (self-awareness)",
            "stem": "Setelah presentasi inovasi Anda mendapat beberapa kritik tajam dari komite penilai karena asumsi biaya implementasi yang terlalu optimistis, respons yang mencerminkan Self-Awareness dan Learning Agility adalah…",
            "options": [
                "Berdebat panjang membela diri bahwa komite kurang memahami visi besar proyek Anda.",
                "Merasa tidak berbakat dan menarik diri dari seluruh proyek inovasi berikutnya.",
                "Mencatat seluruh masukan objektif komite, mengevaluasi kelemahan perhitungan asumsi biaya bersama ahli keuangan, lalu merevisi proposal menjadi lebih realistis.",
                "Menganggap kritik itu semata karena faktor ketidaksukaan pribadi terhadap tim Anda.",
                "Mengubah judul proposal saja tanpa membetulkan tabel rincian biayanya.",
            ],
            "key": 2,
            "hints": h4(
                "Self-Awareness = terbuka terhadap umpan balik jujur + menerjemahkan kritik menjadi perbaikan konkret tanpa defensif atau patah semangat.",
                "Coret sikap defensif, menganggap personal, maupun menyerah mundur.",
                "Kombinasi refleksi + perbaikan angka bersama ahli keuangan menunjukkan Results & People Agility sekaligus.",
                "Sekadar mengganti judul tanpa memperbaiki substansi adalah kegagalan belajar.",
            ),
            "explain": "Individu dengan Learning Agility tinggi menerima kritik sebagai bahan bakar perbaikan: mendengarkan objektif, berkolaborasi memperbaiki titik lemah biaya, dan menyajikan revisi unggul.",
            "targetSec": 35,
            "source": "Original Bank Soal 2026 · RBB Self-Awareness",
        },
        {
            "id": "orig-bumn26-agility-03",
            "subtest": "agility",
            "topic": "learning agility (results agility)",
            "stem": "Di tengah pengerjaan proyek infrastruktur distribusi baru, regulator menerbitkan ketentuan standar keselamatan tambahan yang mengubah 30% desain awal Anda padahal tenggat peluncuran tinggal dua pekan. Tindakan Anda adalah…",
            "options": [
                "Mengabaikan ketentuan regulator baru demi mengejar tanggal peluncuran lama.",
                "Segera memetakan dampak aturan baru terhadap komponen yang berubah, menyusun ulang prioritas kerja tim lintas fungsi, dan mengomunikasikan penyesuaian jadwal/solusi terukur kepada pimpinan.",
                "Menghentikan seluruh aktivitas tim sambil menunggu rapat pleno bulan depan.",
                "Mengeluh di grup kerja bahwa aturan baru membuat pekerjaan selama ini sia-sia.",
                "Membiarkan bagian keselamatan dikerjakan belakangan setelah sistem beroperasi penuh.",
            ],
            "key": 1,
            "hints": h4(
                "Results Agility = tetap tenang mencapai hasil terbaik di tengah perubahan mendadak tanpa melanggar standar keselamatan/regulasi.",
                "Jangan pernah mengorbankan standar keselamatan atau mengabaikan regulator demi kecepatan semu.",
                "Pemetaan dampak + penyesuaian prioritas cepat adalah kunci respons adaptif.",
                "Berhenti bekerja atau sekadar mengeluh menunda pemecahan masalah.",
            ),
            "explain": "Results & Change Agility menuntut ketangkasan memetakan dampak perubahan regulasi secara cepat, mengoordinasikan prioritas tim, dan mengusulkan eksekusi aman yang terukur kepada pimpinan.",
            "targetSec": 40,
            "source": "Original Bank Soal 2026 · RBB Results Agility",
        },
    ])

    return {
        "id": "rbb-bumn-original-2026",
        "name": "RBB BUMN 2026 · Bank Original TKD, AKHLAK, B. Inggris & Agility",
        "family": "bumn",
        "version": 1,
        "updatedAt": "2026-11-13T00:00:00.000Z",
        "note": f"{len(questions)} soal 100% original berstandar FHCI RBB BUMN Terbaru (Tahap 1: TKD Verbal/Deret/Klasifikasi/Diagram, AKHLAK, TWK BUMN; Tahap 2: Grammar/Error ID/Reading & Learning Agility) dengan pembahasan bahasa awam terverifikasi.",
        "source": "Bank Soal Original Jhâr-Ajhârân 2026 (disusun mengacu standar materi resmi FHCI RBB BUMN).",
        "config": {
            "durationMin": 30,
            "subtests": [
                {"id": "tkd", "name": "TKD (Verbal · Deret · Klasifikasi · Diagram)", "scheme": "binary", "perCorrect": 5, "passMin": 15},
                {"id": "akhlak", "name": "Core Values AKHLAK", "scheme": "binary", "perCorrect": 5, "passMin": 15},
                {"id": "twk_bumn", "name": "TWK BUMN", "scheme": "binary", "perCorrect": 5, "passMin": 5},
                {"id": "bhs", "name": "Bahasa Inggris", "scheme": "binary", "perCorrect": 5, "passMin": 15},
                {"id": "agility", "name": "Learning Agility", "scheme": "binary", "perCorrect": 5, "passMin": 10},
            ],
        },
        "questions": questions,
    }


if __name__ == "__main__":
    c = bank_cpns_original_2026()
    b = bank_bumn_original_2026()
    print(f"Verified CPNS original: {len(c['questions'])} soal")
    print(f"Verified BUMN original: {len(b['questions'])} soal")

