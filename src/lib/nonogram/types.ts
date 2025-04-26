export interface NonogramData {
  sizeX: number;
  sizeY: number;
  grid: Array<boolean | null>;
  rowHints: number[][];
  colHints: number[][];
  rowHintslength: number;
  colHintslength: number;
  startGrid: Array<boolean | null>;
}
