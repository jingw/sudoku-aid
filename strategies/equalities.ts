import { Board, ReadonlyBoard, Settings } from "../sudoku.js";
import { ALL_ONES } from "../bitset.js";

export function eliminateFromEqualities(
  settings: Settings,
  origBoard: ReadonlyBoard,
  board: Board,
): void {
  if (!settings.equalities) {
    return;
  }
  for (const equalityConstraint of settings.equalities) {
    let intersection = ALL_ONES;
    for (const [r, c] of equalityConstraint) {
      intersection &= origBoard[r][c];
    }
    for (const [r, c] of equalityConstraint) {
      board[r][c] &= intersection;
    }
  }
}
