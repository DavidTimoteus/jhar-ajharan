#!/usr/bin/env python3
"""
Ingestor Bank Soal Eksternal (GitHub & Google Drive) untuk Jhâr-Ajhârân.
Mengunduh/memproses soal dari:
1. GitHub RokiFauziErenJaegar/jalurasn (SKD CPNS 2026 Paket 1-10: 1.100 soal)
2. GitHub FirmanRcode/RBB-BUMN-2026-CBT (RBB BUMN 2026 Tahap 1 & Tahap 2: 290 soal)
3. GitHub mendiang/bumn-practice-app (BUMN Bahasa Inggris Grammar, Reading & Error ID: 76 soal)
4. Google Drive Materi SKD CPNS (folder 17_2EWyscMd9lukFe8NbIICBFgxDynhai: TO 1-8 + TIU HOTS)

Menghasilkan scripts/external_packs.json yang dipakai assemble_packs.py.
"""
import html
import json
import re
import subprocess
import urllib.request
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = Path(__file__).resolve().parent
CACHE_DIR = SCRIPTS_DIR / "_cache_raw"
CACHE_DIR.mkdir(exist_ok=True)

LETTERS = ["A", "B", "C", "D", "E"]


def fetch_bytes(url: str, cache_name: str) -> bytes:
    p = CACHE_DIR / cache_name
    if p.exists() and p.stat().st_size > 100:
        return p.read_bytes()
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    data = urllib.request.urlopen(req, timeout=35).read()
    p.write_bytes(data)
    return data


def fetch_text(url: str, cache_name: str) -> str:
    return fetch_bytes(url, cache_name).decode("utf-8", "ignore")


def sanitize_hint(text: str) -> str:
    """Pastikan teks hint tidak pernah membocorkan huruf kunci jawaban A-E."""
    if not text:
        return ""
    t = re.sub(r"\s+", " ", text).strip()
    t = re.sub(
        r"(?i)\b(kunci|jawaban|opsi|pilihan)\s*(yang\s+)?(benar|tepat|terbaik)?\s*(adalah|yaitu|:|=)?\s*\(?[A-E]\)?\b\.?",
        "konsep inti",
        t,
    )
    t = re.sub(r"(?i)\b(jawabannya|kuncinya)\s*[:=]?\s*[A-E]\b\.?", "", t)
    t = re.sub(r"(?i)\(([A-E])\)\s*(benar|tepat|salah)", "bagian terkait", t)
    t = re.sub(r"\s+", " ", t).strip(" .,;:-")
    return t


