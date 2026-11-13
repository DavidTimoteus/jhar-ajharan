import { safeJsonParse } from './sanitize.ts';

export type PenTool = 'pen' | 'highlighter' | 'stroke_eraser' | 'eraser';
export type PenColorId = 'ink' | 'blue' | 'emerald' | 'coral' | 'amber';
export type GridStyle = 'grid' | 'lined' | 'blank';
export type ScratchDockMode = 'panel' | 'floating';
export type DetectedShapeKind = 'line' | 'arrow' | 'circle' | 'ellipse' | 'triangle' | 'rect';
export type ScratchTemplateId = 'jokowi' | 'venn' | 'axes';

export interface StrokePoint {
  x: number;
  y: number;
}

export interface Stroke {
  tool: PenTool;
  color: PenColorId;
  width: number;
  points: StrokePoint[];
  /** Jika true, segmen digambar sebagai garis poligon tajam (mis. persegi, segitiga, panah). */
  sharp?: boolean;
  /** Jenis bentuk hasil auto-correction QuickShape (opsional). */
  shapeKind?: DetectedShapeKind;
  /** Titik mentah sebelum dirapikan, agar pengguna bisa membatalkan koreksi bentuk ke tulisan asli. */
  rawPoints?: StrokePoint[];
}

export interface ShapeCorrectionResult {
  kind: DetectedShapeKind;
  label: string;
  points: StrokePoint[];
  sharp: boolean;
}

export interface ScratchState {
  strokes: Stroke[];
  redoStack: Stroke[];
  /** Snapshot riwayat untuk aksi massal (hapus objek, rapikan semua, pasang templat). */
  pastSnapshots?: Stroke[][];
  redoSnapshots?: Stroke[][];
}

export interface SmoothCurveSegment {
  type: 'dot' | 'line' | 'quad';
  x1: number;
  y1: number;
  cx?: number;
  cy?: number;
  x2?: number;
  y2?: number;
}

export const EMPTY_SCRATCH: ScratchState = { strokes: [], redoStack: [] };

export const PEN_COLORS: { id: PenColorId; label: string; lightHex: string; darkHex: string }[] = [
  { id: 'ink', label: 'Tinta Utama', lightHex: '#1b2838', darkHex: '#f1f5f9' },
  { id: 'blue', label: 'Biru Rumus', lightHex: '#1d4ed8', darkHex: '#60a5fa' },
  { id: 'emerald', label: 'Hijau Stabilo', lightHex: '#047857', darkHex: '#34d399' },
  { id: 'coral', label: 'Merah Koreksi', lightHex: '#dc2626', darkHex: '#f87171' },
  { id: 'amber', label: 'Kuning Stabilo', lightHex: '#d97706', darkHex: '#fbbf24' },
];

export const PEN_SIZES: { id: string; label: string; width: number }[] = [
  { id: 'sm', label: 'Tipis', width: 2.2 },
  { id: 'md', label: 'Sedang', width: 3.6 },
  { id: 'lg', label: 'Tebal', width: 6.2 },
];

const SESSION_KEY = 'ja_scratchpad_scopes_v1';
const MAX_SAVED_SCOPES = 40;
const MAX_STROKES_PER_CANVAS = 400;
const MAX_SNAPSHOTS = 35;

export function resolveStrokeHex(colorId: PenColorId, isDark: boolean): string {
  const found = PEN_COLORS.find((c) => c.id === colorId) ?? PEN_COLORS[0];
  return isDark ? found.darkHex : found.lightHex;
}

function roundCoord(v: number): number {
  return Math.round(v * 10) / 10;
}

