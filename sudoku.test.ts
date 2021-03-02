import * as sudoku from "./sudoku.js";

declare const QUnit: any;

QUnit.module("solving puzzles");

function solve(settings: sudoku.ProcessedSettings, board: sudoku.ReadonlyBoard): [sudoku.ReadonlyBoard, number] {
    const MAX_ITERATIONS = 100;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const next = sudoku.clone(board);
        sudoku.eliminateObvious(settings, board, next);
        sudoku.eliminateIntersections(settings, board, next);
        sudoku.eliminateNakedSets(settings, board, next);
        sudoku.eliminateFish(settings, board, next);
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
    const settings = sudoku.processSettings({
        antiknight: true,
        antiking: true,
        anticonsecutiveOrthogonal: true,
    });
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
    const settings = sudoku.processSettings({
        antiknight: true,
        diagonals: true,
    });
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
    const settings = sudoku.processSettings({
        antiknight: true,
        anticonsecutiveOrthogonal: true,
    });
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
    const [solution, steps] = solve(sudoku.processSettings({}), board);
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

QUnit.test("lots of swordfish", (assert: any) => {
    // https://www.youtube.com/watch?v=lPpAtnbvVR8
    const board = sudoku.parse(`
.4. 3.. 6..
..1 ..2 .9.
... ... ...

... ... ...
.3. 6.. 9..
..7 ..1 .2.

.6. 4.. 3..
7.. ... ..8
..2 ..7 .1.
`);
    const [solution, steps] = solve(sudoku.processSettings({}), board);
    assert.equal(steps, 8);
    assert.equal(sudoku.dump(solution), `\
549 318 672
671 542 893
823 796 145

916 285 734
235 674 981
487 931 526

168 429 357
794 153 268
352 867 419`);
});

QUnit.test("killer sudoku", (assert: any) => {
    // https://en.wikipedia.org/wiki/Killer_sudoku
    const settings = sudoku.processSettings({cages: [
        {members: [[0, 0], [0, 1]], sum: 3},
        {members: [[0, 2], [0, 3], [0, 4]], sum: 15},
        {members: [[0, 5], [1, 5], [1, 4], [2, 4]], sum: 22},
        {members: [[0, 6], [1, 6]], sum: 4},
        {members: [[0, 7], [1, 7]], sum: 16},
        {members: [[0, 8], [1, 8], [2, 8], [3, 8]], sum: 15},
        {members: [[1, 0], [2, 0], [2, 1], [1, 1]], sum: 25},
        {members: [[1, 2], [1, 3]], sum: 17},
        {members: [[2, 2], [2, 3], [3, 3]], sum: 9},
        {members: [[2, 5], [3, 5], [4, 5]], sum: 8},
        {members: [[2, 7], [2, 6], [3, 6]], sum: 20},
        {members: [[3, 0], [4, 0]], sum: 6},
        {members: [[3, 2], [3, 1]], sum: 14},
        {members: [[3, 4], [4, 4], [5, 4]], sum: 17},
        {members: [[3, 7], [4, 7], [4, 6]], sum: 17},
        {members: [[4, 1], [5, 1], [4, 2]], sum: 13},
        {members: [[4, 3], [5, 3], [6, 3]], sum: 20},
        {members: [[4, 8], [5, 8]], sum: 12},
        {members: [[5, 0], [6, 0], [7, 0], [8, 0]], sum: 27},
        {members: [[5, 2], [6, 2], [6, 1]], sum: 6},
        {members: [[5, 5], [6, 5], [6, 6]], sum: 20},
        {members: [[5, 7], [5, 6]], sum: 6},
        {members: [[6, 4], [7, 4], [7, 3], [8, 3]], sum: 10},
        {members: [[6, 7], [7, 7], [7, 8], [6, 8]], sum: 14},
        {members: [[7, 1], [8, 1]], sum: 8},
        {members: [[7, 2], [8, 2]], sum: 16},
        {members: [[7, 5], [7, 6]], sum: 15},
        {members: [[8, 4], [8, 5], [8, 6]], sum: 13},
        {members: [[8, 7], [8, 8]], sum: 17},
    ]});
    const [solution, steps] = solve(settings, sudoku.emptyBoard());
    assert.equal(steps, 5);
    assert.equal(sudoku.dump(solution), `\
215 647 398
368 952 174
794 381 652

586 274 931
142 593 867
973 816 425

821 739 546
659 428 713
437 165 289`);
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
    sudoku.findHiddenSingles(sudoku.processSettings({}), board, next);
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
    sudoku.findHiddenSingles(sudoku.processSettings({}), board, next);
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
    sudoku.eliminateNakedSets(sudoku.processSettings({}), board, next);
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
    sudoku.eliminateNakedSets(sudoku.processSettings({}), board, next);
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

QUnit.test("row missing digit", (assert: any) => {
    const board = sudoku.emptyBoard();
    for (let c = 0; c < 9; c++) {
        board[0][c] &= ~sudoku.bitMask(1);
    }
    const next = sudoku.clone(board);
    sudoku.eliminateNakedSets(sudoku.processSettings({}), board, next);
    assert.equal(sudoku.dump(next, true), `\
[         ][         ][         ] [         ][         ][         ] [         ][         ][         ]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate length 9 thermometer", (assert: any) => {
    const settings = sudoku.processSettings({
        thermometers: [{
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
        }],
    });
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
    const settings = sudoku.processSettings({
        thermometers: [{
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
        }],
    });
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
    const settings = sudoku.processSettings({
        thermometers: [{
            members: [
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3],
                [0, 4],
            ],
            strict: true,
        }],
    });
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
    const settings = sudoku.processSettings({
        thermometers: [{
            members: [
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3],
            ],
            strict: true,
        }],
    });
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

QUnit.test("eliminate non-strict thermometer", (assert: any) => {
    const members: sudoku.Coordinate[] = [];
    for (let i = 0; i < 9; i++) {
        members.push([i, i]);
    }
    const settings = sudoku.processSettings({
        thermometers: [{
            members: members,
            strict: false,
        }],
    });
    const board = sudoku.emptyBoard();
    const next = sudoku.clone(board);
    sudoku.eliminateFromThermometers(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123      ][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][ 234     ][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][  345    ] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [  345    ][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][   456   ][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][    567  ] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [    567  ][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][     678 ][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][      789]`);
});

QUnit.test("eliminate X-Wing in rows", (assert: any) => {
    const board = sudoku.emptyBoard();
    // set up X-Wing on 7
    for (const r of [3, 6]) {
        for (let c = 0; c < 9; c++) {
            if (c !== 2 && c !== 8) {
                board[r][c] &= ~sudoku.bitMask(7);
            }
        }
    }
    const next = sudoku.clone(board);
    sudoku.eliminateFish({}, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123456789][123456789][123456 89] [123456789][123456789][123456789] [123456789][123456789][123456 89]
[123456789][123456789][123456 89] [123456789][123456789][123456789] [123456789][123456789][123456 89]
[123456789][123456789][123456 89] [123456789][123456789][123456789] [123456789][123456789][123456 89]

[123456 89][123456 89][123456789] [123456 89][123456 89][123456 89] [123456 89][123456 89][123456789]
[123456789][123456789][123456 89] [123456789][123456789][123456789] [123456789][123456789][123456 89]
[123456789][123456789][123456 89] [123456789][123456789][123456789] [123456789][123456789][123456 89]

[123456 89][123456 89][123456789] [123456 89][123456 89][123456 89] [123456 89][123456 89][123456789]
[123456789][123456789][123456 89] [123456789][123456789][123456789] [123456789][123456789][123456 89]
[123456789][123456789][123456 89] [123456789][123456789][123456789] [123456789][123456789][123456 89]`);
});

QUnit.test("eliminate X-Wing in columns", (assert: any) => {
    const board = sudoku.emptyBoard();
    // set up X-Wing on 7
    for (const c of [3, 6]) {
        for (let r = 0; r < 9; r++) {
            if (r !== 2 && r !== 8) {
                board[r][c] &= ~sudoku.bitMask(7);
            }
        }
    }
    const next = sudoku.clone(board);
    sudoku.eliminateFish({}, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123456789][123456789][123456789] [123456 89][123456789][123456789] [123456 89][123456789][123456789]
[123456789][123456789][123456789] [123456 89][123456789][123456789] [123456 89][123456789][123456789]
[123456 89][123456 89][123456 89] [123456789][123456 89][123456 89] [123456789][123456 89][123456 89]

[123456789][123456789][123456789] [123456 89][123456789][123456789] [123456 89][123456789][123456789]
[123456789][123456789][123456789] [123456 89][123456789][123456789] [123456 89][123456789][123456789]
[123456789][123456789][123456789] [123456 89][123456789][123456789] [123456 89][123456789][123456789]

[123456789][123456789][123456789] [123456 89][123456789][123456789] [123456 89][123456789][123456789]
[123456789][123456789][123456789] [123456 89][123456789][123456789] [123456 89][123456789][123456789]
[123456 89][123456 89][123456 89] [123456789][123456 89][123456 89] [123456789][123456 89][123456 89]`);
});

QUnit.test("eliminate cage with sum", (assert: any) => {
    const settings = sudoku.processSettings({
        cages: [{
            members: [
                [0, 0],
                [0, 1],
                [0, 2],
            ],
            sum: 6,
        }],
    });
    const board = sudoku.emptyBoard();
    const next = sudoku.clone(board);
    sudoku.eliminateFromCages(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123      ][123      ][123      ] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate intersection complete cage", (assert: any) => {
    const settings = sudoku.processSettings({
        cages: [{
            members: [
                [2, 2],
                [2, 3],
                [3, 2],
                [3, 3],
            ],
            sum: 0,
        }],
    });
    const board = sudoku.emptyBoard();
    // Set up cage that must contain 1234, and the 1 candidats are aligned in a row.
    const bits234 = sudoku.bitMask(2) | sudoku.bitMask(3) | sudoku.bitMask(4);
    board[2][2] = sudoku.bitMask(1) | bits234;
    board[2][3] = sudoku.bitMask(1) | bits234;
    board[3][2] = bits234;
    board[3][3] = bits234;
    const next = sudoku.clone(board);
    sudoku.eliminateIntersections(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][ 23456789][1234     ] [1234     ][ 23456789][ 23456789] [ 23456789][ 23456789][ 23456789]

[123456789][123456789][ 234     ] [ 234     ][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate intersection cage with mandatory members", (assert: any) => {
    // Cage summing to 8 must contain 1, so it eliminates 1 from the rest of the row/block.
    const settings = sudoku.processSettings({
        cages: [{
            members: [
                [0, 0],
                [0, 1],
                [0, 2],
            ],
            sum: 8,
        }],
    });
    const board = sudoku.emptyBoard();
    const next = sudoku.clone(board);
    sudoku.eliminateIntersections(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123456789][123456789][123456789] [ 23456789][ 23456789][ 23456789] [ 23456789][ 23456789][ 23456789]
[ 23456789][ 23456789][ 23456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][ 23456789][ 23456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate cage with sum and starting restrictions", (assert: any) => {
    const settings = sudoku.processSettings({
        cages: [{
            members: [
                [0, 0],
                [0, 1],
                [0, 2],
            ],
            sum: 6,
        }],
    });
    const board = sudoku.emptyBoard();
    board[0][0] = 1;
    const next = sudoku.clone(board);
    sudoku.eliminateFromCages(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[1        ][ 23      ][ 23      ] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("worst case cage", (assert: any) => {
    const firstRow: sudoku.Coordinate[] = [];
    for (let i = 0; i < 9; i++) {
        firstRow.push([0, i]);
    }
    const settings = sudoku.processSettings({
        cages: [{
            members: firstRow,
            sum: 45,
        }],
    });
    const board = sudoku.emptyBoard();
    const next = sudoku.clone(board);
    sudoku.eliminateFromCages(settings, board, next);
    assert.ok(sudoku.areBoardsEqual(board, next));
});

QUnit.test("cage missing one digit", (assert: any) => {
    const firstRow: sudoku.Coordinate[] = [];
    for (let i = 0; i < 8; i++) {
        firstRow.push([0, i]);
    }
    const settings = sudoku.processSettings({
        cages: [{
            members: firstRow,
            sum: 44,
        }],
    });
    const board = sudoku.emptyBoard();
    const next = sudoku.clone(board);
    sudoku.eliminateFromCages(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[ 23456789][ 23456789][ 23456789] [ 23456789][ 23456789][ 23456789] [ 23456789][ 23456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate with equality constraint", (assert: any) => {
    const settings = sudoku.processSettings({
        equalities: [[
            [0, 0],
            [0, 1],
            [0, 2],
        ]],
    });
    const board = sudoku.emptyBoard();
    board[0][0] = sudoku.bitMask(1) | sudoku.bitMask(2);
    board[0][1] = sudoku.bitMask(2) | sudoku.bitMask(3);
    const next = sudoku.clone(board);
    sudoku.eliminateFromEqualities(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[ 2       ][ 2       ][ 2       ] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("irregular should not eliminate in blocks", (assert: any) => {
    const settings = sudoku.processSettings({
        irregular: true,
    });
    const board = sudoku.emptyBoard();
    board[0][0] = sudoku.bitMask(1);
    const next = sudoku.clone(board);
    sudoku.eliminateObvious(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[1        ][ 23456789][ 23456789] [ 23456789][ 23456789][ 23456789] [ 23456789][ 23456789][ 23456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate when digits not in same positions", (assert: any) => {
    const settings = sudoku.processSettings({
        digitsNotInSamePosition: true,
    });
    const board = sudoku.emptyBoard();
    board[0][0] = sudoku.bitMask(1);
    board[0][3] = sudoku.bitMask(2) | sudoku.bitMask(3);
    board[0][6] &=sudoku.bitMask(2) | sudoku.bitMask(3);

    board[3][0] &= ~sudoku.bitMask(9);
    board[3][3] &= ~sudoku.bitMask(9);
    board[3][6] &= ~sudoku.bitMask(9);

    sudoku.eliminateObvious(settings, board, board);
    sudoku.eliminateNakedSets(settings, board, board);
    sudoku.eliminateIntersections(settings, board, board);

    assert.equal(sudoku.dump(board, true), `\
[1        ][   456789][   456789] [ 23      ][   456789][   456789] [ 23      ][   456789][   456789]
[ 23456789][ 23456789][ 23456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][ 23456789][ 23456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[   45678 ][123456789][123456789] [   45678 ][123456789][123456789] [   45678 ][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[   456789][12345678 ][12345678 ] [   456789][12345678 ][12345678 ] [   456789][12345678 ][12345678 ]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});

QUnit.test("eliminate intersection with equality", (assert: any) => {
    // If the equal cells are 1, then there is no place to put a 1 in the 3rd block.
    const settings = sudoku.processSettings({
        equalities: [[
            [0, 0],
            [1, 3],
        ]],
    });
    const board = sudoku.emptyBoard();
    for (let c = 6; c < 9; c++) {
        board[2][c] &= ~sudoku.bitMask(1);
    }
    const next = sudoku.clone(board);
    sudoku.eliminateIntersections(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[ 23456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [ 23456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [ 23456789][ 23456789][ 23456789]

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

QUnit.module("kropki");

QUnit.test("shiftMultiply", (assert: any) => {
    assert.equal(sudoku.dumpBitSet(sudoku.shiftMultiply(sudoku.EMPTY_CELL, 1)), "[123456789]");
    assert.equal(sudoku.dumpBitSet(sudoku.shiftMultiply(sudoku.EMPTY_CELL, 2)), "[ 2 4 6 8 ]");
    assert.equal(sudoku.dumpBitSet(sudoku.shiftMultiply(sudoku.EMPTY_CELL, 3)), "[  3  6  9]");
    assert.equal(sudoku.dumpBitSet(sudoku.shiftMultiply(sudoku.bitMask(3), 2)), "[     6   ]");
    assert.equal(sudoku.dumpBitSet(sudoku.shiftMultiply(sudoku.bitMask(6), 2)), "[         ]");
});

QUnit.test("shiftDivide", (assert: any) => {
    assert.equal(sudoku.dumpBitSet(sudoku.shiftDivide(sudoku.EMPTY_CELL, 1)), "[123456789]");
    assert.equal(sudoku.dumpBitSet(sudoku.shiftDivide(sudoku.EMPTY_CELL, 2)), "[1234     ]");
    assert.equal(sudoku.dumpBitSet(sudoku.shiftDivide(sudoku.EMPTY_CELL, 3)), "[123      ]");
    assert.equal(sudoku.dumpBitSet(sudoku.shiftDivide(sudoku.bitMask(3), 2)), "[         ]");
    assert.equal(sudoku.dumpBitSet(sudoku.shiftDivide(sudoku.bitMask(6), 2)), "[  3      ]");
});

QUnit.test("eliminate kropki", (assert: any) => {
    const settings = sudoku.processSettings({
        consecutiveKropkiDots: [[
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
            [0, 5],
            [0, 6],
        ]],
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
    const board = sudoku.emptyBoard();
    const next = sudoku.clone(board);
    sudoku.eliminateObvious(settings, board, next);
    assert.equal(sudoku.dump(next, true), `\
[123   789][ 234 678 ][  34567  ] [   456   ][  34567  ][ 234 678 ] [123   789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[1      8 ][ 2 4     ][ 2 4     ] [1      8 ][123456789][123456789] [123456789][123456789][123456789]

[1234 6 8 ][1234 6 8 ][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]

[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]
[123456789][123456789][123456789] [123456789][123456789][123456789] [123456789][123456789][123456789]`);
});
