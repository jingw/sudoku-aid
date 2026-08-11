import { processSettings } from "../constraints/processor.js";
import * as sudoku from "../sudoku.js";
import { findHiddenSingles } from "./hidden_singles.js";
QUnit.module("strategies/hidden_singles");
QUnit.test("findHiddenSingles", (assert) => {
    const board = sudoku.emptyBoard(9);
    // put a hidden single in the last position on the 4th row
    for (let c = 0; c < 8; c++) {
        board[3][c] &= ~sudoku.bitMask(2);
    }
    const next = sudoku.clone(board);
    findHiddenSingles(processSettings({}), board, next);
    assert.cleanExceptForDigit(next, 2);
    assert.equal(sudoku.dump(next, { singleDigit: 2 }), `\
... ... ...
... ... ...
... ... ...

XXX XXX XX@
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...`);
});
QUnit.test("findHiddenSingles should not resurrect broken board", (assert) => {
    const board = sudoku.emptyBoard(9);
    // put a hidden single in the last position on the 4th row
    for (let c = 0; c < 8; c++) {
        board[3][c] &= ~sudoku.bitMask(2);
    }
    const next = sudoku.clone(board);
    // rule out 2 before getting to findHiddenSingles
    next[3][8] &= ~sudoku.bitMask(2);
    // findHiddenSingles should not bring it back
    findHiddenSingles(processSettings({}), board, next);
    assert.equal(sudoku.dump(next, { verbose: true }), `\
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[1 3456789][1 3456789][1 3456789] [1 3456789][1 3456789][1 3456789] [1 3456789][1 3456789][         ]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});
