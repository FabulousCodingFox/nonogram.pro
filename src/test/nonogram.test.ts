import { assert, test } from 'vitest';
import { getLineCombos } from '../lib/nonogram/utils';

test('getLineCombos()', () => {
  assert.deepEqual(getLineCombos([1], 5), [
    [true, false, false, false, false],
    [false, true, false, false, false],
    [false, false, true, false, false],
    [false, false, false, true, false],
    [false, false, false, false, true]
  ], "[1], 5")

  assert.deepEqual(getLineCombos([2], 5), [
    [true, true, false, false, false],
    [false, true, true, false, false],
    [false, false, true, true, false],
    [false, false, false, true, true],
  ], "[2], 5")

  assert.deepEqual(getLineCombos([3, 1], 5), [
    [true, true, true, false, true,]
  ], "[3, 1], 5")

  assert.deepEqual(getLineCombos([2, 1], 5), [
    [true, true, false, true, false],
    [true, true, false, false, true],
    [false, true, true, false, true],
  ], "[2, 1], 5")

  assert.deepEqual(getLineCombos([4], 5), [
    [true, true, true, true, false],
    [false, true, true, true, true]
  ], "[4], 5")
})
