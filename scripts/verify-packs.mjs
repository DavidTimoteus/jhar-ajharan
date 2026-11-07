// Verifikasi integritas paket soal Jhâr-Ajhârân
import fs from 'node:fs';
import path from 'node:path';

const PACKS_DIR = path.resolve('public/packs');
const INDEX_PATH = path.join(PACKS_DIR, 'index.json');

if (!fs.existsSync(INDEX_PATH)) {
  console.error('❌ Error: index.json tidak ditemukan di public/packs/');
  process.exit(1);
}

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
console.log(`📋 Memeriksa ${index.length} paket di katalog...`);

let totalQuestions = 0;
let errors = 0;

for (const meta of index) {
  const filePath = path.join(PACKS_DIR, meta.file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Berkas paket tidak ditemukan: ${meta.file}`);
    errors++;
    continue;
  }

  const pack = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`\n📦 Paket: ${pack.name} (${pack.id}) v${pack.version}`);
  console.log(`   Subtes: ${pack.config.subtests.map((s) => s.id).join(', ')}`);
  console.log(`   Durasi: ${pack.config.durationMin} menit`);
  console.log(`   Jumlah Soal: ${pack.questions.length}`);

  if (pack.questions.length !== meta.count) {
    console.error(`   ❌ Selisih jumlah: index=${meta.count}, actual=${pack.questions.length}`);
    errors++;
  }

  const subtestIds = new Set(pack.config.subtests.map((s) => s.id));
  const seenIds = new Set();

  pack.questions.forEach((q, idx) => {
    if (seenIds.has(q.id)) {
      console.error(`   ❌ ID duplikat: ${q.id} (nomor ${idx + 1})`);
      errors++;
    }
    seenIds.add(q.id);

    if (!subtestIds.has(q.subtest)) {
      console.error(`   ❌ Subtes tidak dikenal: ${q.subtest} di soal ${q.id}`);
      errors++;
    }

    if (!Array.isArray(q.options) || q.options.length !== 5) {
      console.error(`   ❌ Opsi harus 5 butir (A-E): ${q.id}`);
      errors++;
    }

    const stConfig = pack.config.subtests.find((s) => s.id === q.subtest);
    if (stConfig.scheme === 'binary') {
      if (typeof q.key !== 'number' || q.key < 0 || q.key > 4) {
        console.error(`   ❌ Kunci jawaban binary tidak valid (0-4): ${q.id}`);
        errors++;
      }
    } else if (stConfig.scheme === 'weighted') {
      if (!Array.isArray(q.weights) || q.weights.length !== 5) {
        console.error(`   ❌ Bobot weighted harus 5 nilai: ${q.id}`);
        errors++;
      }
    }

    // Periksa bahwa teks hint tidak membocorkan huruf jawaban (A-E) secara eksplisit
    for (const h of q.hints || []) {
      if (/kunci\s*:\s*[A-E]/i.test(h.text) || /jawaban\s*(adalah|nya)\s*[A-E]\b/i.test(h.text)) {
        console.warn(`   ⚠️ Warning: Hint pada ${q.id} (${h.lens}) mungkin membocorkan huruf jawaban: "${h.text}"`);
      }
    }
  });

  totalQuestions += pack.questions.length;
}

if (errors > 0) {
  console.error(`\n❌ Verifikasi GAGAL dengan ${errors} kesalahan.`);
  process.exit(1);
} else {
  console.log(`\n✅ Seluruh ${index.length} paket valid! Total ${totalQuestions} soal terverifikasi.`);
}
