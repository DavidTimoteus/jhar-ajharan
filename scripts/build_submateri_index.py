#!/usr/bin/env python3
"""
Membangun indeks submateri kisi-kisi (SmartCASN CPNS + RBB BUMN) lintas semua pack
ke public/packs/submateri-index.json untuk akses cepat O(1) tanpa memuat seluruh paket.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACKS_DIR = ROOT / "public" / "packs"


def classify_question(family: str, q: dict) -> str:
    sub = (q.get("subtest") or "").lower()
    topic = (q.get("topic") or "").lower()
    text = f"{topic} {q.get('stem', '')}".lower()

    if family == "cpns":
        if sub == "twk":
            if any(k in topic for k in ("integritas", "korupsi", "gratifikasi")):
                return "cpns-twk-integritas"
            if any(k in topic for k in ("bela negara", "hankam", "pertahanan")):
                return "cpns-twk-bela-negara"
            if any(k in topic for k in ("pilar", "pancasila", "uud", "nkri", "bhinneka")):
                return "cpns-twk-pilar-negara"
            if any(k in topic for k in ("bahasa", "eyd", "kalimat")):
                return "cpns-twk-bahasa"
            if any(k in topic for k in ("nasionalisme", "sejarah")):
                return "cpns-twk-nasionalisme"
            # Fallback keyword dari stem/pembahasan
            if re.search(r"korupsi|suap|gratifikasi|integritas|kpk|jujur|benturan kepentingan", text):
                return "cpns-twk-integritas"
            if re.search(r"bela negara|pertahanan|tni|ancaman|militer|pdri|komponen cadangan", text):
                return "cpns-twk-bela-negara"
            if re.search(r"kalimat efektif|kata baku|eyd|puebi|ejaan|imbuhan|paragraf|ide pokok|simpulan bacaan", text):
                return "cpns-twk-bahasa"
            if re.search(r"pancasila|uud 1945|pasal \d+|mpr|dpr|dpd|bpk|nkri|bhinneka|sila ke|amandemen", text):
                return "cpns-twk-pilar-negara"
            return "cpns-twk-nasionalisme"

        if sub == "tiu":
            if "figural analogi" in topic:
                return "cpns-tiu-figural-analogi"
            if "ketidaksamaan" in topic:
                return "cpns-tiu-figural-beda"
            if "figural" in topic:
                return "cpns-tiu-figural-seri"
            if "analogi" in topic or "sinonim" in topic or "antonim" in topic:
                return "cpns-tiu-analogi"
            if any(k in topic for k in ("silogisme", "logis", "argumen")):
                return "cpns-tiu-silogisme"
            if any(k in topic for k in ("analitis", "analitik", "analisis")):
                return "cpns-tiu-analitis"
            if any(k in topic for k in ("kuantitatif", "kecukupan data", "perbandingan")) and "berbalik" not in text and "senilai" not in text:
                return "cpns-tiu-kuantitatif"
            if any(k in topic for k in ("deret", "pola bilangan")):
                return "cpns-tiu-deret"
            if any(k in topic for k in ("cerita",)):
                return "cpns-tiu-cerita"
            if any(k in topic for k in ("berhitung", "aritmetika", "aljabar", "persen")):
                return "cpns-tiu-berhitung"
            # Fallback stem
            if re.search(r"ketidaksamaan gambar|gambar yang berbeda|berbeda dari keempat", text):
                return "cpns-tiu-figural-beda"
            if re.search(r"seri gambar|kelanjutan gambar|gambar berikutnya", text):
                return "cpns-tiu-figural-seri"
            if re.search(r"analogi gambar|pasangan gambar", text):
                return "cpns-tiu-figural-analogi"
            if re.search(r"\bsemua\b.*\bsebagian\b|\bsemua\b.*\bada\b|premis|silogisme|jika .+ maka", text):
                return "cpns-tiu-silogisme"
            if re.search(r"duduk|meja bundar|urutan|peringkat|jadwal|lebih tinggi|lebih tua", text):
                return "cpns-tiu-analitis"
            if re.search(r"hubungan p dan q|manakah hubungan antara p|kuantitas p|pernyataan \(1\)", text):
                return "cpns-tiu-kuantitatif"
            if re.search(r"\d+\s*,\s*\d+\s*,\s*\d+\s*,|angka selanjutnya|deret", text):
                return "cpns-tiu-deret"
            if re.search(r"pekerja|hari|kecepatan|jarak|menyusul|berpapasan|diskon|untung|rugi|umur|harga beli", text):
                return "cpns-tiu-cerita"
            if re.search(r"\s:\s|berhubungan dengan|padanan kata|sinonim|antonim", text):
                return "cpns-tiu-analogi"
            return "cpns-tiu-berhitung"

        # sub == "tkp"
        if "pelayanan" in topic:
            return "cpns-tkp-pelayanan"
        if any(k in topic for k in ("jejaring", "kolaboratif")):
            return "cpns-tkp-jejaring"
        if "sosial" in topic:
            return "cpns-tkp-sosbud"
        if re.search(r"\b(teknologi|tik)\b", topic):
            return "cpns-tkp-tik"
        if any(k in topic for k in ("anti radikalisme", "antiradikal")):
            return "cpns-tkp-antiradikalisme"
        if "profesional" in topic:
            return "cpns-tkp-profesionalisme"
        if re.search(r"radikal|ekstrem|intoleran|hoaks|ujaran kebencian|teroris", text):
            return "cpns-tkp-antiradikalisme"
        if re.search(r"aplikasi|sistem baru|digital|siber|komputer|teknologi|perangkat lunak|internet|otp|password", text):
            return "cpns-tkp-tik"
        if re.search(r"pelanggan|masyarakat|pemohon|pasien|warga|loket|keluhan|antrean|pelayanan", text):
            return "cpns-tkp-pelayanan"
        if re.search(r"adat|budaya|suku|daerah|tradisi|agama|bahasa daerah|lingkungan baru", text):
            return "cpns-tkp-sosbud"
        if re.search(r"tim|rekan kerja|jejaring|kolaborasi|sinergi|konflik antar|atasan dan rekan", text):
            return "cpns-tkp-jejaring"
        return "cpns-tkp-profesionalisme"

    # family == "bumn"
    if sub == "akhlak":
        return "bumn-akhlak"
    if sub == "twk_bumn":
        return "bumn-twk"
    if sub == "agility":
        return "bumn-agility"
    if sub == "bhs":
        if any(k in topic for k in ("reading", "vocabulary", "wacana", "bacaan")):
            return "bumn-bhs-reading"
        if any(k in topic for k in ("grammar", "structure", "error")):
            return "bumn-bhs-grammar"
        if re.search(r"passage|text above|main idea|according to|author|paragraph", text):
            return "bumn-bhs-reading"
        return "bumn-bhs-grammar"

    # sub == "tkd"
    if "diagram" in topic or re.search(r"diagram|operator|rotasi|pencerminan", text):
        return "bumn-tkd-diagram"
    if "number" in topic or "deret" in topic or re.search(r"\d+\s*,\s*\d+\s*,\s*\d+|%", text):
        return "bumn-tkd-angka"
    return "bumn-tkd-verbal"


def build_submateri_index():
    index_path = PACKS_DIR / "index.json"
    metas = json.loads(index_path.read_text(encoding="utf-8"))

    buckets: dict[str, dict] = {}
    total_mapped = 0

    for meta in metas:
        pack_path = PACKS_DIR / meta["file"]
        pack = json.loads(pack_path.read_text(encoding="utf-8"))
        family = pack["family"]
        for q in pack["questions"]:
            sid = classify_question(family, q)
            entry = buckets.setdefault(
                sid,
                {"id": sid, "family": family, "subtest": q["subtest"], "count": 0, "packs": {}},
            )
            entry["count"] += 1
            entry["packs"].setdefault(pack["id"], []).append(q["id"])
            total_mapped += 1

    out = {
        "version": 1,
        "totalMapped": total_mapped,
        "submateris": {
            sid: {
                "id": e["id"],
                "family": e["family"],
                "subtest": e["subtest"],
                "count": e["count"],
                "packs": [{"packId": pid, "qIds": qids} for pid, qids in e["packs"].items()],
            }
            for sid, e in sorted(buckets.items())
        },
    }
    (PACKS_DIR / "submateri-index.json").write_text(
        json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print(f"Submateri index built: {len(buckets)} kategori, {total_mapped} soal terpetakan.")
    for sid, e in sorted(buckets.items()):
        print(f"  {sid}: {e['count']} soal")


if __name__ == "__main__":
    build_submateri_index()
