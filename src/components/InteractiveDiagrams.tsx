import { useEffect, useState } from 'preact/hooks';
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
  submateriId?: string;
}

export default function InteractiveDiagram({ diagramId, submateriId }: Props) {
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
      return <TkpAkhlakRadarVisual submateriId={submateriId} />;
    case 'integritas-detektor':
      return <IntegritasDetektorVisual />;
    case 'pilar-lembaga':
      return <PilarLembagaVisual />;
    case 'kebangsaan-timeline':
      return <KebangsaanTimelineVisual submateriId={submateriId} />;
    case 'kalimat-efektif-xray':
      return <KalimatEfektifXrayVisual />;
    case 'analogi-jembatan':
      return <AnalogiJembatanVisual />;
    case 'analitis-slot':
      return <AnalitisSlotVisual />;
    case 'kuantitatif-uji3':
      return <KuantitatifUji3Visual />;
    case 'figural-transform':
      return <FiguralTransformVisual submateriId={submateriId} />;
    case 'tkd-verbal-filter':
      return <TkdVerbalFilterVisual />;
    case 'bumn-english-xray':
      return <BumnEnglishXrayVisual submateriId={submateriId} />;
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

/* 6. VISUAL FILTER POIN 5 vs JEBAKAN (TKP, AKHLAK & AGILITY) */
interface BehaviorScenario {
  id: string;
  pillar: string;
  cue: string;
  good: string;
  bad: string;
}

const BEHAVIOR_SCENARIOS: BehaviorScenario[] = [
  {
    id: 'cpns-tkp-pelayanan',
    pillar: 'Pelayanan Publik / Amanah',
    cue: 'Antrean membludak & ada lansia kebingungan aplikasi layanan',
    good: '==Menenangkan antrean, memandu langsung pengisian, atau mengarahkan ke meja bantu tanpa melompati giliran==',
    bad: '~~"Ibu baca saja petunjuk di dinding ya"~~ atau ~~mendahulukan kenalan supaya antrean cepat~~',
  },
  {
    id: 'cpns-tkp-jejaring',
    pillar: 'Jejaring Kerja / Kolaboratif',
    cue: 'Dua divisi saling menyalahkan saat target laporan lintas unit meleset',
    good: '==Memfasilitasi rapat evaluasi objektif tanpa menyalahkan, membagi ulang tugas sesuai keahlian==',
    bad: '~~Diam menghindar karena bukan tanggung jawab unit saya~~ atau ~~mengerjakan semuanya sendirian diam-diam~~',
  },
  {
    id: 'cpns-tkp-sosbud',
    pillar: 'Sosial Budaya',
    cue: 'Ditempatkan di daerah dengan bahasa dan adat kerja yang berbeda dari asal Anda',
    good: '==Aktif mengenal adat setempat, berbaur santun, tetap memegang etika kerja profesional dan netral==',
    bad: '~~Menutup diri di mess dan hanya mau bekerja dengan rekan sesama daerah~~',
  },
  {
    id: 'cpns-tkp-tik',
    pillar: 'TIK / Adaptif',
    cue: 'Kantor menerapkan aplikasi baru & rekan senior gagap teknologi',
    good: '==Mempelajari sistem lebih dulu, membuat panduan ringkas, lalu mendampingi rekan belajar bersama==',
    bad: '~~Mengusulkan kembali ke cara manual kertas~~ atau ~~meminta password akun pribadi teman untuk mengerjakannya~~',
  },
  {
    id: 'cpns-tkp-profesionalisme',
    pillar: 'Profesionalisme / Kompeten',
    cue: 'Diberi tugas mendadak di luar rutinitas saat jam kerja hampir berakhir',
    good: '==Memetakan prioritas, menyanggupi secara terukur sesuai SOP, dan menyelesaikannya tepat mutu==',
    bad: '~~Menolak mentah-mentah tanpa alasan~~ atau ~~mengerjakan asal jadi lalu menyalahkan waktu mepet~~',
  },
  {
    id: 'cpns-tkp-antiradikalisme',
    pillar: 'Anti-Radikalisme / Harmonis',
    cue: 'Beredar pesan grup berisi ujaran intoleran dan hoaks provokatif',
    good: '==Meluruskan fakta dengan santun, menolak penyebaran hoaks, dan melapor lewat saluran resmi bila berlanjut==',
    bad: '~~Ikut memaki di grup~~ atau ~~diam masa bodoh demi menghindari keributan~~',
  },
  {
    id: 'bumn-akhlak',
    pillar: 'AKHLAK BUMN (Loyal & Harmonis)',
    cue: 'Atasan meminta percepatan proyek padahal Anda melihat celah potensi pelanggaran kepatuhan',
    good: '==Menyampaikan risiko secara data-driven dan santun kepada atasan sambil mengusulkan opsi solusi yang patuh aturan==',
    bad: '~~Langsung menyetujui demi loyalitas buta~~ atau ~~membocorkan konflik internal ke media sosial~~',
  },
  {
    id: 'bumn-agility',
    pillar: 'Learning Agility',
    cue: 'Metode lama tidak lagi efektif mengejar target digital perusahaan',
    good: '==Menganalisis penyebab kegagalan, menguji pendekatan baru skala kecil, mengukur hasil, lalu membagikan pelajaran ke tim==',
    bad: '~~Nekat mengganti seluruh sistem sekaligus tanpa uji coba~~ atau ~~menunggu perintah tertulis baru mau berubah~~',
  },
];

function TkpAkhlakRadarVisual({ submateriId }: { submateriId?: string }) {
  const matchedIdx = BEHAVIOR_SCENARIOS.findIndex((b) => b.id === submateriId);
  const [idx, setIdx] = useState(matchedIdx >= 0 ? matchedIdx : 0);

  useEffect(() => {
    if (matchedIdx >= 0) setIdx(matchedIdx);
  }, [matchedIdx]);

  const item = BEHAVIOR_SCENARIOS[idx];

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · Filter Poin 5</span>
        <h4>Kompas Penentu Opsi Poin 5 (TKP, AKHLAK &amp; Agility)</h4>
      </div>

      <div className="lab-preset-pills">
        {BEHAVIOR_SCENARIOS.map((b, i) => (
          <button
            key={b.id}
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
            <div className="lab-rich-line"><RichText text={item.good} /></div>
          </div>
          <div className="lab-radar-box is-bad">
            <span className="badge badge-fail">Poin 1–3 · Coret Ini</span>
            <div className="lab-rich-line"><RichText text={item.bad} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 7. TWK INTEGRITAS & ANTIKORUPSI: DETEKTOR 4 DELIK + SKEMA WAKTU LAPOR GRATIFIKASI */
interface DelikCase {
  id: string;
  label: string;
  tag: string;
  scenario: string;
  initiator: string;
  element: string;
  verdict: string;
  ruleNote: string;
}

const INTEGRITAS_CASES: DelikCase[] = [
  {
    id: 'suap',
    label: 'Suap-Menyuap',
    tag: 'Kedua Pihak Kena Pidana',
    scenario: 'Kontraktor memberi amplop agar panitia tender meloloskan perusahaannya meski syarat kurang.',
    initiator: 'Ada **kesepakatan timbal balik** (*meeting of minds*) antara pemberi dan penerima.',
    element: 'Ada syarat menguntungkan pemberi yang melawan kewajiban jabatan.',
    verdict: '==Suap-Menyuap (Pasal 5 & 11 UU Tipikor)==',
    ruleNote: 'Sama-sama pidana seketika saat janji atau pemberian disepakati, meski nilai kecil.',
  },
  {
    id: 'gratifikasi',
    label: 'Gratifikasi (Lapor KPK)',
    tag: 'Batas 30 Hari Kerja',
    scenario: 'Vendor mengirimkan parsel lebaran bernilai mewah ke rumah pejabat setelah proyek selesai.',
    initiator: 'Berasal dari **pihak lain terkait jabatan**, tanpa kesepakatan syarat di depan.',
    element: 'Wajib ==lapor ke KPK maksimal 30 hari kerja== agar pidana penerima gugur.',
    verdict: '==Gratifikasi (Pasal 12B UU Tipikor)==',
    ruleNote: 'Jangan ditolak diam-diam saja jika terlanjur diterima lewat kurir—segera lapor UPG/KPK sebelum 30 hari kerja.',
  },
  {
    id: 'pemerasan',
    label: 'Pemerasan Jabatan',
    tag: 'Pejabat Memaksa',
    scenario: 'Oknum petugas menahan berkas izin usaha warga dan meminta uang "pelicin" agar berkas diproses.',
    initiator: '==Pejabat yang aktif meminta/memaksa== menyalahgunakan kekuasaan.',
    element: 'Warga memberi karena terpaksa takut haknya dipersulit.',
    verdict: '==Pemerasan dalam Jabatan (Pasal 12 huruf e)==',
    ruleNote: 'Posisi pemberi di sini adalah korban paksaan pejabat, berbeda dengan suap yang sama-sama mau.',
  },
  {
    id: 'benturan',
    label: 'Benturan Kepentingan',
    tag: 'Integritas & Netralitas',
    scenario: 'Anggota tim penguji mendapati adik kandungnya ikut seleksi jabatan di unit yang ia nilai.',
    initiator: 'Tidak harus ada uang berpindah—cukup adanya **hubungan pribadi vs tugas resmi**.',
    element: 'Wajib ==mengungkapkan (declare) & mengundurkan diri== dari posisi penilai.',
    verdict: '==Conflict of Interest (Wajib Mundur / Lapor Atasan)==',
    ruleNote: 'Klaim "saya akan menilai objektif" tetap salah dalam soal TWK Integritas—prosedurnya harus mundur dari tim penilai.',
  },
];

function IntegritasDetektorVisual() {
  const [idx, setIdx] = useState(0);
  const [laporHari, setLaporHari] = useState(14);
  const item = INTEGRITAS_CASES[idx];
  const onTime = laporHari <= 30;

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · TWK Integritas</span>
        <h4>Detektor 4 Kasus Integritas &amp; Batas Lapor Gratifikasi</h4>
      </div>

      <div className="lab-preset-pills">
        {INTEGRITAS_CASES.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={`chip-btn ${i === idx ? 'is-active' : ''}`}
            onClick={() => setIdx(i)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="lab-radar-cue">
        <span>Kasus:</span> <strong>{item.scenario}</strong>
      </div>

      <div className="lab-formula-strip">
        <div className="lab-step-box">
          <span className="muted">Ciri Pemicu</span>
          <RichText text={item.initiator} />
        </div>
        <div className="lab-step-box">
          <span className="muted">Pola Kunci</span>
          <RichText text={item.element} />
        </div>
        <div className="lab-step-box is-accent">
          <span className="muted">Klasifikasi Tepat</span>
          <RichText text={item.verdict} />
        </div>
      </div>

      <div className="lab-sliders-grid">
        <label className="lab-slider">
          <span>
            Simulasi Lapor Gratifikasi ke KPK: <strong>Hari kerja ke-{laporHari}</strong> (batas 30 hari kerja)
          </span>
          <input
            type="range"
            min={1}
            max={45}
            value={laporHari}
            onInput={(e) => setLaporHari(Number((e.target as HTMLInputElement).value))}
          />
        </label>
        <div className="lab-step-box">
          <span className="muted">Status Hukum Penerima</span>
          {onTime ? (
            <strong className="badge badge-pass">Aman — Pidana Gugur (≤ 30 Hari Kerja)</strong>
          ) : (
            <strong className="badge badge-fail">Terlambat (&gt; 30 Hari) — Masuk Delik Suap/Gratifikasi</strong>
          )}
        </div>
      </div>

      <div className="lab-takeaway">
        <RichText text={item.ruleNote} />
      </div>
    </div>
  );
}

/* 8. TWK PILAR NEGARA: KOMPAS 5 SILA & WEWENANG LEMBAGA UUD 1945 */
const SILA_CUES = [
  { sila: 'Sila 1 · Ketuhanan', cue: 'Toleransi antarumat beragama, menghormati hari raya & kebebasan ibadah tanpa memaksa.' },
  { sila: 'Sila 2 · Kemanusiaan', cue: 'Empati ke individu/korban bencana, anti-perundungan, memanusiakan sesama secara setara.' },
  { sila: 'Sila 3 · Persatuan', cue: 'Cinta produk lokal, Bhinneka Tunggal Ika, mendahulukan kepentingan bangsa di atas golongan.' },
  { sila: 'Sila 4 · Kerakyatan', cue: 'Musyawarah mufakat, legawa menerima keputusan rapat, ikut pemilu, tidak memaksakan kehendak.' },
  { sila: 'Sila 5 · Keadilan Sosial', cue: 'Antre tertib, menjaga fasilitas umum, tidak bergaya hidup mewah, keseimbangan hak & kewajiban.' },
];

const LEMBAGA_ROWS = [
  { id: 'mk', name: 'MK (Mahkamah Konstitusi)', tugas: 'Uji **UU terhadap UUD 1945**, sengketa pemilu, pembubaran parpol, memutus pemakzulan Presiden.' },
  { id: 'ma', name: 'MA (Mahkamah Agung)', tugas: 'Kasasi pengadilan & uji **peraturan di bawah UU** (PP, Perpres, Perda) terhadap UU.' },
  { id: 'ky', name: 'KY (Komisi Yudisial)', tugas: 'Mengusulkan calon hakim agung & menjaga kode etik/perilaku hakim (bukan memutus perkara).' },
  { id: 'bpk', name: 'BPK (Badan Pemeriksa Keuangan)', tugas: 'Memeriksa pengelolaan & tanggung jawab keuangan negara, hasilnya diserahkan ke DPR/DPD/DPRD.' },
];

function PilarLembagaVisual() {
  const [silaIdx, setSilaIdx] = useState(1);
  const [lembagaIdx, setLembagaIdx] = useState(0);

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · TWK Pilar Negara</span>
        <h4>Peta Cepat Sila 1–5 &amp; Wewenang Lembaga Tinggi</h4>
      </div>

      <div className="lab-preset-pills">
        {SILA_CUES.map((s, i) => (
          <button
            key={s.sila}
            type="button"
            className={`chip-btn ${i === silaIdx ? 'is-active' : ''}`}
            onClick={() => setSilaIdx(i)}
          >
            {s.sila}
          </button>
        ))}
      </div>

      <div className="lab-radar-cue">
        <span>Kata Kunci Soal:</span> <strong>{SILA_CUES[silaIdx].cue}</strong>
      </div>

      <div className="lab-preset-pills">
        {LEMBAGA_ROWS.map((l, i) => (
          <button
            key={l.id}
            type="button"
            className={`chip-btn ${i === lembagaIdx ? 'is-active' : ''}`}
            onClick={() => setLembagaIdx(i)}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="lab-takeaway">
        <RichText text={`**${LEMBAGA_ROWS[lembagaIdx].name}:** ${LEMBAGA_ROWS[lembagaIdx].tugas}`} />
      </div>
    </div>
  );
}

/* 9. TWK NASIONALISME, BELA NEGARA & TWK BUMN: PETA KONSEP KONTEKSTUAL */
const KEBANGSAAN_MODES = [
  {
    id: 'nasionalisme',
    title: 'Nasionalisme (1908–1945 & Wawasan Nusantara)',
    cards: [
      { k: '1908 · Budi Utomo', v: 'Tonggak ==Kebangkitan Nasional== pertama berbentuk organisasi modern (Soetomo & Wahidin).' },
      { k: '1928 · Sumpah Pemuda', v: 'Mengubah perjuangan kedaerahan menjadi **satu nusa, satu bangsa, satu bahasa**.' },
      { k: 'Batas Sehat', v: '**Patriotisme ≠ Chauvinisme**. Cinta tanah air tidak boleh merendahkan bangsa/suku lain.' },
    ],
    tip: 'Jika ada 2 opsi sama-sama cinta tanah air, pilih yang **terbuka merangkul keberagaman & bebas fanatisme sempit**.',
  },
  {
    id: 'bela-negara',
    title: 'Bela Negara (UU No. 23/2019 PSDN)',
    cards: [
      { k: 'Komponen Utama', v: '**TNI** siap menghadapi ancaman militer secara langsung.' },
      { k: 'Komponen Cadangan', v: '**Komcad** — warga sipil/ASN/mahasiswa sukarela yang dilatih militer untuk memperbesar TNI saat darurat.' },
      { k: 'Komponen Pendukung', v: '**Polri, ASN, profesi sipil, linmas, & infrastruktur nasional** lewat pengabdian sesuai profesi.' },
    ],
    tip: 'Mayoritas soal Bela Negara menguji aksi sipil modern: ==membayar pajak patuh, menyaring hoaks, dan melestarikan budaya==.',
  },
  {
    id: 'bumn-pasal33',
    title: 'TWK BUMN (Pasal 33 UUD 1945 & Agen Pembangunan)',
    cards: [
      { k: 'Ayat (2) & (3)', v: 'Cabang produksi penting & kekayaan alam **dikuasai negara** untuk ==sebesar-besar kemakmuran rakyat==.' },
      { k: 'Fungsi Ganda BUMN', v: '**Pencari Laba (Dividen/Pajak)** + **Agen Pembangunan (PSO/Pemerataan 3T)** — keduanya wajib seimbang.' },
      { k: 'Hilirisasi', v: 'Mengolah bahan mentah di dalam negeri agar **nilai tambah & lapangan kerja** tinggal di Indonesia.' },
    ],
    tip: 'Dalam soal studi kasus BUMN, tolak opsi yang ~~hanya mengejar profit sambil mematikan layanan publik terpencil~~.',
  },
];

function KebangsaanTimelineVisual({ submateriId }: { submateriId?: string }) {
  const initialMode =
    submateriId === 'cpns-twk-bela-negara' ? 1 : submateriId === 'bumn-twk' ? 2 : 0;
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const current = KEBANGSAAN_MODES[mode];

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · Wawasan Kebangsaan</span>
        <h4>{current.title}</h4>
      </div>

      <div className="lab-preset-pills">
        <button type="button" className={`chip-btn ${mode === 0 ? 'is-active' : ''}`} onClick={() => setMode(0)}>
          Nasionalisme 1908–1928
        </button>
        <button type="button" className={`chip-btn ${mode === 1 ? 'is-active' : ''}`} onClick={() => setMode(1)}>
          3 Komponen Bela Negara
        </button>
        <button type="button" className={`chip-btn ${mode === 2 ? 'is-active' : ''}`} onClick={() => setMode(2)}>
          Pasal 33 &amp; Peran BUMN
        </button>
      </div>

      <div className="lab-formula-strip">
        {current.cards.map((c) => (
          <div key={c.k} className="lab-step-box">
            <strong>{c.k}</strong>
            <RichText text={c.v} />
          </div>
        ))}
      </div>

      <div className="lab-takeaway">
        <RichText text={current.tip} />
      </div>
    </div>
  );
}

/* 10. TWK BAHASA INDONESIA: X-RAY KALIMAT EFEKTIF & EYD */
const KALIMAT_SAMPLES = [
  {
    title: 'Jebakan Preposisi di Awal Subjek',
    tokens: [
      { word: 'Bagi', role: 'redundant', note: 'Hapus! Preposisi di depan subjek membuat kalimat kehilangan Subjek.' },
      { word: 'seluruh peserta', role: 'keep', note: 'Berfungsi sebagai Subjek inti.' },
      { word: 'harap', role: 'keep', note: 'Predikat ajakan.' },
      { word: 'membawa', role: 'keep', note: 'Predikat tindakan.' },
      { word: 'kartu ujian.', role: 'keep', note: 'Objek.' },
    ],
    fixed: '==Seluruh peserta== harap membawa kartu ujian.',
  },
  {
    title: 'Jebakan Pleonasme (Kata Mubazir)',
    tokens: [
      { word: 'Para', role: 'redundant', note: 'Jamak pertama — bentrok dengan pengulangan kata di sebelahnya.' },
      { word: 'hadirin-hadirin', role: 'redundant', note: '"Hadirin" sudah berarti jamak! Cukup "Hadirin" saja.' },
      { word: 'sekalian', role: 'redundant', note: 'Mubazir jika "para" atau ulang sudah dipakai.' },
      { word: 'dimohon berdiri', role: 'keep', note: 'Predikat utama yang efektif.' },
      { word: 'sejenak.', role: 'keep', note: 'Keterangan.' },
    ],
    fixed: '==Hadirin== dimohon berdiri sejenak.',
  },
];

function KalimatEfektifXrayVisual() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [xrayOn, setXrayOn] = useState(true);
  const sample = KALIMAT_SAMPLES[sampleIdx];

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · X-Ray PUEBI / EYD V</span>
        <h4>{sample.title}</h4>
      </div>

      <div className="lab-preset-pills">
        {KALIMAT_SAMPLES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            className={`chip-btn ${i === sampleIdx ? 'is-active' : ''}`}
            onClick={() => setSampleIdx(i)}
          >
            Contoh {i + 1}
          </button>
        ))}
        <button
          type="button"
          className={`chip-btn ${xrayOn ? 'is-active' : ''}`}
          onClick={() => setXrayOn((v) => !v)}
        >
          {xrayOn ? 'Mode X-Ray: Coret Mubazir ON' : 'Tampilkan Kalimat Mentah'}
        </button>
      </div>

      <div className="lab-xray-line">
        {sample.tokens.map((t, idx) => {
          const isCut = xrayOn && t.role === 'redundant';
          return (
            <span
              key={idx}
              className={`lab-xray-token ${isCut ? 'is-cut' : 'is-ok'}`}
              title={t.note}
            >
              {t.word}
            </span>
          );
        })}
      </div>

      <div className="lab-takeaway">
        <RichText text={`**Hasil Kalimat Efektif:** ${sample.fixed} (Aturan baku KBBI: \`analisis\`, \`risiko\`, \`izin\`, \`kualitas\`, \`praktik\`).`} />
      </div>
    </div>
  );
}

/* 11. TIU ANALOGI: PENYUSUN JEMBATAN KATA 1 ARAH */
const ANALOGI_PAIRS = [
  {
    a: 'Kompas',
    b: 'Arah',
    bridge: 'digunakan untuk menentukan',
    good: 'Termometer : Suhu',
    reversedTrap: 'Waktu : Jam (terbalik arah!)',
    topicTrap: 'Utara : Selatan (satu tema, bukan hubungan alat → objek)',
  },
  {
    a: 'Koki',
    b: 'Restoran',
    bridge: 'bekerja secara utama di',
    good: 'Hakim : Pengadilan',
    reversedTrap: 'Rumah Sakit : Perawat (terbalik tempat → profesi!)',
    topicTrap: 'Sendok : Garpu (topik dapur tapi bukan hubungan profesi → tempat)',
  },
  {
    a: 'Haus',
    b: 'Minum',
    bridge: 'diatasi atau dipenuhi dengan',
    good: 'Gelap : Lampu',
    reversedTrap: 'Tidur : Mengantuk (terbalik solusi → kondisi!)',
    topicTrap: 'Lapar : Kenyang (hubungan antonim, bukan butuh solusi)',
  },
];

function AnalogiJembatanVisual() {
  const [idx, setIdx] = useState(0);
  const [reverseTest, setReverseTest] = useState(false);
  const p = ANALOGI_PAIRS[idx];

  const leftWord = reverseTest ? p.b : p.a;
  const rightWord = reverseTest ? p.a : p.b;

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · TIU Analogi</span>
        <h4>Uji Kalimat Jembatan 1 Arah (Anti-Terbalik)</h4>
      </div>

      <div className="lab-preset-pills">
        {ANALOGI_PAIRS.map((item, i) => (
          <button
            key={item.a}
            type="button"
            className={`chip-btn ${i === idx ? 'is-active' : ''}`}
            onClick={() => {
              setIdx(i);
              setReverseTest(false);
            }}
          >
            {item.a} : {item.b}
          </button>
        ))}
        <button
          type="button"
          className={`chip-btn ${reverseTest ? 'is-active' : ''}`}
          onClick={() => setReverseTest((r) => !r)}
        >
          {reverseTest ? 'Arah Dibalik (B → A)' : 'Balik Arah untuk Tes Jebakan'}
        </button>
      </div>

      <div className="lab-radar-cue">
        <strong>[{leftWord}]</strong> <span>{p.bridge}</span> <strong>[{rightWord}]</strong>{' '}
        {reverseTest ? (
          <span className="badge badge-fail">SALAH ARAH — Makna Jadi Aneh!</span>
        ) : (
          <span className="badge badge-pass">ARAH BENAR (Kiri → Kanan)</span>
        )}
      </div>

      <div className="lab-radar-cols">
        <div className="lab-radar-box is-good">
          <span className="badge badge-pass">Padanan Sah</span>
          <div><RichText text={`==${p.good}== (arah kiri → kanan persis sama)`} /></div>
        </div>
        <div className="lab-radar-box is-bad">
          <span className="badge badge-fail">2 Jebakan Umum</span>
          <div><RichText text={`1) ~~${p.reversedTrap}~~ · 2) ~~${p.topicTrap}~~`} /></div>
        </div>
      </div>
    </div>
  );
}

/* 12. TIU ANALITIS: SIMULATOR SLOT KURSI BERURUTAN */
const SLOT_STEPS = [
  {
    rule: 'Kondisi Awal (Baca Syarat Paling Kaku Dulu)',
    slots: ['_', '_', '_', '_', '_'],
    note: 'Tersedia 5 kursi rapat (1..5) untuk **Andi, Budi, Cici, Dodi, Eka**.',
  },
  {
    rule: 'Kunci #1: "Andi duduk di ujung paling kiri (Kursi 1)"',
    slots: ['Andi', '_', '_', '_', '_'],
    note: 'Langsung kunci ==Andi → Kursi 1== sebagai jangkar mati.',
  },
  {
    rule: 'Kunci #2: "Dodi selalu tepat di sebelah kanan Budi, di Kursi 4"',
    slots: ['Andi', '_', 'Budi', 'Dodi', '_'],
    note: 'Jika Dodi = 4 dan tepat kanan Budi, otomatis ==Budi = 3== dan ==Dodi = 4==!',
  },
  {
    rule: 'Kunci #3: "Cici tidak boleh di sebelah Andi"',
    slots: ['Andi', 'Eka', 'Budi', 'Dodi', 'Cici'],
    note: 'Kursi sisa tinggal 2 & 5. Karena Kursi 2 menempel Andi, ==Cici wajib ke 5== dan ==Eka masuk Kursi 2==!',
  },
];

function AnalitisSlotVisual() {
  const [step, setStep] = useState(0);
  const cur = SLOT_STEPS[step];

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · Penalaran Analitis</span>
        <h4>Papan Slot Kursi 1–5 (Kunci Syarat Paling Pasti)</h4>
      </div>

      <div className="lab-preset-pills">
        {SLOT_STEPS.map((s, i) => (
          <button
            key={s.rule}
            type="button"
            className={`chip-btn ${i === step ? 'is-active' : ''}`}
            onClick={() => setStep(i)}
          >
            Tahap {i}
          </button>
        ))}
      </div>

      <div className="lab-slot-row">
        {cur.slots.map((name, idx) => (
          <div key={idx} className={`lab-slot-seat ${name === '_' ? 'is-empty' : 'is-filled'}`}>
            <small>Kursi {idx + 1}</small>
            <strong>{name}</strong>
          </div>
        ))}
      </div>

      <div className="lab-takeaway">
        <RichText text={`**${cur.rule}:** ${cur.note}`} />
      </div>
    </div>
  );
}

/* 13. TIU KUANTITATIF P vs Q: TESTER 3 WILAYAH BILANGAN */
function KuantitatifUji3Visual() {
  const [xVal, setXVal] = useState<number>(0.5);
  const presets = [-2, -0.5, 0, 0.5, 2];

  // Contoh klasik: Diketahui x < 2 (tanpa syarat x > 0), bandingkan P = x^2 vs Q = x
  const pVal = Number((xVal * xVal).toFixed(2));
  const qVal = Number(xVal.toFixed(2));
  const cmp = pVal > qVal ? 'P > Q' : pVal < qVal ? 'P < Q' : 'P = Q';

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · TIU Kuantitatif (P vs Q)</span>
        <h4>Uji 3 Wilayah Bilangan: Negatif · Pecahan · Positif</h4>
      </div>

      <div className="lab-radar-cue">
        <span>Soal Klasik:</span>{' '}
        <strong>
          <RichText text="Diketahui `x` bilangan real. Bandingkan `P = x²` vs `Q = x`." inline />
        </strong>
      </div>

      <div className="lab-preset-pills">
        {presets.map((v) => (
          <button
            key={v}
            type="button"
            className={`chip-btn ${xVal === v ? 'is-active' : ''}`}
            onClick={() => setXVal(v)}
          >
            Uji x = {v}
          </button>
        ))}
      </div>

      <div className="lab-formula-strip">
        <div className="lab-step-box">
          <span className="muted"><RichText text="Nilai `P = x²`" inline /></span>
          <strong className="num">{pVal}</strong>
        </div>
        <div className="lab-step-box">
          <span className="muted"><RichText text="Nilai `Q = x`" inline /></span>
          <strong className="num">{qVal}</strong>
        </div>
        <div className="lab-step-box is-accent">
          <span className="muted">Hasil Uji di x = {xVal}</span>
          <strong className="num">{cmp}</strong>
        </div>
      </div>

      <div className="lab-takeaway">
        <RichText text="Saat `x = 2`, **P > Q** (4 > 2). Tapi begitu dicoba pecahan `x = 0.5`, hasilnya berbalik menjadi **P < Q** (0.25 < 0.5)! Karena hasil berubah-ubah, jawaban yang benar adalah ==Tidak dapat ditentukan (E / D)==." />
      </div>
    </div>
  );
}

