import * as base from "./base.js";
import * as bitset from "../bitset.js";
import * as sudoku from "../sudoku.js";
import { eliminateFromGermanWhispers } from "./german_whispers.js";

declare const QUnit: any;

QUnit.module("strategies/german_whispers");

QUnit.test("eliminateFromGermanWhispers", (assert: any) => {
  const settings = base.processSettings({
    germanWhispers: [
      {
        members: [
          [0, 0],
          [0, 1],
          [0, 2],
        ],
        difference: 5,
      },
      {
        members: [
          [1, 0],
          [1, 1],
          [1, 2],
        ],
        difference: 5,
      },
      {
        members: [
          [2, 0],
          [2, 1],
          [2, 2],
        ],
        difference: 5,
      },
      {
        members: [
          [3, 0],
          [3, 1],
          [3, 2],
        ],
        difference: 2,
      },
    ],
  });
  const board = sudoku.emptyBoard(9);
  board[1][0] &= ~(bitset.bitMask1(1) | bitset.bitMask1(9));
  board[2][1] = bitset.bitMask1(6) | bitset.bitMask1(7);
  board[3][1] = bitset.bitMask1(6) | bitset.bitMask1(7);
  const next = sudoku.clone(board);
  eliminateFromGermanWhispers(settings, board, next);
  assert.equal(
    sudoku.dump(next, true),
    `\
[1234 6789][1234 6789][1234 6789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 234 678 ][123   789][1234 6789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[12       ][     67  ][12       ] [123456789][123456789][123456789] [123456789][123456789][123456789]

[12345  89][     67  ][12345  89] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`,
  );
});
