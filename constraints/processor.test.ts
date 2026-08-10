import { processSettings } from "../constraints/processor.js";
import { applyAllStrategies } from "../strategies/all.js";
import { eliminateIntersections } from "../strategies/intersections.js";
import { eliminateNakedSets } from "../strategies/naked_sets.js";
import { eliminateObvious } from "../strategies/obvious.js";
import * as sudoku from "../sudoku.js";

declare const QUnit: any;

QUnit.module("constraints/processor");

QUnit.test("irregular should not eliminate in blocks", (assert: any) => {
  const settings = processSettings({
    irregular: true,
  });
  const board = sudoku.emptyBoard(9);
  board[0][0] = sudoku.bitMask(1);
  const next = sudoku.clone(board);
  eliminateObvious(settings, board, next);
  assert.cleanExceptForDigit(next, 1);
  assert.equal(
    sudoku.dump(next, { singleDigit: 1 }),
    `\
@XX XXX XXX
X.. ... ...
X.. ... ...

X.. ... ...
X.. ... ...
X.. ... ...

X.. ... ...
X.. ... ...
X.. ... ...`,
  );
});

QUnit.test("digits not in same positions", (assert: any) => {
  const settings = processSettings({
    digitsNotInSamePosition: true,
  });
  const board = sudoku.emptyBoard(9);
  board[0][0] = sudoku.bitMask(1);
  board[0][3] = sudoku.bitMask(2) | sudoku.bitMask(3);
  board[0][6] &= sudoku.bitMask(2) | sudoku.bitMask(3);

  board[3][0] &= ~sudoku.bitMask(9);
  board[3][3] &= ~sudoku.bitMask(9);
  board[3][6] &= ~sudoku.bitMask(9);

  eliminateObvious(settings, board, board);
  eliminateNakedSets(settings, board, board);
  eliminateIntersections(settings, board, board);

  assert.equal(
    sudoku.dump(board, { verbose: true }),
    `\
[1        ][   456789][   456789] [ 23      ][   456789][   456789] [ 23      ][   456789][   456789]
[ 23456789][ 23456789][ 23456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][ 23456789][ 23456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[   45678 ][123456789][123456789] [   45678 ][123456789][123456789] [   45678 ][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[   456789][12345678 ][12345678 ] [   456789][12345678 ][12345678 ] [   456789][12345678 ][12345678 ]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`,
  );
});

QUnit.test("digits not in same positions, size 8", (assert: any) => {
  const settings = processSettings({
    boardSize: 8,
    digitsNotInSamePosition: true,
  });
  const board = sudoku.emptyBoard(8);
  board[0][0] = sudoku.bitMask(1);

  eliminateObvious(settings, board, board);

  assert.equal(
    sudoku.dump(board, { verbose: true }),
    `\
[1       ][ 2345678][ 2345678][ 2345678] [ 2345678][ 2345678][ 2345678][ 2345678]
[ 2345678][ 2345678][ 2345678][ 2345678] [12345678][12345678][12345678][12345678]

[ 2345678][12345678][12345678][12345678] [ 2345678][12345678][12345678][12345678]
[ 2345678][12345678][12345678][12345678] [12345678][12345678][12345678][12345678]

[ 2345678][12345678][12345678][12345678] [ 2345678][12345678][12345678][12345678]
[ 2345678][12345678][12345678][12345678] [12345678][12345678][12345678][12345678]

[ 2345678][12345678][12345678][12345678] [ 2345678][12345678][12345678][12345678]
[ 2345678][12345678][12345678][12345678] [12345678][12345678][12345678][12345678]`,
  );
});

QUnit.test("size 10 board", (assert: any) => {
  const settings = processSettings({
    boardSize: 10,
    startDigit: 0,
  });
  const board = sudoku.emptyBoard(10);
  for (let i = 1; i <= 9; i++) {
    board[0][i - 1] = sudoku.bitMask(i);
  }

  applyAllStrategies(settings, board, board);

  assert.equal(
    sudoku.dump(board, { verbose: true, startDigit: 0 }),
    `\
[0         ][ 1        ][  2       ][   3      ][    4     ][     5    ][      6   ][       7  ][        8 ][         9]
[ 123456789][0 23456789][01 3456789][012 456789][0123 56789][01234 6789][012345 789][0123456 89][01234567 9][012345678 ]
[ 123456789][0 23456789][01 3456789][012 456789][0123 56789][01234 6789][012345 789][0123456 89][01234567 9][012345678 ]
[ 123456789][0 23456789][01 3456789][012 456789][0123 56789][01234 6789][012345 789][0123456 89][01234567 9][012345678 ]
[ 123456789][0 23456789][01 3456789][012 456789][0123 56789][01234 6789][012345 789][0123456 89][01234567 9][012345678 ]
[ 123456789][0 23456789][01 3456789][012 456789][0123 56789][01234 6789][012345 789][0123456 89][01234567 9][012345678 ]
[ 123456789][0 23456789][01 3456789][012 456789][0123 56789][01234 6789][012345 789][0123456 89][01234567 9][012345678 ]
[ 123456789][0 23456789][01 3456789][012 456789][0123 56789][01234 6789][012345 789][0123456 89][01234567 9][012345678 ]
[ 123456789][0 23456789][01 3456789][012 456789][0123 56789][01234 6789][012345 789][0123456 89][01234567 9][012345678 ]
[ 123456789][0 23456789][01 3456789][012 456789][0123 56789][01234 6789][012345 789][0123456 89][01234567 9][012345678 ]`,
  );
});
