import { processSettings } from "../constraints/processor.js";
import * as sudoku from "../sudoku.js";
import { eliminateSimpleColoring } from "./simple_coloring.js";
QUnit.module("strategies/simple_coloring");
QUnit.test("4 cell chain", (assert) => {
    const board = sudoku.emptyBoard(9);
    for (let c = 0; c < 9; c++) {
        if (c !== 2 && c !== 3) {
            board[1][c] &= ~sudoku.bitMask(1);
        }
    }
    for (let r = 0; r < 9; r++) {
        if (r !== 1 && r !== 3) {
            board[r][3] &= ~sudoku.bitMask(1);
        }
    }
    for (let c = 0; c < 9; c++) {
        if (c !== 1 && c !== 3) {
            board[3][c] &= ~sudoku.bitMask(1);
        }
    }
    const next = sudoku.clone(board);
    eliminateSimpleColoring(processSettings({}), board, next);
    assert.cleanExceptForDigit(next, 1);
    assert.equal(sudoku.dump(next, { singleDigit: 1 }), `\
.X. X.. ...
XX. .XX XXX
.X. X.. ...

X.X .XX XXX
..X X.. ...
..X X.. ...

... X.. ...
... X.. ...
... X.. ...`);
});
QUnit.test("broken odd length cycle", (assert) => {
    const board = sudoku.emptyBoard(9);
    for (let c = 0; c < 9; c++) {
        if (c !== 2 && c !== 3) {
            board[1][c] &= ~sudoku.bitMask(1);
        }
    }
    for (let r = 0; r < 9; r++) {
        if (r !== 1 && r !== 3) {
            board[r][3] &= ~sudoku.bitMask(1);
        }
    }
    for (let c = 0; c < 9; c++) {
        if (c !== 1 && c !== 3) {
            board[3][c] &= ~sudoku.bitMask(1);
        }
    }
    for (let r = 0; r < 9; r++) {
        if (r !== 2 && r !== 3) {
            board[r][1] &= ~sudoku.bitMask(1);
        }
    }
    board[0][0] &= ~sudoku.bitMask(1);
    board[0][2] &= ~sudoku.bitMask(1);
    board[2][0] &= ~sudoku.bitMask(1);
    board[2][2] &= ~sudoku.bitMask(1);
    const next = sudoku.clone(board);
    eliminateSimpleColoring(processSettings({}), board, next);
    assert.cleanExceptForDigit(next, 1);
    assert.equal(sudoku.dump(next, { singleDigit: 1 }), `\
XXX X.. ...
XXX XXX XXX
XXX X.. ...

XXX XXX XXX
.X. X.. ...
.X. X.. ...

.X. X.. ...
.X. X.. ...
.X. X.. ...`);
});
