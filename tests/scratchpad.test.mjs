import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyBatchStrokes,
  beautifyFreehandPoints,
  buildSmoothSegments,
  buildTemplateStrokes,
  clampPoint,
  detectAndCorrectShape,
  EMPTY_SCRATCH,
  eraseHitStrokes,
  pushStroke,
  redoStroke,
  resolveStrokeHex,
  tidyStrokesBatch,
  undoStroke,
} from '../src/lib/scratchpad.ts';

describe('Mesin Coret-Coretan Digital (Mouse & Touch)', () => {
  it('pushStroke, undoStroke, dan redoStroke menjaga riwayat langkah dengan benar', () => {
    const s1 = {
      tool: 'pen',
      color: 'ink',
      width: 3.6,
      points: [{ x: 10, y: 20 }, { x: 25, y: 40 }],
    };
    const s2 = {
      tool: 'pen',
      color: 'blue',
      width: 2.2,
      points: [{ x: 50, y: 12 }, { x: 80, y: 30 }],
    };

    let state = pushStroke(EMPTY_SCRATCH, s1);
    state = pushStroke(state, s2);
    assert.equal(state.strokes.length, 2);
    assert.equal(state.redoStack.length, 0);

    // Undo menghapus stroke terakhir dan menaruhnya ke redoStack
    state = undoStroke(state);
    assert.equal(state.strokes.length, 1);
    assert.equal(state.redoStack.length, 1);
    assert.equal(state.strokes[0].color, 'ink');

    // Redo memulihkan stroke yang di-undo
    state = redoStroke(state);
    assert.equal(state.strokes.length, 2);
    assert.equal(state.redoStack.length, 0);
    assert.equal(state.strokes[1].color, 'blue');

    // Menggambar stroke baru setelah undo harus mengosongkan redoStack
    state = undoStroke(state);
    state = pushStroke(state, {
      tool: 'eraser',
      color: 'ink',
      width: 6.2,
      points: [{ x: 5, y: 5 }],
    });
    assert.equal(state.strokes.length, 2);
    assert.equal(state.redoStack.length, 0);
  });

  it('buildSmoothSegments merender titik, garis 2-titik, dan kurva kuadratik halus untuk banyak titik', () => {
    assert.deepEqual(buildSmoothSegments([]), []);

    const dot = buildSmoothSegments([{ x: 12, y: 15 }]);
    assert.equal(dot.length, 1);
    assert.equal(dot[0].type, 'dot');

    const line = buildSmoothSegments([{ x: 0, y: 0 }, { x: 10, y: 10 }]);
    assert.equal(line.length, 1);
    assert.equal(line[0].type, 'line');

    const curve = buildSmoothSegments([
      { x: 0, y: 0 },
      { x: 10, y: 20 },
      { x: 30, y: 20 },
      { x: 40, y: 0 },
    ]);
    assert.equal(curve.length, 3);
    assert.equal(curve[0].type, 'quad');
    assert.equal(curve[1].type, 'quad');
    assert.equal(curve[2].type, 'line');
  });

  it('clampPoint menjaga koordinat di dalam batas kanvas & resolveStrokeHex beradaptasi tema', () => {
    const pt = clampPoint(-15.34, 412.89, 300, 240);
    assert.deepEqual(pt, { x: 0, y: 240 });

    assert.notEqual(resolveStrokeHex('ink', false), resolveStrokeHex('ink', true));
    assert.equal(resolveStrokeHex('blue', false).startsWith('#'), true);
  });

  it('detectAndCorrectShape mengenali garis lurus (axis snap), panah, lingkaran, segitiga & persegi (Apple QuickShape)', () => {
    // 1. Garis hampir horizontal (miring 2 derajat + bergetar) harus diluruskan rata horizontal
    const wobblyLine = Array.from({ length: 16 }, (_, i) => ({
      x: 20 + i * 10,
      y: 80 + Math.sin(i * 1.4) * 2.2 + i * 0.25,
    }));
    const lineRes = detectAndCorrectShape(wobblyLine);
    assert.equal(lineRes?.kind, 'line');
    assert.equal(lineRes?.points.length, 2);
    assert.equal(lineRes?.points[0].y, lineRes?.points[1].y);

    // 2. Anak panah 1 goresan berkesinambungan
    const arrowPts = [
      { x: 20, y: 100 },
      { x: 70, y: 101 },
      { x: 130, y: 100 },
      { x: 112, y: 86 },
    ];
    const arrowRes = detectAndCorrectShape(arrowPts);
    assert.equal(arrowRes?.kind, 'arrow');
    assert.equal(arrowRes?.sharp, true);
    assert.equal(arrowRes?.points.length, 5);

    // 3. Lingkaran bergelombang
    const noisyCircle = Array.from({ length: 40 }, (_, i) => {
      const a = (i / 39) * Math.PI * 2;
      const r = 45 + Math.sin(i * 3) * 3;
      return { x: 140 + r * Math.cos(a), y: 120 + r * Math.sin(a) };
    });
    const circleRes = detectAndCorrectShape(noisyCircle);
    assert.equal(circleRes?.kind, 'circle');
    assert.equal(circleRes?.points.length, 49);

    // 4. Persegi dengan 4 sudut agak goyang
    const wobblyRect = [
      { x: 30, y: 30 },
      { x: 80, y: 31 },
      { x: 130, y: 32 },
      { x: 129, y: 80 },
      { x: 128, y: 130 },
      { x: 75, y: 129 },
      { x: 32, y: 128 },
      { x: 31, y: 78 },
      { x: 30, y: 31 },
    ];
    const rectRes = detectAndCorrectShape(wobblyRect);
    assert.equal(rectRes?.kind, 'rect');
    assert.equal(rectRes?.sharp, true);
    assert.equal(rectRes?.points.length, 5);

    // 5. Segitiga 3 simpul
    const triPts = [
      { x: 100, y: 30 },
      { x: 130, y: 75 },
      { x: 160, y: 120 },
      { x: 100, y: 121 },
      { x: 40, y: 120 },
      { x: 70, y: 75 },
      { x: 100, y: 32 },
    ];
    const triRes = detectAndCorrectShape(triPts);
    assert.equal(triRes?.kind, 'triangle');
    assert.equal(triRes?.points.length, 4);
  });

  it('beautifyFreehandPoints meredam getaran kurva sambil menjaga sudut tajam angka 7', () => {
    const num7 = [
      { x: 20, y: 20 },
      { x: 45, y: 21 },
      { x: 70, y: 20 },
      { x: 55, y: 48 },
      { x: 40, y: 80 },
    ];
    const smoothed = beautifyFreehandPoints(num7);
    assert.equal(smoothed[0].x, 20);
    // Titik sudut kanan atas (70, 20) harus tetap tajam terjaga
    assert.ok(smoothed.some((p) => p.x >= 68 && p.y <= 22));
  });

  it('eraseHitStrokes, tidyStrokesBatch, batch Undo/Redo, & buildTemplateStrokes bekerja akurat', () => {
    const s1 = { tool: 'pen', color: 'ink', width: 3, points: [{ x: 10, y: 10 }, { x: 80, y: 10 }] };
    const s2 = {
      tool: 'pen',
      color: 'blue',
      width: 3,
      points: Array.from({ length: 12 }, (_, i) => ({ x: 10 + i * 10, y: 120 + (i % 2) * 2 })),
    };

    let state = applyBatchStrokes(EMPTY_SCRATCH, [s1, s2]);
    // Penghapus objek mengenai s1 saja (y=12)
    const erased = eraseHitStrokes(state.strokes, { x: 45, y: 12 }, 10);
    assert.equal(erased.removed, 1);
    assert.equal(erased.nextStrokes.length, 1);

    state = applyBatchStrokes(state, erased.nextStrokes);
    assert.equal(state.strokes.length, 1);

    // Undo batch mengembalikan 2 coretan awal; redo mengembalikan 1 coretan
    state = undoStroke(state);
    assert.equal(state.strokes.length, 2);
    state = redoStroke(state);
    assert.equal(state.strokes.length, 1);

    // tidyStrokesBatch merapikan garis s2 yang tersisa
    const tidied = tidyStrokesBatch(state.strokes);
    assert.equal(tidied.improved, 1);
    assert.equal(tidied.nextStrokes[0].shapeKind, 'line');

    // Templat cepat valid
    assert.equal(buildTemplateStrokes('jokowi', 400, 300).length, 3);
    assert.equal(buildTemplateStrokes('venn', 400, 300).length, 2);
    assert.equal(buildTemplateStrokes('axes', 400, 300).length, 6);
  });
});

