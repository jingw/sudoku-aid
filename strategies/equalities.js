import { EMPTY_CELL } from "../sudoku.js";
export function eliminateFromEqualities(settings, origBoard, board) {
    if (!settings.equalities) {
        return;
    }
    for (const equalityConstraint of settings.equalities) {
        let intersection = EMPTY_CELL;
        for (const [r, c] of equalityConstraint) {
            intersection &= origBoard[r][c];
        }
        for (const [r, c] of equalityConstraint) {
            board[r][c] &= intersection;
        }
    }
}
