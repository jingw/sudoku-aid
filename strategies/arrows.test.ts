import * as base from "./base.js";
import * as sudoku from "../sudoku.js";
import { eliminateFromArrows } from "./arrows.js";

declare const QUnit: any;

QUnit.module("strategies/arrows");

QUnit.test("eliminateFromArrows", (assert: any) => {
  const settings = base.processSettings({
    arrows: [
      // some members can't repeat
      {
        sumMembers: [[0, 0]],
        members: [
          [0, 1],
          [0, 2],
          [0, 3],
          [1, 4],
        ],
      },
      // effectively an equality constraint
      {
        sumMembers: [[5, 2]],
        members: [[6, 3]],
      },
      // two cell sum
      {
        sumMembers: [
          [8, 0],
          [8, 1],
        ],
        members: [
          [8, 2],
          [8, 3],
        ],
      },
    ],
  });
  const board = sudoku.emptyBoard();
  board[5][2] = sudoku.bitMask(1) | sudoku.bitMask(2);
  board[6][3] = sudoku.bitMask(2) | sudoku.bitMask(3);
  const next = sudoku.clone(board);
  eliminateFromArrows(settings, board, next);
  assert.equal(
    sudoku.dump(next, true),
    `\
[      789][12345    ][12345    ] [12345    ][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123      ][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][ 2       ] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [ 2       ][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[1        ][ 234567  ][  3456789] [  3456789][123456789][123456789] [123456789][123456789][123456789]`,
  );
});
