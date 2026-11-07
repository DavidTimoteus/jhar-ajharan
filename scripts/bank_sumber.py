#!/usr/bin/env python3
"""
Bank Soal Bersumber Eksternal (bukan karangan).
Soal diambil dari publikasi latihan soal bimbel/tryout yang menampilkan
kunci jawaban & pembahasan, lalu dikonversi ke skema Jhâr-Ajhârân (5 opsi A-E,
key/weights, 4 lensa hint, explain, targetSec, source per soal).

Sumber:
- KitaLulus — "Contoh Soal SKD CPNS TIU, TWK, TKP" (kitalulus.com/blog/info-cpns)
- tryout.id — "Latihan Soal CPNS Terbaru 2025" (tryout.id/berita)
- SkillAcademy (Ruangguru) — "Contoh Soal Tes BUMN (TKD)" (blog.skillacademy.com)
- Dealls — "85+ Contoh Soal Tes Bahasa Inggris BUMN 2025" (dealls.com)

Catatan: stem & kunci asli dipertahankan; opsi tambahan (jika sumber hanya
4 opsi) adalah pengecoh tambahan agar sesuai skema 5 opsi aplikasi.
Untuk TKP sumber hanya memberi urutan prioritas (mis. BACDE), yang diterjemahkan
menjadi bobot 1-5 (posisi pertama = 5).
"""


def q(subtest, pid, topic, stem, options, key, weights, hints, explain, target_sec, source):
    qq = {
        "id": f"{subtest}-src-{pid:03d}",
        "subtest": subtest,
        "topic": topic,
        "stem": stem,
        "options": options,
        "hints": hints,
        "explain": explain,
        "targetSec": target_sec,
        "source": source,
    }
    if weights is not None:
        qq["weights"] = weights
    else:
        qq["key"] = key
    return qq


def h4(a, b, c=None, d=None):
    return [
        {"lens": "kilat", "text": a},
        {"lens": "eliminasi", "text": b},
        {"lens": "logika", "text": c or "Terapkan prinsip penyelesaian yang sistematis."},
        {"lens": "jebakan", "text": d or "Baca semua opsi sebelum memutuskan."},
    ]


def weights_from_rank(rank):
    """Urutan prioritas opsi (mis. 'BACDE') -> bobot 5,4,3,2,1 sesuai indeks."""
    order = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4}
    w = [0, 0, 0, 0, 0]
    for score, letter in enumerate(rank, 1):
        w[order[letter]] = 6 - score
    return w


