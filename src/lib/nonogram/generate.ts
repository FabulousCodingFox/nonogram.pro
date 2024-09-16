import type { NonogramData } from './types';
import { isNonogramSolveable } from './solver';

function generateNonogramRandomGrid(dimx: number, dimy: number): Array<boolean> {
  return Array.from({ length: dimx * dimy }, () => Math.random() < 0.5);
}

export async function generateNonogram(dimx: number, dimy: number): Promise<NonogramData> {
  let grid: boolean[] = [];
  let colHints: number[][] = [];
  let rowHints: number[][] = [];
  let colHintslength = 0;
  let rowHintslength = 0;

  let iterationCount = 0;

  while (grid.length < dimx * dimy || !isNonogramSolveable(grid, dimx, dimy, colHints, rowHints)) {
    console.log('Generating nonogram', iterationCount++);

    grid = generateNonogramRandomGrid(dimx, dimy);

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
