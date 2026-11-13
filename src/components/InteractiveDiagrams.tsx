import { useState } from 'preact/hooks';
import {
  calcBerpapasanSama,
  calcPekerjaTambahanTerhenti,
  calcPerubahanPersenBertingkat,
  calcSusulMenyusul,
} from '../lib/formulas';
import type { DiagramId } from '../lib/submateri';
import RichText from './RichText';

interface Props {
  diagramId: DiagramId;
}

export default function InteractiveDiagram({ diagramId }: Props) {
  switch (diagramId) {
    case 'berbalik-nilai':
      return <BerbalikNilaiVisual />;
    case 'gerak-temu':
      return <GerakTemuVisual />;
    case 'silogisme-venn':
      return <SilogismeVennVisual />;
    case 'persen-tangki':
      return <PersenTangkiVisual />;
    case 'deret-scanner':
      return <DeretScannerVisual />;
    case 'tkp-akhlak-radar':
      return <TkpAkhlakRadarVisual />;
    default:
      return null;
  }
}

/* 1. VISUAL TIMBANGAN PEKERJA & PROYEK TERHENTI */
function BerbalikNilaiVisual() {
  const [pekerja, setPekerja] = useState(15);
  const [targetHari, setTargetHari] = useState(20);
  const [sudahKerja, setSudahKerja] = useState(8);
  const [libur, setLibur] = useState(4);

  const safeSudah = Math.min(sudahKerja, Math.max(1, targetHari - 2));
  const maxLibur = Math.max(1, targetHari - safeSudah - 1);
  const safeLibur = Math.min(libur, maxLibur);

  const res = calcPekerjaTambahanTerhenti(pekerja, targetHari, safeSudah, safeLibur);
  const totalBeban = pekerja * targetHari;
  const bebanSisa = pekerja * (targetHari - safeSudah);
  const sisaWaktuEfektif = targetHari - safeSudah - safeLibur;
  const pctDone = Math.round((safeSudah / targetHari) * 100);
  const pctLibur = Math.round((safeLibur / targetHari) * 100);
  const pctSisa = Math.max(0, 100 - pctDone - pctLibur);

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · Beban Tetap</span>
        <h4>Timbangan Pekerja &amp; Proyek Terhenti</h4>
      </div>
      <p className="muted small">
        <RichText text="Geser angka di bawah untuk melihat bagaimana **Total Pekerjaan (Orang × Hari)** tidak pernah hilang meski libur:" inline />
      </p>

      <div className="lab-sliders-grid">
        <label className="lab-slider">
          <span>Pekerja awal: <strong>{pekerja} org</strong></span>
          <input type="range" min={6} max={30} value={pekerja} onInput={(e) => setPekerja(Number((e.target as HTMLInputElement).value))} />
        </label>
        <label className="lab-slider">
          <span>Target awal: <strong>{targetHari} hari</strong></span>
          <input type="range" min={10} max={40} value={targetHari} onInput={(e) => setTargetHari(Number((e.target as HTMLInputElement).value))} />
        </label>
        <label className="lab-slider">
          <span>Sudah kerja: <strong>{safeSudah} hari</strong></span>
          <input type="range" min={1} max={Math.max(2, targetHari - 3)} value={safeSudah} onInput={(e) => setSudahKerja(Number((e.target as HTMLInputElement).value))} />
        </label>
        <label className="lab-slider">
          <span>Berhenti/Libur: <strong>{safeLibur} hari</strong></span>
          <input type="range" min={1} max={maxLibur} value={safeLibur} onInput={(e) => setLibur(Number((e.target as HTMLInputElement).value))} />
        </label>
      </div>

      {/* Timeline Stacked Visual */}
      <div className="lab-timeline-wrap" aria-label="Peta pembagian waktu proyek">
        <div className="lab-timeline-bar">
          <div className="lab-seg is-done" style={{ width: `${pctDone}%` }}>
            Selesai ({safeSudah}h)
          </div>
          <div className="lab-seg is-stop" style={{ width: `${pctLibur}%` }}>
            Libur ({safeLibur}h)
          </div>
          <div className="lab-seg is-left" style={{ width: `${pctSisa}%` }}>
            Sisa ({sisaWaktuEfektif}h)
          </div>
        </div>
      </div>

      <div className="lab-formula-strip">
        <div className="lab-step-box">
          <span>1. Sisa Beban Wajib</span>
          <strong>
            {pekerja} × ({targetHari} − {safeSudah}) = {bebanSisa}
          </strong>
          <small className="muted">dari total {totalBeban} unit-hari</small>
        </div>
        <div className="lab-step-box">
          <span>2. Bagi Sisa Waktu ({sisaWaktuEfektif} hari)</span>
          <strong>
            {bebanSisa} ÷ {sisaWaktuEfektif} = {res.totalOrangDibutuhkan.toFixed(2)}
          </strong>
          <small className="muted">
            <RichText text={`dibulatkan ke atas → ==${res.pekerjaBulat} org==`} inline />
          </small>
        </div>
        <div className="lab-step-box is-accent">
          <span>3. Tambahan Pekerja</span>
          <strong className="num">+{res.tambahan} orang</strong>
          <small className="muted">({res.pekerjaBulat} − {pekerja})</small>
        </div>
      </div>

      <div className="lab-takeaway">
        <RichText
          text={`==Kenapa ${res.totalOrangDibutuhkan.toFixed(2)} wajib naik ke ${res.pekerjaBulat}?== Karena kalau pakai ~~${Math.floor(res.totalOrangDibutuhkan)} orang saja~~, pekerjaan __masih kurang__ di hari terakhir!`}
        />
      </div>
    </div>
  );
}

