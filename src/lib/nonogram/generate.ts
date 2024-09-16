import type { NonogramData } from './types';
import { NonogramSolver } from './solver';

function generateNonogramRandomGrid(dimx: number, dimy: number): Array<boolean> {
  const density = Math.random() * 0.6 + 0.2;
  return Array.from({ length: dimx * dimy }, () => Math.random() < density);
}

export async function generateNonogram(dimx: number, dimy: number): Promise<NonogramData> {
  let grid: boolean[] = [];
  let colHints: number[][] = [];
  let rowHints: number[][] = [];
  let colHintslength = 0;
  let rowHintslength = 0;

  let iterationCount = 0;

  // Generate a nonogram until it is solveable
  while (grid.length < dimx * dimy || !new NonogramSolver(grid, dimx, dimy, colHints, rowHints).solve()) {
    if (import.meta.env && import.meta.env.DEV) console.log('Generating nonogram', iterationCount++);

    // Generate a random nonogram
    grid = generateNonogramRandomGrid(dimx, dimy);

    // Populate column hints
    colHintslength = 0;
    colHints = Array.from({ length: dimx }, (_, x) => {
      const nums: number[] = [];
      let count = 0;

      for (let y = 0; y < dimy; y++) {
        if (grid[y * dimx + x]) {
          count++;
        } else {
          if (count > 0) {
            nums.push(count);
            count = 0;
          }
        }
      }

      if (count > 0) {
        nums.push(count);
      }

      if (nums.length > colHintslength) colHintslength = nums.length;

      return nums;
    });

    // Populate row hints
    rowHintslength = 0;
    rowHints = Array.from({ length: dimy }, (_, y) => {
      const nums: number[] = [];
      let count = 0;

      for (let x = 0; x < dimx; x++) {
        if (grid[y * dimx + x]) {
          count++;
        } else {
          if (count > 0) {
            nums.push(count);
            count = 0;
          }
        }
      }

      if (count > 0) {
        nums.push(count);
      }

      if (nums.length > rowHintslength) rowHintslength = nums.length;

      return nums;
    });
  }

  // Return the generated nonogram
  return {
    sizeX: dimx,
    sizeY: dimy,
    grid: grid,
    rowHints: rowHints,
    colHints: colHints,
    rowHintslength: rowHintslength,
    colHintslength: colHintslength
  };
}
