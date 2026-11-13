import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { cleanDisplayText, hasHtmlOrFormulaLeak } from '../src/lib/sanitize.ts';

function walkStrings(obj, out = []) {
  if (typeof obj === 'string') {
    out.push(obj);
  } else if (Array.isArray(obj)) {
    for (const x of obj) walkStrings(x, out);
  } else if (obj && typeof obj === 'object') {
    for (const v of Object.values(obj)) walkStrings(v, out);
  }
  return out;
}

describe('Uji Kebersihan Teks, Rumus & Anti-HTML Bug', () => {
  it('cleanDisplayText menghapus tag HTML mentah tapi menjaga pertidaksamaan matematika', () => {
    const dirty = '<p>Pertumbuhan naik 2<sup>3</sup> &amp; turun.</p><br/><b>Catatan:</b> uji dulu.';
    const cleaned = cleanDisplayText(dirty);
    assert.equal(hasHtmlOrFormulaLeak(cleaned), false);
    assert.ok(cleaned.includes('2³ & turun.'));
    assert.ok(!cleaned.includes('<p>'));
    assert.ok(!cleaned.includes('&amp;'));

    // Pertidaksamaan matematika tidak boleh ikut terpotong!
    const math = 'Jika a < b atau b > c maka nilai x < 5.';
    assert.equal(cleanDisplayText(math), math);
    assert.equal(hasHtmlOrFormulaLeak(math), false);
  });

  it('Seluruh 30 paket soal di public/packs bebas dari tag HTML (<p>, <br>, &nbsp;) & spoiler hint', () => {
    const indexPath = path.resolve('public/packs/index.json');
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    assert.ok(index.length >= 30);

    for (const meta of index) {
      const packPath = path.resolve('public/packs', meta.file);
      const pack = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
      assert.equal(pack.questions.length, meta.count, `Count mismatch on ${meta.id}`);

      for (const q of pack.questions) {
        const texts = [q.stem, q.explain, ...(q.options || []), ...(q.hints || []).map((h) => h.text)];
        for (const t of texts) {
          assert.equal(
            hasHtmlOrFormulaLeak(t),
            false,
            `Kebocoran HTML/rumus terdeteksi di ${meta.id} -> ${q.id}: ${String(t).slice(0, 120)}`,
          );
        }
        for (const h of q.hints || []) {
          assert.equal(
            /\b(kunci\s*:\s*[A-E]|jawaban(nya)?\s*(adalah|nya|=|:)\s*[A-E])\b/i.test(h.text),
            false,
            `Hint spoiler terdeteksi di ${q.id}: ${h.text}`,
          );
        }
      }
    }
  });

  it('Seluruh pustaka Tips & Trik, Baku vs Mudah (knowledge.json), dan Glosarium bersih dari HTML/rumus rusak', () => {
    const knowledge = JSON.parse(fs.readFileSync(path.resolve('src/lib/knowledge.json'), 'utf-8'));
    const kStrings = walkStrings(knowledge);
    assert.ok(kStrings.length > 200);
    for (const s of kStrings) {
      assert.equal(hasHtmlOrFormulaLeak(s), false, `Leak di knowledge.json: ${s.slice(0, 120)}`);
    }

    const tipsTs = fs.readFileSync(path.resolve('src/lib/tips.ts'), 'utf-8');
    // Pastikan definisi CPNS_TIPS, BUMN_TIPS, dan BUMN_GLOSSARY bebas dari tag HTML atau LaTeX mentah
    assert.equal(hasHtmlOrFormulaLeak(tipsTs), false, 'Ditemukan kebocoran tag HTML atau LaTeX di src/lib/tips.ts');
  });
});
