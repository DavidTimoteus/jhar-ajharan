// Rumus matematis terverifikasi untuk TIU CPNS & TKD RBB BUMN.
// Setiap fungsi murni diuji silang terhadap perhitungan cara baku di tests/formulas.test.mjs.

export const CPNS_PASSING_GRADE_2024 = {
  twk: 65,
  tiu: 80,
  tkp: 166,
  maxTwk: 150,
  maxTiu: 175,
  maxTkp: 225,
  maxTotal: 550,
} as const;

/**
 * Perbandingan berbalik nilai murni (contoh: pekerja × hari, kecepatan × waktu).
 * Rumus mudah: Total Awal = A1 × B1, maka nilai baru = Total Awal ÷ B2.
 */
export function calcBerbalikNilai(a1: number, b1: number, b2: number): number {
  if (b2 <= 0) throw new Error('Pembagi harus lebih dari 0');
  return (a1 * b1) / b2;
}

/**
 * Pekerja tambahan jika proyek terhenti di tengah jalan:
 * 1. Hitung sisa hari yang masih berhak dikerjakan (setelah hari berjalan + hari libur).
 * 2. Total pekerja yang dibutuhkan = (orangAwal × (targetHari - hariBerjalan)) ÷ sisaHari.
 * 3. Tambahan pekerja = pembulatan ke atas(totalButuh) - orangAwal.
 */
export function calcPekerjaTambahanTerhenti(
  orangAwal: number,
  targetHari: number,
  hariBerjalan: number,
  hariLibur: number,
): { totalOrangDibutuhkan: number; pekerjaBulat: number; tambahan: number } {
  const sisaBebanHari = targetHari - hariBerjalan;
  const sisaHariEfektif = targetHari - hariBerjalan - hariLibur;
  if (sisaBebanHari <= 0 || sisaHariEfektif <= 0) {
    throw new Error('Sisa hari efektif harus lebih dari 0');
  }
  const totalOrangDibutuhkan = (orangAwal * sisaBebanHari) / sisaHariEfektif;
  const pekerjaBulat = Math.ceil(totalOrangDibutuhkan - 1e-9);
  return {
    totalOrangDibutuhkan,
    pekerjaBulat,
    tambahan: Math.max(0, pekerjaBulat - orangAwal),
  };
}

/**
 * Kerja bersama 2 orang/mesin: Kalikan waktunya, lalu bagi dengan jumlah waktunya.
 * t = (t1 × t2) ÷ (t1 + t2)
 */
export function calcKerjaBersama(t1: number, t2: number): number {
  if (t1 <= 0 || t2 <= 0) throw new Error('Waktu kerja harus positif');
  return (t1 * t2) / (t1 + t2);
}

/**
 * Kerja bersama 3 orang/mesin: 1/t = 1/t1 + 1/t2 + 1/t3
 */
export function calcKerjaBersamaTiga(t1: number, t2: number, t3: number): number {
  if (t1 <= 0 || t2 <= 0 || t3 <= 0) throw new Error('Waktu kerja harus positif');
  return 1 / (1 / t1 + 1 / t2 + 1 / t3);
}

/**
 * Waktu berpapasan jika berangkat di jam yang sama: Jarak ÷ (V1 + V2)
 */
export function calcBerpapasanSama(jarakKm: number, v1KmJam: number, v2KmJam: number): number {
  if (v1KmJam + v2KmJam <= 0) throw new Error('Jumlah kecepatan harus positif');
  return jarakKm / (v1KmJam + v2KmJam);
}

/**
 * Susul-menyusul saat orang kedua berangkat lebih lambat selisihJam jam:
 * Selisih jarak awal = vAwal × selisihJam
 * Waktu susul (dihitung dari jam berangkat penyusul) = Selisih jarak awal ÷ (vPenyusul - vAwal)
 */
export function calcSusulMenyusul(
  selisihJam: number,
  vAwalKmJam: number,
  vPenyusulKmJam: number,
): number {
  if (vPenyusulKmJam <= vAwalKmJam) {
    throw new Error('Kecepatan penyusul harus lebih besar dari yang disusul');
  }
  const jarakAwal = vAwalKmJam * selisihJam;
  return jarakAwal / (vPenyusulKmJam - vAwalKmJam);
}

/**
 * Kecepatan rata-rata pergi-pulang untuk JARAK SAMA: (2 × v1 × v2) ÷ (v1 + v2)
 */
export function calcRataRataPergiPulang(v1: number, v2: number): number {
  if (v1 <= 0 || v2 <= 0) throw new Error('Kecepatan harus positif');
  return (2 * v1 * v2) / (v1 + v2);
}

/**
 * Perubahan persen bertingkat (mis. diskon 50% + 20%, atau naik 20% lalu turun 20%).
 * Setiap perubahan persen (mis. -50, -20) dikalikan terhadap sisa nilai sebelumnya.
 */
export function calcPerubahanPersenBertingkat(
  nilaiAwal: number,
  daftarPersen: number[],
): { nilaiAkhir: number; perubahanTotalPersen: number } {
  let nilai = nilaiAwal;
  for (const p of daftarPersen) {
    nilai = nilai * (1 + p / 100);
  }
  const perubahanTotalPersen = ((nilai - nilaiAwal) / nilaiAwal) * 100;
  return { nilaiAkhir: nilai, perubahanTotalPersen };
}

/**
 * Harga Beli (Modal) dari Harga Jual & Persen Untung/Rugi:
 * Harga Beli = Harga Jual ÷ (1 + persen/100)
 * (Untuk rugi masukkan angka negatif, mis. rugi 20% → -20)
 */
export function calcHargaBeliDariUntungRugi(hargaJual: number, persenUntungRugi: number): number {
  const faktor = 1 + persenUntungRugi / 100;
  if (faktor <= 0) throw new Error('Persentase rugi tidak boleh ≤ -100%');
  return hargaJual / faktor;
}

/**
 * Trik aljabar selisih dua kuadrat: a² - b² = (a + b) × (a - b)
 */
export function calcSelisihKuadrat(a: number, b: number): number {
  return (a + b) * (a - b);
}

/**
 * Akar berulang √(k ± √(k ± √(k ± ...))):
 * Bila k = n × (n + 1), tanda "+" menghasilkan (n + 1), tanda "-" menghasilkan n.
 */
export function calcAkarBerulang(k: number, operasi: '+' | '-'): number | null {
  if (k <= 0) return null;
  const n = Math.floor(Math.sqrt(k));
  if (n * (n + 1) !== k) return null;
  return operasi === '+' ? n + 1 : n;
}

/**
 * Pola tabel/baris linear: loncat k langkah dari suku ke-k -> Nilai(n) = Nilai(k) + beda × (n - k)
 */
export function calcSukuPolaLinear(n: number, sukuK: number, k: number, beda: number): number {
  return sukuK + beda * (n - k);
}

/**
 * Evaluasi kelulusan Ambang Batas SKD CPNS resmi (KepmenPANRB No. 321 Tahun 2024).
 */
export function cekLulusSkdCpns(twk: number, tiu: number, tkp: number): {
  total: number;
  lulusPg: boolean;
  zonaAman: boolean;
} {
  const total = twk + tiu + tkp;
  const lulusPg =
    twk >= CPNS_PASSING_GRADE_2024.twk &&
    tiu >= CPNS_PASSING_GRADE_2024.tiu &&
    tkp >= CPNS_PASSING_GRADE_2024.tkp;
  return { total, lulusPg, zonaAman: lulusPg && total >= 450 };
}

