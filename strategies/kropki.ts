import { ALL_ONES, bitMask1 } from "../bitset.js";
import { Board, Coordinate, ReadonlyBoard, Settings } from "../sudoku.js";

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

/* Return a new set where each member of the original set is multiplied by factor */
export function shiftMultiply(
  set: number,
  factor: number,
  boardSize: number,
  startDigit: number,
): number {
  const offset = startDigit - 1;
  let result = 0;
  for (let d = 1; d <= boardSize; d++) {
    const newDigit = (d + offset) * factor - offset;
    if (set & bitMask1(d) && newDigit <= boardSize) {
      result |= bitMask1(newDigit);
    }
  }
  return result;
}

/* Return a new set where each member of the original set is divided by factor */
export function shiftDivide(
  set: number,
  factor: number,
  boardSize: number,
  startDigit: number,
): number {
  const offset = startDigit - 1;
  let result = 0;
  for (let d = 1; d <= boardSize; d++) {
    if (set & bitMask1(d) && (d + offset) % factor === 0) {
      result |= bitMask1((d + offset) / factor - offset);
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
  const startDigit = settings.startDigit ?? 1;
  for (const dots of settings.doubleKropkiDots) {
    // get all possible values for first cell if ascending or descending
    const startAscending = intersectWithShift(origBoard, dots, (s, i) =>
      shiftDivide(s, 1 << i, board.length, startDigit),
    );
    const startDescending = intersectWithShift(origBoard, dots, (s, i) =>
      shiftMultiply(s, 1 << i, board.length, startDigit),
    );
    // apply to whole chain
    for (let i = 0; i < dots.length; i++) {
      const [r, c] = dots[i];
      board[r][c] &=
        shiftMultiply(startAscending, 1 << i, board.length, startDigit) |
        shiftDivide(startDescending, 1 << i, board.length, startDigit);
    }
  }
}