function dist(a: StrokePoint, b: StrokePoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function polylineLength(points: StrokePoint[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += dist(points[i - 1], points[i]);
  }
  return len;
}

function sanitizePoints(points: StrokePoint[]): StrokePoint[] {
  return points.map((p) => ({ x: roundCoord(p.x), y: roundCoord(p.y) }));
}

export function clampPoint(x: number, y: number, width: number, height: number): StrokePoint {
  return {
    x: roundCoord(Math.max(0, Math.min(width, x))),
    y: roundCoord(Math.max(0, Math.min(height, y))),
  };
}

export function pushStroke(state: ScratchState, stroke: Stroke): ScratchState {
  if (!stroke.points || stroke.points.length === 0) return state;
  const nextStroke: Stroke = {
    tool: stroke.tool,
    color: stroke.color,
    width: stroke.width,
    points: sanitizePoints(stroke.points),
    ...(stroke.sharp ? { sharp: true } : {}),
    ...(stroke.shapeKind ? { shapeKind: stroke.shapeKind } : {}),
    ...(stroke.rawPoints ? { rawPoints: sanitizePoints(stroke.rawPoints) } : {}),
  };
  const nextStrokes = [...state.strokes, nextStroke];
  const trimmed =
    nextStrokes.length > MAX_STROKES_PER_CANVAS
      ? nextStrokes.slice(nextStrokes.length - MAX_STROKES_PER_CANVAS)
      : nextStrokes;
  const past = [...(state.pastSnapshots ?? []), state.strokes].slice(-MAX_SNAPSHOTS);
  return { strokes: trimmed, redoStack: [], pastSnapshots: past, redoSnapshots: [] };
}

export function applyBatchStrokes(state: ScratchState, nextStrokes: Stroke[]): ScratchState {
  const past = [...(state.pastSnapshots ?? []), state.strokes].slice(-MAX_SNAPSHOTS);
  const trimmed =
    nextStrokes.length > MAX_STROKES_PER_CANVAS
      ? nextStrokes.slice(nextStrokes.length - MAX_STROKES_PER_CANVAS)
      : nextStrokes;
  return {
    strokes: trimmed,
    redoStack: [],
    pastSnapshots: past,
    redoSnapshots: [],
  };
}

export function undoStroke(state: ScratchState): ScratchState {
  if (state.pastSnapshots && state.pastSnapshots.length > 0) {
    const prev = state.pastSnapshots[state.pastSnapshots.length - 1];
    const diffSingle =
      state.strokes.length === prev.length + 1 ? state.strokes[state.strokes.length - 1] : null;
    return {
      strokes: prev,
      redoStack: diffSingle ? [...state.redoStack, diffSingle] : state.redoStack,
      pastSnapshots: state.pastSnapshots.slice(0, -1),
      redoSnapshots: [...(state.redoSnapshots ?? []), state.strokes].slice(-MAX_SNAPSHOTS),
    };
  }
  if (state.strokes.length === 0) return state;
  const last = state.strokes[state.strokes.length - 1];
  return {
    strokes: state.strokes.slice(0, -1),
    redoStack: [...state.redoStack, last],
  };
}

export function redoStroke(state: ScratchState): ScratchState {
  if (state.redoSnapshots && state.redoSnapshots.length > 0) {
    const next = state.redoSnapshots[state.redoSnapshots.length - 1];
    const shouldPopSingle = state.redoStack.length > 0 && next.length === state.strokes.length + 1;
    return {
      strokes: next,
      redoStack: shouldPopSingle ? state.redoStack.slice(0, -1) : state.redoStack,
      pastSnapshots: [...(state.pastSnapshots ?? []), state.strokes].slice(-MAX_SNAPSHOTS),
      redoSnapshots: state.redoSnapshots.slice(0, -1),
    };
  }
  if (state.redoStack.length === 0) return state;
  const restored = state.redoStack[state.redoStack.length - 1];
  return {
    strokes: [...state.strokes, restored],
    redoStack: state.redoStack.slice(0, -1),
  };
}

export function canUndoScratch(state: ScratchState): boolean {
  return state.strokes.length > 0 || Boolean(state.pastSnapshots && state.pastSnapshots.length > 0);
}

export function canRedoScratch(state: ScratchState): boolean {
  return state.redoStack.length > 0 || Boolean(state.redoSnapshots && state.redoSnapshots.length > 0);
}

/**
 * Ramer-Douglas-Peucker: menyederhanakan titik berlebih tanpa merusak sudut tajam angka/simbol.
 */
export function rdpSimplify(points: StrokePoint[], epsilon: number): StrokePoint[] {
  if (points.length < 3 || epsilon <= 0) return points.slice();
  const first = points[0];
  const last = points[points.length - 1];
  let maxDist = 0;
  let maxIdx = 0;

  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const denom = Math.hypot(dx, dy);

  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const d =
      denom < 1e-6
        ? dist(p, first)
        : Math.abs(dy * p.x - dx * p.y + last.x * first.y - last.y * first.x) / denom;
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdpSimplify(points.slice(0, maxIdx + 1), epsilon);
    const right = rdpSimplify(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [first, last];
}

/**
 * Penstabil tinta otomatis (terinspirasi Apple Pencil Ink Fairing):
 * meredam getaran mouse/jari pada kurva lengkung sambil menjaga sudut tajam angka (2, 4, 7, √).
 */
export function beautifyFreehandPoints(points: StrokePoint[]): StrokePoint[] {
  if (points.length <= 2) return sanitizePoints(points);

  // Tahap 1: saring sampel berjarak sangat rapat (< 1.5px) agar tidak menumpuk
  const deduped: StrokePoint[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    if (dist(deduped[deduped.length - 1], points[i]) >= 1.5) {
      deduped.push(points[i]);
    }
  }
  deduped.push(points[points.length - 1]);
  if (deduped.length <= 2) return sanitizePoints(deduped);

  // Deteksi sudut tajam agar angka 7, 4, 2, >, √ tidak melengkung tumpul
  const isSharp = new Array<boolean>(deduped.length).fill(false);
  isSharp[0] = true;
  isSharp[deduped.length - 1] = true;
  for (let i = 1; i < deduped.length - 1; i++) {
    const ax = deduped[i].x - deduped[i - 1].x;
    const ay = deduped[i].y - deduped[i - 1].y;
    const bx = deduped[i + 1].x - deduped[i].x;
    const by = deduped[i + 1].y - deduped[i].y;
    const la = Math.hypot(ax, ay);
    const lb = Math.hypot(bx, by);
    if (la > 2 && lb > 2) {
      const cosAngle = (ax * bx + ay * by) / (la * lb);
      if (cosAngle < 0.42) {
        isSharp[i] = true;
      }
    }
  }

  // Tahap 2: 2 iterasi Laplacian fairing berbobot pada titik non-sudut
  let cur = deduped.map((p) => ({ ...p }));
  for (let pass = 0; pass < 2; pass++) {
    const next = cur.map((p) => ({ ...p }));
    for (let i = 1; i < cur.length - 1; i++) {
      if (isSharp[i]) continue;
      next[i] = {
        x: cur[i - 1].x * 0.22 + cur[i].x * 0.56 + cur[i + 1].x * 0.22,
        y: cur[i - 1].y * 0.22 + cur[i].y * 0.56 + cur[i + 1].y * 0.22,
      };
    }
    cur = next;
  }

  const simplified = cur.length > 14 ? rdpSimplify(cur, 0.75) : cur;
  return sanitizePoints(simplified);
}

function snapAxisPoint(start: StrokePoint, end: StrokePoint, angleSnapDeg = 5.5): StrokePoint {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return end;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const candidates = [0, 45, 90, 135, 180, -45, -90, -135, -180];
  for (const target of candidates) {
    if (Math.abs(deg - target) <= angleSnapDeg) {
      const rad = (target * Math.PI) / 180;
      return {
        x: roundCoord(start.x + len * Math.cos(rad)),
        y: roundCoord(start.y + len * Math.sin(rad)),
      };
    }
  }
  return { x: roundCoord(end.x), y: roundCoord(end.y) };
}

function maxPerpendicularDistance(points: StrokePoint[], a: StrokePoint, b: StrokePoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return 0;
  let maxD = 0;
  for (const p of points) {
    const d = Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
    if (d > maxD) maxD = d;
  }
  return maxD;
}

function resamplePolyline(points: StrokePoint[], count: number): StrokePoint[] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array.from({ length: count }, () => ({ ...points[0] }));
  const total = polylineLength(points);
  if (total < 1e-6) return Array.from({ length: count }, () => ({ ...points[0] }));

  const step = total / (count - 1);
  const out: StrokePoint[] = [{ ...points[0] }];
  let accum = 0;
  let i = 1;
  let prev = { ...points[0] };

  while (i < points.length && out.length < count) {
    const cur = points[i];
    const segLen = dist(prev, cur);
    if (accum + segLen >= step) {
      const t = (step - accum) / segLen;
      const np = { x: prev.x + t * (cur.x - prev.x), y: prev.y + t * (cur.y - prev.y) };
      out.push(np);
      prev = np;
      accum = 0;
    } else {
      accum += segLen;
      prev = cur;
      i++;
    }
  }
  while (out.length < count) {
    out.push({ ...points[points.length - 1] });
  }
  return out;
}

function polygonArea(pts: StrokePoint[]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) / 2;
}