# =====================================================================
# KITALULUS — CPNS (TIU 3, TKP 3, TWK 3) + TRYOUT.ID (TWK 1, TIU 1, TKP 1)
# =====================================================================
def bank_cpns_kitalulus():
    S = "KitaLulus — Contoh Soal SKD CPNS (kitalulus.com/blog/info-cpns/contoh-soal-skd-cpns-tiu-twk-tkp)"
    out = []
    # TIU
    out.append(q("tiu", 1, "aritmetika",
        "Sari dan Ratih memiliki suatu pekerjaan. Waktu yang dibutuhkan oleh Sari dalam menghasilkan uang adalah 21 menit, sedangkan Ratih membutuhkan waktu 42 menit. Jika Sari dan Ratih bekerja bersama-sama untuk menghasilkan uang, waktu yang dibutuhkan adalah ...",
        ["14 menit", "21 menit", "28 menit", "35 menit", "42 menit"], 0, None,
        h4("Rumus kerja bersama t = (a×b)/(a+b) = (21×42)/(21+42) = 882/63 = 14 menit.",
           "Hasil harus kurang dari waktu tercepat (21) → buang B, C, D, E.",
           "Laju gabungan = 1/21 + 1/42 = 3/42 = 1/14 → total 14 menit."),
        "Rumus kerja bersama: t = (a×b)/(a+b). Dengan a=21, b=42: (21×42)/(21+42) = 882/63 = 14 menit. Jawaban A.",
        45, S))
    out.append(q("tiu", 2, "logika",
        "Prestasi Intan lebih tinggi dari Dini dan lebih rendah dari Tina. Prestasi Cantik lebih rendah dari Intan, tetapi lebih tinggi dari Dini. Prestasi Dani lebih tinggi dari Dini dan Cantik. Tiga orang berprestasi terbaik adalah ...",
        ["Dani, Intan, Tina", "Dani, Dini, Tina", "Intan, Tina, Cantik", "Intan, Dani, Cantik", "Tina, Cantik, Dini"], 0, None,
        h4("Urutkan: Tina > Intan > Cantik/Dani > Dini. Tiga terbaik = Dani, Intan, Tina (urutan bisa saja Dani di atas Intan).",
           "Buang yang memuat Dini atau Cantik di tiga teratas - keduanya di bawah Intan.",
           "Gambar garis ranking dari setiap klausa, lalu gabungkan."),
        "Dari klausa: Tina > Intan > Dini; Intan > Cantik > Dini; Dani > Dini dan Dani > Cantik. Tiga terbaik adalah Dani, Intan, Tina. Jawaban A.",
        50, S))
    out.append(q("tiu", 3, "analogi",
        "Afrika Selatan : Pretoria = ... : ...",
        ["Kanada : Canberra", "Ekuador : Quito", "Kamerun : Astana", "Maroko : Cetinje", "Nigeria : Wellington"], 1, None,
        h4("Relasi negara : ibu kota. Pretoria = ibu kota Afrika Selatan; Quito = ibu kota Ekuador.",
           "Ibu kota Kanada = Ottawa, Kamerun = Yaounde, Maroko = Rabat, Nigeria = Abuja - buang semuanya.",
           "Hafalkan pasangan ibu kota negara: Ekuador-Quito adalah pasangan benar."),
        "Hubungan analogi: ibu kota suatu negara. Afrika Selatan beribu kota Pretoria; Ekuador beribu kota Quito. Jawaban B.",
        45, S))
    # TKP (urutan prioritas -> weights)
    out.append(q("tkp", 1, "jejaring",
        "Ketika pemilihan kepala desa sedang berlangsung di tempat tinggal Anda, nenek Anda yang mempunyai hak pilih dalam pemilihan kepala desa tetapi pada saat pencoblosan nenek dirawat di rumah sakit. Apa yang Anda lakukan...",
        ["Melaporkan keadaan nenek kepada panitia pemungutan suara",
         "Melaporkan keadaan nenek kepada panitia pemungutan suara untuk menentukan langkah yang harus ditempuh",
         "Melaporkan dan menginformasikan kondisi nenek kepada panitia pemungutan suara untuk diwakilkan Anda menggunakan hak pilihnya",
         "Melaporkan keadaan nenek kepada panitia pemungutan suara untuk meminta tolong orang lain menggunakan hak pilihnya",
         "Membiarkan hak suara nenek hangus"],
        None, weights_from_rank("BACDE"),
        h4("Hak pilih bersifat personal dan tidak bisa diwakilkan. Urutan terbaik: B (lapor + tentukan langkah), lalu A.",
           "Buang E (hangus) dan opsi yang meminta orang lain mewakili hak pilih.",
           "Jejaring kerja sama dengan panitia: laporkan kondisi dan cari langkah bersama."),
        "Hak pilih personal dan tidak bisa diwakilkan. E tidak solutif; opsi meminta diwakilkan salah; terbaik B (melapor + menentukan langkah), disusul A. Bobot: B=5, A=4, C=3, D=2, E=1.",
        45, S))
    out.append(q("tkp", 2, "profesional",
        "Edi baru saja diterima bekerja di salah satu pabrik pengolahan kayu. Sebagai pegawai baru, Edi belum terlalu mengenal jenis-jenis pekerjaan. Suatu malam, Edi ditugaskan manajernya menyelesaikan tugas rekan yang tiba-tiba berhenti bekerja. Menurut Anda, apa yang harus dilakukan Edi?",
        ["Meminta orang lain mengerjakan asalkan bisa selesai tepat waktu",
         "Segera berusaha memulai dan menyelesaikan sebisanya saja yang penting selesai",
         "Tidak perlu buru-buru menyelesaikannya karena pekerjaan tersebut bukan tugas pokoknya",
         "Segera berusaha memulai untuk menyelesaikan tugas itu dan berusaha menyelesaikannya sesempurna mungkin",
         "Mempertanyakan dan menegosiasi manajernya karena merasa takut hasilnya tidak maksimal"],
        None, weights_from_rank("DEBAC"),
        h4("Profesionalisme = melaksanakan tugas sebaik mungkin secara maksimal. Terbaik D, lalu E (negosiasi/komunikasi).",
           "Buang A (minta orang lain = tidak profesional), B (sebisanya = tidak maksimal), C (meremehkan tugas).",
           "Sikap ideal: kerjakan tupoksi sebaik mungkin + komunikasi dengan atasan bila ragu."),
        "D = mulai & selesaikan sesempurna mungkin (5), E = menegosiasi karena komunikasi (4), B = sebisanya (3), A = minta orang lain (2), C = menunda (1). Jawaban urutan DEBAC.",
        45, S))
    out.append(q("tkp", 3, "profesional",
        "Anda ditunjuk sebagai ketua kegiatan. Atasan memberikan tugas menyiapkan pentas seni ulang tahun perusahaan yang ke-21 karena tiap kantor cabang harus menampilkan pertunjukan. Tindakan yang Anda lakukan...",
        ["Bekerja keras membentuk panitia persiapan pentas seni ulang tahun perusahaan",
         "Menunjuk beberapa anggota untuk tampil pada pentas seni ulang tahun perusahaan",
         "Mengumpulkan seluruh anggota untuk membahas bersama-sama persiapan pentas seni ulang tahun perusahaan",
         "Melakukan voting untuk mengambil keputusan persiapan pentas seni ulang tahun perusahaan",
         "Menunjuk beberapa anggota untuk menampilkan pentas seni yang mengangkat kebudayaan bangsa"],
        None, weights_from_rank("CDAEB"),
        h4("Komunikasi & koordinasi = kata kunci pemimpin. Terbaik C (musyawarah bersama), lalu D (voting bila buntu).",
           "Buang B/E ('menunjuk' tanpa koordinasi) dan A (membentuk panitia saja belum menyelesaikan).",
           "Voting hanya dilakukan saat ada perbedaan pendapat yang tidak terpecahkan."),
        "C = musyawarah bersama anggota (5), D = voting (4), A = membentuk panitia (3), E = menunjuk anggota (2), B = menunjuk tampil (1). Jawaban urutan CDAEB.",
        45, S))
    # TWK
    out.append(q("twk", 1, "pancasila",
        "Dalam pidatonya di sidang BPUPKI (1 Juni 1945), Ir. Soekarno menyampaikan prinsip dasar negara yang terdiri dari ...",
        ["Kebangsaan Indonesia; Internasionalisme atau perikemanusiaan; Mufakat atau demokrasi; Perdamaian abadi",
         "Peri Kebangsaan, Peri Kemanusiaan, Peri Ketuhanan, Peri Kerakyatan, dan Mufakat",
         "Kebangsaan Indonesia; Internasionalisme atau perikemanusiaan; Mufakat atau demokrasi; Kesejahteraan sosial; Ketuhanan yang berkebudayaan",
         "Peri Kebangsaan, Peri Kemanusiaan, Peri Ketuhanan, Peri Kerakyatan, dan Kesejahteraan Rakyat",
         "Ketuhanan YME, Peri Kemanusiaan, Kebangsaan, Kerakyatan, Keadilan Sosial"],
        2, None,
        h4("Usulan Bung Karno: Nasionalisme, Internasionalisme, Mufakat, Kesejahteraan sosial, Ketuhanan yang berkebudayaan.",
           "Buang yang memuat 'Peri' (rumusan lain) atau tanpa 'Kesejahteraan sosial'.",
           "Lima asas usulan Soekarno diberi nama 'Pancasila'."),
        "Pada 1 Juni 1945 Soekarno mengusulkan lima asas: Nasionalisme/Kebangsaan, Internasionalisme/Perikemanusiaan, Mufakat/Demokrasi, Kesejahteraan sosial, Ketuhanan yang berkebudayaan. Jawaban C.",
        40, S))
    out.append(q("twk", 2, "uud",
        "Pembangunan ekonomi kerakyatan untuk kemakmuran rakyat sesuai dengan bunyi UUD NRI 1945 Pasal 33 ayat (1) yang berbunyi ...",
        ["Cabang-cabang produksi yang penting bagi negara dan yang menguasai hajat hidup orang banyak dikuasai oleh negara",
         "Perekonomian disusun sebagai usaha bersama berdasar atas asas kekeluargaan",
         "Perekonomian nasional diselenggarakan berdasarkan atas demokrasi ekonomi dengan prinsip kebersamaan, efisiensi, keadilan, keberlanjutan, wawasan lingkungan, kemandirian, serta menjaga keseimbangan kemajuan dan kesatuan ekonomi nasional",
         "Cabang-cabang produksi boleh dikuasai oleh perseorangan atau negara",
         "Bumi dan air dan kekayaan alam yang terkandung di dalamnya dikuasai oleh negara dan dipergunakan untuk sebesar-besarnya kemakmuran rakyat"],
        1, None,
        h4("Pasal 33 ayat (1): 'Perekonomian disusun sebagai usaha bersama berdasar atas asas kekeluargaan'.",
           "Buang ayat 2 (cabang produksi), ayat 3 (bumi/air), ayat 4 (demokrasi ekonomi) - itu ayat lain.",
           "Hafalkan urutan ayat Pasal 33: (1) asas kekeluargaan, (2) cabang produksi, (3) bumi-air, (4) demokrasi ekonomi."),
        "Pasal 33 ayat (1) UUD 1945: 'Perekonomian disusun sebagai usaha bersama berdasar atas asas kekeluargaan'. Jawaban B.",
        40, S))
    out.append(q("twk", 3, "sejarah",
        "Perundingan antara Indonesia dan Belanda pada 10 November 1946 di Linggarjati; Indonesia diwakili Perdana Menteri Sutan Syahrir, Belanda diwakili Prof. Schermerhorn. Perundingan ini adalah ...",
        ["Renville", "Linggarjati", "Roem Royen", "Giyanti", "Bongaya"], 1, None,
        h4("Tanggal 10 November 1946 + Sutan Syahrir + Schermerhorn = Perundingan Linggarjati.",
           "Renville (1948, di kapal USS Renville), Roem Royen (1949), Giyanti (1755), Bongaya (1667) - bukan.",
           "Hafalkan tokoh & tanggal: Linggarjati 1946 (Syahrir-Schermerhorn), Renville 1948, Roem-Royen 1949."),
        "Perundingan Linggarjati dilakukan 10 November 1946; delegasi Indonesia Sutan Syahrir, Belanda Schermerhorn. Jawaban B.",
        35, S))

    # TRYOUT.ID — 3 soal (4 opsi + 1 pengecoh tambahan)
    S2 = "tryout.id — Latihan Soal CPNS Terbaru 2025 (tryout.id/berita)"
    out.append(q("twk", 4, "pancasila",
        "Pancasila merupakan...",
        ["Ideologi negara", "Dasar negara", "Sumber dari segala sumber hukum", "Semua jawaban benar", "Hanya pedoman pembangunan"], 3, None,
        h4("Pancasila = ideologi + dasar negara + sumber dari segala sumber hukum → 'semua jawaban benar'.",
           "Buang opsi tunggal karena Pancasila mencakup ketiganya sekaligus.",
           "Kedudukan Pancasila: dasar negara, ideologi, sumber segala sumber hukum."),
        "Pancasila sebagai ideologi negara sekaligus dasar negara dan sumber dari segala sumber hukum. Jawaban D.",
        30, S2))
    out.append(q("tiu", 4, "aljabar",
        "Jika dua buah angka dijumlahkan menghasilkan 50, dan jika salah satu angkanya dikurangi 10 hasilnya adalah 20. Maka angka tersebut adalah...",
        ["30", "20", "25", "10", "15"], 0, None,
        h4("x + y = 50 dan x - 10 = 20 → x = 30.",
           "Substitusi x=30 ke x+y=50 → y=20; angka yang dicari 30.",
           "Buat dua persamaan, selesaikan untuk x."),
        "x + y = 50; x - 10 = 20 → x = 30. Substitusi: 30 + y = 50 → y = 20. Angka yang dicari adalah 30. Jawaban A.",
        40, S2))
    out.append(q("tkp", 4, "kolaboratif",
        "Ketika Anda diberi tugas penting oleh atasan, namun dalam waktu bersamaan terdapat kesalahan yang dilakukan rekan Anda, apa yang Anda lakukan?",
        ["Mengabaikan kesalahan dan fokus pada tugas", "Membantu rekan Anda memperbaiki kesalahan",
         "Melaporkan kesalahan kepada atasan", "Menyalahkan rekan Anda", "Menunda tugas agar membantu rekan dulu"],
        None, [4, 5, 2, 1, 3],
        h4("Sebagai anggota tim, perbaiki kesalahan bersama = nilai kerjasama & integritas (B=5).",
           "Menyalahkan (D=1) dan melapor langsung (C=2) kurang kolaboratif; mengabaikan (A=4) kalah dari membantu; menunda tugas (E=3) mengorbankan prioritas.",
           "Prioritas: selesaikan tugas + bantu rekan tanpa saling menyalahkan."),
        "Membantu rekan memperbaiki kesalahan mencerminkan nilai kerjasama dan integritas (B=5); mengabaikan (A=4); menunda tugas (E=3); melapor (C=2); menyalahkan (D=1).",
        40, S2))
    return out


