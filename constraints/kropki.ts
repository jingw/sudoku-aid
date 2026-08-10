import {
  ALL_ONES,
  Board,
  Coordinate,
  ReadonlyBoard,
  bitMask,
} from "../sudoku.js";
import { ProcessedSettings } from "./constraint.js";
import { Constraint } from "./constraint.js";

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

// A single KropkiDots constraint represents a chain of dots where digits cannot repeat

export class ConsecutiveKropkiDots extends Constraint {
  performElimination(
    _: ProcessedSettings,
    origBoard: ReadonlyBoard,
    board: Board,
  ): void {
    // get all possible values for first cell if ascending or descending
    const startAscending = intersectWithShift(
      origBoard,
      this.members,
      (s, i) => s >>> i,
    );
    const startDescending = intersectWithShift(
      origBoard,
      this.members,
      (s, i) => s << i,
    );
    // apply to whole chain
    for (let i = 0; i < this.members.length; i++) {
      const [r, c] = this.members[i];
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
    if (set & bitMask(d) && newDigit <= boardSize) {
      result |= bitMask(newDigit);
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
    if (set & bitMask(d) && (d + offset) % factor === 0) {
      result |= bitMask((d + offset) / factor - offset);
    }
  }
  return result;
}

export class DoubleKropkiDots extends Constraint {
  performElimination(
    settings: ProcessedSettings,
    origBoard: ReadonlyBoard,
    board: Board,
  ): void {
    const startDigit = settings.startDigit;
    // get all possible values for first cell if ascending or descending
    const startAscending = intersectWithShift(origBoard, this.members, (s, i) =>
      shiftDivide(s, 1 << i, board.length, startDigit),
    );
    const startDescending = intersectWithShift(
      origBoard,
      this.members,
      (s, i) => shiftMultiply(s, 1 << i, board.length, startDigit),
    );
    // apply to whole chain
    for (let i = 0; i < this.members.length; i++) {
      const [r, c] = this.members[i];
      board[r][c] &=
        shiftMultiply(startAscending, 1 << i, board.length, startDigit) |
        shiftDivide(startDescending, 1 << i, board.length, startDigit);
    }
  }
}