function extractClosedVertices(points: StrokePoint[], diag: number): StrokePoint[] {
  const closedLoop = [...points, points[0]];
  const eps = Math.max(6.5, diag * 0.068);
  const simple = rdpSimplify(closedLoop, eps);
  // Buang titik penutup ganda & gabungkan simpul berdekatan di awal-akhir
  const verts = simple.slice(0, -1);
  if (verts.length > 2 && dist(verts[0], verts[verts.length - 1]) < eps * 1.15) {
    verts.pop();
  }
  return verts;
}

function buildRegularEllipsePoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angleRad: number,
  steps = 48,
): StrokePoint[] {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const pts: StrokePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const lx = rx * Math.cos(t);
    const ly = ry * Math.sin(t);
    pts.push({
      x: roundCoord(cx + lx * cos - ly * sin),
      y: roundCoord(cy + lx * sin + ly * cos),
    });
  }
  return pts;
}

/**
 * Mesin pengenal bentuk geometris (terinspirasi Apple QuickShape / PencilKit):
 * Mengenali garis lurus, anak panah, lingkaran, elips, segitiga, dan persegi/persegi panjang.
 */
export function detectAndCorrectShape(
  points: StrokePoint[],
  options: { allowSmall?: boolean } = {},
): ShapeCorrectionResult | null {
  if (!points || points.length < 2) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const boxW = maxX - minX;
  const boxH = maxY - minY;
  const diag = Math.hypot(boxW, boxH);
  const totalLen = polylineLength(points);
  const minDiag = options.allowSmall ? 18 : 30;
  if (diag < minDiag || totalLen < 20) return null;

  const start = points[0];
  const end = points[points.length - 1];
  const closureDist = dist(start, end);
  const isClosed =
    totalLen >= (options.allowSmall ? 55 : 78) &&
    diag >= minDiag &&
    closureDist <= Math.max(26, diag * 0.27);

  // 1. Cek Panah (ujung batang lurus + 1 atau 2 kait tajam di akhir)
  if (!isClosed && points.length >= 4) {
    const simp = rdpSimplify(points, Math.max(4, diag * 0.045));
    if (simp.length === 3 || simp.length === 4) {
      const p0 = simp[0];
      const tip = simp[1];
      const shaftLen = dist(p0, tip);
      const wing1 = dist(tip, simp[2]);
      if (shaftLen >= 26 && shaftLen >= totalLen * 0.48 && wing1 >= 7 && wing1 <= shaftLen * 0.42) {
        const sx = tip.x - p0.x;
        const sy = tip.y - p0.y;
        const wx = simp[2].x - tip.x;
        const wy = simp[2].y - tip.y;
        const cosTurn = (sx * wx + sy * wy) / (shaftLen * wing1);
        if (cosTurn < -0.25) {
          const snappedTip = snapAxisPoint(p0, tip);
          const angle = Math.atan2(snappedTip.y - p0.y, snappedTip.x - p0.x);
          const headLen = Math.max(9, Math.min(20, shaftLen * 0.16));
          const spread = 0.5; // ~28.6 deg
          const wingA: StrokePoint = {
            x: roundCoord(snappedTip.x - headLen * Math.cos(angle - spread)),
            y: roundCoord(snappedTip.y - headLen * Math.sin(angle - spread)),
          };
          const wingB: StrokePoint = {
            x: roundCoord(snappedTip.x - headLen * Math.cos(angle + spread)),
            y: roundCoord(snappedTip.y - headLen * Math.sin(angle + spread)),
          };
          return {
            kind: 'arrow',
            label: 'Panah',
            sharp: true,
            points: [
              { x: roundCoord(p0.x), y: roundCoord(p0.y) },
              snappedTip,
              wingA,
              snappedTip,
              wingB,
            ],
          };
        }
      }
    }
  }

  // 2. Cek Garis Lurus
  if (!isClosed) {
    const chord = dist(start, end);
    if (chord >= 24 && totalLen <= chord * 1.18) {
      const maxDev = maxPerpendicularDistance(points, start, end);
      if (maxDev <= Math.max(6.5, chord * 0.065)) {
        const snappedEnd = snapAxisPoint(start, end);
        return {
          kind: 'line',
          label: 'Garis Lurus',
          sharp: true,
          points: [{ x: roundCoord(start.x), y: roundCoord(start.y) }, snappedEnd],
        };
      }
    }
  }

  // 3. Cek Bentuk Tertutup (Lingkaran, Segitiga, Persegi, Elips)
  if (isClosed) {
    const closedPts = resamplePolyline([...points, points[0]], 48);
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < closedPts.length - 1; i++) {
      cx += closedPts[i].x;
      cy += closedPts[i].y;
    }
    const n = closedPts.length - 1;
    cx /= n;
    cy /= n;

    const radii: number[] = [];
    for (let i = 0; i < n; i++) {
      radii.push(Math.hypot(closedPts[i].x - cx, closedPts[i].y - cy));
    }
    const meanR = radii.reduce((a, b) => a + b, 0) / n;
    const varianceR = radii.reduce((a, r) => a + (r - meanR) ** 2, 0) / n;
    const stdR = Math.sqrt(varianceR);

    // Ekstrak sudut poligon tertutup terlebih dahulu agar persegi/segitiga bersudut tajam tidak tertukar dengan lingkaran
    const verts = extractClosedVertices(points, diag);

    // Cek Segitiga (3 simpul dominan dengan luas bermakna)
    if (verts.length === 3 && boxW > 10 && boxH > 10) {
      const area = polygonArea(verts);
      if (area >= boxW * boxH * 0.18) {
        const snappedVerts = verts.map((v) => ({ x: roundCoord(v.x), y: roundCoord(v.y) }));
        // Ratakan sisi dasar jika hampir horizontal (< 5 derajat) agar segitiga rapi
        for (let i = 0; i < 3; i++) {
          const a = snappedVerts[i];
          const b = snappedVerts[(i + 1) % 3];
          if (Math.abs(a.x - b.x) > 20 && Math.abs(a.y - b.y) / Math.abs(a.x - b.x) < 0.085) {
            const avgY = roundCoord((a.y + b.y) / 2);
            a.y = avgY;
            b.y = avgY;
          }
        }
        return {
          kind: 'triangle',
          label: 'Segitiga',
          sharp: true,
          points: [...snappedVerts, { ...snappedVerts[0] }],
        };
      }
    }

    // Cek Persegi / Persegi Panjang (4 simpul sudut mendekati 90°)
    if (verts.length === 4) {
      let maxAngleErr = 0;
      for (let i = 0; i < 4; i++) {
        const prev = verts[(i + 3) % 4];
        const curr = verts[i];
        const next = verts[(i + 1) % 4];
        const v1x = prev.x - curr.x;
        const v1y = prev.y - curr.y;
        const v2x = next.x - curr.x;
        const v2y = next.y - curr.y;
        const l1 = Math.hypot(v1x, v1y);
        const l2 = Math.hypot(v2x, v2y);
        if (l1 < 8 || l2 < 8) {
          maxAngleErr = 90;
          break;
        }
        const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (l1 * l2)));
        const angleDeg = (Math.acos(cos) * 180) / Math.PI;
        maxAngleErr = Math.max(maxAngleErr, Math.abs(angleDeg - 90));
      }

      if (maxAngleErr <= 24) {
        // Sudut rotasi rata-rata dari tepi 0 -> 1
        let theta = Math.atan2(verts[1].y - verts[0].y, verts[1].x - verts[0].x);
        const deg = (theta * 180) / Math.PI;
        // Snap ke sumbu horisontal/vertikal jika miringnya <= 7 derajat
        const mod90 = ((deg % 90) + 90) % 90;
        if (mod90 <= 7 || mod90 >= 83) {
          theta = 0;
        }
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        let uMin = Infinity;
        let uMax = -Infinity;
        let vMin = Infinity;
        let vMax = -Infinity;
        for (const p of closedPts) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const u = dx * cos + dy * sin;
          const v = -dx * sin + dy * cos;
          if (u < uMin) uMin = u;
          if (u > uMax) uMax = u;
          if (v < vMin) vMin = v;
          if (v > vMax) vMax = v;
        }
        let rw = uMax - uMin;
        let rh = vMax - vMin;
        const isSquare = Math.abs(rw - rh) / Math.max(rw, rh) <= 0.13;
        if (isSquare) {
          const side = (rw + rh) / 2;
          rw = side;
          rh = side;
        }
        const rcx = cx + ((uMin + uMax) / 2) * cos - ((vMin + vMax) / 2) * sin;
        const rcy = cy + ((uMin + uMax) / 2) * sin + ((vMin + vMax) / 2) * cos;
        const hw = rw / 2;
        const hh = rh / 2;
        const localCorners: [number, number][] = [
          [-hw, -hh],
          [hw, -hh],
          [hw, hh],
          [-hw, hh],
        ];
        const rectPts = localCorners.map(([lu, lv]) => ({
          x: roundCoord(rcx + lu * cos - lv * sin),
          y: roundCoord(rcy + lu * sin + lv * cos),
        }));
        return {
          kind: 'rect',
          label: isSquare ? 'Persegi' : 'Persegi Panjang',
          sharp: true,
          points: [...rectPts, { ...rectPts[0] }],
        };
      }
    }

    // Cek Lingkaran setelah poligon tersaring (lingkaran selalu punya >= 5 simpul RDP)
    if (meanR >= 13 && stdR / meanR <= 0.135) {
      return {
        kind: 'circle',
        label: 'Lingkaran',
        sharp: false,
        points: buildRegularEllipsePoints(cx, cy, meanR, meanR, 0, 48),
      };
    }

    // Cek Elips (via matriks kovariansi PCA 2D)
    let cxx = 0;
    let cyy = 0;
    let cxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = closedPts[i].x - cx;
      const dy = closedPts[i].y - cy;
      cxx += dx * dx;
      cyy += dy * dy;
      cxy += dx * dy;
    }
    cxx /= n;
    cyy /= n;
    cxy /= n;

    const trace = cxx + cyy;
    const disc = Math.sqrt(Math.max(0, (cxx - cyy) ** 2 + 4 * cxy * cxy));
    const l1 = (trace + disc) / 2;
    const l2 = (trace - disc) / 2;
    const rx = Math.sqrt(Math.max(0, 2 * l1));
    const ry = Math.sqrt(Math.max(0, 2 * l2));

    if (rx >= 16 && ry >= 10 && rx / ry <= 4.2) {
      let theta = Math.atan2(l1 - cxx, cxy);
      if (Math.abs(cxy) < 1e-4) theta = cxx >= cyy ? 0 : Math.PI / 2;
      const deg = (theta * 180) / Math.PI;
      if (Math.abs(deg) <= 6 || Math.abs(Math.abs(deg) - 180) <= 6) theta = 0;
      else if (Math.abs(Math.abs(deg) - 90) <= 6) theta = Math.PI / 2;

      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      let errSum = 0;
      for (let i = 0; i < n; i++) {
        const dx = closedPts[i].x - cx;
        const dy = closedPts[i].y - cy;
        const u = dx * cos + dy * sin;
        const v = -dx * sin + dy * cos;
        const normR = Math.hypot(u / rx, v / ry);
        errSum += Math.abs(normR - 1);
      }
      if (errSum / n <= 0.16) {
        return {
          kind: 'ellipse',
          label: 'Elips',
          sharp: false,
          points: buildRegularEllipsePoints(cx, cy, rx, ry, theta, 48),
        };
      }
    }
  }

  return null;
}

