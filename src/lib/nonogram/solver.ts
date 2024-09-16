import { getLineCombos } from './utils';

export function hasNonogramEmptyRowCol(colHints: number[][], rowHints: number[][]): boolean {
  for (let i = 0; i < colHints.length; i++) {
    if (colHints[i].length === 0) return true;
  }
  for (let i = 0; i < rowHints.length; i++) {
    if (rowHints[i].length === 0) return true;
  }
  return false;
}

export function solveNonogramRowsIteration(workingGrid: Array<boolean | null>, dimx: number, dimy: number, rowHints: number[][]): boolean {
  let changed = false;

  for (let y = 0; y < dimy; y++) {
    const matchingCombinations = getLineCombos(rowHints[y], dimy).filter((combination) => {
      for (let x = 0; x < dimx; x++) {
        if (workingGrid[y * dimx + x] !== null && workingGrid[y * dimx + x] !== combination[x]) return false;
      }
      return true;
    });

    for (let x = 0; x < dimx; x++) {
      let value: boolean | null = matchingCombinations[0][x];
      for (let i = 0; i < matchingCombinations.length; i++) {
        if (matchingCombinations[i][x] !== value) {
          value = null;
          break;
        }
      }
      if (value !== null && workingGrid[y * dimx + x] !== value) {
        workingGrid[y * dimx + x] = value;
        changed = true;
      }
    }
  }

  return changed;
}

export function solveNonogramColsIteration(workingGrid: Array<boolean | null>, dimx: number, dimy: number, colHints: number[][]): boolean {
  let changed = false;

  for (let x = 0; x < dimx; x++) {
    const matchingCombinations = getLineCombos(colHints[x], dimx).filter((combination) => {
      for (let y = 0; y < dimy; y++) {
        if (workingGrid[y * dimx + x] !== null && workingGrid[y * dimx + x] !== combination[y]) return false;
      }
      return true;
    });

    for (let y = 0; y < dimy; y++) {
      let value: boolean | null = matchingCombinations[0][x];

      for (let i = 0; i < matchingCombinations.length; i++) {
        if (matchingCombinations[i][y] !== value) {
          value = null;
          break;
        }
      }
      if (value !== null && workingGrid[y * dimx + x] !== value) {
        workingGrid[y * dimx + x] = value;
        changed = true;
      }
    }
  }

  return changed;
}

export const MAX_SOLVE_TRY_ITERATIONS = 25;

export function isNonogramSolveable(grid: Array<boolean>, dimx: number, dimy: number, colHints: number[][], rowHints: number[][]): boolean {
  if (hasNonogramEmptyRowCol(colHints, rowHints)) return false;

  let workingGrid: Array<boolean | null> = Array.from({ length: dimx * dimy }, () => null);

  for (let solveIteration = 0; solveIteration < MAX_SOLVE_TRY_ITERATIONS; solveIteration++) {
    const changedY = solveNonogramRowsIteration(workingGrid, dimx, dimy, rowHints);
    const changedX = solveNonogramColsIteration(workingGrid, dimx, dimy, colHints);

    //console.log(Array.from({ length: dimy }, (_, y) => Array.from({ length: dimx }, (_, x) => (workingGrid[y * dimx + x] === null ? '.' : workingGrid[y * dimx + x] === true ? 'X' : 'O')).join(' ')).join('\n'));

    if (!changedY && !changedX) {
      for (let i = 0; i < dimx * dimy; i++) {
        if (workingGrid[i] !== grid[i]) {
          return false; // Nonogram is not solveable // TODO -> return false
        }
      }
      // Nonogram is solveable
      return true;
    }
  }

  return true;
}
