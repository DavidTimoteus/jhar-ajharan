"""Utilitas pemolesan tipografi dan pembentuk pembahasan terstruktur."""
import re
import unicodedata

LETTERS = ["A", "B", "C", "D", "E"]


def _normalize_math_alnum(text: str) -> str:
    """Konversi karakter Mathematical Alphanumeric (U+1D400..U+1D7FF) menjadi ASCII tanpa merusak pangkat Unicode."""
    out = []
    for ch in text:
        if 0x1D400 <= ord(ch) <= 0x1D7FF:
            out.append(unicodedata.normalize("NFKC", ch))
        else:
            out.append(ch)
    return "".join(out)


def _ensure_period(text: str) -> str:
    s = (text or "").strip()
    if not s:
        return ""
    if s[-1] in '.!?"\')”…]':
        return s
    return s + "."


def build_explain_binary(options, key, kilat, logika) -> str:
    letter = LETTERS[key] if 0 <= key < len(LETTERS) else "?"
    ans = options[key] if 0 <= key < len(options) else ""
    parts = [f"==Jawaban benar: **{letter}. {ans}**=="]
    if kilat:
        parts.append(f"**Pembahasan:** {_ensure_period(kilat)}")
    if logika:
        parts.append(f"**Konsep inti:** {_ensure_period(logika)}")
    return "\n".join(parts)


def build_explain_weighted(options, weights, kilat, logika) -> str:
    best_idx = max(range(len(weights)), key=lambda i: weights[i]) if weights else 0
    best_score = weights[best_idx] if weights else 5
    letter = LETTERS[best_idx] if 0 <= best_idx < len(LETTERS) else "?"
    ans = options[best_idx] if 0 <= best_idx < len(options) else ""
    parts = [f"==Opsi terbaik (Poin {best_score}): **{letter}. {ans}**=="]
    if kilat:
        parts.append(f"**Alasan:** {_ensure_period(kilat)}")
    if logika:
        parts.append(f"**Prinsip:** {_ensure_period(logika)}")
    return "\n".join(parts)


def polish_question_text(raw: str, *, is_diagram: bool = False, is_explain: bool = False) -> str:
    if not isinstance(raw, str):
        return raw
    s = raw.strip()
    if not s:
        return ""

    # Pertahankan tata letak diagram ASCII apa adanya kecuali trailing whitespace per baris.
    if is_diagram:
        return "\n".join(line.rstrip() for line in s.splitlines())

    # 0. Normalisasi karakter Mathematical Alphanumeric (mis. 𝑝, 𝑥, 𝒃) menjadi ASCII rapi.
    s = _normalize_math_alnum(s)

    # 1. Konversi notasi pangkat ASCII sederhana (termasuk 2^(n-1) / 3^(m+2)) menjadi Unicode pangkat rapi.
    sup_map = str.maketrans("0123456789mnx+-", "⁰¹²³⁴⁵⁶⁷⁸⁹ᵐⁿˣ⁺⁻")
    s = re.sub(
        r"\^\(([0-9mnx+-]+)\)",
        lambda m: m.group(1).translate(sup_map),
        s,
    )
    s = re.sub(
        r"\^([0-9mnx]+)\b",
        lambda m: m.group(1).translate(sup_map),
        s,
    )

    # 2. Rapikan elipsis terpisah spasi, titik ganda sebelum skor, dan spasi dalam tanda kurung.
    s = re.sub(r"\.\s+\.\s+\.", "...", s)
    s = re.sub(r"\.\s+\.(?=\s*\()", ".", s)
    s = re.sub(r"\(\s+([^)\n])", r"(\1", s)
    s = re.sub(r"([^(\n])\s+\)", r"\1)", s)
    s = re.sub(r"([.!?])\s*\(\s*skor\s*(\d+)\s*\)", r"\1 (Skor \2)", s, flags=re.IGNORECASE)
    s = re.sub(r"\(\s*skor\s*(\d+)\s*\)", r"(Skor \1)", s, flags=re.IGNORECASE)

    # 3. Hapus spasi nyasar sebelum tanda baca setelah huruf, angka (untuk ? ! ;), atau kurung tutup
    #    (menjaga ": ?" pada soal pola dan menjaga notasi angka "42 . 60").
    s = re.sub(r"([A-Za-zÀ-ÿ)\]\"”'])\s+([.,])(?=\s|$)", r"\1\2", s)
    s = re.sub(r"([A-Za-zÀ-ÿ0-9)\]\"”'])\s+([?!;])(?=\s|$)", r"\1\2", s)

    # 4. Rapikan ejaan umum yang sempat muncul salah di arsip soal.
    s = s.replace("ber-bhineka tunggal ika", "ber-Bhinneka Tunggal Ika")
    s = s.replace("Bhineka Tunggal Ika", "Bhinneka Tunggal Ika")
    s = s.replace("berpaspasan", "berpapasan")
    s = re.sub(r"\bke tiga\b", "ketiga", s)

    # 5. Rapikan pemisah opsi inline pada stem klasifikasi kata (mis. "A) Mawar  B) Melati").
    s = re.sub(
        r"([A-E]\)\s+[^\n]+?)\s{2,}(?=[B-E]\)\s)",
        r"\1 · ",
        s,
    )

    # 6. Untuk stem & opsi (non-RichText), hilangkan tanda bintang *italic* agar tidak muncul mentah.
    if not is_explain:
        s = re.sub(r"(?<!\*)\*([^\s*\n](?:[^\n*]*?[^\s*\n])?)\*(?!\*)", r"\1", s)

    # 7. Normalisasi spasi ganda menjadi tunggal per baris.
    lines = [re.sub(r" {2,}", " ", ln).strip() for ln in s.splitlines()]
    s = "\n".join(ln for ln in lines if ln)

    if is_explain:
        # Pecah daftar poin "- Langkah..." / "• ..." ke baris baru agar mudah dipindai mata.
        s = re.sub(r"\s+•\s+", "\n• ", s)
        s = re.sub(r"\s+-\s+(?=(?:Langkah|Kemudian|Selanjutnya|Opsi)\b)", "\n- ", s)
        # Pecah rincian evaluasi opsi TKP ("... (Skor 5) B. ...") ke baris baru.
        s = re.sub(r"(\(Skor\s+\d+\))\s+(?=[A-E]\.\s)", r"\1\n", s)
        s = re.sub(
            r"(jawaban yang paling tepat adalah [A-E]\.)\s+(?=[A-E]\.\s)",
            r"\1\n",
            s,
            flags=re.IGNORECASE,
        )
        # Perbaiki fragmen gantung "Opsi X salah, karena" tanpa alasan.
        s = re.sub(r"(Opsi [A-E] salah),\s*karena(?=\s*(?:\n|$|-))", r"\1.", s)

        # Kapitalkan awal kalimat penjelasan jika diawali huruf kecil.
        if s and s[0].islower():
            s = s[0].upper() + s[1:]

        # Pastikan pembahasan diakhiri tanda baca penutup.
        s = _ensure_period(s)

    return s
