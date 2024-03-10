import { bitMask } from "../sudoku.js";
export function eliminate159(settings, origBoard, board) {
    if (!settings.index159) {
        return;
    }
    for (const d of [1, 5, 9]) {
        for (let r = 0; r < 9; r++) {
            const candidates = origBoard[r][d - 1];
            for (let c = 0; c < 9; c++) {
                // cell candidates -> positions in row
                if (!(candidates & bitMask(c + 1))) {
                    board[r][c] &= ~bitMask(d);
                }
                // positions in row -> cell candidates
                if (!(origBoard[r][c] & bitMask(d))) {
                    board[r][d - 1] &= ~bitMask(c + 1);
                }
            }
        }
    }
}
