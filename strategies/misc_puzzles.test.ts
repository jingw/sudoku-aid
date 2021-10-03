import * as base from "./base.js";
import * as sudoku from "../sudoku.js";
import * as test_util from "./test_util.js";

declare const QUnit: any;

QUnit.module("strategies/misc_puzzles");

QUnit.test("miracle", (assert: any) => {
    // https://www.youtube.com/watch?v=Tv-48b-KuxI
    const settings = base.processSettings({
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
    const [solution, steps] = test_util.solve(settings, board);
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
    const settings = base.processSettings({
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
    const [solution, steps] = test_util.solve(settings, board);
    assert.equal(steps, 10);
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
    const settings = base.processSettings({
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
    const [solution, steps] = test_util.solve(settings, board);
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
    const [solution, steps] = test_util.solve(base.processSettings({}), board);
    assert.equal(steps, 11);
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
