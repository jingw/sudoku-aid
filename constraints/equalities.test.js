import * as sudoku from "../sudoku.js";
import { EqualityConstraint } from "./equalities.js";
import { processSettings } from "./processor.js";
QUnit.module("constraints/equalities");
QUnit.test("computes set intersection on 3 cells", (assert) => {
    const constraint = new EqualityConstraint([
        [0, 0],
        [0, 1],
        [0, 2],
    ]);
    const settings = processSettings({ constraints: [constraint] });
    const board = sudoku.emptyBoard(9);
    board[0][0] = sudoku.bitMask(1) | sudoku.bitMask(2);
    board[0][1] = sudoku.bitMask(2) | sudoku.bitMask(3);
    const next = sudoku.clone(board);
    constraint.performElimination(settings, board, next);
    assert.equal(sudoku.dump(next, { verbose: true }), `\
[ 2       ][ 2       ][ 2       ] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});
