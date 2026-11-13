import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { newAttempt, remedialIds, score } from '../src/lib/engine.ts';

const MOCK_PACK = {
  id: 'test-pack',
  name: 'Test SKD',
  family: 'cpns',
  version: 1,
  updatedAt: '2026-11-13T00:00:00.000Z',
  source: 'Unit Test',
  config: {
    durationMin: 100,
    subtests: [
      { id: 'twk', name: 'TWK', scheme: 'binary', perCorrect: 5, passMin: 5 },
      { id: 'tkp', name: 'TKP', scheme: 'weighted', passMin: 4 },
    ],
  },
  questions: [
    {
      id: 'q1',
      subtest: 'twk',
      topic: 'integritas',
      stem: 'Soal TWK 1',
      options: ['A', 'B', 'C', 'D', 'E'],
      key: 2,
      hints: [],
      explain: 'Pembahasan 1',
      targetSec: 40,
    },
    {
      id: 'q2',
      subtest: 'tkp',
      topic: 'pelayanan',
      stem: 'Soal TKP 1',
      options: ['A', 'B', 'C', 'D', 'E'],
      weights: [5, 4, 3, 2, 1],
      hints: [],
      explain: 'Pembahasan 2',
      targetSec: 40,
    },
  ],
};

describe('Mesin Ujian & Isolasi Sesi', () => {
  it('Menghitung skor binary + weighted dan menandai remidi dengan akurat', () => {
    const att = newAttempt(MOCK_PACK, 'simulasi', ['q1', 'q2'], 'sesi-budi');
    assert.equal(att.sessionId, 'sesi-budi');
    att.answers.q1 = { choice: 2, doubt: false, ms: 20_000, hints: 0 };
    att.answers.q2 = { choice: 1, doubt: true, ms: 70_000, hints: 0 }; // skor 4, ragu & lambat

    const res = score(att, MOCK_PACK);
    assert.equal(res.total, 9);
    assert.equal(res.perSubtest[0].passed, true);
    const rem = remedialIds(att, MOCK_PACK);
    assert.deepEqual(rem, ['q2']);
  });
});
