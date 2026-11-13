import { safeJsonParse } from './sanitize.ts';

export type PenTool = 'pen' | 'eraser';
export type PenColorId = 'ink' | 'blue' | 'emerald' | 'coral';
export type GridStyle = 'grid' | 'lined' | 'blank';
export type ScratchDockMode = 'panel' | 'floating';

export interface StrokePoint {
  x: number;
  y: number;
}

export interface Stroke {
  tool: PenTool;
  color: PenColorId;
  width: number;
  points: StrokePoint[];
}

export interface ScratchState {
  strokes: Stroke[];
  redoStack: Stroke[];
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
];

export const PEN_SIZES: { id: string; label: string; width: number }[] = [
  { id: 'sm', label: 'Tipis', width: 2.2 },
  { id: 'md', label: 'Sedang', width: 3.6 },
  { id: 'lg', label: 'Tebal', width: 6.2 },
];

const SESSION_KEY = 'ja_scratchpad_scopes_v1';
const MAX_SAVED_SCOPES = 40;
const MAX_STROKES_PER_CANVAS = 400;

export function resolveStrokeHex(colorId: PenColorId, isDark: boolean): string {
  const found = PEN_COLORS.find((c) => c.id === colorId) ?? PEN_COLORS[0];
  return isDark ? found.darkHex : found.lightHex;
}

function roundCoord(v: number): number {
  return Math.round(v * 10) / 10;
}

export function clampPoint(x: number, y: number, width: number, height: number): StrokePoint {
  return {
    x: roundCoord(Math.max(0, Math.min(width, x))),
    y: roundCoord(Math.max(0, Math.min(height, y))),
  };
}

export function pushStroke(state: ScratchState, stroke: Stroke): ScratchState {
  if (!stroke.points || stroke.points.length === 0) return state;
  const cleanPoints = stroke.points.map((p) => ({
    x: roundCoord(p.x),
    y: roundCoord(p.y),
  }));
  const nextStroke: Stroke = {
    tool: stroke.tool,
    color: stroke.color,
    width: stroke.width,
    points: cleanPoints,
  };
  const nextStrokes = [...state.strokes, nextStroke];
  const trimmed =
    nextStrokes.length > MAX_STROKES_PER_CANVAS
      ? nextStrokes.slice(nextStrokes.length - MAX_STROKES_PER_CANVAS)
      : nextStrokes;
  return { strokes: trimmed, redoStack: [] };
}

export function undoStroke(state: ScratchState): ScratchState {
  if (state.strokes.length === 0) return state;
  const last = state.strokes[state.strokes.length - 1];
  return {
    strokes: state.strokes.slice(0, -1),
    redoStack: [...state.redoStack, last],
  };
}

export function redoStroke(state: ScratchState): ScratchState {
  if (state.redoStack.length === 0) return state;
  const restored = state.redoStack[state.redoStack.length - 1];
  return {
    strokes: [...state.strokes, restored],
    redoStack: state.redoStack.slice(0, -1),
  };
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
