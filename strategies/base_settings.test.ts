import * as base from "./base.js";
import * as sudoku from "../sudoku.js";
import { eliminateIntersections } from "./intersections.js";
import { eliminateNakedSets } from "./naked_sets.js";
import { eliminateObvious } from "./obvious.js";

declare const QUnit: any;

QUnit.module("strategies/base_settings");

QUnit.test("irregular should not eliminate in blocks", (assert: any) => {
    const settings = base.processSettings({
        irregular: true,
    });
    const board = sudoku.emptyBoard();
    board[0][0] = sudoku.bitMask(1);
    const next = sudoku.clone(board);
    eliminateObvious(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[1        ][ 23456789][ 23456789] [ 23456789][ 23456789][ 23456789] [ 23456789][ 23456789][ 23456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate when digits not in same positions", (assert: any) => {
    const settings = base.processSettings({
        digitsNotInSamePosition: true,
    });
    const board = sudoku.emptyBoard();
    board[0][0] = sudoku.bitMask(1);
    board[0][3] = sudoku.bitMask(2) | sudoku.bitMask(3);
    board[0][6] &=sudoku.bitMask(2) | sudoku.bitMask(3);

    board[3][0] &= ~sudoku.bitMask(9);
    board[3][3] &= ~sudoku.bitMask(9);
    board[3][6] &= ~sudoku.bitMask(9);

    eliminateObvious(settings, board, board);
    eliminateNakedSets(settings, board, board);
    eliminateIntersections(settings, board, board);

    assert.equal(sudoku.dump(board, true), `\
[1        ][   456789][   456789] [ 23      ][   456789][   456789] [ 23      ][   456789][   456789]
[ 23456789][ 23456789][ 23456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][ 23456789][ 23456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[   45678 ][123456789][123456789] [   45678 ][123456789][123456789] [   45678 ][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[   456789][12345678 ][12345678 ] [   456789][12345678 ][12345678 ] [   456789][12345678 ][12345678 ]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});
