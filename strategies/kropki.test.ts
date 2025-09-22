import * as base from "./base.js";
import * as sudoku from "../sudoku.js";
import {
  eliminateFromConsecutiveKropkiDots,
  eliminateFromDoubleKropkiDots,
  shiftDivide,
  shiftMultiply,
} from "./kropki.js";

declare const QUnit: any;

QUnit.module("strategies/kropki");

QUnit.test("shiftMultiply 1-based", (assert: any) => {
  assert.equal(
    sudoku.dumpBitSet(shiftMultiply(sudoku.emptyCell(9), 1, 9, 1)),
    "[123456789]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftMultiply(sudoku.emptyCell(9), 2, 9, 1)),
    "[ 2 4 6 8 ]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftMultiply(sudoku.emptyCell(9), 3, 9, 1)),
    "[  3  6  9]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftMultiply(sudoku.bitMask(3), 2, 9, 1)),
    "[     6   ]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftMultiply(sudoku.bitMask(6), 2, 9, 1)),
    "[         ]",
  );
});

QUnit.test("shiftMultiply 0-based", (assert: any) => {
  assert.equal(
    sudoku.dumpBitSet(shiftMultiply(sudoku.emptyCell(9), 1, 9, 0), 0),
    "[012345678]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftMultiply(sudoku.emptyCell(9), 2, 9, 0), 0),
    "[0 2 4 6 8]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftMultiply(sudoku.emptyCell(9), 3, 9, 0), 0),
    "[0  3  6  ]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftMultiply(sudoku.bitMask(3 + 1), 2, 9, 0), 0),
    "[      6  ]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftMultiply(sudoku.bitMask(6 + 1), 2, 9, 0), 0),
    "[         ]",
  );
});

QUnit.test("shiftDivide 1-based", (assert: any) => {
  assert.equal(
    sudoku.dumpBitSet(shiftDivide(sudoku.emptyCell(9), 1, 9, 1)),
    "[123456789]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftDivide(sudoku.emptyCell(9), 2, 9, 1)),
    "[1234     ]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftDivide(sudoku.emptyCell(9), 3, 9, 1)),
    "[123      ]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftDivide(sudoku.bitMask(3), 2, 9, 1)),
    "[         ]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftDivide(sudoku.bitMask(6), 2, 9, 1)),
    "[  3      ]",
  );
});

QUnit.test("shiftDivide 0-based", (assert: any) => {
  assert.equal(
    sudoku.dumpBitSet(shiftDivide(sudoku.emptyCell(9), 1, 9, 0), 0),
    "[012345678]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftDivide(sudoku.emptyCell(9), 2, 9, 0), 0),
    "[01234    ]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftDivide(sudoku.emptyCell(9), 3, 9, 0), 0),
    "[012      ]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftDivide(sudoku.bitMask(3 + 1), 2, 9, 0), 0),
    "[         ]",
  );
  assert.equal(
    sudoku.dumpBitSet(shiftDivide(sudoku.bitMask(6 + 1), 2, 9, 0), 0),
    "[   3     ]",
  );
});

QUnit.test("eliminate kropki", (assert: any) => {
  const settings = base.processSettings({
    consecutiveKropkiDots: [
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6],
      ],
    ],
    doubleKropkiDots: [
      [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
      ],
      [
        [3, 0],
        [3, 1],
      ],
    ],
  });
  const board = sudoku.emptyBoard(9);
  const next = sudoku.clone(board);
  eliminateFromConsecutiveKropkiDots(settings, board, next);
  eliminateFromDoubleKropkiDots(settings, board, next);
  assert.equal(
    sudoku.dump(next, true),
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
