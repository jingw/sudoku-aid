import * as sudoku from "../sudoku.js";
import { GeneralBooleanConstraint } from "./general_boolean.js";
import { processSettings } from "./processor.js";
QUnit.module("constraints/general_boolean");
QUnit.test("single solution", (assert) => {
    const constraint = new GeneralBooleanConstraint([
        [0, 0],
        [0, 1],
        [0, 2],
    ], "x[0] === 1 && x[1] === sum([x[-1], 2])");
    const settings = processSettings({ constraints: [constraint] });
    const board = sudoku.emptyBoard(9);
    board[0][1] &= sudoku.bitMask(5);
    const next = sudoku.clone(board);
    constraint.performElimination(settings, board, next);
    assert.equal(sudoku.dump(next), `\
153 ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...`);
});
QUnit.test("should handle duplicate cell", (assert) => {
    const constraint = new GeneralBooleanConstraint([
        [0, 0],
        [0, 1],
        [0, 1],
        [0, 1],
        [0, 1],
    ], "x[0] === sum(x.slice(1))");
    const settings = processSettings({ constraints: [constraint] });
    const board = sudoku.emptyBoard(9);
    const next = sudoku.clone(board);
    constraint.performElimination(settings, board, next);
    assert.equal(next[0][0], sudoku.bitMask(4) | sudoku.bitMask(8));
    assert.equal(next[0][1], sudoku.bitMask(1) | sudoku.bitMask(2));
});