def pick_topic_tips(subtest: str, topic: str, stem: str) -> dict[str, str]:
    """Hasilkan strategi spesifik topik berdasarkan pola soal CPNS/BUMN & Jurus Cepat."""
    ctx = f"{topic} {stem[:220]}".lower()
    st = subtest.lower()

    # TIU & TKD formulas
    if st in ("tiu", "tkd"):
        if any(w in ctx for w in ("deret", "baris", "angka", "sequence", "pola bilangan")):
            return {
                "kilat": "Cek selisih berdekatan dulu; jika melonjak acak, langsung uji pola selang-seling (lompat 1 atau 2 suku) atau kuadrat/prima.",
                "eliminasi": "Buang opsi dengan paritas (ganjil/genap) atau tren naik-turun yang menyalahi 2 suku terakhir.",
                "logika": "Tulis selisih tingkat-1 di atas deret. Jika belum konstan, tarik selisih tingkat-2 atau rasio perkalian/pembagian.",
                "jebakan": "Sering kali dua suku berurutan bukan satu deret, melainkan gabungan 2 deret berselang-seling.",
            }
        if any(w in ctx for w in ("semua", "sebagian", "beberapa", "jika", "maka", "silogisme", "kesimpulan", "simpulan")):
            return {
                "kilat": "Hafal jurus silogisme: 'Semua' + 'Sebagian' selalu menghasilkan 'Sebagian'; jangan menyimpulkan hal di luar premis.",
                "eliminasi": "Coret opsi yang memakai kata 'Semua' jika salah satu premisnya hanya 'Sebagian/Beberapa'.",
                "logika": "Modelkan 'Jika P → Q' setara dengan kontraposisinya '~Q → ~P' (bukan ~P → ~Q maupun Q → P).",
                "jebakan": "Waspadai pembalikan sebab-akibat ('Semua A adalah B' TIDAK berarti 'Semua B adalah A').",
            }
        if any(w in ctx for w in ("analogi", "padanan", "berhubungan dengan", ":")):
            return {
                "kilat": "Buat kalimat penghubung spesifik dari kiri ke kanan (mis. 'X bekerja di Y' atau 'X bagian dari Y'), lalu terapkan pola persis yang sama.",
                "eliminasi": "Singkirkan pasangan kata yang arah hubungannya terbalik (kanan-ke-kiri) atau kelas katanya tidak sejajar.",
                "logika": "Uji kesetaraan relasi: fungsi, sebab-akibat, bahan baku, sinonim/antonim, atau bagian-keseluruhan.",
                "jebakan": "Jangan terkecoh oleh kata yang berasal dari bidang tema sama tetapi relasi fungsionalnya berbeda.",
            }
        if any(w in ctx for w in ("kecepatan", "jarak", "waktu", "pukul", "susul", "berpapasan", "pekerja", "hari", "selesai")):
            return {
                "kilat": "Pekerja bertambah → waktu pasti berkurang (kalikan Orang × Hari = Orang baru × Hari baru; jika koma, bulatkan orang ke atas). Susul-menyusul: Jarak duluan ÷ (Kecepatan penyusul − yang disusul).",
                "eliminasi": "Cek akal sehat: tambahan pekerja wajib membuat hari LEBIH SINGKAT; waktu berpapasan wajib berada di antara jam berangkat & jam tiba.",
                "logika": "Samakan seluruh satuan terlebih dulu (menit ke jam, km ke meter) dan kurangkan hari yang sudah selesai sebelum menghitung sisa proyek.",
                "jebakan": "Pada proyek yang sempat libur/terhenti, kurangi dulu hari yang sudah dikerjakan; pada susul-menyusul, hitung dari jam berangkat orang KEDUA.",
            }
        if any(w in ctx for w in ("%", "persen", "diskon", "untung", "rugi", "harga", "tabungan", "bunga", "perbandingan", "rasio")):
            return {
                "kilat": "Untung/Rugi selalu dihitung dari Harga Beli (Modal), bukan Harga Jual. Diskon bertingkat d1% + d2% ≠ jumlah langsung, hitung bertahap.",
                "eliminasi": "Gunakan pembulatan kasar (estimasi puluhan terdekat) untuk membuang opsi yang terlalu jauh secara magnitudo.",
                "logika": "Ubah persen umum ke pecahan istimewa: 12,5% = 1/8, 25% = 1/4, 33,3% = 1/3, 37,5% = 3/8, 66,7% = 2/3 agar hitung kilat.",
                "jebakan": "Diskon 50% + 20% bukan 70%, melainkan 100% → 50% → sisa 40% (total potongan 60%).",
            }
        if any(w in ctx for w in ("duduk", "meja", "urutan", "lebih tinggi", "lebih cepat", "di sebelah", "jadwal", "analitik")):
            return {
                "kilat": "Visualisasikan dengan simbol pertidaksamaan '>' / '<' atau sketsa slot kursi bernomor 1..N agar semua syarat terbaca sekaligus.",
                "eliminasi": "Gunakan syarat paling ketat (posisi ujung / berhadapan / bersebelahan) untuk langsung menggugurkan 2–3 opsi.",
                "logika": "Kunci dahulu pasangan yang wajib berdekatan (blok), baru selipkan syarat relatif sisanya.",
                "jebakan": "Kata 'di antara A dan B' tidak selalu berarti bersebelahan persis kecuali ditulis 'tepat di sebelah'.",
            }
        if any(w in ctx for w in ("figural", "diagram", "rotasi", "matriks", "klasifikasi", "kelompok kata")):
            return {
                "kilat": "Amati satu elemen saja (misal sudut rotasi 45°/90° atau jumlah sisi) dari kiri ke kanan sebelum melihat detail lain.",
                "eliminasi": "Coret opsi yang arah pencerminan atau perubahan warnanya melanggar pola dua langkah pertama.",
                "logika": "Bandingkan perubahan per baris/kolom: pergeseran arah jarum jam, penambahan elemen, atau kategori kata tak sejenis.",
                "jebakan": "Pola rotasi + pencerminan sering digabung sekaligus—uji masing-masing elemen secara terpisah.",
            }

    # TWK & TWK BUMN
    if st in ("twk", "twk_bumn"):
        if any(w in ctx for w in ("uud", "pasal", "amandemen", "mpr", "dpr", "presiden", "mahkamah", "konstitusi")):
            return {
                "kilat": "Cocokkan kata kunci kewenangan lembaga negara pasca-Amandemen UUD 1945 (MPR tak lagi lembaga tertinggi; DPD mengurus otonomi daerah).",
                "eliminasi": "Buang opsi yang mengaitkan fungsi Yudikatif (MA/MK/KY) dengan lembaga Eksekutif/Legislatif.",
                "logika": "Petakan Bab UUD 1945: Kekuasaan Presiden (Bab III), DPR (Bab VII), Pemda (Bab VI), HAM (Bab XA), Kekuasaan Kehakiman (Bab IX).",
                "jebakan": "Jangan tertukar wewenang MK (uji UU terhadap UUD, sengketa pemilu) dengan MA (uji peraturan di bawah UU, kasasi).",
            }
        if any(w in ctx for w in ("pancasila", "sila", "butir", "bpupki", "ppki", "piagam", "ideologi")):
            return {
                "kilat": "Petakan kasus ke nilai inti Sila: 1 (toleransi/iman), 2 (empati/kemanusiaan adil), 3 (persatuan/cinta produk RI), 4 (musyawarah), 5 (adil sosial).",
                "eliminasi": "Sisihkan sikap yang hanya menolong secara individual (Sila 2) jika konteksnya keadilan hak publik/gotong royong (Sila 5).",
                "logika": "Bedakan pengamalan Sila 2 (martabat manusia universal) vs Sila 3 (nasionalisme/NKRI) vs Sila 5 (keadilan ekonomi & hak bersama).",
                "jebakan": "Jebakan klasik: membedakan tanggal pidato Yamin (29 Mei), Soepomo (31 Mei), Sukarno (1 Juni), Piagam Jakarta (22 Juni), & pengesahan PPKI (18 Ags).",
            }
        if any(w in ctx for w in ("bela negara", "nasionalisme", "radikalisme", "nkri", "sejarah", "integritas", "korupsi", "antikorupsi")):
            return {
                "kilat": "Cari perilaku nyata sesuai nilai Integritas (jujur, mandiri, tanggung jawab) atau unsur Bela Negara (cinta tanah air, sadar berbangsa).",
                "eliminasi": "Singkirkan opsi yang pasif, permisif terhadap pelanggaran etika, atau bersifat primordial/sektarian.",
                "logika": "Nilai TWK modern menguji penerapan sikap (situational awareness), bukan sekadar hafalan tanggal.",
                "jebakan": "Opsi yang terdengar patriotik tetapi mengabaikan persatuan/aturan hukum tetap keliru.",
            }
        if any(w in ctx for w in ("kalimat", "ejaan", "eyd", "puebi", "paragraf", "ide pokok", "baku", "imbuhan")):
            return {
                "kilat": "Ide pokok selalu merangkum kalimat utama (umumnya di awal/deduktif atau akhir/induktif), bukan kalimat penjelas berisi contoh.",
                "eliminasi": "Kalimat efektif wajib punya S + P jelas, tidak boros kata ('agar supaya', 'para hadirin sekalian'), dan ejaan baku KBBI.",
                "logika": "Uji keterkaitan: opsi ide pokok harus bisa menaungi seluruh kalimat lain di dalam paragraf.",
                "jebakan": "Opsi yang terlalu sempit (hanya mengutip fakta satu kalimat penjelas) atau terlalu luas melenceng dari teks bukan ide pokok.",
            }

    # TKP
    if st == "tkp":
        return {
            "kilat": "Rumus emas TKP ('Bongkar TKP'): fokus pada judul/submateri soal (Pelayanan, Jejaring, TIK, Anti-Radikalisme, Sosial Budaya, Profesionalisme) → pilih sikap paling proaktif + taat SOP.",
            "eliminasi": "Buang segera respons pasif, menunda pekerjaan, melempar tanggung jawab, atau bertindak emosional.",
            "logika": "Urutan skor 5: berdampak langsung bagi pemecahan masalah + menjaga etika tim/organisasi + tetap taat aturan.",
            "jebakan": "Hati-hati pada opsi yang terdengar heroik/membantu teman tetapi melanggar prosedur rahasia jabatan atau aturan layanan.",
        }

    # AKHLAK BUMN
    if st == "akhlak":
        return {
            "kilat": "Cocokkan kata kunci perilaku dengan 6 pilar AKHLAK: Amanah (integritas/janji), Kompeten (belajar/kualitas), Harmonis (peduli/beda), Loyal (dedikasi), Adaptif (inovasi/ubah), Kolaboratif (sinergi).",
            "eliminasi": "Eliminasi tindakan menyalahkan rekan, menolak perubahan sistem, atau mendahulukan kepentingan pribadi di atas target BUMN.",
            "logika": "Opsi terbaik menunjukkan akuntabilitas pribadi sekaligus keterbukaan bekerja sama lintas fungsi.",
            "jebakan": "Pilihan yang tampak tegas menegur secara keras di depan umum melanggar nilai Harmonis.",
        }

    # Bahasa Inggris BUMN
    if st == "bhs":
        if any(w in ctx for w in ("bacaan", "reading", "passage", "paragraph", "author", "infer")):
            return {
                "kilat": "Baca pertanyaan dulu baru scan teks dengan kata kunci (proper noun/angka/sinonim); untuk Main Idea, baca kalimat pertama tiap paragraf.",
                "eliminasi": "Buang opsi ekstrem ('always', 'never', 'only') atau detail yang persis tertulis tetapi menjawab bagian paragraf yang salah.",
                "logika": "Jawaban reading yang benar umumnya merupakan parafrase dari kalimat kunci di teks, bukan copy-paste mentah.",
                "jebakan": "Waspadai pengecoh dengan kata identik dari teks tetapi hubungan sebab-akibatnya dibalik.",
            }
        if any(w in ctx for w in ("<u>", "[u]", "error", "salah")):
            return {
                "kilat": "Cek 4 tersangka utama Error ID: Subject–Verb Agreement (tunggal/jamak), Tense marker, Pronoun (its vs it's), dan Parallel Structure.",
                "eliminasi": "Bagian frasa yang sudah tepat tata bahasanya segera abaikan, fokus pada kata kerja utama dan kata sambung.",
                "logika": "Tentukan dulu Subjek inti (abaikan frasa preposisi di tengah) untuk mengecek kecocokan Verb-nya.",
                "jebakan": "It's (= it is) vs Its (kepemilikan), serta preposisi + V-ing sering muncul di BUMN Error ID.",
            }
        return {
            "kilat": "Identifikasi posisi kosong dalam kalimat (Subject, Verb, Adjective, Adverb, atau Conjunction) sebelum menerjemahkan seluruh arti.",
            "eliminasi": "Buang pilihan yang kelas katanya atau tense-nya bertentangan dengan penanda waktu (since, yesterday, by the time, had + V3).",
            "logika": "Perhatikan pola baku: Conditional (If + past, would + V1), Passive (be + V3), dan Parallelism (A, B, and C sekelas kata).",
            "jebakan": "Subjek berimbuhan 'Each / Every / Neither / The number of' selalu mengambil Verb tunggal.",
        }

    # Learning Agility BUMN
    if st == "agility":
        return {
            "kilat": "Learning Agility mencari profil paling tangkas belajar dari pengalaman baru, terbuka pada kritik, berani mencoba cara lebih baik secara terukur.",
            "eliminasi": "Singkirkan jawaban yang bertahan di zona nyaman, defensif saat dikritik, atau menyalahkan teknologi/sistem baru.",
            "logika": "Poin tertinggi menyeimbangkan aksi cepat (bias for action) dengan refleksi & kolaborasi.",
            "jebakan": "Terlalu nekat tanpa berkonsultasi/menimbang risiko bukan agility positif; begitu pula menunggu perintah lengkap baru bergerak.",
        }

    return {
        "kilat": f"Fokus pada kata kunci inti di soal {topic} sebelum membandingkan kelima opsi.",
        "eliminasi": "Sisihkan opsi yang bertentangan langsung dengan premis atau konteks utama soal.",
        "logika": "Pecah soal menjadi syarat inti dan hubungkan dengan konsep dasar subtes.",
        "jebakan": "Baca ulang kalimat pertanyaan terakhir (termasuk kata 'kecuali' atau satuan) sebelum mengunci pilihan.",
    }


