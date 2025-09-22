import { Board, ReadonlyBoard, Settings } from "../sudoku.js";
import { bitMask1 } from "../bitset.js";

export function eliminate159(
  settings: Settings,
  origBoard: ReadonlyBoard,
  board: Board,
): void {
  if (!settings.index159) {
    return;
  }
  if (board.length !== 9) {
    throw new Error("159 indexing requires board size 9");
  }
  for (const d of [1, 5, 9]) {
    for (let r = 0; r < 9; r++) {
      const candidates = origBoard[r][d - 1];
      for (let c = 0; c < 9; c++) {
        // cell candidates -> positions in row
        if (!(candidates & bitMask1(c + 1))) {
          board[r][c] &= ~bitMask1(d);
        }
        // positions in row -> cell candidates
        if (!(origBoard[r][c] & bitMask1(d))) {
          board[r][d - 1] &= ~bitMask1(c + 1);
        }
      }
    }
  }
}