/**
 * Mengembalikan jarak terdekat dari titik P ke segmen garis A-B.
 */
function pointToSegmentDist(p: StrokePoint, a: StrokePoint, b: StrokePoint): number {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const lenSq = vx * vx + vy * vy;
  if (lenSq < 1e-6) return dist(p, a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / lenSq));
  return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy));
}

/**
 * Menghapus goresan yang tersentuh oleh kursor/sentuhan Penghapus Objek.
 */
export function eraseHitStrokes(
  strokes: Stroke[],
  target: StrokePoint,
  radius = 12,
): { nextStrokes: Stroke[]; removed: number } {
  const hitRadiusBase = Math.max(6, radius);
  const kept: Stroke[] = [];
  let removed = 0;

  for (const s of strokes) {
    if (s.tool === 'eraser') {
      kept.push(s);
      continue;
    }
    const thresh = hitRadiusBase + (s.tool === 'highlighter' ? s.width * 1.4 : s.width * 0.6);
    let hit = false;
    if (s.points.length === 1) {
      hit = dist(target, s.points[0]) <= thresh;
    } else {
      for (let i = 1; i < s.points.length; i++) {
        if (pointToSegmentDist(target, s.points[i - 1], s.points[i]) <= thresh) {
          hit = true;
          break;
        }
      }
    }
    if (hit) {
      removed++;
    } else {
      kept.push(s);
    }
  }
  return { nextStrokes: kept, removed };
}