def make_hints(subtest: str, topic: str, explain: str, trick: str = "", stem: str = "") -> list[dict]:
    clean_trick = sanitize_hint(trick)
    clean_exp = sanitize_hint(explain)
    first_sentence = ""
    if clean_exp:
        parts = [s.strip() for s in re.split(r"(?<=[.!?])\s+", clean_exp) if len(s.strip()) > 18]
        if parts:
            first_sentence = parts[0][:190]

    tips = pick_topic_tips(subtest, topic, stem)
    # Jika soal punya trick asli (mis. dari RBB BUMN) atau pembahasan spesifik non-generik, utamakan di Jalur Kilat
    kilat = clean_trick or tips["kilat"]
    if first_sentence and not clean_trick and subtest.lower() not in ("tkp", "akhlak", "agility"):
        # Gabungkan petunjuk konsep inti bila tidak membocorkan opsi langsung
        if len(first_sentence) <= 150:
            kilat = f"{tips['kilat']} Petunjuk inti: {first_sentence}."

    return [
        {"lens": "kilat", "text": kilat[:260]},
        {"lens": "eliminasi", "text": tips["eliminasi"][:240]},
        {"lens": "logika", "text": tips["logika"][:240]},
        {"lens": "jebakan", "text": tips["jebakan"][:240]},
    ]


# =====================================================================
# 1. CPNS 2026 — RokiFauziErenJaegar/jalurasn (Paket 1 - 10)
# =====================================================================
def build_jalurasn_packs() -> list[dict]:
    packs = []
    subtest_cfg = [
        {"id": "twk", "name": "Tes Wawasan Kebangsaan", "scheme": "binary", "perCorrect": 5, "passMin": 65},
        {"id": "tiu", "name": "Tes Intelegensi Umum", "scheme": "binary", "perCorrect": 5, "passMin": 80},
        {"id": "tkp", "name": "Tes Karakteristik Pribadi", "scheme": "weighted", "passMin": 166},
    ]
    source_label = "SKD CPNS 2026"

    for pnum in range(1, 11):
        url = f"https://raw.githubusercontent.com/RokiFauziErenJaegar/jalurasn/main/src/data/soal/paket-{pnum:02d}.json"
        raw = json.loads(fetch_text(url, f"jalurasn_p{pnum:02d}.json"))
        questions = []
        for item in raw:
            st = item["kat"].lower()
            opts_dict = item["o"]
            options = [opts_dict[l] for l in LETTERS]
            topic = item.get("sub", st.upper()).lower()
            stem = item["q"].strip()
            explain = re.sub(r"\s+", " ", item.get("p", "")).strip()
            target_sec = 45 if st == "twk" else (60 if st == "tiu" else 45)
            qq = {
                "id": f"cpns26-p{pnum}-{item['id'].lower()}",
                "subtest": st,
                "topic": topic,
                "stem": stem,
                "options": options,
                "hints": make_hints(st, topic, explain, "", stem),
                "explain": explain or "Lihat kesesuaian konsep pada opsi jawaban terbaik.",
                "targetSec": target_sec,
                "source": f"{source_label} · Paket {pnum}",
            }
            if st == "tkp":
                s_dict = item["s"]
                qq["weights"] = [int(s_dict[l]) for l in LETTERS]
            else:
                qq["key"] = LETTERS.index(item["k"].upper())
            questions.append(qq)

        packs.append({
            "id": f"cpns-skd-2026-p{pnum}",
            "name": f"SKD CPNS 2026 · Paket {pnum} (TWK · TIU · TKP)",
            "family": "cpns",
            "version": 2,
            "updatedAt": "2026-11-13T00:00:00.000Z",
            "note": f"Simulasi penuh 110 soal SKD CPNS 2026 (30 TWK, 35 TIU, 45 TKP bobot 1–5) sesuai KepmenPANRB No. 321 Tahun 2024.",
            "source": "Kurasi Try Out SKD CPNS 2026 dengan pembobotan TKP 1–5 dan pembahasan lengkap.",
            "config": {"durationMin": 100, "subtests": subtest_cfg},
            "questions": questions,
        })
    return packs


