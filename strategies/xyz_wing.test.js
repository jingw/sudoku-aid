import * as base from "./base.js";
import * as sudoku from "../sudoku.js";
import { eliminateXYZWing } from "./xyz_wing.js";
QUnit.module("strategies/xyz_wing");
QUnit.test("XY wing", (assert) => {
    const settings = base.processSettings({});
    const board = sudoku.emptyBoard();
    board[0][0] = sudoku.bitMask(1) | sudoku.bitMask(3);
    board[0][3] = sudoku.bitMask(1) | sudoku.bitMask(2);
    board[1][1] = sudoku.bitMask(2) | sudoku.bitMask(3);
    const next = sudoku.clone(board);
    eliminateXYZWing(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[1 3      ][1 3456789][1 3456789] [12       ][123456789][123456789] [123456789][123456789][123456789]
[123456789][ 23      ][123456789] [1 3456789][1 3456789][1 3456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});
QUnit.test("XYZ wing", (assert) => {
    const settings = base.processSettings({});
    const board = sudoku.emptyBoard();
    board[0][0] = sudoku.bitMask(1) | sudoku.bitMask(2) | sudoku.bitMask(3);
    board[0][3] = sudoku.bitMask(1) | sudoku.bitMask(2);
    board[1][1] = sudoku.bitMask(2) | sudoku.bitMask(3);
    const next = sudoku.clone(board);
    eliminateXYZWing(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123      ][1 3456789][1 3456789] [12       ][123456789][123456789] [123456789][123456789][123456789]
[123456789][ 23      ][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});