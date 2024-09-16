import { getLineCombos } from './utils';

export class NonogramSolver {
  public MAX_SOLVE_TRY_ITERATIONS: number = 25;
  private grid: Array<boolean>;
  private solvedGrid: Array<boolean | null>;
  public isSolved: boolean;
  private dimx: number;
  private dimy: number;
  private colHints: number[][];
  private rowHints: number[][];
  private cachedRowCombos: boolean[][][];
  private cachedColCombos: boolean[][][];

  constructor(grid: Array<boolean>, dimx: number, dimy: number, colHints: number[][], rowHints: number[][]) {
    this.grid = grid;
    this.dimx = dimx;
    this.dimy = dimy;
    this.colHints = colHints;
    this.rowHints = rowHints;
    this.solvedGrid = Array.from({ length: dimx * dimy }, () => null);
    this.isSolved = false;
    this.cachedRowCombos = [];
    this.cachedColCombos = [];
  }

  public solve(): boolean {
    // Check for empty cols
    for (let i = 0; i < this.colHints.length; i++) {
      if (this.colHints[i].length === 0) {
        this.isSolved = false;
        return false;
      }
    }

    // Check for empty rows
    for (let i = 0; i < this.rowHints.length; i++) {
      if (this.rowHints[i].length === 0) {
        this.isSolved = false;
        return false;
      }
    }

    // Cache row and col combos
    for (let i = 0; i < this.dimy; i++) this.cachedRowCombos.push(getLineCombos(this.rowHints[i], this.dimx));
    for (let i = 0; i < this.dimx; i++) this.cachedColCombos.push(getLineCombos(this.colHints[i], this.dimy));

    // Try and solve the grid with a limited number of iterations
    for (let solveIteration = 0; solveIteration < this.MAX_SOLVE_TRY_ITERATIONS; solveIteration++) {
      const changedY = this.iterateRows();
      const changedX = this.iterateCols();

      if (import.meta.env && import.meta.env.DEV) console.log(Array.from({ length: this.dimy }, (_, y) => Array.from({ length: this.dimx }, (_, x) => (this.solvedGrid[y * this.dimx + x] === null ? '.' : this.solvedGrid[y * this.dimx + x] === true ? 'X' : 'O')).join(' ')).join('\n'));

      if (!changedY && !changedX) {
        for (let i = 0; i < this.dimx * this.dimy; i++) {
          if (this.solvedGrid[i] !== this.grid[i]) {
            this.isSolved = false;
            return false; // Nonogram is not solveable
          }
        }
        // Nonogram is solveable
        this.isSolved = true;
        return true;
      }
    }

    // Reached maximum number of iterations; assume the nonogram is not solveable
    this.isSolved = false;
    return false;
  }

  private iterateRows(): boolean {
    let changed = false;

    for (let y = 0; y < this.dimy; y++) {
      // Recalculate matching combinations
      const matchingCombinations = this.cachedRowCombos[y].filter((combination) => {
        for (let x = 0; x < this.dimx; x++) {
          if (this.solvedGrid[y * this.dimx + x] !== null && this.solvedGrid[y * this.dimx + x] !== combination[x]) return false;
        }
        return true;
      });
      this.cachedRowCombos[y] = matchingCombinations;

      // Iterate over row
      for (let x = 0; x < this.dimx; x++) {
        let value: boolean | null = matchingCombinations[0][x];
        for (let i = 0; i < matchingCombinations.length; i++) {
          if (matchingCombinations[i][x] !== value) {
            value = null;
            break;
          }
        }
        if (value !== null && this.solvedGrid[y * this.dimx + x] !== value) {
          this.solvedGrid[y * this.dimx + x] = value;
          changed = true;
        }
      }
    }

    return changed;
  }

  private iterateCols(): boolean {
    let changed = false;

    for (let x = 0; x < this.dimx; x++) {
      // Recalculate matching combinations
      const matchingCombinations = this.cachedColCombos[x].filter((combination) => {
        for (let y = 0; y < this.dimy; y++) {
          if (this.solvedGrid[y * this.dimx + x] !== null && this.solvedGrid[y * this.dimx + x] !== combination[y]) return false;
        }
        return true;
      });
      this.cachedColCombos[x] = matchingCombinations;

      // Iterate over row
      for (let y = 0; y < this.dimy; y++) {
        let value: boolean | null = matchingCombinations[0][y];
        for (let i = 0; i < matchingCombinations.length; i++) {
          if (matchingCombinations[i][y] !== value) {
            value = null;
            break;
          }
        }
        if (value !== null && this.solvedGrid[y * this.dimx + x] !== value) {
          this.solvedGrid[y * this.dimx + x] = value;
          changed = true;
        }
      }
    }

    return changed;
  }
}