# =====================================================================
# 2. BUMN RBB 2026 — FirmanRcode/RBB-BUMN-2026-CBT (Tahap 1 & Tahap 2)
# =====================================================================
def eval_js_array(js_code: str, var_name: str) -> list[dict]:
    script = js_code + f"\nconsole.log(JSON.stringify({var_name}));"
    proc = subprocess.run(
        ["node", "-"],
        input=script,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if proc.returncode != 0:
        raise RuntimeError(f"Node eval failed for {var_name}: {proc.stderr[:300]}")
    return json.loads(proc.stdout)


def build_bumn_2026_packs() -> list[dict]:
    base = "https://raw.githubusercontent.com/FirmanRcode/RBB-BUMN-2026-CBT/main/data"
    source_label = "RBB BUMN 2026"

    sub_meta = {
        1: ("tkd", "verbal logical reasoning", 45),
        2: ("tkd", "number sequence", 55),
        3: ("tkd", "word classification", 25),
        4: ("tkd", "diagram reasoning", 45),
        5: ("akhlak", "core values akhlak (sjt)", 45),
        6: ("twk_bumn", "wawasan kebangsaan bumn", 40),
        7: ("bhs", "bahasa inggris rbb", 50),
        8: ("agility", "learning agility", 40),
    }

    parsed = {}
    for i in range(1, 9):
        js = fetch_text(f"{base}/subtest{i}.js", f"bumn26_subtest{i}.js")
        parsed[i] = eval_js_array(js, f"subtest{i}")

    def convert_items(indices: list[int], prefix: str) -> list[dict]:
        out = []
        for s_idx in indices:
            st, topic, tsec = sub_meta[s_idx]
            for item in parsed[s_idx]:
                opts_dict = item["options"]
                options = [str(opts_dict[l]).strip() for l in LETTERS]
                ans = item["answer"].strip().upper()
                stem = str(item["question"]).strip()
                explain = re.sub(r"\s+", " ", str(item.get("explanation", ""))).strip()
                trick = str(item.get("trick", "")).strip()
                out.append({
                    "id": f"{prefix}-s{s_idx}-{int(item['id']):03d}",
                    "subtest": st,
                    "topic": topic,
                    "stem": stem,
                    "options": options,
                    "key": LETTERS.index(ans),
                    "hints": make_hints(st, topic, explain, trick, stem),
                    "explain": explain or "Lihat penjelasan konsep utama di atas.",
                    "targetSec": tsec,
                    "source": f"{source_label} · Subtes {s_idx}",
                })
        return out

    tahap1_q = convert_items([1, 2, 3, 4, 5, 6], "bumn26-t1")
    tahap1 = {
        "id": "rbb-bumn-2026-tahap1",
        "name": "RBB BUMN 2026 · Tahap 1 (TKD · AKHLAK · TWK BUMN)",
        "family": "bumn",
        "version": 2,
        "updatedAt": "2026-11-13T00:00:00.000Z",
        "note": "Simulasi lengkap Tes Online Tahap 1 Rekrutmen Bersama BUMN: 100 TKD (Verbal, Deret, Klasifikasi, Diagram), 30 AKHLAK SJT, dan 10 TWK BUMN.",
        "source": "Kisi-kisi terbaru Rekrutmen Bersama BUMN Tahap 1 lengkap dengan pembahasan dan trik cepat.",
        "config": {
            "durationMin": 90,
            "subtests": [
                {"id": "tkd", "name": "TKD (Verbal · Deret · Klasifikasi · Diagram)", "scheme": "binary", "perCorrect": 5, "passMin": 300},
                {"id": "akhlak", "name": "Core Values AKHLAK", "scheme": "binary", "perCorrect": 5, "passMin": 95},
                {"id": "twk_bumn", "name": "Tes Wawasan Kebangsaan BUMN", "scheme": "binary", "perCorrect": 5, "passMin": 30},
            ],
        },
        "questions": tahap1_q,
    }

    tahap2_q = convert_items([7, 8], "bumn26-t2")
    tahap2 = {
        "id": "rbb-bumn-2026-tahap2",
        "name": "RBB BUMN 2026 · Tahap 2 (Bahasa Inggris · Learning Agility)",
        "family": "bumn",
        "version": 2,
        "updatedAt": "2026-11-13T00:00:00.000Z",
        "note": "Simulasi Tes Online Tahap 2 Rekrutmen Bersama BUMN: 100 soal Bahasa Inggris kerja & 50 soal Learning Agility.",
        "source": "Kisi-kisi terbaru Rekrutmen Bersama BUMN Tahap 2 lengkap dengan subtes Learning Agility.",
        "config": {
            "durationMin": 120,
            "subtests": [
                {"id": "bhs", "name": "Bahasa Inggris (Structure & Reading)", "scheme": "binary", "perCorrect": 5, "passMin": 300},
                {"id": "agility", "name": "Learning Agility", "scheme": "binary", "perCorrect": 5, "passMin": 160},
            ],
        },
        "questions": tahap2_q,
    }

    return [tahap1, tahap2]


# =====================================================================
# 3. BUMN English Intensive — Grammar, Reading & Error Identification
# =====================================================================
def clean_html_underline(text: str) -> str:
    return re.sub(r"</?u>", lambda m: "[" if m.group(0).lower() == "<u>" else "]", text, flags=re.I)


def clean_plain_html(raw: str) -> str:
    """Bersihkan tag HTML asli (<p>, <br>, <div>, dll.) tanpa merusak tanda '<' matematika."""
    if not raw:
        return ""
    s = raw

    def table_to_lines(m: re.Match) -> str:
        tbl = m.group(0)
        rows = re.findall(r"<tr[^>]*>(.*?)</tr>", tbl, re.S | re.I)
        out_rows = []
        for r in rows:
            cells = re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", r, re.S | re.I)
            cleaned = [re.sub(r"\s+", " ", html.unescape(re.sub(r"</?[a-zA-Z!][a-zA-Z0-9]*(?:\s+[^>]*)?/?>", "", c))).strip() for c in cells]
            if any(cleaned):
                out_rows.append(" | ".join(cleaned))
        return "\n" + "\n".join(out_rows) + "\n" if out_rows else ""

    sup_map = str.maketrans("0123456789+-n", "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ")
    sub_map = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")

    s = re.sub(r"<table[^>]*>.*?</table>", table_to_lines, s, flags=re.S | re.I)
    s = re.sub(r"<sup>(.*?)</sup>", lambda m: m.group(1).strip().translate(sup_map), s, flags=re.S | re.I)
    s = re.sub(r"<sub>(.*?)</sub>", lambda m: m.group(1).strip().translate(sub_map), s, flags=re.S | re.I)
    s = clean_html_underline(s)
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</(?:p|div|li|tr|h[1-6])>", "\n", s, flags=re.I)
    s = re.sub(
        r"</?(?:p|div|span|b|strong|i|em|ul|ol|li|table|thead|tbody|tr|th|td|h[1-6]|blockquote|pre|code|hr|a|img|small|center|font)(?:\s+[^>]*)?\s*/?>",
        "",
        s,
        flags=re.I,
    )
    s = html.unescape(s)
    s = s.replace("\uf0e0", "→").replace("\uf077", "•")
    s = re.sub(r"[\uf000-\uf8ff]", "", s)
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in s.splitlines()]
    return "\n".join(ln for ln in lines if ln).strip()