/**
 * Merapikan seluruh coretan tinta aktif di kanvas (bentuk geometris + tulisan halus).
 */
export function tidyStrokesBatch(strokes: Stroke[]): { nextStrokes: Stroke[]; improved: number } {
  let improved = 0;
  const next = strokes.map((s) => {
    if (s.tool === 'eraser' || s.shapeKind) return s;
    const shape = s.tool === 'pen' ? detectAndCorrectShape(s.points) : null;
    if (shape) {
      improved++;
      return {
        ...s,
        rawPoints: s.rawPoints ?? s.points,
        points: shape.points,
        sharp: shape.sharp,
        shapeKind: shape.kind,
      };
    }
    if (s.points.length >= 4) {
      const smoothed = beautifyFreehandPoints(s.points);
      if (smoothed.length !== s.points.length || dist(smoothed[1], s.points[1]) > 0.3) {
        improved++;
        return {
          ...s,
          rawPoints: s.rawPoints ?? s.points,
          points: smoothed,
        };
      }
    }
    return s;
  });
  return { nextStrokes: next, improved };
}

/**
 * Membuat templat geometris cepat (Segitiga JoKoWi, Diagram Venn, Sumbu Bilangan) agar siap diisi angka.
 */
export function buildTemplateStrokes(
  templateId: ScratchTemplateId,
  width: number,
  height: number,
  color: PenColorId = 'blue',
): Stroke[] {
  const cx = width / 2;
  const cy = height / 2;
  const w = Math.min(width * 0.68, 220);
  const h = Math.min(height * 0.68, 165);

  if (templateId === 'jokowi') {
    const top: StrokePoint = { x: roundCoord(cx), y: roundCoord(cy - h * 0.46) };
    const left: StrokePoint = { x: roundCoord(cx - w * 0.48), y: roundCoord(cy + h * 0.44) };
    const right: StrokePoint = { x: roundCoord(cx + w * 0.48), y: roundCoord(cy + h * 0.44) };
    const midY = roundCoord(top.y + (left.y - top.y) * 0.48);
    const ratio = (midY - top.y) / (left.y - top.y);
    const midL: StrokePoint = { x: roundCoord(top.x + (left.x - top.x) * ratio), y: midY };
    const midR: StrokePoint = { x: roundCoord(top.x + (right.x - top.x) * ratio), y: midY };
    const midBot: StrokePoint = { x: roundCoord(cx), y: left.y };
    const midTop: StrokePoint = { x: roundCoord(cx), y: midY };
    return [
      { tool: 'pen', color, width: 2.6, sharp: true, shapeKind: 'triangle', points: [top, right, left, top] },
      { tool: 'pen', color, width: 2.2, sharp: true, shapeKind: 'line', points: [midL, midR] },
      { tool: 'pen', color, width: 2.2, sharp: true, shapeKind: 'line', points: [midTop, midBot] },
    ];
  }

  if (templateId === 'venn') {
    const r = Math.min(w * 0.31, h * 0.44);
    const offset = r * 0.62;
    return [
      {
        tool: 'pen',
        color,
        width: 2.5,
        shapeKind: 'circle',
        points: buildRegularEllipsePoints(cx - offset, cy, r, r, 0, 48),
      },
      {
        tool: 'pen',
        color,
        width: 2.5,
        shapeKind: 'circle',
        points: buildRegularEllipsePoints(cx + offset, cy, r, r, 0, 48),
      },
    ];
  }

  // 'axes' -> Garis bilangan dengan 5 tanda skala rapi
  const xStart = roundCoord(cx - Math.min(width * 0.4, 150));
  const xEnd = roundCoord(cx + Math.min(width * 0.4, 150));
  const span = xEnd - xStart;
  const ticks: Stroke[] = [
    {
      tool: 'pen',
      color,
      width: 2.5,
      sharp: true,
      shapeKind: 'arrow',
      points: [
        { x: xStart, y: roundCoord(cy) },
        { x: xEnd, y: roundCoord(cy) },
        { x: roundCoord(xEnd - 10), y: roundCoord(cy - 6) },
        { x: xEnd, y: roundCoord(cy) },
        { x: roundCoord(xEnd - 10), y: roundCoord(cy + 6) },
      ],
    },
  ];
  for (let i = 0; i <= 4; i++) {
    const tx = roundCoord(xStart + (span * 0.85 * i) / 4 + span * 0.05);
    ticks.push({
      tool: 'pen',
      color,
      width: 2,
      sharp: true,
      shapeKind: 'line',
      points: [
        { x: tx, y: roundCoord(cy - 6) },
        { x: tx, y: roundCoord(cy + 6) },
      ],
    });
  }
  return ticks;
}