# =====================================================================
# SKILLACADEMY — TKD BUMN (verbal 15, penalaran 15)
# =====================================================================
def bank_tkd_skillacademy():
    S = "SkillAcademy (Ruangguru) — Contoh Soal Tes BUMN (TKD) (blog.skillacademy.com/contoh-soal-tes-bumn-tkd-dan-pembahasannya)"
    out = []
    # --- VERBAL 15 ---
    verbal = [
        ("sinonim", "Boga = ....", ["Dekorasi tataruang", "Pakaian kebesaran", "Pakaian pengantin", "Tata rias", "Makanan kenikmatan"], 4,
         "Boga merujuk makanan/hidangan → sinonim 'makanan kenikmatan'.", "Buang yang bukan makanan: dekorasi, pakaian, tata rias."),
        ("sinonim", "Praduga = ....", ["Dugaan awal", "Bukti konkret", "Keputusan pasti", "Fakta yang jelas", "Pernyataan resmi"], 0,
         "Praduga = dugaan awal/perkiraan sebelum kepastian.", "Buang yang berarti pasti/nyata - kebalikan praduga."),
        ("antonim", "Dermawan >< ....", ["Pemurah", "Murah hati", "Kikir", "Suka memberi", "Sosial"], 2,
         "Dermawan = suka memberi → lawannya kikir.", "Buang sinonim: pemurah, murah hati, suka memberi."),
        ("antonim", "Hipokrit >< ....", ["Jujur", "Pembohong", "Sabar", "Kamuflase", "Terbuka"], 0,
         "Hipokrit = munafik/berpura-pura → lawannya jujur.", "Buang yang sinonim: pembohong, kamuflase."),
        ("antonim", "Morfem >< ....", ["Forum", "Lambang", "Morse", "Jantung", "Fonem"], 4,
         "Morfem = satuan bentuk bahasa terkecil bermakna; lawannya fonem = satuan bunyi terkecil.", "Buang yang bukan istilah linguistik: forum, morse, jantung, lambang."),
        ("analogi", "Otonomi : Mandiri = ....", ["Hardisk : VGA card", "Sabun : Mandi", "Cerdas : Banyak akal", "Bensin : Mesin", "Rakyat : Masyarakat"], 2,
         "Otonomi sama artinya dengan mandiri; cerdas sama artinya dengan banyak akal.", "Buang yang bukan relasi sinonim."),
        ("analogi", "Pemerintah : Perpu = ....", ["Buruh : Demokrasi", "Makan : Kenyang", "MPR : UU", "Hakim : Jaksa", "Menteri : Kepres"], 2,
         "Pemerintah mengesahkan Perpu; MPR mengesahkan UU.", "Buang yang bukan relasi lembaga-produk hukum."),
        ("analogi", "Jatuh : Sakit = Mengantuk : ....", ["Berjalan", "Tidur", "Kalori", "Teriakan", "Tersenyum"], 1,
         "Jatuh mengakibatkan sakit; mengantuk mengakibatkan tidur.", "Buang yang bukan akibat dari mengantuk."),
        ("analogi", "Rokok : Asbak = Air : ....", ["Pancur", "Selokan", "Ember", "Selang", "Keran"], 2,
         "Tempat menampung rokok = asbak; tempat menampung air = ember.", "Buang yang bukan wadah: pancur, selokan, selang, keran."),
        ("analogi", "1 Minggu : 7 Hari = 1 Hari : ....", ["3.600 menit", "60 detik", "68.400 detik", "1.440 menit", "365 hari"], 3,
         "1 minggu terdiri dari 7 hari; 1 hari terdiri dari 1.440 menit.", "Buang yang salah konversi: 60 detik, 3.600 menit."),
        ("ketidaksamaan", "Mana yang tidak masuk kelompoknya?", ["Perseteruan", "Pertengkaran", "Pertikaian", "Penyelarasan", "Persaingan"], 3,
         "Semua bermakna permusuhan kecuali 'penyelarasan' (positif).", "Kenali kata bernada negatif vs positif."),
        ("ketidaksamaan", "Mana yang tidak masuk kelompoknya?", ["Penyelidikan", "Pengusutan", "Penelitian", "Pemeriksaan", "Penuntutan"], 4,
         "Semua setara investigasi kecuali 'penuntutan'.", "Buang yang bukan sinonim investigasi."),
        ("ketidaksamaan", "Mana yang tidak masuk kelompoknya?", ["Srimpi", "Kecak", "Pendet", "Jaipong", "Angklung"], 4,
         "Semua tarian daerah kecuali angklung (alat musik).", "Kenali kategori: tari vs alat musik."),
        ("ketidaksamaan", "Mana yang tidak masuk kelompoknya?", ["Megawati", "Sudharmono", "Soekarno", "Soeharto", "Abdurrahman Wahid"], 1,
         "Semua mantan presiden RI kecuali Sudharmono.", "Sudharmono adalah wakil presiden, bukan presiden."),
        ("ketidaksamaan", "Pilihlah yang tidak termasuk kelompoknya!", ["Einstein", "W. Shakespeare", "Graham Bell", "T. Alfa Edison", "James Watt"], 1,
         "Semua ilmuwan/penemu kecuali Shakespeare (penulis).", "Kenali profesi: penemu vs sastrawan."),
    ]
    for pid, (topic, stem, options, key, kilat, elim) in enumerate(verbal, 1):
        out.append(q("tkd", pid, topic, stem, options, key, None,
                     h4(kilat, elim), f"Jawaban kunci dari sumber: {chr(65+key)}. {kilat}", 35, S))

    # --- PENALARAN 15 ---
    penalaran = [
        ("silogisme", "Semua dosen adalah pegawai negeri. Sebagian dosen adalah seniman. Yang tidak cocok dengan pernyataan tersebut adalah ....",
         ["Sebagian seniman adalah pegawai negeri", "Sebagian pegawai negeri adalah dosen", "Sebagian seniman adalah dosen", "Semua seniman adalah pegawai negeri", "Sebagian dosen bukan seniman"], 3,
         "Premis tidak menjamin semua seniman adalah pegawai negeri → pernyataan D tidak cocok.", "Buang yang konsisten dengan premis (A, B, C)."),
        ("silogisme", "Semua Y adalah P. Sebagian Y adalah R. Jadi ....",
         ["Semua Y yang bukan P adalah R", "Semua Y yang bukan R adalah P", "Semua R yang bukan Y adalah P", "Sebagian Y yang bukan R adalah P", "Semua Y adalah R"], 1,
         "Karena semua Y adalah P, maka Y yang bukan R tetap P → B.", "Buang yang bertentangan: A (Y pasti P), E (tidak semua Y=R)."),
        ("silogisme", "Semua kertas gambar sangat berguna. Sebagian kertas yang sangat berguna harganya murah, jadi ....",
         ["Semua kertas gambar harganya murah", "Semua kertas yang harganya murah adalah kertas gambar", "Sebagian kertas harganya murah", "Kertas yang murah sangat berguna", "Semua kertas yang murah adalah kertas gambar"], 2,
         "Dari premis, yang pasti: sebagian kertas (yang sangat berguna) harganya murah → C.", "Buang yang melampaui: A, B, E, D."),
        ("silogisme", "Sebagian P adalah B. B bukan T. Sebagian P bukan M adalah T. Semua B, M, dan T adalah P. Jadi ....",
         ["Semua T adalah T bukan M", "Semua P adalah B bukan T", "Semua P bukan B bukan M", "Sebagian P bukan T, bukan M, bukan B", "Semua B adalah M"], 3,
         "Gambarkan Venn: sebagian P berada di luar B, M, dan T → D.", "Buang yang absolut tanpa dukungan premis."),
        ("silogisme", "Semua musim berlangsung selama tiga bulan. Sebagian musim terasa dingin. Jadi, ....",
         ["Semua musim yang terasa dingin berlangsung selama tiga bulan", "Tidak semua musim berlangsung tiga bulan", "Semua musim terasa dingin dalam tiga bulan", "Sebagian musim tidak berlangsung selama tiga bulan", "Musim dingin bukan musim"], 0,
         "Musim yang dingin adalah bagian dari 'semua musim' yang berlangsung 3 bulan → A.", "Buang yang kontradiktif: B, D, E."),
        ("analisis", "Ikan kakap merah bergizi dan indah penampilannya. Ikan tuna rasanya enak tapi membosankan. Udang walau kecil-kecil, tetapi nilai gizinya lebih tinggi daripada kakap merah. Bandeng memiliki gizi lebih baik dari tuna, tetapi biasanya tidak segar. Hidangan yang menarik dan bergizi adalah ....",
         ["Ikan kakap merah dan udang", "Bandeng dan kakap merah", "Ikan tuna dan bandeng", "Udang dan bandeng", "Ikan tuna dan udang"], 0,
         "Buat tabel: gizi tinggi = udang & kakap; menarik = kakap & udang → keduanya memenuhi.", "Buang yang memuat bandeng (tidak segar) atau tuna (membosankan)."),
        ("analisis", "Dalam satu kelas ada sejumlah anak yang menyukai olahraga. Lisa suka bola voli dan tidak suka atletik. Dino suka basket dan voli. Pardi suka semua olahraga kecuali voli. Susi suka olahraga tanpa bola. Gino suka olahraga dengan bola. Mereka yang menyukai olahraga voli adalah ....",
         ["Dino, Gino, dan Lisa", "Pardi, Gino, dan Lisa", "Susi, Gino, dan Dino", "Dino, Susi, dan Lisa", "Pardi, Susi, dan Lisa"], 0,
         "Coret yang tidak suka bola: Pardi (anti-voli) dan Susi (tanpa bola) → tersisa Lisa, Dino, Gino.", "Buang opsi yang memuat Pardi/Susi."),
        ("silogisme", "Semua U bukan B. Sebagian U adalah C. Jadi, ....",
         ["Sebagian U adalah C bukan B", "Semua U bukan B dan C", "Sebagian U bukan C adalah B", "Semua U adalah C", "Semua C adalah U"], 0,
         "U yang C tetap bukan B (karena semua U bukan B) → A.", "Buang yang bertentangan: B, C, D, E."),
        ("silogisme", "Jika A = B maka A tidak sama dengan C. Bila P = A maka ....",
         ["Bila P = C maka P = B", "Bila P = C maka P tidak sama dengan A", "Bila P = C maka P tidak sama dengan B", "Bila P = C maka P = A = B", "Bila P = C maka P = A"], 2,
         "P = A dan A ≠ C; jika P = C, maka P ≠ B (karena A≠C berarti P≠C? tinjau: P=A, A≠C, dan A=B → P≠C; jika P=C bertentangan, yang valid: P tidak sama dengan B).", "Uji tiap opsi terhadap premis A=B dan A≠C."),
        ("silogisme", "Jika tidak benar dikatakan 'bahwa semua orang tentu berbahagia' maka ....",
         ["Semua orang akan tidak bahagia", "Tidak semua orang mengerti bahagia", "Sebagian orang akan berbahagia", "Tak semua orang tidak mengerti bahagia", "Tidak ada orang yang bahagia"], 2,
         "Negasi 'semua orang bahagia' = 'sebagian orang tidak bahagia' → sebagian orang akan berbahagia.", "Buang yang absolut: A, E."),
        ("analisis", "Pada iklan panas tumbuh pohon getah dan karet. Semak dan rumput hanya tumbuh di tempat dingin. Rumput dan karet membutuhkan banyak kelembapan. Semak dan pohon getah hanya tumbuh di daerah cukup kering. Di dekat Sungai Amazon sangat panas dan lembap. Tumbuh-tumbuhan yang tumbuh di dekat Sungai Amazon adalah ....",
         ["Pohon-pohon getah dan semak", "Pohon karet", "Rumput", "Jawaban A, B, dan C salah", "Pohon getah dan rumput"], 1,
         "Amazon panas + lembap: karet butuh panas + lembap → pohon karet.", "Buang yang butuh dingin/kering: semak, rumput, getah."),
        ("silogisme", "Semua ban terbuat dari karet. Semua karet bersifat elastis. Sebagian karet berwarna hitam, jadi ....",
         ["Semua ban elastis dan terbuat dari karet", "Semua ban berwarna hitam", "Semua ban elastis berwarna hitam", "Sebagian ban berwarna hitam terbuat dari karet", "Ban tidak elastis"], 0,
         "Semua ban = karet = elastis → A.", "Buang yang hanya sebagian/bertentangan."),
        ("silogisme", "Beberapa benda yang memuai adalah logam. Semua logam adalah benda padat, jadi ....",
         ["Hanya logam yang memuai merupakan benda padat", "Benda yang bukan logam tidak memuai", "Beberapa benda padat dapat memuai", "Benda padat dapat memuai", "Semua benda padat memuai"], 2,
         "Logam (yang memuai) adalah benda padat → sebagian benda padat memuai.", "Buang yang absolut: A, B, D, E."),
        ("silogisme", "Semua guru adalah pegawai negeri. Sebagian guru adalah penulis. Manakah yang tidak cocok dengan pernyataan ini?",
         ["Sebagian penulis adalah pegawai negeri", "Sebagian pegawai negeri adalah guru", "Sebagian penulis adalah guru", "Semua penulis adalah pegawai negeri", "Sebagian guru bukan penulis"], 3,
         "Premis tidak menjamin semua penulis adalah pegawai negeri → D tidak cocok.", "Buang yang konsisten: A, B, C, E."),
        ("silogisme", "Misalkan semua X adalah A. Sebagian X adalah B, jadi ....",
         ["Semua X yang bukan A adalah B", "Semua X yang bukan B adalah A", "Semua B yang bukan X adalah A", "Sebagian A yang bukan X adalah B", "Semua A adalah X"], 1,
         "Karena semua X adalah A, X yang bukan B tetap A → B.", "Buang yang bertentangan: A, C, D, E."),
    ]
    base = len(verbal)
    for pid, (topic, stem, options, key, kilat, elim) in enumerate(penalaran, base + 1):
        out.append(q("tkd", pid, topic, stem, options, key, None,
                     h4(kilat, elim), f"Jawaban kunci dari sumber: {chr(65+key)}. {kilat}", 45, S))
    return out