def build_bumn_english_pack() -> dict:
    url = "https://raw.githubusercontent.com/mendiang/bumn-practice-app/main/js/modules/data.js"
    js = fetch_text(url, "mendiang_data.js")
    script = js + "\nconsole.log(JSON.stringify({grammar: grammarQuestions, reading: readingQuestions, errid: bumnErrorIdQuestions}));"
    proc = subprocess.run(["node", "-"], input=script, capture_output=True, text=True, encoding="utf-8")
    if proc.returncode != 0:
        raise RuntimeError(f"mendiang eval failed: {proc.stderr[:300]}")
    data = json.loads(proc.stdout)

    questions = []

    for item in data["grammar"]:
        opts = [clean_plain_html(str(o)) for o in item["options"]]
        key = opts.index(clean_plain_html(str(item["answer"])))
        stem = clean_plain_html(str(item["question"]))
        explain = re.sub(r"\s+", " ", clean_plain_html(str(item.get("explanation", "")))).strip()
        questions.append({
            "id": f"bumn-eng-{item['id']}",
            "subtest": "bhs",
            "topic": "grammar & structure",
            "stem": stem,
            "options": opts,
            "key": key,
            "hints": make_hints("bhs", "grammar & structure", explain, "", stem),
            "explain": explain,
            "targetSec": 45,
            "source": "BUMN English · Grammar",
        })

    for item in data["errid"]:
        opts = [clean_plain_html(str(o)) for o in item["options"]]
        key = opts.index(clean_plain_html(str(item["answer"])))
        stem = "Identify the bracketed part [A/B/C/D] that must be corrected:\n" + clean_plain_html(str(item["question"]))
        explain = re.sub(r"\s+", " ", clean_plain_html(str(item.get("explanation", "")))).strip()
        questions.append({
            "id": f"bumn-eng-{item['id']}",
            "subtest": "bhs",
            "topic": "error identification",
            "stem": stem,
            "options": opts,
            "key": key,
            "hints": make_hints("bhs", "error identification", explain, "", stem),
            "explain": explain,
            "targetSec": 45,
            "source": "BUMN English · Error ID",
        })

    for item in data["reading"]:
        opts = [clean_plain_html(str(o)) for o in item["options"]]
        key = opts.index(clean_plain_html(str(item["answer"])))
        passage = clean_plain_html(str(item.get("passage", "")))
        q_text = clean_plain_html(str(item["question"]))
        stem = f"Bacaan:\n{passage}\n\nPertanyaan: {q_text}" if passage else q_text
        explain = re.sub(r"\s+", " ", clean_plain_html(str(item.get("explanation", "")))).strip()
        questions.append({
            "id": f"bumn-eng-{item['id']}",
            "subtest": "bhs",
            "topic": "reading comprehension",
            "stem": stem,
            "options": opts,
            "key": key,
            "hints": make_hints("bhs", "reading comprehension", explain, "", stem),
            "explain": explain,
            "targetSec": 65,
            "source": "BUMN English · Reading",
        })

    return {
        "id": "rbb-bumn-english-drill",
        "name": "BUMN Bahasa Inggris Intensive (Grammar · Error ID · Reading)",
        "family": "bumn",
        "version": 2,
        "updatedAt": "2026-11-13T00:00:00.000Z",
        "note": f"{len(questions)} soal latihan intensif Bahasa Inggris BUMN: Structure/Grammar, Error Identification, dan Reading Comprehension lengkap dengan pembahasan bahasa Indonesia.",
        "source": "Latihan intensif Bahasa Inggris BUMN format TOEFL-style 4 opsi (A–D).",
        "config": {
            "durationMin": 60,
            "subtests": [
                {"id": "bhs", "name": "Bahasa Inggris (Grammar, Error ID & Reading)", "scheme": "binary", "perCorrect": 5, "passMin": 230},
            ],
        },
        "questions": questions,
    }


# =====================================================================
# 4. Google Drive Materi SKD CPNS — TO 1..8 & TIU HOTS Analogi/Analitik
# =====================================================================
GDRIVE_TO_FILES = {
    1: ("1EevMwG9hRB8smjTYAtGSBhUzjNFw5YML", "1EmAlvXQAMuB6yguLNUPZpzxBVhjtXr49", "1EkcyU2Aus188vvHSq_21fvMnO8VauJu0"),
    2: ("1EUxBc4x7VjD3WTOp5widT4pcNVyjOztc", "1EbGz1mCrfpI84s_PK8mZRP8xQ7s5zs6Z", "1EX5mVhBw2JZvLS3YGMTPiZ4kr-5hLtAl"),
    3: ("1EJNyz5NbQqiYE-GCJX7ZkCnuz6EnXXU2", "1EUbfXntKHdGxzIiI1jfBXmJn5MVCG58X", "1ESfKiPCRFb-xEKTaBU6NaUdIu4f-8LvV"),
    4: ("1E-RzEjAGwB68JtIW_RbnaOK7A9lQ5lYL", "1E8UZWOTVkMc51nrmKDzh1h70VcSYRmMk", "1E73qW_0gbad4wgZcpEoh9FFWKLA4svaa"),
    5: ("1DkVu3JdHTty-mvz0V3Ua_Ut4Hz9NMOl2", "1DuRy6zpIvBmZd_TjyUyiwYUZQSLBdmIc", "1DlWdrB3Fg8HTd9KZugOPJ4t19ZRv7zEu"),
    6: ("1DaXuKs2Nj1CIBxt1Rwuc3tuIqwh5voHO", "1Dc4a4GaFXmXBm5hvtYcrhsdD8Z_u_zLo", "1DipL1UMRPrAPplhuzCq1SQ_MkCZjJdao"),
    7: ("1DXtmLPXogthEiOkXhxulYHYhs5xkbqLA", "1DaF9btw0JHB9MpxPQYligPuR_roc_Ro1", "1D_5dZ1ZKaM3mSz0-lxvkHxC1UlSbnbIN"),
    8: ("1DLyNPeErSyQ8oBtpcGi3JdF0h7EGBvzk", "1DWy3c_HYfQ5cLVH-2phgrnhTvvt5YO2V", "1DSol_YfA-z0aVQFGKuYup9Y_O2hsHA4g"),
}


