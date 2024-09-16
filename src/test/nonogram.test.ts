import { assert, test } from 'vitest';
import { getLineCombos } from '../lib/nonogram/utils';
import { solveNonogramRowsIteration } from '../lib/nonogram/solver';

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

test("solveNonogramRowsIteration()", () => {
  let grid = [
    null, true, null, null, null,
    null, null, null, null, null,
    null, null, null, null, null,
    null, null, null, null, null,
    null, null, null, null, null
  ]

  let rowHints = [
    [2],
    [1],
    [1],
    [1],
    [1]
  ]

  solveNonogramRowsIteration(grid, 5, 5, rowHints)

  assert.deepEqual(grid, [
    null, true, null, false, false,
    null, null, null, null, null,
    null, null, null, null, null,
    null, null, null, null, null,
    null, null, null, null, null
  ])

  console.log(Array.from({ length: 5 }, (_, y) => Array.from({ length: 5 }, (_, x) => (grid[y * 5 + x] === null ? '.' : grid[y * 5 + x] === true ? 'X' : 'O')).join(' ')).join('\n'));
})