/* 2. VISUAL LINTASAN BERPAPASAN & SUSUL-MENYUSUL */
function GerakTemuVisual() {
  const [mode, setMode] = useState<'susul' | 'papas'>('susul');
  const [vA, setVA] = useState(60);
  const [vB, setVB] = useState(80);
  const [jarak, setJarak] = useState(210);
  const [selisihMenit, setSelisihMenit] = useState(30);

  const safeVB = mode === 'susul' ? Math.max(vA + 10, vB) : vB;
  const selisihJam = selisihMenit / 60;

  const tTemu =
    mode === 'papas'
      ? calcBerpapasanSama(jarak, vA, safeVB)
      : calcSusulMenyusul(selisihJam, vA, safeVB);

  const jarakDuluan = vA * selisihJam;
  const posisiTemuPct =
    mode === 'papas'
      ? Math.min(92, Math.max(8, Math.round(((vA * tTemu) / jarak) * 100)))
      : 78;

  const formatJam = (jamDes: number) => {
    const jam = Math.floor(jamDes);
    const mnt = Math.round((jamDes - jam) * 60);
    return jam > 0 ? `${jam} jam ${mnt} mnt` : `${mnt} menit`;
  };

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · Kecepatan &amp; Waktu</span>
        <div className="lab-mode-toggle">
          <button
            type="button"
            className={`chip-btn ${mode === 'susul' ? 'is-active' : ''}`}
            onClick={() => setMode('susul')}
          >
            Susul-Menyusul
          </button>
          <button
            type="button"
            className={`chip-btn ${mode === 'papas' ? 'is-active' : ''}`}
            onClick={() => setMode('papas')}
          >
            Berpapasan
          </button>
        </div>
      </div>

      <div className="lab-sliders-grid">
        <label className="lab-slider">
          <span>Kecepatan A (lebih dulu): <strong>{vA} km/j</strong></span>
          <input type="range" min={30} max={90} step={5} value={vA} onInput={(e) => setVA(Number((e.target as HTMLInputElement).value))} />
        </label>
        <label className="lab-slider">
          <span>Kecepatan B ({mode === 'susul' ? 'penyusul' : 'dari arah lawan'}): <strong>{safeVB} km/j</strong></span>
          <input type="range" min={mode === 'susul' ? vA + 10 : 30} max={120} step={5} value={safeVB} onInput={(e) => setVB(Number((e.target as HTMLInputElement).value))} />
        </label>
        {mode === 'papas' ? (
          <label className="lab-slider">
            <span>Jarak Kota P – Q: <strong>{jarak} km</strong></span>
            <input type="range" min={80} max={400} step={10} value={jarak} onInput={(e) => setJarak(Number((e.target as HTMLInputElement).value))} />
          </label>
        ) : (
          <label className="lab-slider">
            <span>A berangkat duluan: <strong>{selisihMenit} menit</strong></span>
            <input type="range" min={15} max={90} step={15} value={selisihMenit} onInput={(e) => setSelisihMenit(Number((e.target as HTMLInputElement).value))} />
          </label>
        )}
      </div>

      <div className="lab-road-scene">
        <div className="lab-road-track">
          <span className="lab-city start">Start A</span>
          <div className="lab-meet-pin" style={{ left: `${posisiTemuPct}%` }}>
            <span className="lab-meet-dot">★</span>
            <span className="lab-meet-tag">Ketemu!</span>
          </div>
          {mode === 'papas' && <span className="lab-city end">Start B</span>}
        </div>
      </div>

      <div className="lab-takeaway">
        {mode === 'susul' ? (
          <RichText
            text={`1) A sudah duluan ==${jarakDuluan.toFixed(0)} km== (${vA} × ${selisihMenit}/60 jam). 2) Selisih ngebut B = ==${safeVB - vA} km/jam==. 3) Waktu susul = \`${jarakDuluan.toFixed(0)} ÷ ${safeVB - vA}\` = ==${formatJam(tTemu)}== __dihitung dari jam berangkat B__ (~~bukan jam berangkat A~~!).`}
          />
        ) : (
          <RichText
            text={`Karena berangkat berhadapan, kecepatan bekerja sama (**ditambah**): \`${vA} + ${safeVB} = ${vA + safeVB} km/jam\`. Waktu temu = \`${jarak} ÷ ${vA + safeVB}\` = ==${formatJam(tTemu)}== sejak berangkat!`}
          />
        )}
      </div>
    </div>
  );
}

