import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CPNS_PASSING_GRADE_2024,
  calcAkarBerulang,
  calcBerbalikNilai,
  calcBerpapasanSama,
  calcHargaBeliDariUntungRugi,
  calcKerjaBersama,
  calcKerjaBersamaTiga,
  calcPekerjaTambahanTerhenti,
  calcPerubahanPersenBertingkat,
  calcRataRataPergiPulang,
  calcSelisihKuadrat,
  calcSukuPolaLinear,
  calcSusulMenyusul,
  cekLulusSkdCpns,
} from '../src/lib/formulas.ts';

describe('Validasi Matematis Rumus Tercepat TIU & TKD', () => {
  it('Perbandingan berbalik nilai selalu menjaga hasil kali konstan (O1 × W1 = O2 × W2)', () => {
    for (let o1 = 4; o1 <= 40; o1 += 3) {
      for (let w1 = 5; w1 <= 30; w1 += 5) {
        const w2 = w1 + 4;
        const o2 = calcBerbalikNilai(o1, w1, w2);
        assert.ok(Math.abs(o2 * w2 - o1 * w1) < 1e-9);
      }
    }
  });

  it('Proyek terhenti di tengah jalan: pembulatan pekerja ke atas selalu menuntaskan sisa beban', () => {
    // Kasus contoh di TipsDrawer: 15 orang, target 20 hari, kerja 8 hari, libur 4 hari -> 22.5 -> 23 -> +8
    const ex = calcPekerjaTambahanTerhenti(15, 20, 8, 4);
    assert.equal(ex.totalOrangDibutuhkan, 22.5);
    assert.equal(ex.pekerjaBulat, 23);
    assert.equal(ex.tambahan, 8);

    // Uji 30 skenario berbeda
    for (let orang = 6; orang <= 30; orang += 4) {
      for (let target = 18; target <= 36; target += 6) {
        const jalan = Math.floor(target / 3);
        const libur = 3;
        const res = calcPekerjaTambahanTerhenti(orang, target, jalan, libur);
        const sisaBeban = orang * (target - jalan);
        const sisaHari = target - jalan - libur;
        assert.ok(res.pekerjaBulat * sisaHari >= sisaBeban - 1e-9);
        assert.ok((res.pekerjaBulat - 1) * sisaHari < sisaBeban);
      }
    }
  });

  it('Kerja bersama 2 & 3 orang memenuhi penjumlahan laju kerja = 1 pekerjaan penuh', () => {
    assert.equal(calcKerjaBersama(6, 3), 2);
    for (let a = 2; a <= 16; a += 2) {
      for (let b = 3; b <= 15; b += 3) {
        const t2 = calcKerjaBersama(a, b);
        assert.ok(Math.abs(t2 * (1 / a + 1 / b) - 1) < 1e-9);
        const t3 = calcKerjaBersamaTiga(a, b, a + b);
        assert.ok(Math.abs(t3 * (1 / a + 1 / b + 1 / (a + b)) - 1) < 1e-9);
      }
    }
  });

  it('Jarak susul-menyusul & berpapasan menghasilkan posisi temu yang identik', () => {
    // Contoh TipsDrawer: 06.40 (60 km/j), B 07.00 (70 km/j) -> selisih 1/3 jam -> 2 jam -> 09.00
    assert.ok(Math.abs(calcSusulMenyusul(1 / 3, 60, 70) - 2) < 1e-9);
    // Contoh soal original: Rina 07.15 (48 km/j), Dito 07.45 (60 km/j) -> 2 jam -> 09.45
    assert.ok(Math.abs(calcSusulMenyusul(0.5, 48, 60) - 2) < 1e-9);

    for (let selisih = 0.25; selisih <= 2; selisih += 0.25) {
      const v1 = 45;
      const v2 = 65;
      const tSusul = calcSusulMenyusul(selisih, v1, v2);
      const jarak1 = v1 * (selisih + tSusul);
      const jarak2 = v2 * tSusul;
      assert.ok(Math.abs(jarak1 - jarak2) < 1e-9);
    }

    const tPapasan = calcBerpapasanSama(300, 55, 65);
    assert.ok(Math.abs(55 * tPapasan + 65 * tPapasan - 300) < 1e-9);
  });

  it('Kecepatan rata-rata pergi-pulang jarak sama persis dengan total jarak / total waktu', () => {
    assert.equal(calcRataRataPergiPulang(60, 40), 48);
    for (const jarak of [24, 120, 360]) {
      for (let v1 = 30; v1 <= 90; v1 += 15) {
        const v2 = 50;
        const totalWaktu = jarak / v1 + jarak / v2;
        const caraBaku = (2 * jarak) / totalWaktu;
        const caraCepat = calcRataRataPergiPulang(v1, v2);
        assert.ok(Math.abs(caraCepat - caraBaku) < 1e-9);
      }
    }
  });

  it('Diskon/persentase bertingkat tidak sama dengan penjumlahan persen langsung', () => {
    const naikTurun = calcPerubahanPersenBertingkat(100, [20, -20]);
    assert.equal(naikTurun.nilaiAkhir, 96);
    assert.equal(naikTurun.perubahanTotalPersen, -4);

    const diskonGanda = calcPerubahanPersenBertingkat(500_000, [-30, -20]);
    assert.equal(diskonGanda.nilaiAkhir, 280_000);
    assert.ok(Math.abs(diskonGanda.perubahanTotalPersen - -44) < 1e-9);
  });

  it('Harga beli dari harga jual selalu konsisten terhadap persentase untung dan rugi', () => {
    assert.equal(calcHargaBeliDariUntungRugi(120_000, 20), 100_000);
    assert.equal(calcHargaBeliDariUntungRugi(80_000, -20), 100_000);
  });

  it('Selisih kuadrat, akar berulang, dan pola linear identik dengan perhitungan baku', () => {
    assert.equal(calcSelisihKuadrat(675, 325), 675 * 675 - 325 * 325);
    assert.equal(calcSelisihKuadrat(786 / 3, 714 / 3), 12_000);

    for (let n = 1; n <= 20; n++) {
      const k = n * (n + 1);
      const plus = calcAkarBerulang(k, '+');
      const minus = calcAkarBerulang(k, '-');
      assert.equal(plus, n + 1);
      assert.equal(minus, n);
      assert.ok(Math.abs(Math.sqrt(k + plus) - plus) < 1e-9);
      assert.ok(Math.abs(Math.sqrt(k - minus) - minus) < 1e-9);
    }

    assert.equal(calcSukuPolaLinear(20, 27, 5, 4), 87);
    assert.equal(calcSukuPolaLinear(10, 32, 6, 5), 52);
  });

  it('Ambang batas kelulusan SKD CPNS mematuhi KepmenPANRB 321/2024', () => {
    assert.equal(CPNS_PASSING_GRADE_2024.twk, 65);
    assert.equal(CPNS_PASSING_GRADE_2024.tiu, 80);
    assert.equal(CPNS_PASSING_GRADE_2024.tkp, 166);
    assert.deepEqual(cekLulusSkdCpns(130, 140, 180), {
      total: 450,
      lulusPg: true,
      zonaAman: true,
    });
    // TWK 60 gagal PG meskipun total tinggi > 450
    assert.equal(cekLulusSkdCpns(60, 175, 220).lulusPg, false);
  });
});

