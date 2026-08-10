import * as sudoku from "../sudoku.js";
import { ConsecutiveKropkiDots, DoubleKropkiDots } from "./kropki.js";
import { processSettings } from "./processor.js";

declare const QUnit: any;

QUnit.module("constraints/kropki");

QUnit.test("eliminate kropki", (assert: any) => {
  const constraints = [
    new ConsecutiveKropkiDots([
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
    ]),
    new DoubleKropkiDots([
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ]),
    new DoubleKropkiDots([
      [3, 0],
      [3, 1],
    ]),
  ];
  const settings = processSettings({ constraints });
  const board = sudoku.emptyBoard(9);
  const next = sudoku.clone(board);
  for (const constraint of constraints) {
    constraint.performElimination(settings, board, next);
  }
  assert.equal(
    sudoku.dump(next, { verbose: true }),
    `\
[123   789][ 234 678 ][  34567  ] [   456   ][  34567  ][ 234 678 ] [123   789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[1      8 ][ 2 4     ][ 2 4     ] [1      8 ][123456789][123456789] [123456789][123456789][123456789]

[1234 6 8 ][1234 6 8 ][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`,
  );
});
