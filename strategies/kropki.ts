import {
  ALL_ONES,
  Board,
  Coordinate,
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
  let start = ALL_ONES;
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
      board[r][c] &= (startAscending << i) | (startDescending >>> i);
    }
  }
}

export function shiftMultiply(
  set: number,
  factor: number,
  boardSize: number,
): number {
  let result = 0;
  for (let d = 1; d <= boardSize; d++) {
    if (set & bitMask(d) && d * factor <= boardSize) {
      result |= bitMask(d * factor);
    }
  }
  return result;
}

export function shiftDivide(
  set: number,
  factor: number,
  boardSize: number,
): number {
  let result = 0;
  for (let d = 1; d <= boardSize; d++) {
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
      shiftDivide(s, 1 << i, board.length),
    );
    const startDescending = intersectWithShift(origBoard, dots, (s, i) =>
      shiftMultiply(s, 1 << i, board.length),
    );
    // apply to whole chain
    for (let i = 0; i < dots.length; i++) {
      const [r, c] = dots[i];
      board[r][c] &=
        shiftMultiply(startAscending, 1 << i, board.length) |
        shiftDivide(startDescending, 1 << i, board.length);
    }
  }
}
