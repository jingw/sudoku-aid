import * as sudoku from "./sudoku.js";
import QUnit from "qunit";

QUnit.module("sudoku");

QUnit.test("dumpBitSet", (assert: Assert) => {
  assert.strictEqual(sudoku.dumpBitSet(sudoku.emptyCell(9)), "[123456789]");
  assert.strictEqual(sudoku.dumpBitSet(sudoku.bitMask(1)), "[1        ]");
  assert.strictEqual(
    sudoku.dumpBitSet(sudoku.bitMask(5) | sudoku.bitMask(9)),
    "[    5   9]",
  );
});

QUnit.test("dump", (assert: Assert) => {
  assert.strictEqual(
    sudoku.dump(sudoku.emptyBoard(9)),
    `\
... ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...`,
  );

  const nonTrivialBoard = sudoku.emptyBoard(9);
  nonTrivialBoard[1][2] = sudoku.bitMask(5);
  nonTrivialBoard[1][5] = sudoku.bitMask(5) | sudoku.bitMask(6);
  assert.strictEqual(
    sudoku.dump(nonTrivialBoard),
    `\
... ... ...
..5 ... ...
... ... ...

... ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...`,
  );
});

QUnit.test("dump verbose", (assert: Assert) => {
  const nonTrivialBoard = sudoku.emptyBoard(9);
  nonTrivialBoard[1][2] = sudoku.bitMask(5);
  nonTrivialBoard[1][5] = sudoku.bitMask(5) | sudoku.bitMask(6);
  assert.strictEqual(
    sudoku.dump(nonTrivialBoard, { verbose: true }),
    `\
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][    5    ] [123456789][123456789][    56   ] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`,
  );
});

QUnit.test("parse", (assert: Assert) => {
  const boardStr = `\
123 456 789
... ... ...
... ... ...

... 568 ...
... ... ...
... ... ...

... 789 ...
... ... ...
... ... ...`;
  assert.strictEqual(sudoku.dump(sudoku.parse(boardStr)), boardStr);
});

QUnit.test("pack / unpack", (assert: Assert) => {
  assert.deepEqual(sudoku.unpackRC(sudoku.packRC(2, 4)), [2, 4]);
  assert.deepEqual(sudoku.unpackRC(sudoku.packRC(-2, 4)), [-2, 4]);
  assert.deepEqual(sudoku.unpackRC(sudoku.packRC(2, -4)), [2, -4]);
  assert.deepEqual(sudoku.unpackRC(sudoku.packRC(-2, -4)), [-2, -4]);
});
