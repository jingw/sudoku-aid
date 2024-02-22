import {
  Board,
  Coordinate,
  EMPTY_CELL,
  ReadonlyBoard,
  Settings,
  bitMask,
} from "../sudoku.js";

/**
 * Compute shift(set1, 0) & shift(set2, 1) & shift(set3, 2) & ...
 */
function intersectWithShift(
  board: ReadonlyBoard,
  coordinates: readonly Coordinate[],
  shift: (set: number, i: number) => number,
): number {
  let start = EMPTY_CELL;
  for (let i = 0; i < coordinates.length; i++) {
    const [r, c] = coordinates[i];
    start &= shift(board[r][c], i);
  }
  return start;
}

export function eliminateFromConsecutiveKropkiDots(
  settings: Settings,
  origBoard: ReadonlyBoard,
  board: Board,
): void {
  if (!settings.consecutiveKropkiDots) {
    return;
  }
  for (const dots of settings.consecutiveKropkiDots) {
    // get all possible values for first cell if ascending or descending
    const startAscending = intersectWithShift(
      origBoard,
      dots,
      (s, i) => s >>> i,
    );
    const startDescending = intersectWithShift(
      origBoard,
      dots,
      (s, i) => s << i,
    );
    // apply to whole chain
    for (let i = 0; i < dots.length; i++) {
      const [r, c] = dots[i];
      board[r][c] &=
        (startAscending << i) | ((startDescending >>> i) & EMPTY_CELL);
    }
  }
}

export function shiftMultiply(set: number, factor: number): number {
  let result = 0;
  for (let d = 1; d <= 9; d++) {
    if (set & bitMask(d) && d * factor <= 9) {
      result |= bitMask(d * factor);
    }
  }
  return result;
}

export function shiftDivide(set: number, factor: number): number {
  let result = 0;
  for (let d = 1; d <= 9; d++) {
    if (set & bitMask(d) && d % factor === 0) {
      result |= bitMask(d / factor);
    }
  }
  return result;
}

export function eliminateFromDoubleKropkiDots(
  settings: Settings,
  origBoard: ReadonlyBoard,
  board: Board,
): void {
  if (!settings.doubleKropkiDots) {
    return;
  }
  for (const dots of settings.doubleKropkiDots) {
    // get all possible values for first cell if ascending or descending
    const startAscending = intersectWithShift(origBoard, dots, (s, i) =>
      shiftDivide(s, 1 << i),
    );
    const startDescending = intersectWithShift(origBoard, dots, (s, i) =>
      shiftMultiply(s, 1 << i),
    );
    // apply to whole chain
    for (let i = 0; i < dots.length; i++) {
      const [r, c] = dots[i];
      board[r][c] &=
        shiftMultiply(startAscending, 1 << i) |
        shiftDivide(startDescending, 1 << i);
    }
  }
}