/* 3. VISUAL DIAGRAM VENN SILOGISME */
const VENN_CASES = [
  {
    id: 'semua-sebagian',
    label: 'Semua + Sebagian',
    p1: 'Semua ASN memakai seragam Korpri.',
    p2: 'Sebagian ASN bertugas di daerah 3T.',
    valid: '==Sebagian== yang bertugas di daerah 3T memakai seragam Korpri.',
    trap: '~~Semua yang bertugas di daerah 3T memakai seragam Korpri.~~ (Premis 2 pakai Sebagian!)',
    kind: 'intersect',
  },
  {
    id: 'tollens',
    label: 'Modus Tollens (Ingkaran)',
    p1: 'Jika nilai melewati PG, peserta lanjut SKB.',
    p2: 'Budi __tidak__ lanjut ke tahap SKB.',
    valid: 'Budi ==tidak== melewati nilai PG.',
    trap: '~~Jika tidak lulus PG maka pasti gagal SKB selamanya.~~ (Melampaui premis!)',
    kind: 'nested',
  },
  {
    id: 'negasi',
    label: 'Negasi "Semua" & "Jika→Maka"',
    p1: 'Negasi kalimat: "Semua peserta rajin belajar."',
    p2: 'Aturan: lawan "Semua P" adalah "Ada/Sebagian TIDAK P".',
    valid: '==Ada / Sebagian== peserta __tidak__ rajin belajar.',
    trap: '~~Semua peserta tidak rajin belajar.~~ (Terlalu ekstrem — cukup 1 yang malas sudah mematahkan "Semua"!)',
    kind: 'negate',
  },
];

