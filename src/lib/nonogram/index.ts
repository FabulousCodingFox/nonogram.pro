export interface NonogramData {
  sizeX: number;
  sizeY: number;
  grid: Array<boolean | null>;
  rowHints: number[][];
  colHints: number[][];
  rowHintslength: number;
  colHintslength: number;
}

function generateNonogramRandomGrid(dimx: number, dimy: number): Array<boolean> {
  return Array.from({ length: dimx * dimy }, () => Math.random() < 0.5);
}

function generateNonogramIsGridValid(grid: Array<boolean>, dimx: number, dimy: number): boolean {
  return true;
}

export async function generateNonogram(dimx: number, dimy: number): Promise<NonogramData> {
  let grid = generateNonogramRandomGrid(dimx, dimy);
  while (!generateNonogramIsGridValid(grid, dimx, dimy)) {
    grid = generateNonogramRandomGrid(dimx, dimy);
  }

  let colHintslength = 0;
  const colHints: number[][] = Array.from({ length: dimx }, (_, x) => {
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

  let rowHintslength = 0;
  const rowHints: number[][] = Array.from({ length: dimy }, (_, y) => {
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

  await new Promise((resolve) => setTimeout(resolve, 1000));

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