# =====================================================================
# DEALLS — Bahasa Inggris BUMN (structure 10)
# =====================================================================
def bank_bhs_dealls():
    S = "Dealls — 85+ Contoh Soal Tes Bahasa Inggris BUMN 2025 (dealls.com/pengembangan-karir/tes-bahasa-inggris-bumn)"
    out = []
    d = [
        ("structure", "He was so tired that he ______ asleep during the movie.",
         ["Falls", "Falling", "Fell", "Fall", "Fallen"], 2,
         "Kalimat lampau + 'so tired that' → past tense 'fell'.", "Buang non-past: falls, falling, fall, fallen."),
        ("structure", "The teacher asked the students ______ quietly during the exam.",
         ["To work", "Working", "Work", "Works", "Worked"], 0,
         "ask + objek + to-infinitif → 'to work'.", "Buang yang bukan infinitif."),
        ("structure", "They ______ in the library when I last saw them.",
         ["Were studying", "Studying", "Studied", "Are studying", "Lot"], 0,
         "'when I last saw' (past) → past continuous 'were studying'.", "Buang yang bukan past continuous."),
        ("structure", "______ of the students passed the final exam.",
         ["Many", "Some", "Few", "Much", "Lot"], 0,
         "Countable plural 'students' → 'many'.", "Buang 'much' (uncountable) dan 'lot' (kurang tepat)."),
        ("structure", "Could you please hand me ______ book on the table?",
         ["The", "An", "A", "That", "This"], 0,
         "Buku spesifik di meja → definite article 'the'.", "Buang indefinite 'a/an'."),
        ("structure", "She is not ______ to attend the meeting.",
         ["Can", "Able", "Can't", "Ability", "Capable"], 1,
         "'is not able to' = pola adjective 'able'.", "Buang 'can' (perlu to be+can salah), 'can't' (ganda negatif)."),
        ("structure", "The CEO expressed ______ satisfaction with the company's performance.",
         ["His", "He", "Her", "Their", "Them"], 0,
         "Possessive adjective sebelum noun → 'his'.", "Buang pronoun subjek/objek."),
        ("structure", "He ______ a letter when I called him.",
         ["Writes", "Writing", "Write", "Was writing", "Wrote"], 3,
         "'when I called' (past) → past continuous 'was writing'.", "Buang non-past dan bentuk salah."),
        ("structure", "She is the person ______ helped me yesterday.",
         ["Who", "Whom", "Which", "That", "Whose"], 0,
         "Subjek relatif untuk orang → 'who'.", "Buang 'whom' (objek), 'which' (benda)."),
        ("structure", "The manager asked me if I ______ to the meeting.",
         ["Come", "Comes", "Coming", "Came", "To come"], 3,
         "Past reported speech → past tense 'came'.", "Buang non-past dan infinitif."),
    ]
    for pid, (topic, stem, options, key, kilat, elim) in enumerate(d, 1):
        out.append(q("bhs", pid, topic, stem, options, key, None,
                     h4(kilat, elim), f"Jawaban kunci dari sumber: {chr(65+key)}. {kilat}", 40, S))
    return out
