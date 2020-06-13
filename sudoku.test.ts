import * as sudoku from "./sudoku.js";

declare const QUnit: any;

QUnit.module("solving puzzles");

function solve(settings: sudoku.Settings, board: sudoku.ReadonlyBoard): [sudoku.ReadonlyBoard, number] {
    const MAX_ITERATIONS = 100;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const next = sudoku.clone(board);
        sudoku.eliminateObvious(settings, board, next);
        sudoku.eliminateIntersections(settings, board, next);
        sudoku.eliminateNakedSets(settings, board, next);
        sudoku.findHiddenSingles(settings, board, next);
        if (sudoku.areBoardsEqual(board, next)) {
            return [board, i];
        }
        board = next;
    }
    return [board, MAX_ITERATIONS];
}

QUnit.test("miracle", (assert: any) => {
    // https://www.youtube.com/watch?v=Tv-48b-KuxI
    const settings: sudoku.Settings = {
        antiknight: true,
        antiking: true,
        anticonsecutiveOrthogonal: true,
    };
    const board = sudoku.parse(`
... ... ...
... ... ...
... .4. ...

..3 ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...
`);
    const [solution, steps] = solve(settings, board);
    assert.equal(steps, 31);
    assert.equal(sudoku.dump(solution), `\
948 372 615
372 615 948
615 948 372

483 726 159
726 159 483
159 483 726

837 261 594
261 594 837
594 837 261`);
});

QUnit.test("magic square", (assert: any) => {
    // https://www.youtube.com/watch?v=hAyZ9K2EBF0
    const settings: sudoku.Settings = {
        antiknight: true,
        diagonals: true,
    };
    const board = sudoku.parse(`
... ... ...
... ... ...
... ... ...

384 672 ...
... 159 ...
... 834 ...

... ... ...
... ... ...
... ... ..2
`);
    const [solution, steps] = solve(settings, board);
    assert.equal(steps, 12);
    assert.equal(sudoku.dump(solution), `\
843 567 219
275 913 846
619 428 375

384 672 951
726 159 483
951 834 627

537 286 194
462 791 538
198 345 762`);
});

QUnit.test("antiknight anticonsecutive", (assert: any) => {
    // https://www.youtube.com/watch?v=QNzltTzv0fc
    const settings: sudoku.Settings = {
        antiknight: true,
        anticonsecutiveOrthogonal: true,
    };
    const board = sudoku.parse(`
... ... ...
... ... ...
... 4.7 ...

..6 ... 5..
... ... ...
..4 ... 3..

... 2.5 ...
... ... ...
... ... ...
`);
    const [solution, steps] = solve(settings, board);
    assert.equal(steps, 13);
    assert.equal(sudoku.dump(solution), `\
973 518 264
425 963 718
861 427 953

316 842 597
758 396 142
294 751 386

649 275 831
182 639 475
537 184 629`);
});

QUnit.test("NYT hard", (assert: any) => {
    // https://www.nytimes.com/puzzles/sudoku/hard
    const board = sudoku.parse(`
... .8. .36
2.. 369 .7.
..5 21. .8.

... ..5 8..
9.. 7.. ...
... ... 6..

8.. ... 3..
..4 ... .95
3.9 ... ...
`);
    const [solution, steps] = solve({}, board);
    assert.equal(steps, 12);
    assert.equal(sudoku.dump(solution), `\
197 584 236
248 369 571
635 217 984

463 195 827
981 726 453
572 843 619

856 971 342
724 638 195
319 452 768`);
});

QUnit.module("string conversions");

