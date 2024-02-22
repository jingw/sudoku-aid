import * as base from "./base.js";
import * as sudoku from "../sudoku.js";
import { eliminateFromThermometers } from "./thermometers.js";

declare const QUnit: any;

QUnit.module("strategies/thermometers");

QUnit.test("eliminate length 9 thermometer", (assert: any) => {
  const settings = base.processSettings({
    thermometers: [
      {
        members: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
          [1, 4],
          [2, 4],
          [3, 4],
          [4, 4],
        ],
        strict: true,
      },
    ],
  });
  const board = sudoku.emptyBoard();
  const next = sudoku.clone(board);
  eliminateFromThermometers(settings, board, next);
  assert.equal(
    sudoku.dump(next),
    `\
123 45. ...
... .6. ...
... .7. ...

... .8. ...
... .9. ...
... ... ...

... ... ...
... ... ...
... ... ...`,
  );
});

QUnit.test("eliminate broken thermometer", (assert: any) => {
  const settings = base.processSettings({
    thermometers: [
      {
        members: [
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
        ],
        strict: true,
      },
    ],
  });
  const board = sudoku.emptyBoard();
  const next = sudoku.clone(board);
  eliminateFromThermometers(settings, board, next);
  assert.equal(
    sudoku.dump(next, false),
    `\
      . ...
... . . ...
... . . ...

... . . ...
... . . ...
... . . ...

... ... ...
... ... ...
... ... ...`,
  );
});

QUnit.test("eliminate length 5 thermometer", (assert: any) => {
  const settings = base.processSettings({
    thermometers: [
      {
        members: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
        ],
        strict: true,
      },
    ],
  });
  const board = sudoku.emptyBoard();
  const next = sudoku.clone(board);
  eliminateFromThermometers(settings, board, next);
  assert.equal(
    sudoku.dump(next, true),
    `\
[12345    ][ 23456   ][  34567  ] [   45678 ][    56789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`,
  );
});

QUnit.test(
  "eliminate thermometer with starting restrictions",
  (assert: any) => {
    const settings = base.processSettings({
      thermometers: [
        {
          members: [
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
          ],
          strict: true,
        },
      ],
    });
    const board = sudoku.emptyBoard();
    board[0][0] = sudoku.bitMask(2);
    board[0][2] = sudoku.bitMask(3) | sudoku.bitMask(6) | sudoku.bitMask(7);
    const next = sudoku.clone(board);
    eliminateFromThermometers(settings, board, next);
    assert.equal(
      sudoku.dump(next, true),
      `\
[ 2       ][  3456   ][     67  ] [      789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`,
    );
  },
);

QUnit.test("eliminate non-strict thermometer", (assert: any) => {
  const members: sudoku.Coordinate[] = [];
  for (let i = 0; i < 9; i++) {
    members.push([i, i]);
  }
  const settings = base.processSettings({
    thermometers: [
      {
        members: members,
        strict: false,
      },
    ],
  });
  const board = sudoku.emptyBoard();
  const next = sudoku.clone(board);
  eliminateFromThermometers(settings, board, next);
  assert.equal(
    sudoku.dump(next, true),
    `\
[123      ][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][ 234     ][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][  345    ] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [  345    ][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][   456   ][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][    567  ] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [    567  ][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][     678 ][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][      789]`,
  );
});
