import * as sudoku from "./sudoku.js";

declare const QUnit: any;

QUnit.module("sudoku");

QUnit.test("dumpBitSet", (assert: any) => {
    assert.equal(sudoku.dumpBitSet(sudoku.EMPTY_CELL), "[123456789]");
    assert.equal(sudoku.dumpBitSet(sudoku.bitMask(1)), "[1        ]");
    assert.equal(sudoku.dumpBitSet(sudoku.bitMask(5) | sudoku.bitMask(9)), "[    5   9]");
});

QUnit.test("dump", (assert: any) => {
    assert.equal(sudoku.dump(sudoku.emptyBoard()), `\
... ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...`);

    const nonTrivialBoard = sudoku.emptyBoard();
    nonTrivialBoard[1][2] = sudoku.bitMask(5);
    nonTrivialBoard[1][5] = sudoku.bitMask(5) | sudoku.bitMask(6);
    assert.equal(sudoku.dump(nonTrivialBoard), `\
... ... ...
..5 ... ...
... ... ...

... ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...`);
});


QUnit.test("dump verbose", (assert: any) => {
    const nonTrivialBoard = sudoku.emptyBoard();
    nonTrivialBoard[1][2] = sudoku.bitMask(5);
    nonTrivialBoard[1][5] = sudoku.bitMask(5) | sudoku.bitMask(6);
    assert.equal(sudoku.dump(nonTrivialBoard, true), `\
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][    5    ] [123456789][123456789][    56   ] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("parse", (assert: any) => {
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
    assert.equal(sudoku.dump(sudoku.parse(boardStr)), boardStr);
});

QUnit.test("pack / unpack", (assert: any) => {
    assert.deepEqual(sudoku.unpackRC(sudoku.packRC(2, 4)), [2, 4]);
    assert.deepEqual(sudoku.unpackRC(sudoku.packRC(-2, 4)), [-2, 4]);
    assert.deepEqual(sudoku.unpackRC(sudoku.packRC(2, -4)), [2, -4]);
    assert.deepEqual(sudoku.unpackRC(sudoku.packRC(-2, -4)), [-2, -4]);
});
