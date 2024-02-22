import * as base from "./base.js";
import { Board, Coordinate, ReadonlyBoard, bitMask } from "../sudoku.js";

export function findHiddenSingles(
  settings: base.ProcessedSettings,
  origBoard: ReadonlyBoard,
  board: Board,
): void {
  for (const group of settings.groups) {
    const required = group.requiredDigits(origBoard);
    for (let digit = 1; digit <= 9; digit++) {
      if (required & bitMask(digit)) {
        const possibleCoordinates: Coordinate[] = [];
        for (const [r, c] of group.members) {
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
