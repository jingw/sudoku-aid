import * as base from "./base.js";
import { Board, Coordinate, ReadonlyBoard } from "../sudoku.js";
import { bitMask } from "../bitset.js";

export function findHiddenSingles(
  settings: base.ProcessedSettings,
  origBoard: ReadonlyBoard,
  board: Board,
): void {
  for (const group of settings.groups) {
    const required = group.requiredDigits(origBoard);
    for (let i = 0; i < board.length; i++) {
      if (required & bitMask(i)) {
        const possibleCoordinates: Coordinate[] = [];
        for (const [r, c] of group.members) {
          if (origBoard[r][c] & bitMask(i)) {
            possibleCoordinates.push([r, c]);
          }
        }
        if (possibleCoordinates.length === 1) {
          const [r, c] = possibleCoordinates[0];
          board[r][c] &= bitMask(i);
        }
      }
    }
  }
}
