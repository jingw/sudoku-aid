import * as base from "./base.js";
import * as bitset from "../bitset.js";
import * as sudoku from "../sudoku.js";
import { eliminate159 } from "./index159.js";

declare const QUnit: any;

QUnit.module("strategies/index159");

QUnit.test("eliminate159", (assert: any) => {
  const settings = base.processSettings({
    index159: true,
  });
  const board = sudoku.emptyBoard(9);
  // candidates -> positions
  board[0][0] = bitset.bitMask(8);
  board[0][4] = bitset.bitMask(2) | bitset.bitMask(3);
  board[0][8] = bitset.bitMask(4) | bitset.bitMask(5);
  // positions -> candidates
  for (let c = 1; c < 9; c++) {
    board[1][c] &= ~bitset.bitMask(1);
  }
  for (let c = 6; c < 9; c++) {
    board[1][c] &= ~bitset.bitMask(5);
  }
  for (let c = 0; c < 3; c++) {
    board[1][c] &= ~bitset.bitMask(9);
  }

  const next = sudoku.clone(board);
  eliminate159(settings, board, next);
  assert.equal(
    sudoku.dump(next, true),
    `\
[       8 ][ 2345678 ][ 2345678 ] [ 234 6789][ 23      ][ 234 678 ] [ 234 678 ][1234 678 ][   4     ]
[1        ][ 2345678 ][ 2345678 ] [ 23456789][ 23456   ][ 23456789] [ 234 6789][ 234 6789][   4 6789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`,
  );
});
