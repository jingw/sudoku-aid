export const EMPTY_CELL = (1 << 9) - 1;
export type Coordinate = readonly [number, number]
export type Board = number[][]
export type ReadonlyBoard = ReadonlyArray<ReadonlyArray<number>>
export interface Thermometer {
    readonly members: readonly Coordinate[];
    readonly strict: boolean;
}
export type EqualityConstraint = readonly Coordinate[]
export interface Cage {
    readonly members: readonly Coordinate[];
    readonly sum: number;
}
// A single KropkiDots constraint represents a chain of dots where digits cannot repeat
export type KropkiDots = readonly Coordinate[];
export type BetweenLine = readonly Coordinate[];
export interface Arrow {
    readonly sumMembers: readonly Coordinate[];
    readonly members: readonly Coordinate[];
}

export interface Settings {
    readonly antiknight?: boolean;
    readonly antiking?: boolean;
    readonly diagonals?: boolean;
    readonly anticonsecutiveOrthogonal?: boolean;
    readonly digitsNotInSamePosition?: boolean;
    readonly irregular?: boolean;
    readonly thermometers?: readonly Thermometer[];
    readonly cages?: readonly Cage[];
    readonly equalities?: readonly EqualityConstraint[];
    readonly consecutiveKropkiDots?: readonly KropkiDots[];
    readonly doubleKropkiDots?: readonly KropkiDots[];
    readonly betweenLines?: readonly BetweenLine[];
    readonly arrows?: readonly Arrow[];
}

export function packRC(r: number, c: number): number {
    return (r << 16) | (c & 0xFFFF);
}

export function unpackRC(rc: number): [number, number] {
    return [rc >> 16, (rc << 16) >> 16];
}

export function bitMask(digit: number): number {
    return 1 << (digit - 1);
}

export function bitCount(set: number): number {
    let count = 0;
    while (set) {
        set &= set - 1;
        count++;
    }
    return count;
}

const LOWEST_DIGIT_CACHE: number[] = [];
for (let i = 0; i < 9; i++) {
    LOWEST_DIGIT_CACHE[1 << i] = i + 1;
}

export function lowestDigit(set: number): number {
    if (!set) {
        throw new Error("no bit set");
    }
    return LOWEST_DIGIT_CACHE[set & -set];
}

export function highestDigit(set: number): number {
    for (let digit = 9; digit >= 1; digit--) {
        if ((set & bitMask(digit)) !== 0) {
            return digit;
        }
    }
    throw new Error("no bit set");
}

export function coordinatesContains(arr: readonly Coordinate[], [r, c]: Coordinate): boolean {
    for (const [ar, ac] of arr) {
        if (r === ar && c === ac) {
            return true;
        }
    }
    return false;
}

export function clone(board: ReadonlyBoard): Board {
    const result = [];
    for (const row of board) {
        result.push(row.slice());
    }
    return result;
}

export function emptyBoard(): Board {
    const board: Board = [];
    for (let r = 0; r < 9; r++) {
        board.push(new Array<number>(9).fill(EMPTY_CELL));
    }
    return board;
}

export function areBoardsEqual(a: ReadonlyBoard, b: ReadonlyBoard): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function dumpBitSet(set: number): string {
    const parts = [];
    for (let d = 1; d <= 9; d++) {
        if (set & bitMask(d)) {
            parts.push(d.toString());
        } else {
            parts.push(" ");
        }
    }
    return "[" + parts.join("") + "]";
}

export function dump(board: ReadonlyBoard, verbose = false): string {
    const output = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const set = board[r][c];
            if (verbose) {
                output.push(dumpBitSet(set));
            } else {
                if (!set) {
                    output.push(" ");
                } else if (bitCount(set) === 1) {
                    const digit = lowestDigit(set);
                    output.push(digit.toString());
                } else {
                    output.push(".");
                }
            }
            if (c % 3 === 2 && c < 8) {
                output.push(" ");
            }
        }
        if (r < 8) {
            output.push("\n");
            if (r % 3 === 2) {
                output.push("\n");
            }
        }
    }
    return output.join("");
}

export function parse(boardStr: string): Board {
    let i = 0;
    const board = emptyBoard();
    for (let strI = 0; strI < boardStr.length; strI++) {
        const char = boardStr.charAt(strI);
        // Treat 0 and . as empty cells. Ignore all other non-digit characters.
        const digit = char === "." ? 0 : char.charCodeAt(0) - "0".charCodeAt(0);
        if (0 <= digit && digit <= 9) {
            const r = Math.floor(i / 9);
            const c = i % 9;
            board[r][c] = digit === 0 ? EMPTY_CELL : bitMask(digit);
            i++;
        }
    }
    return board;
}

export function coordinateToStr(r: number, c: number): string {
    return `r${r + 1}c${c + 1}`;
}

export function groupToStr(group: readonly Coordinate[]): string {
    if (group.length === 9) {
        if (allSame(group, (rc) => rc[0])) {
            return "row" + (group[0][0] + 1);
        } else if (allSame(group, (rc) => rc[1])) {
            return "col" + (group[0][1] + 1);
        } else if (allSame(group, boxNumber)) {
            return "box" + boxNumber(group[0]);
        }
    }

    const strParts = [];
    for (const [gr, gc] of group) {
        strParts.push(coordinateToStr(gr, gc));
    }
    return strParts.join(",");
}

function boxNumber([r, c]: Coordinate): number {
    return Math.floor(r / 3) * 3 + Math.floor(c / 3) + 1;
}

function allSame<X, Y>(xs: readonly X[], fn: (x: X) => Y): boolean {
    const first = fn(xs[0]);
    for (let i = 1; i < xs.length; i++) {
        if (fn(xs[i]) !== first) {
            return false;
        }
    }
    return true;
}
