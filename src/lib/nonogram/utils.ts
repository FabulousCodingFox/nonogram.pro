export function getLineCombos(hints: number[], length: number): boolean[][] {
  let combinations: boolean[][] = [];

  function recurse(line: boolean[], hintIndex: number, position: number) {
    if (hintIndex === hints.length) {
      // All hints have been processed; fill the rest with false
      for (let i = position; i < length; i++) {
        line[i] = false;
      }
      combinations.push(line.slice()); // Add a copy of the line to combinations
      return;
    }

    let blockLength = hints[hintIndex];

    // Calculate the minimum total length needed from the current hint index
    let minLengthNeeded = 0;
    for (let i = hintIndex; i < hints.length; i++) {
      minLengthNeeded += hints[i];
    }
    // Add minimum spaces between remaining blocks
    minLengthNeeded += hints.length - hintIndex - 1;

    // Calculate the maximum starting position for the current block
    let maxStart = length - minLengthNeeded;

    // Try placing the current block at all possible positions
    for (let i = position; i <= maxStart; i++) {
      // Create a copy of the line to avoid mutating the original
      let newLine = line.slice();

      // Set positions from the current position to the start of the block to false
      for (let j = position; j < i; j++) {
        newLine[j] = false;
      }

      // Set positions for the current block to true
      for (let j = i; j < i + blockLength; j++) {
        newLine[j] = true;
      }

      // Set the position after the block to false (space between blocks), if within bounds
      if (i + blockLength < length) {
        newLine[i + blockLength] = false;
      }

      // Recurse for the next hint
      recurse(newLine, hintIndex + 1, i + blockLength + 1);
    }
  }

  // Initialize the line with false values
  let initialLine = new Array(length).fill(false);
  recurse(initialLine, 0, 0);

  return combinations;
}