/* 14. TIU FIGURAL & BUMN DIAGRAM: SIMULATOR ROTASI + INVERT WARNA + CERMIN */
function FiguralTransformVisual({ submateriId }: { submateriId?: string }) {
  const [rotDeg, setRotDeg] = useState<number>(submateriId === 'cpns-tiu-figural-seri' ? 90 : 0);
  const [flipX, setFlipX] = useState<boolean>(submateriId === 'cpns-tiu-figural-beda');
  const [invertColor, setInvertColor] = useState<boolean>(submateriId === 'bumn-tkd-diagram');

  useEffect(() => {
    setRotDeg(submateriId === 'cpns-tiu-figural-seri' ? 90 : 0);
    setFlipX(submateriId === 'cpns-tiu-figural-beda');
    setInvertColor(submateriId === 'bumn-tkd-diagram');
  }, [submateriId]);

  const shapeTransform = `translate(50 50) scale(${flipX ? -1 : 1}, 1) rotate(${rotDeg}) translate(-50 -50)`;
  const mainFill = invertColor ? '#f1f5f9' : '#1b2a3d';
  const dotFill = invertColor ? '#1b2a3d' : '#f59e0b';

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-cpns">Visual Interaktif · Figural &amp; Diagram BUMN</span>
        <h4>Lab Transformasi Bentuk (Rotasi · Cermin · Tukar Warna)</h4>
      </div>

      <div className="lab-preset-pills">
        <button type="button" className="chip-btn" onClick={() => setRotDeg((d) => (d + 90) % 360)}>
          Putar +90° Searah Jarum Jam ({rotDeg}°)
        </button>
        <button
          type="button"
          className={`chip-btn ${flipX ? 'is-active' : ''}`}
          onClick={() => setFlipX((f) => !f)}
        >
          {flipX ? 'Cermin Horizontal (ON — Berbeda Kiri-Kanan)' : 'Cermin Horizontal (OFF)'}
        </button>
        <button
          type="button"
          className={`chip-btn ${invertColor ? 'is-active' : ''}`}
          onClick={() => setInvertColor((v) => !v)}
        >
          {invertColor ? 'Tukar Warna (Invert ON)' : 'Tukar Warna (OFF)'}
        </button>
        <button
          type="button"
          className="chip-btn"
          onClick={() => {
            setRotDeg(0);
            setFlipX(false);
            setInvertColor(false);
          }}
        >
          Reset Awal
        </button>
      </div>

      <div className="lab-figural-stage">
        <div className="lab-figural-box">
          <small className="muted">Bentuk Asal</small>
          <svg viewBox="0 0 100 100" className="lab-figural-svg">
            <rect x="6" y="6" width="88" height="88" rx="14" fill="none" stroke="currentColor" strokeOpacity="0.2" />
            <path d="M26 22 H44 V62 H74 V78 H26 Z" fill="#1b2a3d" />
            <circle cx="68" cy="30" r="9" fill="#f59e0b" />
          </svg>
        </div>
        <div className="lab-figural-arrow">→</div>
        <div className="lab-figural-box">
          <small className="muted">Hasil Operator</small>
          <svg viewBox="0 0 100 100" className="lab-figural-svg">
            <rect x="6" y="6" width="88" height="88" rx="14" fill="none" stroke="currentColor" strokeOpacity="0.2" />
            <g transform={shapeTransform}>
              <path d="M26 22 H44 V62 H74 V78 H26 Z" fill={mainFill} stroke="#1b2a3d" strokeWidth="2.5" />
              <circle cx="68" cy="30" r="9" fill={dotFill} stroke="#1b2a3d" strokeWidth="2" />
            </g>
          </svg>
        </div>
      </div>

      <div className="lab-takeaway">
        <RichText text="Putaran 90°/180° tetap mempertahankan arah tangan kiri-kanan gambar (masih identik untuk **Ketidaksamaan**). Begitu tombol **Cermin** aktif, arah huruf L berbalik permanen—tidak mungkin sama meski diputar bagaimanapun!" />
      </div>
    </div>
  );
}

