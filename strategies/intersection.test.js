import { Cage } from "../constraints/cages.js";
import { EqualityConstraint } from "../constraints/equalities.js";
import { processSettings } from "../constraints/processor.js";
import * as sudoku from "../sudoku.js";
import { eliminateIntersections } from "./intersections.js";
QUnit.module("strategies/intersection");
QUnit.test("eliminate intersection with equality", (assert) => {
    // If the equal cells are 1, then there is no place to put a 1 in the 3rd block.
    const settings = processSettings({
        constraints: [
            new EqualityConstraint([
                [0, 0],
                [1, 3],
            ]),
        ],
    });
    const board = sudoku.emptyBoard(9);
    for (let c = 6; c < 9; c++) {
        board[2][c] &= ~sudoku.bitMask(1);
    }
    const next = sudoku.clone(board);
    eliminateIntersections(settings, board, next);
    assert.cleanExceptForDigit(next, 1);
    assert.equal(sudoku.dump(next, { singleDigit: 1 }), `\
X.. ... ...
... X.. ...
... ... XXX

... ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...`);
});
QUnit.test("eliminate intersection complete cage", (assert) => {
    const settings = processSettings({
        constraints: [
            new Cage([
                [2, 2],
                [2, 3],
                [3, 2],
                [3, 3],
            ], 0),
        ],
    });
    const board = sudoku.emptyBoard(9);
    // Set up cage that must contain 1234, and the 1 candidates are aligned in a row.
    const bits234 = sudoku.bitMask(2) | sudoku.bitMask(3) | sudoku.bitMask(4);
    board[2][2] = sudoku.bitMask(1) | bits234;
    board[2][3] = sudoku.bitMask(1) | bits234;
    board[3][2] = bits234;
    board[3][3] = bits234;
    const next = sudoku.clone(board);
    eliminateIntersections(settings, board, next);
    assert.equal(sudoku.dump(next, { verbose: true }), `\
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][ 23456789][1234     ] [1234     ][ 23456789][ 23456789] [ 23456789][ 23456789][ 23456789]

[123456789][123456789][ 234     ] [ 234     ][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});
QUnit.test("eliminate intersection cage with mandatory members", (assert) => {
    // Cage summing to 8 must contain 1, so it eliminates 1 from the rest of the row/block.
    const settings = processSettings({
        constraints: [
            new Cage([
                [0, 0],
                [0, 1],
                [0, 2],
            ], 8),
        ],
    });
    const board = sudoku.emptyBoard(9);
    const next = sudoku.clone(board);
    eliminateIntersections(settings, board, next);
    assert.cleanExceptForDigit(next, 1);
    assert.equal(sudoku.dump(next, { singleDigit: 1 }), `\
... XXX XXX
XXX ... ...
XXX ... ...

... ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...`);
});