function SilogismeVennVisual() {
  const [idx, setIdx] = useState(0);
  const c = VENN_CASES[idx];

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · Diagram Logika</span>
        <h4>Radar Lingkaran Silogisme</h4>
      </div>

      <div className="lab-preset-pills">
        {VENN_CASES.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`chip-btn ${i === idx ? 'is-active' : ''}`}
            onClick={() => setIdx(i)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="lab-venn-stage">
        <svg viewBox="0 0 340 130" className="lab-venn-svg" role="img" aria-label="Diagram Venn Logika">
          {c.kind === 'intersect' && (
            <>
              <circle cx="115" cy="65" r="48" className="venn-a" />
              <circle cx="215" cy="65" r="48" className="venn-b" />
              <text x="72" y="65" className="venn-lbl">Seragam A</text>
              <text x="232" y="65" className="venn-lbl">Tugas 3T</text>
              <text x="165" y="69" className="venn-hit">Irisan</text>
            </>
          )}
          {c.kind === 'nested' && (
            <>
              <circle cx="170" cy="65" r="54" className="venn-b" />
              <circle cx="170" cy="68" r="32" className="venn-a" />
              <text x="170" y="32" className="venn-lbl">Lanjut SKB (Q)</text>
              <text x="170" y="72" className="venn-hit">Lulus PG (P)</text>
              <circle cx="275" cy="65" r="10" className="venn-out" />
              <text x="275" y="92" className="venn-lbl">Di luar = ~Q → ~P</text>
            </>
          )}
          {c.kind === 'negate' && (
            <>
              <rect x="42" y="20" width="256" height="90" rx="18" className="venn-b" />
              <circle cx="135" cy="65" r="36" className="venn-a" />
              <circle cx="242" cy="65" r="14" className="venn-out" />
              <text x="135" y="68" className="venn-hit">Rajin</text>
              <text x="242" y="94" className="venn-lbl">Min. 1 Tidak</text>
            </>
          )}
        </svg>

        <div className="lab-venn-copy">
          <p><RichText text={`**Premis 1:** ${c.p1}`} inline /></p>
          <p><RichText text={`**Premis 2:** ${c.p2}`} inline /></p>
          <div className="lab-takeaway">
            <RichText text={`**Kesimpulan Sah:** ${c.valid}`} />
            <br />
            <RichText text={`**Waspada Jebakan:** ${c.trap}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* 4. VISUAL KOTAK 100 DISKON BERTINGKAT */
function PersenTangkiVisual() {
  const [d1, setD1] = useState(50);
  const [d2, setD2] = useState(20);

  const res = calcPerubahanPersenBertingkat(100, [-d1, -d2]);
  const diskonAsli = Math.round(Math.abs(res.perubahanTotalPersen));
  const sisaBayar = Math.round(res.nilaiAkhir);
  const mitosSalah = d1 + d2;

  const cells = Array.from({ length: 100 }, (_, i) => {
    if (i < d1) return 'cut-1';
    if (i < diskonAsli) return 'cut-2';
    return 'keep';
  });

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · Anti-Jebakan Persen</span>
        <h4>Kotak 100 Petak Diskon Bertingkat ({d1}% + {d2}%)</h4>
      </div>

      <div className="lab-sliders-grid">
        <label className="lab-slider">
          <span>Diskon pertama: <strong>{d1}%</strong></span>
          <input type="range" min={10} max={70} step={10} value={d1} onInput={(e) => setD1(Number((e.target as HTMLInputElement).value))} />
        </label>
        <label className="lab-slider">
          <span>Diskon kedua (dari sisa!): <strong>{d2}%</strong></span>
          <input type="range" min={10} max={50} step={10} value={d2} onInput={(e) => setD2(Number((e.target as HTMLInputElement).value))} />
        </label>
      </div>

      <div className="lab-grid100-wrap">
        <div className="lab-grid100" aria-label="Grid 100 petak persen">
          {cells.map((cls, i) => (
            <span key={i} className={`g100-cell ${cls}`} />
          ))}
        </div>
        <div className="lab-grid-legend">
          <span><i className="g100-dot cut-1" /> Dipotong diskon 1 ({d1} petak)</span>
          <span><i className="g100-dot cut-2" /> Dipotong {d2}% dari <strong>sisa {100 - d1}</strong> ({diskonAsli - d1} petak)</span>
          <span><i className="g100-dot keep" /> <RichText text={`Sisa yang benar-benar dibayar (==${sisaBayar}%==)`} inline /></span>
          <div className="lab-takeaway">
            <RichText
              text={`Diskon total = ==${diskonAsli}%== (~~bukan {mitosSalah}%~~). Rumus kilat: \`${100 - d1}% × ${100 - d2}% = ${sisaBayar}%\` sisa bayar!`.replace('{mitosSalah}', String(mitosSalah))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* 5. VISUAL PEMINDAI DERET 3 LAPIS */
function DeretScannerVisual() {
  const [step, setStep] = useState<1 | 2 | 3>(2);
  const seq = [3, 10, 6, 20, 12, 40, 24];

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-bumn">Visual Interaktif · Scanner Pola 3 Detik</span>
        <h4>Cara Melihat 2 Jalur Tersembunyi di Deret Angka</h4>
      </div>

      <div className="lab-preset-pills">
        <button type="button" className={`chip-btn ${step === 1 ? 'is-active' : ''}`} onClick={() => setStep(1)}>
          1. Uji Tetangga (+ / −)
        </button>
        <button type="button" className={`chip-btn ${step === 2 ? 'is-active' : ''}`} onClick={() => setStep(2)}>
          2. Pisah Lompat-1 (Ketemu!)
        </button>
        <button type="button" className={`chip-btn ${step === 3 ? 'is-active' : ''}`} onClick={() => setStep(3)}>
          3. Prediksi Lanjutan
        </button>
      </div>

      <div className="lab-seq-row">
        {seq.map((num, idx) => {
          const isOdd = idx % 2 === 0;
          const isTarget = idx === seq.length - 1;
          return (
            <div
              key={idx}
              className={`lab-seq-node ${step >= 2 ? (isOdd ? 'is-lane-a' : 'is-lane-b') : ''} ${isTarget && step < 3 ? 'is-hidden-next' : ''}`}
            >
              <strong>{isTarget && step < 3 ? '?' : num}</strong>
              {step >= 2 && <small>{isOdd ? 'Jalur A (×2)' : 'Jalur B (×2)'}</small>}
            </div>
          );
        })}
      </div>

      <div className="lab-takeaway">
        {step === 1 && (
          <RichText text="Jika cek tetangga langsung (`+7, −4, +14, −8...`), polanya terasa ~~kacau tidak beraturan~~. Jangan panik—langsung masuk **Langkah 2**!" />
        )}
        {step === 2 && (
          <RichText text="==Aha!== Ketika warna jalur **Ganjil (3, 6, 12)** dipisah dari jalur **Genap (10, 20, 40)**, ternyata masing-masing cukup dikali `×2`!" />
        )}
        {step === 3 && (
          <RichText text="Karena tanda `?` duduk di **Jalur A (posisi ganjil ke-7)** setelah angka `12`, hasilnya langsung `12 × 2` = ==24== dalam 3 detik!" />
        )}
      </div>
    </div>
  );
}

/* 6. VISUAL FILTER POIN 5 vs JEBAKAN (TKP & AKHLAK) */
const BEHAVIOR_SCENARIOS = [
  {
    pillar: 'Pelayanan Publik / Amanah',
    cue: 'Antrean membludak & ada lansia kebingungan aplikasi',
    good: '==Menenangkan antrean, memandu langsung pengisian, atau mengarahkan ke meja bantu tanpa melompati giliran==',
    bad: '~~"Ibu baca saja petunjuk di dinding ya"~~ atau ~~mendahulukan kenalan supaya cepat~~',
  },
  {
    pillar: 'TIK / Adaptif',
    cue: 'Kantor menerapkan aplikasi baru & rekan senior gagap teknologi',
    good: '==Mempelajari sistem lebih dulu, membuat panduan ringkas, lalu mendampingi rekan belajar bersama==',
    bad: '~~Mengusulkan kembali ke cara manual kertas~~ atau ~~mengerjakan akun teman dengan password pribadinya~~',
  },
  {
    pillar: 'Jejaring / Kolaboratif',
    cue: 'Dua divisi saling menyalahkan saat target laporan meleset',
    good: '==Memfasilitasi rapat evaluasi objektif tanpa menyalahkan, membagi ulang tugas sesuai keahlian==',
    bad: '~~Diam menghindar karena bukan tanggung jawab unit saya~~ atau ~~mengerjakan semuanya sendirian diam-diam~~',
  },
  {
    pillar: 'Anti-Radikalisme / Harmonis',
    cue: 'Beredar pesan grup berisi ujaran intoleran dan hoaks provokatif',
    good: '==Meluruskan fakta dengan santun, menolak penyebaran hoaks, dan melapor lewat saluran resmi bila berlanjut==',
    bad: '~~Ikut memaki di grup~~ atau ~~acuh tak acuh demi menghindari keributan~~',
  },
];

function TkpAkhlakRadarVisual() {
  const [idx, setIdx] = useState(0);
  const item = BEHAVIOR_SCENARIOS[idx];

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · Filter Poin 5</span>
        <h4>Kompas Penentu Opsi Poin 5 (TKP &amp; AKHLAK)</h4>
      </div>

      <div className="lab-preset-pills">
        {BEHAVIOR_SCENARIOS.map((b, i) => (
          <button
            key={b.pillar}
            type="button"
            className={`chip-btn ${i === idx ? 'is-active' : ''}`}
            onClick={() => setIdx(i)}
          >
            {b.pillar}
          </button>
        ))}
      </div>

      <div className="lab-radar-compare">
        <div className="lab-radar-cue">
          <span>Situasi Uji:</span> <strong>{item.cue}</strong>
        </div>
        <div className="lab-radar-cols">
          <div className="lab-radar-box is-good">
            <span className="badge badge-pass">Poin 5 · Pilih Pola Ini</span>
            <p><RichText text={item.good} /></p>
          </div>
          <div className="lab-radar-box is-bad">
            <span className="badge badge-fail">Poin 1–3 · Coret Ini</span>
            <p><RichText text={item.bad} /></p>
          </div>
        </div>
      </div>
    </div>
  );
}