/**
 * Menghasilkan segmen kurva Bezier kuadratik melalui titik tengah antar sampel,
 * sehingga tarikan jari atau mouse terlihat mulus tanpa sudut patah.
 */
export function buildSmoothSegments(points: StrokePoint[]): SmoothCurveSegment[] {
  if (points.length === 0) return [];
  if (points.length === 1) {
    return [{ type: 'dot', x1: points[0].x, y1: points[0].y }];
  }
  if (points.length === 2) {
    return [
      {
        type: 'line',
        x1: points[0].x,
        y1: points[0].y,
        x2: points[1].x,
        y2: points[1].y,
      },
    ];
  }

  const segs: SmoothCurveSegment[] = [];
  let prevEnd = points[0];
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    segs.push({
      type: 'quad',
      x1: prevEnd.x,
      y1: prevEnd.y,
      cx: points[i].x,
      cy: points[i].y,
      x2: midX,
      y2: midY,
    });
    prevEnd = { x: midX, y: midY };
  }
  const last = points[points.length - 1];
  segs.push({
    type: 'line',
    x1: prevEnd.x,
    y1: prevEnd.y,
    x2: last.x,
    y2: last.y,
  });
  return segs;
}

interface StoredScopeEntry {
  updatedAt: number;
  strokes: Stroke[];
}

