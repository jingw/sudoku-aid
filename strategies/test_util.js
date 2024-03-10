import * as all from "./all.js";
import * as sudoku from "../sudoku.js";
export function solve(settings, board) {
    const MAX_ITERATIONS = 100;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const next = sudoku.clone(board);
        all.applyAllStrategies(settings, board, next);
        if (sudoku.areBoardsEqual(board, next)) {
            return [board, i];
        }
        board = next;
    }
    return [board, MAX_ITERATIONS];
}
