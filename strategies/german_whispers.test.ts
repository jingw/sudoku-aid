import * as base from "./base.js";
import * as sudoku from "../sudoku.js";
import { eliminateFromGermanWhispers } from "./german_whispers.js";

declare const QUnit: any;

QUnit.module("strategies/german_whispers");

QUnit.test("eliminateFromGermanWhispers", (assert: any) => {
  const settings = base.processSettings({
    germanWhispers: [
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],
    ],
  });
  const board = sudoku.emptyBoard();
  board[1][0] &= ~(sudoku.bitMask(1) | sudoku.bitMask(9));
  board[2][1] = sudoku.bitMask(6) | sudoku.bitMask(7);
  const next = sudoku.clone(board);
  eliminateFromGermanWhispers(settings, board, next);
  assert.equal(
    sudoku.dump(next, true),
    `\
[1234 6789][1234 6789][1234 6789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 234 678 ][123   789][1234 6789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[12       ][     67  ][12       ] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`,
  );
});
