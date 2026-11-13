import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import {
  applyBatchStrokes,
  beautifyFreehandPoints,
  buildSmoothSegments,
  buildTemplateStrokes,
  canRedoScratch,
  canUndoScratch,
  clampPoint,
  detectAndCorrectShape,
  EMPTY_SCRATCH,
  eraseHitStrokes,
  loadScratchScope,
  PEN_COLORS,
  PEN_SIZES,
  pushStroke,
  redoStroke,
  resolveStrokeHex,
  saveScratchScope,
  tidyStrokesBatch,
  undoStroke,
  type GridStyle,
  type PenColorId,
  type PenTool,
  type ScratchDockMode,
  type ScratchState,
  type ScratchTemplateId,
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

const HOLD_SNAP_DELAY_MS = 350;

function isDarkTheme(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function paintStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, dark: boolean) {
  if (stroke.points.length === 0) return;
  const isEraser = stroke.tool === 'eraser';
  const isHighlighter = stroke.tool === 'highlighter';
  const strokeWidth = isEraser
    ? Math.max(14, stroke.width * 4.2)
    : isHighlighter
      ? Math.max(12, stroke.width * 3.8)
      : stroke.width;

  ctx.save();
  ctx.lineCap = isHighlighter ? 'butt' : 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = strokeWidth;

  if (isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = isHighlighter ? 0.34 : 1;
    const hex = resolveStrokeHex(stroke.color, dark);
    ctx.strokeStyle = hex;
    ctx.fillStyle = hex;
  }

  // Untuk bentuk bersudut tajam (persegi, segitiga, panah, garis lurus), gunakan lineTo langsung agar sudut tidak tumpul.
  if (stroke.sharp && stroke.points.length >= 2) {
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
    return;
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
  const [autoTidy, setAutoTidy] = useState(true);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [shapeBadge, setShapeBadge] = useState<{ label: string; revertable: boolean } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [dark, setDark] = useState<boolean>(() => isDarkTheme());
  const [floatOffset, setFloatOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const eraserBatchRef = useRef<Stroke[] | null>(null);
  const eraserChangedRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const clearTimerRef = useRef<number | null>(null);
  const badgeTimerRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const showShapeNotice = useCallback((label: string, revertable: boolean) => {
    setShapeBadge({ label, revertable });
    if (badgeTimerRef.current) window.clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = window.setTimeout(() => setShapeBadge(null), 4200);
  }, []);

  // Muat coretan tersimpan setiap kali berpindah soal / submateri.
  useEffect(() => {
    const loaded = loadScratchScope(scopeKey);
    setScratch(loaded);
    activeStrokeRef.current = null;
    activePointerIdRef.current = null;
    eraserBatchRef.current = null;
    eraserChangedRef.current = false;
    setConfirmClear(false);
    setShapeBadge(null);
    setTemplateMenuOpen(false);
    onStrokeCountChange?.(loaded.strokes.length);
  }, [scopeKey]);

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

  // Render ulang kanvas beresolusi tinggi (High-DPI).
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
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      if (badgeTimerRef.current) window.clearTimeout(badgeTimerRef.current);
    };
  }, []);

  if (!open) return null;

  const getLocalPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return clampPoint(clientX - rect.left, clientY - rect.top, rect.width, rect.height);
  };

  const cancelHoldSnapTimer = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // Apple QuickShape Hold-to-Snap: tahan jari/mouse 350ms di akhir goresan untuk koreksi bentuk seketika.
  const scheduleHoldSnap = () => {
    cancelHoldSnapTimer();
    holdTimerRef.current = window.setTimeout(() => {
      const cur = activeStrokeRef.current;
      if (!cur || (cur.tool !== 'pen' && cur.tool !== 'highlighter') || cur.shapeKind) return;
      const shape = detectAndCorrectShape(cur.points, { allowSmall: true });
      if (shape) {
        cur.rawPoints = cur.points.slice();
        cur.points = shape.points;
        cur.sharp = shape.sharp;
        cur.shapeKind = shape.kind;
        redrawCanvas(scratch.strokes, cur);
        showShapeNotice(`✦ ${shape.label}`, true);
      }
    }, HOLD_SNAP_DELAY_MS);
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (activePointerIdRef.current !== null) return;

    const pt = getLocalPoint(e.clientX, e.clientY);
    if (!pt) return;

    e.preventDefault();
    const canvas = canvasRef.current;
    canvas?.setPointerCapture?.(e.pointerId);
    activePointerIdRef.current = e.pointerId;
    setConfirmClear(false);
    setTemplateMenuOpen(false);

    if (tool === 'stroke_eraser') {
      const res = eraseHitStrokes(scratch.strokes, pt, 13);
      eraserBatchRef.current = res.nextStrokes;
      eraserChangedRef.current = res.removed > 0;
      redrawCanvas(res.nextStrokes, null);
      return;
    }

    const newStroke: Stroke = {
      tool,
      color: tool === 'highlighter' && color === 'ink' ? 'amber' : color,
      width: PEN_SIZES[sizeIdx].width,
      points: [pt],
    };
    activeStrokeRef.current = newStroke;
    redrawCanvas(scratch.strokes, newStroke);
    scheduleHoldSnap();
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();

    const nativeEvt = e as unknown as { getCoalescedEvents?: () => PointerEvent[] };
    const samples =
      typeof nativeEvt.getCoalescedEvents === 'function'
        ? nativeEvt.getCoalescedEvents()
        : [e];
    const list = samples.length > 0 ? samples : [e];

    if (tool === 'stroke_eraser' && eraserBatchRef.current) {
      let curStrokes = eraserBatchRef.current;
      let anyHit = false;
      for (const ev of list) {
        const pt = getLocalPoint(ev.clientX, ev.clientY);
        if (!pt) continue;
        const res = eraseHitStrokes(curStrokes, pt, 13);
        if (res.removed > 0) {
          curStrokes = res.nextStrokes;
          eraserChangedRef.current = true;
          anyHit = true;
        }
      }
      if (anyHit) {
        eraserBatchRef.current = curStrokes;
        redrawCanvas(curStrokes, null);
      }
      return;
    }

    const active = activeStrokeRef.current;
    if (!active) return;

    // Jika bentuk sudah ter-snap saat user tahan, bergerak lagi jauh > 16px berarti user mau ubah arah ujung garis lurus
    let movedFar = false;
    for (const ev of list) {
      const pt = getLocalPoint(ev.clientX, ev.clientY);
      if (!pt) continue;
      if (active.shapeKind === 'line' && active.points.length === 2) {
        active.points = [active.points[0], pt];
        movedFar = true;
        continue;
      }
      const pts = active.points;
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) >= 1.2) {
        pts.push(pt);
        movedFar = true;
      }
    }

    if (movedFar && !active.shapeKind) {
      scheduleHoldSnap();
    }
    redrawCanvas(scratch.strokes, active);
  };

  const finishActiveStroke = (e: PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    cancelHoldSnapTimer();

    const canvas = canvasRef.current;
    if (canvas?.hasPointerCapture?.(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    activePointerIdRef.current = null;

    if (tool === 'stroke_eraser') {
      const nextList = eraserBatchRef.current;
      const didChange = eraserChangedRef.current;
      eraserBatchRef.current = null;
      eraserChangedRef.current = false;
      if (didChange && nextList) {
        commitScratch(applyBatchStrokes(scratch, nextList));
      }
      return;
    }

    const finished = activeStrokeRef.current;
    activeStrokeRef.current = null;
    if (!finished || finished.points.length === 0) return;

    let finalStroke = finished;
    if (!finished.shapeKind && autoTidy && (finished.tool === 'pen' || finished.tool === 'highlighter')) {
      const shape = detectAndCorrectShape(finished.points);
      if (shape && (finished.tool === 'pen' || shape.kind === 'line')) {
        finalStroke = {
          ...finished,
          rawPoints: finished.points.slice(),
          points: shape.points,
          sharp: shape.sharp,
          shapeKind: shape.kind,
        };
        showShapeNotice(`✦ ${shape.label}`, true);
      } else if (finished.points.length >= 4) {
        finalStroke = {
          ...finished,
          rawPoints: finished.points.slice(),
          points: beautifyFreehandPoints(finished.points),
        };
      }
    } else if (finished.shapeKind) {
      showShapeNotice(
        `✦ ${finished.shapeKind === 'line' ? 'Garis Lurus' : finished.shapeKind === 'circle' ? 'Lingkaran' : finished.shapeKind === 'triangle' ? 'Segitiga' : finished.shapeKind === 'rect' ? 'Persegi' : finished.shapeKind === 'arrow' ? 'Panah' : 'Elips'}`,
        true,
      );
    }

    commitScratch(pushStroke(scratch, finalStroke));
  };

  const revertLastAutoShape = () => {
    if (scratch.strokes.length === 0) return;
    const lastIdx = scratch.strokes.length - 1;
    const last = scratch.strokes[lastIdx];
    if (!last.rawPoints || last.rawPoints.length === 0) return;
    const restored: Stroke = {
      tool: last.tool,
      color: last.color,
      width: last.width,
      points: last.rawPoints,
    };
    const nextList = [...scratch.strokes.slice(0, lastIdx), restored];
    commitScratch(applyBatchStrokes(scratch, nextList));
    setShapeBadge(null);
  };

  const handleTidyAll = () => {
    const res = tidyStrokesBatch(scratch.strokes);
    if (res.improved > 0) {
      commitScratch(applyBatchStrokes(scratch, res.nextStrokes));
      showShapeNotice(`✦ ${res.improved} coretan dirapikan`, false);
    } else {
      showShapeNotice('Coretan sudah rapi', false);
    }
  };

  const insertTemplate = (tplId: ScratchTemplateId) => {
    const stage = stageRef.current;
    const w = stage?.clientWidth || 380;
    const h = stage?.clientHeight || HEIGHT_PX[heightPreset];
    const tplColor: PenColorId = color === 'amber' ? 'blue' : color;
    const added = buildTemplateStrokes(tplId, w, h, tplColor);
    commitScratch(applyBatchStrokes(scratch, [...scratch.strokes, ...added]));
    setTemplateMenuOpen(false);
    setTool('pen');
    showShapeNotice(
      tplId === 'jokowi' ? '△ Segitiga JoKoWi siap' : tplId === 'venn' ? '◯ Diagram Venn siap' : '→ Garis Bilangan siap',
      false,
    );
  };

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = dark ? '#0f1722' : '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    const link = document.createElement('a');
    link.download = `coretan-${scopeKey.replace(/[^a-z0-9-_]/gi, '-')}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
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
    setShapeBadge(null);
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
          <strong>✎ Kertas Coret-Coretan Pintar</strong>
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
            title="Pena tulis & koreksi bentuk otomatis"
          >
            ✎ Pena
          </button>
          <button
            type="button"
            className={`scratch-tool-btn ${tool === 'highlighter' ? 'is-active' : ''}`}
            onClick={() => setTool('highlighter')}
            aria-pressed={tool === 'highlighter'}
            title="Stabilo transparan untuk menandai angka penting"
          >
            🖍 Stabilo
          </button>
          <button
            type="button"
            className={`scratch-tool-btn ${tool === 'stroke_eraser' ? 'is-active' : ''}`}
            onClick={() => setTool('stroke_eraser')}
            aria-pressed={tool === 'stroke_eraser'}
            title="Sentuh coretan untuk menghapus satu goresan penuh"
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
                className={`scratch-color-dot ${
                  tool !== 'stroke_eraser' && color === c.id ? 'is-active' : ''
                }`}
                style={{ '--dot-color': swatch }}
                onClick={() => {
                  setColor(c.id);
                  if (tool === 'stroke_eraser') setTool('pen');
                }}
                title={c.label}
                aria-label={c.label}
                aria-pressed={tool !== 'stroke_eraser' && color === c.id}
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
            className={`scratch-tool-btn ${autoTidy ? 'is-magic' : ''}`}
            onClick={() => setAutoTidy((v) => !v)}
            aria-pressed={autoTidy}
            title="Rapikan tulisan & bentuk (garis/panah/lingkaran/segitiga/persegi) otomatis, atau tahan sejenak di akhir goresan"
          >
            ✦ Auto-Rapi
          </button>
          <div className="scratch-tpl-wrap">
            <button
              type="button"
              className={`scratch-tool-btn ${templateMenuOpen ? 'is-active' : ''}`}
              onClick={() => setTemplateMenuOpen((v) => !v)}
              title="Sisipkan templat cepat (Segitiga JoKoWi, Diagram Venn, Garis Bilangan)"
            >
              ⊞ Templat
            </button>
            {templateMenuOpen && (
              <div className="scratch-tpl-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => insertTemplate('jokowi')}>
                  △ Segitiga JoKoWi (J = K × W)
                </button>
                <button type="button" role="menuitem" onClick={() => insertTemplate('venn')}>
                  ◯ Diagram Venn (2 Himpunan)
                </button>
                <button type="button" role="menuitem" onClick={() => insertTemplate('axes')}>
                  → Garis Bilangan
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={scratch.strokes.length === 0}
                  onClick={() => {
                    setTemplateMenuOpen(false);
                    handleTidyAll();
                  }}
                >
                  ✦ Rapikan Coretan Lama
                </button>
              </div>
            )}
          </div>
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
            disabled={!canUndoScratch(scratch)}
            title="Urungkan (Ctrl+Z)"
            aria-label="Urungkan coretan terakhir"
          >
            ↶
          </button>
          <button
            type="button"
            className="scratch-tool-btn"
            onClick={() => commitScratch(redoStroke(scratch))}
            disabled={!canRedoScratch(scratch)}
            title="Ulangi (Ctrl+Y)"
            aria-label="Ulangi coretan"
          >
            ↷
          </button>
          <button
            type="button"
            className="scratch-tool-btn"
            onClick={handleDownloadPng}
            disabled={scratch.strokes.length === 0}
            title="Simpan coretan sebagai gambar PNG"
            aria-label="Simpan gambar coretan"
          >
            ⬇
          </button>
          <button
            type="button"
            className={`scratch-tool-btn ${confirmClear ? 'is-danger' : ''}`}
            onClick={handleClearClick}
            disabled={scratch.strokes.length === 0}
            title="Bersihkan seluruh kertas"
          >
            {confirmClear ? 'Yakin?' : 'Hapus Semua'}
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
            Tulis hitungan dengan mouse atau jari. <strong>Auto-Rapi</strong> menghaluskan tulisan &amp;
            meluruskan bentuk—atau <strong>tahan ujung goresan 0,35 detik</strong> untuk snap garis,
            panah, segitiga, lingkaran, atau persegi.
          </div>
        )}
        {shapeBadge && (
          <div className="scratch-shape-toast" role="status" aria-live="polite">
            <span>{shapeBadge.label}</span>
            {shapeBadge.revertable && (
              <button type="button" onClick={revertLastAutoShape}>
                Kembalikan Asli
              </button>
            )}
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`scratch-canvas ${tool === 'stroke_eraser' ? 'is-eraser' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishActiveStroke}
          onPointerCancel={finishActiveStroke}
        />
      </div>
    </section>
  );
}