def extract_pdf_text(pdf_bytes: bytes) -> str:
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for page in doc:
        txt = page.get_text("text")
        lines = []
        for line in txt.splitlines():
            s = line.strip()
            if re.match(r"^Pembahasan TO \d+ (TWK|TIU|TKP)", s, re.I):
                continue
            if s == "2023" or re.match(r"^Halaman \d+\s*\|\s*\d+$", s):
                continue
            if s in ("Tes Wawasan Kebangsaan", "Tes Intelegensia Umum", "Tes Karakteristik Pribadi"):
                continue
            lines.append(line)
        pages.append("\n".join(lines))
    return "\n".join(pages)


def heuristic_tkp_weights(options: list[str], best_idx: int) -> list[int]:
    """Beri bobot 5 pada kunci resmi PDF, dan 4..1 secara deterministik untuk opsi lain."""
    neg_words = ("tidak", "membiarkan", "diam", "menolak", "acuh", "marah", "menghindar", "menunda", "keluar", "mengabaikan")
    pos_words = ("segera", "solusi", "diskusi", "koordinasi", "komunikasi", "membantu", "melaporkan", "bersama", "profesional", "evaluasi")

    def score_opt(txt: str) -> tuple[int, int]:
        low = txt.lower()
        s = sum(2 for w in pos_words if w in low) - sum(3 for w in neg_words if w in low)
        return (s, len(txt))

    others = [i for i in range(5) if i != best_idx]
    others_sorted = sorted(others, key=lambda idx: score_opt(options[idx]), reverse=True)
    weights = [0] * 5
    weights[best_idx] = 5
    for rank_val, idx in zip((4, 3, 2, 1), others_sorted):
        weights[idx] = rank_val
    return weights


def parse_gdrive_pdf(pdf_bytes: bytes, subtest: str, prefix: str, src_name: str) -> list[dict]:
    text = extract_pdf_text(pdf_bytes)
    chunks = re.split(r"(?m)^(\d{1,2})\.\s+", text)
    out = []
    seen_num = set()
    for i in range(1, len(chunks), 2):
        num = int(chunks[i])
        if num in seen_num:
            continue
        body = chunks[i + 1]
        ans_m = re.search(r"(?im)^Jawaban\s*[:\-]?\s*([A-E])\b", body)
        if not ans_m:
            continue
        ans_letter = ans_m.group(1).upper()
        before_ans = body[: ans_m.start()].strip()
        after_ans = body[ans_m.end() :].strip()
        pem_m = re.search(r"(?im)^Pembahasan\s*[:\-]?\s*(.*)", after_ans, re.S)
        explain = pem_m.group(1).strip() if pem_m else after_ans
        explain = re.sub(r"\s+", " ", clean_plain_html(explain)).strip()

        opt_splits = re.split(r"(?m)^([A-E])\.\s*", before_ans)
        if len(opt_splits) < 11:
            continue
        stem = re.sub(r"\s+", " ", clean_plain_html(opt_splits[0])).strip()
        opts = {}
        for j in range(1, len(opt_splits), 2):
            opts[opt_splits[j].upper()] = re.sub(r"\s+", " ", clean_plain_html(opt_splits[j + 1])).strip()
        if not all(k in opts for k in LETTERS):
            continue
        opt_list = [opts[k] for k in LETTERS]
        if len(stem) < 12 or any(len(o) < 1 for o in opt_list):
            continue

        seen_num.add(num)
        best_idx = LETTERS.index(ans_letter)
        topic_map = {"twk": "wawasan kebangsaan", "tiu": "intelegensi umum", "tkp": "karakteristik pribadi"}
        topic = topic_map[subtest]
        qq = {
            "id": f"{prefix}-{subtest}-{num:02d}",
            "subtest": subtest,
            "topic": topic,
            "stem": stem,
            "options": opt_list,
            "hints": make_hints(subtest, topic, explain, "", stem),
            "explain": explain or f"Jawaban terbaik adalah {ans_letter}.",
            "targetSec": 45 if subtest != "tiu" else 60,
            "source": src_name,
        }
        if subtest == "tkp":
            qq["weights"] = heuristic_tkp_weights(opt_list, best_idx)
        else:
            qq["key"] = best_idx
        out.append(qq)
    return out


def build_gdrive_to_packs() -> list[dict]:
    subtest_cfg = [
        {"id": "twk", "name": "Tes Wawasan Kebangsaan", "scheme": "binary", "perCorrect": 5, "passMin": 65},
        {"id": "tiu", "name": "Tes Intelegensi Umum", "scheme": "binary", "perCorrect": 5, "passMin": 80},
        {"id": "tkp", "name": "Tes Karakteristik Pribadi", "scheme": "weighted", "passMin": 166},
    ]
    packs = []
    for to_num, fids in GDRIVE_TO_FILES.items():
        qs = []
        for st, fid in zip(("twk", "tiu", "tkp"), fids):
            pdf_bytes = fetch_bytes(
                f"https://drive.google.com/uc?export=download&id={fid}",
                f"to{to_num}_{st}.pdf",
            )
            qs.extend(
                parse_gdrive_pdf(
                    pdf_bytes,
                    st,
                    f"gd-to{to_num}",
                    f"Try Out SKD #{to_num} ({st.upper()})",
                )
            )
        packs.append({
            "id": f"cpns-gdrive-to{to_num}",
            "name": f"Try Out SKD CPNS · Paket TO {to_num}",
            "family": "cpns",
            "version": 2,
            "updatedAt": "2026-11-13T00:00:00.000Z",
            "note": f"Simulasi Try Out SKD lengkap ({len(qs)} soal TWK/TIU/TKP) beserta kunci & pembahasan terstruktur.",
            "source": f"Koleksi Try Out SKD CPNS · Paket TO {to_num} TWK/TIU/TKP.",
            "config": {"durationMin": 95, "subtests": subtest_cfg},
            "questions": qs,
        })
    return packs


