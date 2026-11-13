#!/usr/bin/env python3
"""
Assembler Paket Soal Jhâr-Ajhârân
Menggabungkan bank TWK/TIU/TKP + BUMN (TKD/AKHLAK/BHS), menulis JSON pack,
membangun index.json, lalu memverifikasi struktur.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACKS_DIR = ROOT / "public" / "packs"

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bank_twk import bank_twk
from bank_tiu import bank_tiu
from bank_tkp import bank_tkp
from bank_bumn import bank_bumn_tkd, bank_bumn_akhlak, bank_bumn_bhs
from bank_sumber import bank_cpns_kitalulus, bank_tkd_skillacademy, bank_bhs_dealls
from bank_original_2026 import bank_cpns_original_2026, bank_bumn_original_2026
from build_submateri_index import build_submateri_index
from text_polish import polish_question_text


def pack(id_str, name, family, version, note, source, duration_min, subtests, questions):
    return {
        "id": id_str,
        "name": name,
        "family": family,
        "version": version,
        "updatedAt": "2026-11-07T00:00:00.000Z",
        "note": note,
        "source": source,
        "config": {"durationMin": duration_min, "subtests": subtests},
        "questions": questions,
    }


def build():
    twk = bank_twk()
    tiu = bank_tiu()
    tkp = bank_tkp()
    tkd = bank_bumn_tkd()
    akhlak = bank_bumn_akhlak()
    bhs = bank_bumn_bhs()

    cpns = pack(
        "cpns-skd-2024",
        "SKD CPNS 2024 (TWK · TIU · TKP)",
        "cpns",
        1,
        "Paket simulasi SKD CPNS sesuai kisi resmi BKN/KemenPAN-RB: 30 TWK, 35 TIU, 45 TKP.",
        "Soal disusun mengikuti pola kisi resmi Seleksi Kompetensi Dasar CPNS (TWK, TIU, TKP) dan ambang batas KepmenPANRB No. 321 Tahun 2024 (TWK 65, TIU 80, TKP 166).",
        100,
        [
            {"id": "twk", "name": "Tes Wawasan Kebangsaan", "scheme": "binary", "perCorrect": 5, "passMin": 65},
            {"id": "tiu", "name": "Tes Intelegensi Umum", "scheme": "binary", "perCorrect": 5, "passMin": 80},
            {"id": "tkp", "name": "Tes Karakteristik Pribadi", "scheme": "weighted", "passMin": 166},
        ],
        twk + tiu + tkp,
    )

    bumn = pack(
        "rbb-bumn-2024",
        "RBB BUMN 2024 (TKD · AKHLAK · Bahasa Inggris)",
        "bumn",
        1,
        "Paket simulasi Rekrutmen Bersama BUMN: TKD, Core Values AKHLAK, dan Bahasa Inggris.",
        "Soal disusun mengikuti materi tes Rekrutmen Bersama BUMN (TKD, AKHLAK, Bahasa Inggris) dan Core Values AKHLAK (Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif).",
        45,
        [
            {"id": "tkd", "name": "Tes Kemampuan Dasar", "scheme": "binary", "perCorrect": 5, "passMin": 40},
            {"id": "akhlak", "name": "Core Values AKHLAK", "scheme": "weighted", "passMin": 30},
            {"id": "bhs", "name": "Bahasa Inggris", "scheme": "binary", "perCorrect": 5, "passMin": 30},
        ],
        tkd + akhlak + bhs,
    )

    # Paket Kilat: campuran HOTS dari TWK, TIU, TKP untuk latihan cepat 30 menit.
    kilat_q = []
    for take, bank, prefix in (
        (10, twk, "twk"),
        (10, tiu, "tiu"),
        (10, tkp, "tkp"),
    ):
        for idx, q in enumerate(bank[:take], 1):
            qq = dict(q)
            qq["id"] = f"kilat-{prefix}-{idx:02d}"
            kilat_q.append(qq)
    kilat = pack(
        "taktis-kilat",
        "Paket Kilat Taktis (HOTS Campuran)",
        "cpns",
        1,
        "30 soal HOTS campuran untuk melatih kecepatan di bawah tekanan detik.",
        "Soal pilihan dari bank TWK, TIU, dan TKP dengan target waktu ketat untuk membangun refleks penyelesaian cepat.",
        30,
        [
            {"id": "twk", "name": "Tes Wawasan Kebangsaan", "scheme": "binary", "perCorrect": 5, "passMin": 65},
            {"id": "tiu", "name": "Tes Intelegensi Umum", "scheme": "binary", "perCorrect": 5, "passMin": 80},
            {"id": "tkp", "name": "Tes Karakteristik Pribadi", "scheme": "weighted", "passMin": 166},
        ],
        kilat_q,
    )

    packs = [cpns, bumn, kilat]

    # ---- Paket Fresh 2025: soal BERSUMBER eksternal (bukan karangan) ----
    cpns_2025 = pack(
        "contoh-soal-cpns",
        "Contoh Soal SKD CPNS (Sumber Bimbel)",
        "cpns",
        1,
        "12 soal contoh asli dari publikasi latihan soal bimbel/tryout (KitaLulus & tryout.id) dengan kunci jawaban resmi dari sumber. Untuk soal TKP, urutan prioritas sumber diterjemahkan menjadi bobot 1-5.",
        "Soal diambil dari: KitaLulus (kitalulus.com/blog/info-cpns/contoh-soal-skd-cpns-tiu-twk-tkp) dan tryout.id (tryout.id/berita/latihan-soal-cpns-terbaru-2025-...). Stem & kunci asli dipertahankan; opsi ke-5 ditambahkan sebagai pengecoh agar sesuai skema 5 opsi.",
        30,
        [
            {"id": "twk", "name": "Tes Wawasan Kebangsaan", "scheme": "binary", "perCorrect": 5, "passMin": 65},
            {"id": "tiu", "name": "Tes Intelegensi Umum", "scheme": "binary", "perCorrect": 5, "passMin": 80},
            {"id": "tkp", "name": "Tes Karakteristik Pribadi", "scheme": "weighted", "passMin": 166},
        ],
        bank_cpns_kitalulus(),
    )

    bumn_2025 = pack(
        "rbb-bumn-2025",
        "RBB BUMN 2025 (Soal Asli TKD & B. Inggris)",
        "bumn",
        1,
        "40 soal asli dari publikasi latihan bimbel: TKD BUMN (30 soal: verbal, penalaran) dari SkillAcademy dan Bahasa Inggris (10 soal structure) dari Dealls.",
        "Soal diambil dari: SkillAcademy/Ruangguru (blog.skillacademy.com/contoh-soal-tes-bumn-tkd-dan-pembahasannya) dan Dealls (dealls.com/pengembangan-karir/tes-bahasa-inggris-bumn). Stem & kunci asli dipertahankan.",
        45,
        [
            {"id": "tkd", "name": "Tes Kemampuan Dasar", "scheme": "binary", "perCorrect": 5, "passMin": 40},
            {"id": "bhs", "name": "Bahasa Inggris", "scheme": "binary", "perCorrect": 5, "passMin": 30},
        ],
        bank_tkd_skillacademy() + bank_bhs_dealls(),
    )

    packs += [cpns_2025, bumn_2025, bank_cpns_original_2026(), bank_bumn_original_2026()]

    ext_path = Path(__file__).resolve().parent / "external_packs.json"
    if ext_path.exists():
        ext_packs = json.loads(ext_path.read_text(encoding="utf-8"))
        packs.extend(ext_packs)

    for p in packs:
        for q in p.get("questions", []):
            is_diag = any(ch in (q.get("stem") or "") for ch in "┌┐└┘│─┬┴┼●○▲△■□")
            q["stem"] = polish_question_text(q.get("stem", ""), is_diagram=is_diag)
            if isinstance(q.get("options"), list):
                q["options"] = [
                    polish_question_text(opt, is_diagram=False) for opt in q["options"]
                ]
            if isinstance(q.get("hints"), list):
                for h in q["hints"]:
                    if isinstance(h, dict) and isinstance(h.get("text"), str):
                        h["text"] = polish_question_text(h["text"], is_explain=True)
            if isinstance(q.get("explain"), str):
                q["explain"] = polish_question_text(q["explain"], is_explain=True)

        out = PACKS_DIR / f"{p['id']}.json"
        out.write_text(json.dumps(p, ensure_ascii=False, indent=2), encoding="utf-8")

    index = [
        {
            "id": p["id"],
            "name": p["name"],
            "family": p["family"],
            "version": p["version"],
            "updatedAt": p["updatedAt"],
            "file": f"{p['id']}.json",
            "count": len(p["questions"]),
            "durationMin": p["config"]["durationMin"],
            "subtests": [s["id"] for s in p["config"]["subtests"]],
            "note": p.get("note", ""),
        }
        for p in packs
    ]
    (PACKS_DIR / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    for p in packs:
        sub = {}
        for q in p["questions"]:
            sub[q["subtest"]] = sub.get(q["subtest"], 0) + 1
        print(f"{p['id']}: {len(p['questions'])} soal | {sub}")

    build_submateri_index()


if __name__ == "__main__":
    build()