/* 15. BUMN TKD VERBAL & WORD CLASSIFICATION: FILTER TRUE / FALSE / CANNOT SAY */
const TKD_STATEMENTS = [
  {
    text: 'PT X mewajibkan seluruh pegawai divisi operasional mengenakan helm pengaman di area gudang.',
    verdict: 'Benar (True)',
    badge: 'badge-pass',
    reason: 'Tertulis eksplisit di paragraf bahwa pegawai divisi operasional wajib berhelm di area gudang.',
  },
  {
    text: 'Pegawai divisi keuangan juga diwajibkan memakai helm setiap jam istirahat.',
    verdict: 'Tidak Dapat Disimpulkan (Cannot Say)',
    badge: 'badge-fail',
    reason: 'Premis **tidak menyinggung** divisi keuangan maupun aturan saat jam istirahat—jangan menebak dengan akal sehat!',
  },
  {
    text: 'Tamu gudang dilarang masuk tanpa izin kepala logistik.',
    verdict: 'Salah / Kontradiksi jika teks menyebut bebas masuk, atau Cannot Say jika tak dibahas.',
    badge: 'badge-fail',
    reason: 'Kunci BUMN TKD Verbal: cocokkan kata per kata hanya pada **teks yang tertera**.',
  },
];

function TkdVerbalFilterVisual() {
  const [idx, setIdx] = useState(0);
  const item = TKD_STATEMENTS[idx];

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-bumn">Visual Interaktif · TKD Verbal BUMN</span>
        <h4>Uji Bukti Teks: True · False · Cannot Say</h4>
      </div>

      <div className="lab-radar-cue">
        <span>Premis Teks:</span>{' '}
        <strong>
          "Di area gudang logistik, seluruh pegawai divisi operasional wajib mengenakan helm pengaman selama jam kerja."
        </strong>
      </div>

      <div className="lab-preset-pills">
        {TKD_STATEMENTS.map((s, i) => (
          <button
            key={i}
            type="button"
            className={`chip-btn ${i === idx ? 'is-active' : ''}`}
            onClick={() => setIdx(i)}
          >
            Pernyataan #{i + 1}
          </button>
        ))}
      </div>

      <div className="lab-step-box">
        <strong>"{item.text}"</strong>
        <span className={`badge ${item.badge}`}>{item.verdict}</span>
        <RichText text={item.reason} />
      </div>
    </div>
  );
}