def build_tiu_hots_pack() -> dict:
    """Ekstrak TIU HOTS Analogi, Silogisme & Analitik dari tiu_hots_tg.pdf (Google Drive)."""
    pdf_bytes = fetch_bytes(
        "https://drive.google.com/uc?export=download&id=1En1ZZH4MlpGFevouw-pjHhm1Ptm4mK1v",
        "tiu_hots_tg.pdf",
    )
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    q_text = "\n".join(doc[i].get_text("text") for i in range(13))
    a_text = "\n".join(doc[i].get_text("text") for i in range(13, len(doc)))

    # Parse answers map from pages 14-21
    answers: dict[int, tuple[str, str]] = {}
    ans_chunks = re.split(r"(?m)^\s*(\d{1,2})\.\s+", a_text)
    for i in range(1, len(ans_chunks), 2):
        num = int(ans_chunks[i])
        body = ans_chunks[i + 1]
        m = re.search(r"Jawaban\s*:\s*([A-E])\b", body, re.I)
        if not m:
            continue
        ans_letter = m.group(1).upper()
        exp_raw = body[: m.start()].replace("#", " ").strip()
        exp = re.sub(r"\s+", " ", clean_plain_html(exp_raw)).strip()
        if num not in answers:
            answers[num] = (ans_letter, exp)

    # Extract passage contexts Teks A, Teks B, Teks C for analytical questions
    passages: dict[str, str] = {}
    for label in ("A", "B", "C"):
        pm = re.search(rf"Teks {label}\s+(.*?)(?=\n\d{{2}}\.\s)", q_text, re.S)
        if pm:
            passages[label] = re.sub(r"\s+", " ", clean_plain_html(pm.group(1))).strip()

    # Clean section headers from q_text
    q_clean = re.sub(r"(?m)^\s*\d{1,2}\s*$", "", q_text)
    q_chunks = re.split(r"(?m)^\s*(\d{1,2})\.\s+", q_clean)

    questions = []
    seen = set()
    for i in range(1, len(q_chunks), 2):
        num = int(q_chunks[i])
        if num in seen or num not in answers:
            continue
        body = q_chunks[i + 1]
        # Cut off trailing section instruction for next group
        body = re.split(r"(?m)^(?:Untuk mengerjakan soal|Gunakan teks [A-C] untuk|TES INTELEGENSI)", body)[0]
        # Extract options tagged (A)..(E) (often 2-column layout in PDF!)
        opt_matches = list(re.finditer(r"\(([A-E])\)\s*", body))
        if len(opt_matches) < 5:
            continue
        first_opt_pos = min(m.start() for m in opt_matches)
        stem = re.sub(r"\s+", " ", clean_plain_html(body[:first_opt_pos])).strip()
        opts: dict[str, str] = {}
        sorted_matches = sorted(opt_matches, key=lambda m: m.start())
        for idx_m, m in enumerate(sorted_matches):
            letter = m.group(1).upper()
            end_pos = sorted_matches[idx_m + 1].start() if idx_m + 1 < len(sorted_matches) else len(body)
            val = re.sub(r"\s+", " ", clean_plain_html(body[m.end() : end_pos])).strip()
            if letter not in opts and val:
                opts[letter] = val
        if not all(k in opts for k in LETTERS):
            continue
        opt_list = [opts[k] for k in LETTERS]
        if len(stem) < 8:
            continue

        # Attach Teks A/B/C for #46-55
        if 46 <= num <= 48 and "A" in passages:
            stem = f"Teks: {passages['A']}\n\n{stem}"
        elif 49 <= num <= 52 and "B" in passages:
            stem = f"Teks: {passages['B']}\n\n{stem}"
        elif 53 <= num <= 55 and "C" in passages:
            stem = f"Teks: {passages['C']}\n\n{stem}"

        topic = "analogi verbal" if num <= 10 else ("penalaran logis" if num <= 45 else "penalaran analitik")
        ans_letter, explain = answers[num]
        seen.add(num)
        questions.append({
            "id": f"tiu-hots-{num:02d}",
            "subtest": "tiu",
            "topic": topic,
            "stem": stem,
            "options": opt_list,
            "key": LETTERS.index(ans_letter),
            "hints": make_hints("tiu", topic, explain, "", stem),
            "explain": explain or f"Jawaban tepat adalah {ans_letter}.",
            "targetSec": 55 if num <= 45 else 75,
            "source": "Drill HOTS TIU · Penalaran & Analogi",
        })

    return {
        "id": "cpns-tiu-hots-drill",
        "name": "Fokus HOTS TIU · Analogi, Silogisme & Analitik",
        "family": "cpns",
        "version": 1,
        "updatedAt": "2026-11-13T00:00:00.000Z",
        "note": f"Latihan intensif {len(questions)} soal HOTS TIU pilihan (Analogi Verbal, Silogisme Logis, dan Penalaran Analitik) disertai pembahasan langkah demi langkah.",
        "source": "Kurasi latihan HOTS TIU (Analogi, Silogisme & Penalaran Analitik).",
        "config": {
            "durationMin": 45,
            "subtests": [
                {"id": "tiu", "name": "Tes Intelegensi Umum (HOTS)", "scheme": "binary", "perCorrect": 5, "passMin": 150},
            ],
        },
        "questions": questions,
    }


# =====================================================================
# 5. yudhapratama14/CPNS — Bank Soal Kisi Resmi + Pustaka Baku/Mudah + Glosarium
# =====================================================================
def clean_yudha_html(raw: str) -> str:
    return clean_plain_html(raw)


