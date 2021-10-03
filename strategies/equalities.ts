import {
    Board,
    EMPTY_CELL,
    ReadonlyBoard,
    Settings,
} from "../sudoku.js";

export function eliminateFromEqualities(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
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