/* 16. BUMN ENGLISH GRAMMAR & READING: X-RAY SUBJEK SEBENARNYA & SCANNER IDE POKOK */
function BumnEnglishXrayVisual({ submateriId }: { submateriId?: string }) {
  const [mode, setMode] = useState<'grammar' | 'reading'>(
    submateriId === 'bumn-bhs-reading' ? 'reading' : 'grammar',
  );
  const [hidePreposition, setHidePreposition] = useState(true);

  useEffect(() => {
    setMode(submateriId === 'bumn-bhs-reading' ? 'reading' : 'grammar');
  }, [submateriId]);

  return (
    <div className="visual-lab-card">
      <div className="visual-lab-head">
        <span className="pill pill-bumn">Visual Interaktif · RBB English</span>
        <h4>X-Ray Subject–Verb &amp; Main Idea Scanner</h4>
      </div>

      <div className="lab-preset-pills">
        <button
          type="button"
          className={`chip-btn ${mode === 'grammar' ? 'is-active' : ''}`}
          onClick={() => setMode('grammar')}
        >
          Grammar: Coret Frasa Preposisi
        </button>
        <button
          type="button"
          className={`chip-btn ${mode === 'reading' ? 'is-active' : ''}`}
          onClick={() => setMode('reading')}
        >
          Reading: Filter Main Idea vs Detail
        </button>
      </div>

      {mode === 'grammar' ? (
        <div className="lab-radar-compare">
          <div className="lab-preset-pills">
            <button
              type="button"
              className={`chip-btn ${hidePreposition ? 'is-active' : ''}`}
              onClick={() => setHidePreposition((v) => !v)}
            >
              {hidePreposition ? 'Preposisi Dicoret (ON)' : 'Tampilkan Kalimat Utuh'}
            </button>
          </div>
          <div className="lab-xray-line">
            <span className="lab-xray-token is-ok">The quality</span>
            <span className={`lab-xray-token ${hidePreposition ? 'is-cut' : ''}`}>
              of the quarterly financial reports
            </span>
            <span className="lab-xray-token is-ok">
              <RichText text="==is== (bukan are)" inline />
            </span>
            <span className="lab-xray-token is-ok">improving.</span>
          </div>
          <div className="lab-takeaway">
            <RichText text="Jangan tertipu kata jamak **reports** di tengah! Setelah frasa `of ...` dicoret, subjek aslinya adalah **The quality** (tunggal) → wajib **is**." />
          </div>
        </div>
      ) : (
        <div className="lab-radar-cols">
          <div className="lab-radar-box is-good">
            <span className="badge badge-pass">Main Idea (Umum &amp; Mencakup Semua Paragraf)</span>
            <div>
              <RichText text="==Kalimat payung yang merangkum topik + kesimpulan utama di Paragraf 1 &amp; penutup==." />
            </div>
          </div>
          <div className="lab-radar-box is-bad">
            <span className="badge badge-fail">Jebakan Detail Sempit</span>
            <div>
              <RichText text="~~Angka statistik khusus atau contoh kasus yang hanya muncul di 1 kalimat Paragraf ke-3~~." />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
