import * as sudoku from "../sudoku.js";
import { GermanWhisper } from "./german_whispers.js";
import { processSettings } from "./processor.js";

declare const QUnit: any;

QUnit.module("constraints/german_whispers");

QUnit.test("basic elimination", (assert: any) => {
  const constraints = [
    new GermanWhisper(
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      5,
    ),
    new GermanWhisper(
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      5,
    ),
    new GermanWhisper(
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      5,
    ),
    new GermanWhisper(
      [
        [3, 0],
        [3, 1],
        [3, 2],
      ],
      2,
    ),
  ];
  const settings = processSettings({ constraints });
  const board = sudoku.emptyBoard(9);
  board[1][0] &= ~(sudoku.bitMask(1) | sudoku.bitMask(9));
  board[2][1] = sudoku.bitMask(6) | sudoku.bitMask(7);
  board[3][1] = sudoku.bitMask(6) | sudoku.bitMask(7);
  const next = sudoku.clone(board);
  for (const constraint of constraints) {
    constraint.performElimination(settings, board, next);
  }
  assert.equal(
    sudoku.dump(next, { verbose: true }),
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
