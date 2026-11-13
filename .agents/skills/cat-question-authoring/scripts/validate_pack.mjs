#!/usr/bin/env node
// Validator standar paket soal Jhâr-Ajhârân (skema, anti-HTML, anti-spoiler hint).
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Pemakaian: node validate_pack.mjs <path-pack.json>');
  process.exit(1);
}

const pack = JSON.parse(fs.readFileSync(file, 'utf-8'));
const errors = [];

const HTML_RE = /<\/?(?:p|div|br|span|b|strong|i|em|u|ul|ol|li|table|tr|td|th|h[1-6]|sup|sub)(?:\s+[^>]*)?\s*\/?>/i;
const LATEX_RE = /\\(?:frac|sqrt|times|div|cdot|text|begin|end)\b|\$\$/;
const SPOIL_RE = /\b(kunci\s*:\s*[A-E]|jawaban(nya)?\s*(adalah|nya|=|:)\s*[A-E])\b/i;

if (!pack.id || !pack.name || !['cpns', 'bumn'].includes(pack.family)) {
  errors.push('Header pack tidak valid (id/name/family).');
}
if (!pack.config || !Array.isArray(pack.config.subtests) || pack.config.subtests.length === 0) {
  errors.push('pack.config.subtests wajib diisi.');
}
if (!Array.isArray(pack.questions) || pack.questions.length === 0) {
  errors.push('pack.questions minimal 1 soal.');
}

const subMap = new Map((pack.config?.subtests || []).map((s) => [s.id, s]));
const seenIds = new Set();

for (const [i, q] of (pack.questions || []).entries()) {
  const tag = `Soal #${i + 1} (${q.id || 'no-id'})`;
  if (!q.id || seenIds.has(q.id)) errors.push(`${tag}: ID hilang/duplikat.`);
  seenIds.add(q.id);

  const st = subMap.get(q.subtest);
  if (!st) errors.push(`${tag}: subtest "${q.subtest}" tidak ada di config.subtests.`);

  if (!Array.isArray(q.options) || q.options.length !== 5) {
    errors.push(`${tag}: wajib tepat 5 opsi (A–E).`);
  }

  if (st?.scheme === 'binary') {
    if (typeof q.key !== 'number' || q.key < 0 || q.key > 4) {
      errors.push(`${tag}: key binary harus 0–4.`);
    }
  } else if (st?.scheme === 'weighted') {
    if (!Array.isArray(q.weights) || q.weights.length !== 5) {
      errors.push(`${tag}: weights weighted harus 5 nilai.`);
    } else if (Math.max(...q.weights) !== 5 || Math.min(...q.weights) !== 1) {
      errors.push(`${tag}: weights TKP/SJT idealnya mencakup rentang 1–5.`);
    }
  }

  if (!Array.isArray(q.hints) || q.hints.length < 4) {
    errors.push(`${tag}: wajib memiliki 4 lensa hints (kilat, eliminasi, logika, jebakan).`);
  } else {
    for (const h of q.hints) {
      if (SPOIL_RE.test(h.text || '')) errors.push(`${tag}: hint "${h.lens}" membocorkan huruf jawaban!`);
    }
  }

  const allTexts = [q.stem, q.explain, ...(q.options || []), ...(q.hints || []).map((h) => h.text)];
  for (const txt of allTexts) {
    if (HTML_RE.test(txt || '')) errors.push(`${tag}: mengandung tag HTML mentah.`);
    if (LATEX_RE.test(txt || '')) errors.push(`${tag}: mengandung LaTeX mentah yang tidak dirender.`);
    if (/&(?:nbsp|amp|lt|gt|quot);/i.test(txt || '')) errors.push(`${tag}: mengandung HTML entity mentah.`);
  }
}

if (errors.length > 0) {
  console.error(`❌ Validasi gagal (${errors.length} masalah):`);
  for (const e of errors.slice(0, 30)) console.error(' -', e);
  process.exit(1);
}
console.log(`✅ Pack "${pack.id}" (${pack.questions.length} soal) lolos standar CAT Authoring!`);