function readAllScopes(): Record<string, StoredScopeEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    const parsed = safeJsonParse(raw, 2 * 1024 * 1024);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, StoredScopeEntry>;
  } catch {
    return {};
  }
}

export function loadScratchScope(scopeKey: string): ScratchState {
  const all = readAllScopes();
  const entry = all[scopeKey];
  if (!entry || !Array.isArray(entry.strokes)) return EMPTY_SCRATCH;
  return { strokes: entry.strokes, redoStack: [] };
}

export function saveScratchScope(scopeKey: string, state: ScratchState): void {
  if (typeof window === 'undefined') return;
  try {
    const all = readAllScopes();
    if (state.strokes.length === 0) {
      delete all[scopeKey];
    } else {
      all[scopeKey] = { updatedAt: Date.now(), strokes: state.strokes };
    }

    const keys = Object.keys(all);
    if (keys.length > MAX_SAVED_SCOPES) {
      keys
        .sort((a, b) => (all[a]?.updatedAt ?? 0) - (all[b]?.updatedAt ?? 0))
        .slice(0, keys.length - MAX_SAVED_SCOPES)
        .forEach((oldKey) => delete all[oldKey]);
    }
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(all));
  } catch {
    // Abaikan jika sessionStorage penuh atau diblokir oleh mode privat.
  }
}

export function getSavedScratchCounts(prefix: string): Record<string, number> {
  const all = readAllScopes();
  const counts: Record<string, number> = {};
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith(prefix) && Array.isArray(v?.strokes) && v.strokes.length > 0) {
      counts[k.slice(prefix.length)] = v.strokes.length;
    }
  }
  return counts;
}
