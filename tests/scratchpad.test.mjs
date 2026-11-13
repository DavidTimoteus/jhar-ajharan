import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSmoothSegments,
  clampPoint,
  EMPTY_SCRATCH,
  pushStroke,
  redoStroke,
  resolveStrokeHex,
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
});

