import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import {
  buildSmoothSegments,
  clampPoint,
  EMPTY_SCRATCH,
  loadScratchScope,
  PEN_COLORS,
  PEN_SIZES,
  pushStroke,
  redoStroke,
  resolveStrokeHex,
  saveScratchScope,
  undoStroke,
  type GridStyle,
  type PenColorId,
  type PenTool,
  type ScratchDockMode,
  type ScratchState,
  type Stroke,
} from '../lib/scratchpad';

interface Props {
  open: boolean;
  scopeKey: string;
  subtitle?: string;
  dockMode: ScratchDockMode;
  canToggleDock?: boolean;
  onDockModeChange?: (mode: ScratchDockMode) => void;
  onClose: () => void;
  onStrokeCountChange?: (count: number) => void;
}

type HeightPreset = 'compact' | 'normal' | 'tall';

const HEIGHT_PX: Record<HeightPreset, number> = {
  compact: 220,
  normal: 330,
  tall: 450,
};

function isDarkTheme(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function paintStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, dark: boolean) {
  if (stroke.points.length === 0) return;
  const isEraser = stroke.tool === 'eraser';
  const strokeWidth = isEraser ? Math.max(14, stroke.width * 4.2) : stroke.width;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = strokeWidth;

  if (isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    const hex = resolveStrokeHex(stroke.color, dark);
    ctx.strokeStyle = hex;
    ctx.fillStyle = hex;
  }

  const segs = buildSmoothSegments(stroke.points);
  if (segs.length === 1 && segs[0].type === 'dot') {
    ctx.beginPath();
    ctx.arc(segs[0].x1, segs[0].y1, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  let started = false;
  for (const s of segs) {
    if (!started) {
      ctx.moveTo(s.x1, s.y1);
      started = true;
    }
    if (s.type === 'quad' && s.cx != null && s.cy != null && s.x2 != null && s.y2 != null) {
      ctx.quadraticCurveTo(s.cx, s.cy, s.x2, s.y2);
    } else if (s.type === 'line' && s.x2 != null && s.y2 != null) {
      ctx.lineTo(s.x2, s.y2);
    }
  }
  ctx.stroke();
  ctx.restore();
}

export default function ScratchPad({
  open,
  scopeKey,
  subtitle,
  dockMode,
  canToggleDock = true,
  onDockModeChange,
  onClose,
  onStrokeCountChange,
}: Props) {
  const [scratch, setScratch] = useState<ScratchState>(() => loadScratchScope(scopeKey));
  const [tool, setTool] = useState<PenTool>('pen');
  const [color, setColor] = useState<PenColorId>('ink');
  const [sizeIdx, setSizeIdx] = useState(1);
  const [grid, setGrid] = useState<GridStyle>('grid');
  const [heightPreset, setHeightPreset] = useState<HeightPreset>('normal');
  const [confirmClear, setConfirmClear] = useState(false);
  const [dark, setDark] = useState<boolean>(() => isDarkTheme());
  const [floatOffset, setFloatOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const clearTimerRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Muat coretan tersimpan setiap kali berpindah soal / submateri.
  useEffect(() => {
    const loaded = loadScratchScope(scopeKey);
    setScratch(loaded);
    activeStrokeRef.current = null;
    activePointerIdRef.current = null;
    setConfirmClear(false);
    onStrokeCountChange?.(loaded.strokes.length);
  }, [scopeKey]);

  // Simpan coretan sesi & kabari induk saat jumlah stroke berubah.
  const commitScratch = useCallback(
    (next: ScratchState) => {
      setScratch(next);
      saveScratchScope(scopeKey, next);
      onStrokeCountChange?.(next.strokes.length);
    },
    [scopeKey, onStrokeCountChange],
  );

  // Sinkronisasi tema Terang/Gelap agar tinta utama tetap kontras.
  useEffect(() => {
    const updateDark = () => setDark(isDarkTheme());
    updateDark();
    const obs = new MutationObserver(updateDark);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  // Fungsi render ulang seluruh kanvas beresolusi tinggi (High-DPI).
  const redrawCanvas = useCallback(
    (strokesToDraw: Stroke[], liveStroke: Stroke | null) => {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!canvas || !stage) return;

      const rect = stage.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 3);

      const targetW = Math.round(w * dpr);
      const targetH = Math.round(h * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (const s of strokesToDraw) {
        paintStroke(ctx, s, dark);
      }
      if (liveStroke) {
        paintStroke(ctx, liveStroke, dark);
      }
    },
    [dark],
  );

  useEffect(() => {
    if (!open) return;
    redrawCanvas(scratch.strokes, activeStrokeRef.current);
  }, [open, scratch.strokes, dark, heightPreset, dockMode, redrawCanvas]);

  useEffect(() => {
    if (!open || !stageRef.current) return;
    const obs = new ResizeObserver(() => {
      redrawCanvas(scratch.strokes, activeStrokeRef.current);
    });
    obs.observe(stageRef.current);
    return () => obs.disconnect();
  }, [open, scratch.strokes, redrawCanvas]);

  // Pintasan keyboard Ctrl+Z / Ctrl+Y ketika coretan terbuka.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault();
        commitScratch(undoStroke(scratch));
      } else if ((k === 'z' && e.shiftKey) || k === 'y') {
        e.preventDefault();
        commitScratch(redoStroke(scratch));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, scratch, commitScratch]);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    };
  }, []);

  if (!open) return null;

  const getLocalPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return clampPoint(clientX - rect.left, clientY - rect.top, rect.width, rect.height);
  };

  const handlePointerDown = (e: PointerEvent) => {
    // Hanya terima tombol utama mouse atau sentuhan tunggal aktif.
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (activePointerIdRef.current !== null) return;

    const pt = getLocalPoint(e.clientX, e.clientY);
    if (!pt) return;

    e.preventDefault();
    const canvas = canvasRef.current;
    canvas?.setPointerCapture?.(e.pointerId);
    activePointerIdRef.current = e.pointerId;
    setConfirmClear(false);

    const newStroke: Stroke = {
      tool,
      color,
      width: PEN_SIZES[sizeIdx].width,
      points: [pt],
    };
    activeStrokeRef.current = newStroke;
    redrawCanvas(scratch.strokes, newStroke);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId || !activeStrokeRef.current) return;
    e.preventDefault();

    const nativeEvt = e as unknown as { getCoalescedEvents?: () => PointerEvent[] };
    const samples =
      typeof nativeEvt.getCoalescedEvents === 'function'
        ? nativeEvt.getCoalescedEvents()
        : [e];

    const list = samples.length > 0 ? samples : [e];
    for (const ev of list) {
      const pt = getLocalPoint(ev.clientX, ev.clientY);
      if (!pt) continue;
      const pts = activeStrokeRef.current.points;
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) >= 1.2) {
        pts.push(pt);
      }
    }
    redrawCanvas(scratch.strokes, activeStrokeRef.current);
  };

  const finishActiveStroke = (e: PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    const canvas = canvasRef.current;
    if (canvas?.hasPointerCapture?.(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    activePointerIdRef.current = null;
    const finished = activeStrokeRef.current;
    activeStrokeRef.current = null;
    if (finished && finished.points.length > 0) {
      commitScratch(pushStroke(scratch, finished));
    }
  };

  const handleClearClick = () => {
    if (scratch.strokes.length === 0) return;
    if (!confirmClear) {
      setConfirmClear(true);
      if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = window.setTimeout(() => setConfirmClear(false), 2600);
      return;
    }
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    setConfirmClear(false);
    commitScratch(EMPTY_SCRATCH);
  };

  const cycleHeight = () => {
    setHeightPreset((prev) =>
      prev === 'compact' ? 'normal' : prev === 'normal' ? 'tall' : 'compact',
    );
  };

  const cycleGrid = () => {
    setGrid((prev) => (prev === 'grid' ? 'lined' : prev === 'lined' ? 'blank' : 'grid'));
  };

  // Geser jendela mengambang dengan mouse/sentuhan di header.
  const startDragHeader = (e: PointerEvent) => {
    if (dockMode !== 'floating') return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: floatOffset.x,
      origY: floatOffset.y,
    };
  };

  const moveDragHeader = (e: PointerEvent) => {
    if (!dragStateRef.current || dragStateRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    setFloatOffset({
      x: Math.max(-520, Math.min(260, dragStateRef.current.origX + dx)),
      y: Math.max(-420, Math.min(180, dragStateRef.current.origY + dy)),
    });
  };

  const endDragHeader = (e: PointerEvent) => {
    if (dragStateRef.current?.pointerId === e.pointerId) {
      dragStateRef.current = null;
    }
  };

  const gridLabel = grid === 'grid' ? 'Petak' : grid === 'lined' ? 'Garis' : 'Polos';
  const heightLabel =
    heightPreset === 'compact' ? 'Ringkas' : heightPreset === 'normal' ? 'Sedang' : 'Lega';

  return (
    <section
      className={`scratch-card is-${dockMode}`}
      aria-label="Kertas coret-coretan perhitungan"
      style={
        dockMode === 'floating' && (floatOffset.x !== 0 || floatOffset.y !== 0)
          ? { '--scratch-drag-x': `${floatOffset.x}px`, '--scratch-drag-y': `${floatOffset.y}px` }
          : undefined
      }
    >
      <header
        className={`scratch-head ${dockMode === 'floating' ? 'is-draggable' : ''}`}
        onPointerDown={startDragHeader}
        onPointerMove={moveDragHeader}
        onPointerUp={endDragHeader}
        onPointerCancel={endDragHeader}
      >
        <div className="scratch-title-wrap">
          <strong>✎ Kertas Coret-Coretan</strong>
          {subtitle && <small className="muted">{subtitle}</small>}
        </div>

        <div className="scratch-head-actions">
          {canToggleDock && onDockModeChange && (
            <button
              type="button"
              className="scratch-mini-btn"
              onClick={() => onDockModeChange(dockMode === 'panel' ? 'floating' : 'panel')}
              title={
                dockMode === 'panel'
                  ? 'Lepas sebagai panel mengambang yang bisa digeser'
                  : 'Tempelkan kembali ke sisi soal'
              }
            >
              {dockMode === 'panel' ? '❐ Mengambang' : '◫ Panel Sisi'}
            </button>
          )}
          <button
            type="button"
            className="scratch-mini-btn"
            onClick={cycleHeight}
            title="Ubah luas ruang coret-coretan"
          >
            ↕ {heightLabel}
          </button>
          <button
            type="button"
            className="scratch-close-btn"
            onClick={onClose}
            aria-label="Tutup kertas coret-coretan"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="scratch-toolbar" role="toolbar" aria-label="Alat tulis coretan">
        <div className="scratch-tool-group">
          <button
            type="button"
            className={`scratch-tool-btn ${tool === 'pen' ? 'is-active' : ''}`}
            onClick={() => setTool('pen')}
            aria-pressed={tool === 'pen'}
          >
            ✎ Pena
          </button>
          <button
            type="button"
            className={`scratch-tool-btn ${tool === 'eraser' ? 'is-active' : ''}`}
            onClick={() => setTool('eraser')}
            aria-pressed={tool === 'eraser'}
          >
            ⌫ Hapus
          </button>
        </div>

        <div className="scratch-tool-group" aria-label="Warna tinta">
          {PEN_COLORS.map((c) => {
            const swatch = dark ? c.darkHex : c.lightHex;
            return (
              <button
                key={c.id}
                type="button"
                className={`scratch-color-dot ${tool === 'pen' && color === c.id ? 'is-active' : ''}`}
                style={{ '--dot-color': swatch }}
                onClick={() => {
                  setColor(c.id);
                  setTool('pen');
                }}
                title={c.label}
                aria-label={c.label}
                aria-pressed={tool === 'pen' && color === c.id}
              />
            );
          })}
        </div>

        <div className="scratch-tool-group" aria-label="Ketebalan garis">
          {PEN_SIZES.map((sz, i) => (
            <button
              key={sz.id}
              type="button"
              className={`scratch-size-btn ${sizeIdx === i ? 'is-active' : ''}`}
              onClick={() => setSizeIdx(i)}
              title={`Ukuran ${sz.label}`}
              aria-label={`Ukuran ${sz.label}`}
              aria-pressed={sizeIdx === i}
            >
              <span
                className="scratch-size-pip"
                style={{ width: Math.round(sz.width * 2 + 2), height: Math.round(sz.width * 2 + 2) }}
              />
            </button>
          ))}
        </div>

        <div className="scratch-tool-group is-right">
          <button
            type="button"
            className="scratch-tool-btn"
            onClick={cycleGrid}
            title="Ubah latar kertas (Petak / Garis / Polos)"
          >
            ▦ {gridLabel}
          </button>
          <button
            type="button"
            className="scratch-tool-btn"
            onClick={() => commitScratch(undoStroke(scratch))}
            disabled={scratch.strokes.length === 0}
            title="Urungkan (Ctrl+Z)"
            aria-label="Urungkan coretan terakhir"
          >
            ↶
          </button>
          <button
            type="button"
            className="scratch-tool-btn"
            onClick={() => commitScratch(redoStroke(scratch))}
            disabled={scratch.redoStack.length === 0}
            title="Ulangi (Ctrl+Y)"
            aria-label="Ulangi coretan"
          >
            ↷
          </button>
          <button
            type="button"
            className={`scratch-tool-btn ${confirmClear ? 'is-danger' : ''}`}
            onClick={handleClearClick}
            disabled={scratch.strokes.length === 0}
            title="Bersihkan seluruh kertas"
          >
            {confirmClear ? 'Yakin Bersihkan?' : 'Bersihkan'}
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className={`scratch-stage bg-${grid}`}
        style={{ height: `${HEIGHT_PX[heightPreset]}px` }}
      >
        {scratch.strokes.length === 0 && (
          <div className="scratch-empty-hint" aria-hidden="true">
            Tulis hitungan di sini dengan mouse (PC/Web) atau usapan jari (Mobile). Coretan tersimpan per soal.
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`scratch-canvas ${tool === 'eraser' ? 'is-eraser' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishActiveStroke}
          onPointerCancel={finishActiveStroke}
        />
      </div>
    </section>
  );
}