def build_yudha_skd_pack() -> dict:
    url = "https://raw.githubusercontent.com/yudhapratama14/CPNS/main/index.html"
    raw_html = fetch_text(url, "yudhapratama_cpns.html")
    scripts = re.findall(r"<script[^>]*>(.*?)</script>", raw_html, re.S | re.I)
    s0, s3 = scripts[0], scripts[3]

    lib_start = s0.find("const LIB = {")
    lib_end = s0.find("\n    };", lib_start) + 7
    q_start = s0.find("const Q = (q, o, a, e)")
    q_end = s0.find("// ---------- Analogi + contoh soal")
    shim = (
        "const MATERI = {}; const EXTRA = {}; "
        "const LESSONS = { find: () => ({ m: [], subs: [] }), push: () => {} };\n"
        + s0[lib_start:lib_end]
        + "\n"
    )
    proc_qz = subprocess.run(
        ["node", "-"],
        input=shim + s0[q_start:q_end] + "\nconsole.log(JSON.stringify({LIB, QZ}));",
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if proc_qz.returncode != 0:
        raise RuntimeError(f"yudha QZ eval failed: {proc_qz.stderr[:300]}")
    extracted = json.loads(proc_qz.stdout)
    lib_data = extracted["LIB"]
    qz_data = extracted["QZ"]

    glo_start = s3.find("const GLO = [")
    glo_end = s3.find("\n  ];", glo_start) + 5
    proc_glo = subprocess.run(
        ["node", "-"],
        input=s3[glo_start:glo_end] + "\nconsole.log(JSON.stringify(GLO));",
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    glo_data = json.loads(proc_glo.stdout) if proc_glo.returncode == 0 else []

    # Export Cara Baku vs Cara Mudah + Glosarium ke src/lib/knowledge.json
    knowledge = {
        "bakuMudah": {
            st: [
                {
                    "title": clean_yudha_html(item[0]),
                    "standard": clean_yudha_html(item[1]),
                    "shortcut": clean_yudha_html(item[2]),
                    "example": clean_yudha_html(item[3]),
                }
                for item in rows
                if len(item) >= 4
            ]
            for st, rows in lib_data.items()
        },
        "glossary": [
            {
                "term": clean_yudha_html(item[0]),
                "def": clean_yudha_html(item[1]),
                "subtest": str(item[2]).upper(),
            }
            for item in glo_data
            if len(item) >= 3
        ],
    }
    knowledge_path = ROOT / "src" / "lib" / "knowledge.json"
    knowledge_path.write_text(json.dumps(knowledge, ensure_ascii=False, indent=2), encoding="utf-8")

    # Pemetaan subkey QZ ke (subtest, topicLabel, libKey)
    sub_map = {
        "nas": ("twk", "nasionalisme", "twk"),
        "int": ("twk", "integritas", "twk"),
        "bela": ("twk", "bela negara", "twk"),
        "pancasila": ("twk", "pilar pancasila", "twk"),
        "uud": ("twk", "pilar uud 1945", "twk"),
        "nkri": ("twk", "nkri & otonomi", "twk"),
        "bti": ("twk", "bhinneka tunggal ika", "twk"),
        "bhs": ("twk", "bahasa indonesia", "twk"),
        "analogi": ("tiu", "verbal analogi", "tiu"),
        "silo": ("tiu", "verbal silogisme", "tiu"),
        "analitis": ("tiu", "verbal analitis", "tiu"),
        "argumen": ("tiu", "penguatan & pelemahan argumen", "tiu"),
        "hitung": ("tiu", "numerik berhitung", "tiu"),
        "deret": ("tiu", "deret angka", "tiu"),
        "poltab": ("tiu", "pola bilangan dalam tabel", "tiu"),
        "banding": ("tiu", "perbandingan kuantitatif", "tiu"),
        "cerita": ("tiu", "soal cerita numerik", "tiu"),
        "ctabel": ("tiu", "soal cerita tabel", "tiu"),
        "kecdata": ("tiu", "kecukupan data (p & q)", "tiu"),
        "pel": ("tkp", "pelayanan publik", "tkp"),
        "jej": ("tkp", "jejaring kerja", "tkp"),
        "sos": ("tkp", "sosial budaya", "tkp"),
        "tik": ("tkp", "tik & sistem baru", "tkp"),
        "prof": ("tkp", "profesionalisme", "tkp"),
        "anti": ("tkp", "anti radikalisme", "tkp"),
    }

    # Siapkan pencocokan cepat Cara Mudah dari LIB berdasarkan kata kunci
    lib_shortcuts = {
        st: [
            (item[0].lower(), clean_yudha_html(item[2]), clean_yudha_html(item[1]))
            for item in rows
            if len(item) >= 3
        ]
        for st, rows in lib_data.items()
    }

    questions = []
    for qkey, items in qz_data.items():
        if qkey not in sub_map or not isinstance(items, list):
            continue
        st, topic_lbl, lib_cat = sub_map[qkey]
        for idx, item in enumerate(items, 1):
            if not isinstance(item, dict) or "<svg" in str(item.get("q", "")).lower():
                continue
            stem = clean_yudha_html(str(item["q"]))
            opts = [clean_yudha_html(str(o)) for o in item["o"]]
            if len(opts) != 5 or len(stem) < 10:
                continue
            ans_idx = int(item["a"])
            explain = clean_yudha_html(str(item.get("e", "")))

            # Cari Cara Mudah + Cara Baku yang paling relevan dari LIB
            matched_trick = ""
            matched_baku = ""
            for title_l, shortcut_txt, baku_txt in lib_shortcuts.get(lib_cat, []):
                if any(tok in title_l for tok in topic_lbl.split() if len(tok) > 3):
                    matched_trick = shortcut_txt
                    matched_baku = baku_txt
                    break

            hints = make_hints(st, topic_lbl, explain, matched_trick, stem)
            if matched_baku and len(hints) >= 3:
                hints[2]["text"] = sanitize_hint(f"Cara baku: {matched_baku}")[:240]

            qq = {
                "id": f"skd-kisi-{qkey}-{idx:02d}",
                "subtest": st,
                "topic": topic_lbl,
                "stem": stem,
                "options": opts,
                "hints": hints,
                "explain": explain or "Lihat pembahasan konsep inti di atas.",
                "targetSec": 50 if st == "tiu" else 42,
                "source": f"Kisi-Kisi SKD · {topic_lbl.title()}",
            }
            if st == "tkp":
                qq["weights"] = heuristic_tkp_weights(opts, ans_idx)
            else:
                qq["key"] = ans_idx
            questions.append(qq)

    return {
        "id": "cpns-skd-kisi-terbaru",
        "name": "SKD CPNS Kisi Terbaru · Argumen, Kecukupan Data & 21 Submateri",
        "family": "cpns",
        "version": 1,
        "updatedAt": "2026-11-13T00:00:00.000Z",
        "note": f"{len(questions)} soal terstruktur mengacu 21 subtes kisi-kisi resmi SKD terbaru: termasuk Kecukupan Data, Penguatan/Pelemahan Argumen, Pola Tabel, Cerita Tabel, Pilar Kebangsaan, dan 6 Aspek TKP dengan Cara Mudah & Cara Baku.",
        "source": "Kurasi kisi-kisi resmi SKD CPNS 21 submateri (GitHub yudhapratama14/CPNS) dilengkapi pustaka Cara Baku vs Cara Mudah.",
        "config": {
            "durationMin": 110,
            "subtests": [
                {"id": "twk", "name": "Tes Wawasan Kebangsaan", "scheme": "binary", "perCorrect": 5, "passMin": 65},
                {"id": "tiu", "name": "Tes Intelegensi Umum (Verbal · Numerik · HOTS)", "scheme": "binary", "perCorrect": 5, "passMin": 80},
                {"id": "tkp", "name": "Tes Karakteristik Pribadi (6 Aspek)", "scheme": "weighted", "passMin": 166},
            ],
        },
        "questions": questions,
    }


def main():
    all_packs = []
    print("1. Fetching & parsing GitHub jalurasn (CPNS 2026 Paket 1-10)...")
    all_packs.extend(build_jalurasn_packs())
    print("2. Fetching & parsing GitHub RBB-BUMN-2026-CBT (Tahap 1 & 2)...")
    all_packs.extend(build_bumn_2026_packs())
    print("3. Fetching & parsing BUMN English (Grammar, Error ID & Reading)...")
    all_packs.append(build_bumn_english_pack())
    print("4. Parsing Google Drive TO 1 - TO 8...")
    all_packs.extend(build_gdrive_to_packs())
    print("5. Parsing Google Drive TIU HOTS...")
    all_packs.append(build_tiu_hots_pack())
    print("6. Parsing yudhapratama14/CPNS (21 Submateri, Pustaka Baku/Mudah & Glosarium)...")
    all_packs.append(build_yudha_skd_pack())

    out_path = SCRIPTS_DIR / "external_packs.json"
    out_path.write_text(json.dumps(all_packs, ensure_ascii=False, indent=2), encoding="utf-8")
    total_q = 0
    for p in all_packs:
        total_q += len(p["questions"])
        print(f"  -> {p['id']} ({p['family']}): {len(p['questions'])} soal")
    print(f"Saved {len(all_packs)} external packs ({total_q} soal) to {out_path}")


if __name__ == "__main__":
    main()
