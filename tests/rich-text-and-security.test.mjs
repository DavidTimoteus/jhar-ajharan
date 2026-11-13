import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseInlineRichText } from '../src/lib/richText.ts';
import { hasHtmlOrFormulaLeak, safeJsonParse } from '../src/lib/sanitize.ts';

describe('Keamanan JSON, Format Teks Kaya & Indeks Kisi Submateri', () => {
  it('parseInlineRichText memformat bold, underline, strikethrough, highlight & menjaga isian rumpang', () => {
    const tokens = parseInlineRichText(
      '**Kunci**: __wajib bulatkan__ bukan ~~bulatkan ke bawah~~, pakai ==O₁ × W₁== atau `a² - b²`.',
    );
    const kinds = tokens.map((t) => t.kind);
    assert.ok(kinds.includes('bold'));
    assert.ok(kinds.includes('underline'));
    assert.ok(kinds.includes('strike'));
    assert.ok(kinds.includes('highlight'));
    assert.ok(kinds.includes('code'));

    // Isian grammar _____ & snake_case twk_bumn tidak boleh salah dideteksi sebagai underline!
    const blankTokens = parseInlineRichText('She _____ to the office at twk_bumn.');
    assert.equal(blankTokens.every((t) => t.kind === 'text'), true);
  });

  it('safeJsonParse memblokir prototype pollution dan batas payload berlebih', () => {
    const poisoned = '{"name":"ok","__proto__":{"polluted":true},"constructor":{"bad":1},"questions":[]}';
    const parsed = safeJsonParse(poisoned);
    assert.equal(({}).polluted, undefined);
    assert.equal(Object.prototype.hasOwnProperty.call(parsed, '__proto__'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(parsed, 'constructor'), false);

    assert.throws(() => safeJsonParse('{"a":1}', 3), /melebihi batas aman/);
  });

  it('submateri-index.json memetakan seluruh 2857 soal lintas 29 submateri tanpa bucket kosong', () => {
    const idxPath = path.resolve('public/packs/submateri-index.json');
    const idx = JSON.parse(fs.readFileSync(idxPath, 'utf-8'));
    const entries = Object.values(idx.submateris);
    assert.equal(entries.length, 29);
    const sum = entries.reduce((acc, e) => acc + e.count, 0);
    assert.equal(sum, idx.totalMapped);
    assert.equal(sum, 2857);
    for (const e of entries) {
      assert.ok(e.count >= 10, `Bucket ${e.id} terlalu sedikit (${e.count})`);
      assert.ok(Array.isArray(e.packs) && e.packs.length > 0);
    }
  });

  it('Konten psikologi belajar di submateri.ts bersih dari tag HTML mentah', () => {
    const raw = fs.readFileSync(path.resolve('src/lib/submateri.ts'), 'utf-8');
    assert.equal(hasHtmlOrFormulaLeak(raw), false);
  });
});

