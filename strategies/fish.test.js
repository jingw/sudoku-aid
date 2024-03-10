import * as base from "./base.js";
import * as sudoku from "../sudoku.js";
import * as test_util from "./test_util.js";
import { eliminateFish } from "./fish.js";
QUnit.module("strategies/fish");
QUnit.test("lots of swordfish", (assert) => {
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
    const [solution, steps] = test_util.solve(base.processSettings({}), board);
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
QUnit.test("eliminate X-Wing in rows", (assert) => {
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
    eliminateFish({}, board, next);
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
QUnit.test("eliminate X-Wing in columns", (assert) => {
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
    eliminateFish({}, board, next);
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
