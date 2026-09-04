import * as sudoku from "../sudoku.js";
import { processSettings } from "./processor.js";
import { Thermometer } from "./thermometers.js";
QUnit.module("constraints/thermometers");
QUnit.test("eliminate length 9 thermometer", (assert) => {
    const constraint = new Thermometer([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
    ], true);
    const settings = processSettings({ constraints: [constraint] });
    const board = sudoku.emptyBoard(9);
    const next = sudoku.clone(board);
    constraint.performElimination(settings, board, next);
    assert.equal(sudoku.dump(next), `\
123 45. ...
... .6. ...
... .7. ...

... .8. ...
... .9. ...
... ... ...

... ... ...
... ... ...
... ... ...`);
});
QUnit.test("eliminate broken thermometer", (assert) => {
    const constraint = new Thermometer([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [5, 4],
    ], true);
    const settings = processSettings({ constraints: [constraint] });
    const board = sudoku.emptyBoard(9);
    const next = sudoku.clone(board);
    constraint.performElimination(settings, board, next);
    assert.equal(sudoku.dump(next), `\
      . ...
... . . ...
... . . ...

... . . ...
... . . ...
... . . ...

... ... ...
... ... ...
... ... ...`);
});
QUnit.test("eliminate length 5 thermometer", (assert) => {
    const constraint = new Thermometer([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
    ], true);
    const settings = processSettings({ constraints: [constraint] });
    const board = sudoku.emptyBoard(9);
    const next = sudoku.clone(board);
    constraint.performElimination(settings, board, next);
    assert.equal(sudoku.dump(next, { verbose: true }), `\
[12345    ][ 23456   ][  34567  ] [   45678 ][    56789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});
QUnit.test("eliminate thermometer with starting restrictions", (assert) => {
    const constraint = new Thermometer([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
    ], true);
    const settings = processSettings({ constraints: [constraint] });
    const board = sudoku.emptyBoard(9);
    board[0][0] = sudoku.bitMask(2);
    board[0][2] = sudoku.bitMask(3) | sudoku.bitMask(6) | sudoku.bitMask(7);
    const next = sudoku.clone(board);
    constraint.performElimination(settings, board, next);
    assert.equal(sudoku.dump(next, { verbose: true }), `\
[ 2       ][  3456   ][     67  ] [      789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});
QUnit.test("eliminate non-strict thermometer", (assert) => {
    const members = [];
    for (let i = 0; i < 9; i++) {
        members.push([i, i]);
    }
    const constraint = new Thermometer(members, false);
    const settings = processSettings({ constraints: [constraint] });
    const board = sudoku.emptyBoard(9);
    const next = sudoku.clone(board);
    constraint.performElimination(settings, board, next);
    assert.equal(sudoku.dump(next, { verbose: true }), `\
[123      ][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][ 234     ][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][  345    ] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [  345    ][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][   456   ][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][    567  ] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [    567  ][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][     678 ][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][      789]`);
});
