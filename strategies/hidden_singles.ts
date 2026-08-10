import { ProcessedSettings } from "../constraints/constraint.js";
import { Board, Coordinate, ReadonlyBoard, bitMask } from "../sudoku.js";

export function findHiddenSingles(
  settings: ProcessedSettings,
  origBoard: ReadonlyBoard,
  board: Board,
): void {
  for (const constraint of settings.constraints) {
    const required = constraint.requiredDigits(settings, origBoard);
    for (let digit = 1; digit <= board.length; digit++) {
      if (required & bitMask(digit)) {
        const possibleCoordinates: Coordinate[] = [];
        for (const [r, c] of constraint.members) {
          if (origBoard[r][c] & bitMask(digit)) {
            possibleCoordinates.push([r, c]);
          }
        }
        if (possibleCoordinates.length === 1) {
          const [r, c] = possibleCoordinates[0];
          board[r][c] &= bitMask(digit);
        }
      }
    }
  }
}
