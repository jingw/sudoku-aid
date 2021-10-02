import * as cages from "./cages.js";
import * as sudoku from "./sudoku.js";

declare const QUnit: any;

QUnit.module("border tracing");

function mapToCoordinates(s: string): number[] {
    const result = [];
    let r = 0;
    let c = 0;
    for (let i = 0; i < s.length; i++) {
        if (s.charAt(i) === "\n") {
            r += 1;
            c = 0;
        } else {
            if (s.charAt(i) === "X") {
                result.push(sudoku.packRC(r, c));
            }
            c += 1;
        }
    }
    return result;
}

function coordinatesToMap(coords: number[]): string {
    const minR = Math.min(0, ...coords.map(x => sudoku.unpackRC(x)[0]));
    const maxR = Math.max(...coords.map(x => sudoku.unpackRC(x)[0]));
    const minC = Math.min(0, ...coords.map(x => sudoku.unpackRC(x)[1]));
    const maxC = Math.max(...coords.map(x => sudoku.unpackRC(x)[1]));
    const parts = [];
    const coordToIndex = new Map();
    for (let i = 0; i < coords.length; i++) {
        coordToIndex.set(coords[i], i);
    }
    for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
            const i = coordToIndex.get(sudoku.packRC(r, c));
            if (i === undefined) {
                parts.push(".");
            } else {
                parts.push((i % 10).toString());
            }
        }
        parts.push("\n");
    }
    return parts.join("");
}

QUnit.test("traceAllBorders", (assert: any) => {
    const map = `\
  XXXXXX
XXXXXXXXXX
XXXXXXXXXX
XX      XX
XX  XX  XX
XX  XX  XX
XX      XX
XXXXXXXXXX
XXXXXXXXXX
XXXX
XX`;

    const result = cages.traceAllBorders(new Set(mapToCoordinates(map)));
    assert.deepEqual(result.map(coordinatesToMap), [`\
..076543..
321....210
4........9
5........8
6........7
7........6
8........5
9........4
0..7890123
1456......
23........
`, `\
.........
.........
.03210987
.1......6
.2......5
.3......4
.4......3
.56789012
`, `\
......
......
......
......
....03
....12
`]);
});

QUnit.test("traceAllBorders with touching corner", (assert: any) => {
    const map = `\
   XXXX
   XXXX
XXX  XX
XXX  XX
XXXXXXX
XXXXXXX
`;

    const result = cages.traceAllBorders(new Set(mapToCoordinates(map)));
    assert.deepEqual(result.map(coordinatesToMap), [`\
...0987
...1236
321..45
4.0..54
5.98763
6789012
`]);
});

QUnit.test("traceSudokuBorder", (assert: any) => {
    // XX
    //  X
    assert.deepEqual(
        cages.traceSudokuBorder([
            [0, 0],
            [0, 1],
            [1, 1],
        ]),
        [[
            [[0, 0], 0, 0],
            [[0, 0], 1, 0],
            [[0, 0], 1, 1],

            [[0, 1], 1, 0],

            [[1, 1], 0, 0],
            [[1, 1], 1, 0],
            [[1, 1], 1, 1],
            [[1, 1], 0, 1],

            [[0, 1], 1, 1],
            [[0, 1], 0, 1],
            [[0, 1], 0, 0],

            [[0, 0], 0, 1],
        ]],
    );
});