QUnit.test("sudoku.dumpBitSet", (assert: any) => {
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

QUnit.module("solving tools");

QUnit.test("findHiddenSingles", (assert: any) => {
    const board = sudoku.emptyBoard();
    // put a hidden single in the last position on the 4th row
    for (let c = 0; c < 8; c++) {
        board[3][c] &= ~sudoku.bitMask(2);
    }
    const next = sudoku.clone(board);
    sudoku.findHiddenSingles({}, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[1 3456789][1 3456789][1 3456789] [1 3456789][1 3456789][1 3456789] [1 3456789][1 3456789][ 2       ]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("findHiddenSingles should not resurrect broken board", (assert: any) => {
    const board = sudoku.emptyBoard();
    // put a hidden single in the last position on the 4th row
    for (let c = 0; c < 8; c++) {
        board[3][c] &= ~sudoku.bitMask(2);
    }
    const next = sudoku.clone(board);
    // rule out 2 before getting to findHiddenSingles
    next[3][8] &= ~sudoku.bitMask(2);
    // findHiddenSingles should not bring it back
    sudoku.findHiddenSingles({}, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[1 3456789][1 3456789][1 3456789] [1 3456789][1 3456789][1 3456789] [1 3456789][1 3456789][         ]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate naked pair", (assert: any) => {
    const board = sudoku.emptyBoard();
    // put a 27 pair in the second row
    const double = sudoku.bitMask(2) | sudoku.bitMask(7);
    board[1][2] = double;
    board[1][4] = double;
    const next = sudoku.clone(board);
    sudoku.eliminateNakedSets({}, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[1 3456 89][1 3456 89][ 2    7  ] [1 3456 89][ 2    7  ][1 3456 89] [1 3456 89][1 3456 89][1 3456 89]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate naked triple", (assert: any) => {
    const board = sudoku.emptyBoard();
    // put a 279 triple in the second row/block
    const triple = sudoku.bitMask(2) | sudoku.bitMask(7) | sudoku.bitMask(9);
    board[1][3] = triple;
    board[1][4] = triple;
    board[1][5] = triple;
    const next = sudoku.clone(board);
    sudoku.eliminateNakedSets({}, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123456789][123456789][123456789] [1 3456 8 ][1 3456 8 ][1 3456 8 ] [123456789][123456789][123456789]
[1 3456 8 ][1 3456 8 ][1 3456 8 ] [ 2    7 9][ 2    7 9][ 2    7 9] [1 3456 8 ][1 3456 8 ][1 3456 8 ]
[123456789][123456789][123456789] [1 3456 8 ][1 3456 8 ][1 3456 8 ] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate length 9 thermometer", (assert: any) => {
    const settings: sudoku.Settings = {
        thermometers: [[
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
            [1, 4],
            [2, 4],
            [3, 4],
            [4, 4],
        ]],
    };
    const board = sudoku.emptyBoard();
    const next = sudoku.clone(board);
    sudoku.eliminateObvious(settings, board, next);
    assert.equal(sudoku.dump(next), `\
123 45. ...
... .6. ...
... .7. ...

... .8. ...
... .9. ...
... ... ...

... ... ...
... ... ...
... ... ...`);
});

QUnit.test("eliminate broken thermometer", (assert: any) => {
    const settings: sudoku.Settings = {
        thermometers: [[
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
        ]],
    };
    const board = sudoku.emptyBoard();
    const next = sudoku.clone(board);
    sudoku.eliminateObvious(settings, board, next);
    assert.equal(sudoku.dump(next, false), `\
      . ...
... . . ...
... . . ...

... . . ...
... . . ...
... . . ...

... ... ...
... ... ...
... ... ...`);
});

QUnit.test("eliminate length 5 thermometer", (assert: any) => {
    const settings: sudoku.Settings = {
        thermometers: [[
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
        ]],
    };
    const board = sudoku.emptyBoard();
    const next = sudoku.clone(board);
    sudoku.eliminateObvious(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[12345    ][ 23456   ][  34567  ] [   45678 ][    56789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate thermometer with starting restrictions", (assert: any) => {
    const settings: sudoku.Settings = {
        thermometers: [[
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
        ]],
    };
    const board = sudoku.emptyBoard();
    board[0][0] = sudoku.bitMask(2);
    board[0][2] = sudoku.bitMask(3) | sudoku.bitMask(6) | sudoku.bitMask(7);
    const next = sudoku.clone(board);
    sudoku.eliminateFromThermometers(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[ 2       ][  3456   ][     67  ] [      789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.module("generic utilities");

QUnit.test("forEachSubset", (assert: any) => {
    const results1: string[] = [];
    sudoku.forEachSubset(1, [1, 2, 3, 4], (x) => results1.push(x.join("")));
    assert.deepEqual(results1, ["1", "2", "3", "4"]);

    const results2: string[] = [];
    sudoku.forEachSubset(2, [1, 2, 3, 4], (x) => results2.push(x.join("")));
    assert.deepEqual(results2, ["12", "13", "14", "23", "24", "34"]);

    const results3: string[] = [];
    sudoku.forEachSubset(3, [1, 2, 3, 4], (x) => results3.push(x.join("")));
    assert.deepEqual(results3, ["123", "124", "134", "234"]);

    const results4: string[] = [];
    sudoku.forEachSubset(4, [1, 2, 3, 4], (x) => results4.push(x.join("")));
    assert.deepEqual(results4, ["1234"]);
});
