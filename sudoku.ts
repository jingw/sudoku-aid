export const EMPTY_CELL = (1 << 9) - 1;
export type Coordinate = readonly [number, number]
export type Board = number[][]
export type ReadonlyBoard = ReadonlyArray<ReadonlyArray<number>>
export type Thermometer = readonly Coordinate[]

export interface Settings {
    readonly antiknight?: boolean;
    readonly antiking?: boolean;
    readonly diagonals?: boolean;
    readonly anticonsecutiveOrthogonal?: boolean;
    readonly thermometers?: readonly Thermometer[];
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

export function lowestDigit(set: number): number {
    for (let digit = 1; digit <= 9; digit++) {
        if (set & bitMask(digit)) {
            return digit;
        }
    }
    throw new Error("no bit set");
}

export function highestDigit(set: number): number {
    for (let digit = 9; digit >= 1; digit--) {
        if ((set & bitMask(digit)) !== 0) {
            return digit;
        }
    }
    throw new Error("no bit set");
}

export function eliminateObvious(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const set = origBoard[r][c];
            const count = bitCount(set);
            if (count === 1) {
                const digit = lowestDigit(set);
                clearFrom(board, digit, r, c, settings);
            }
        }
    }
    eliminateFromThermometers(settings, origBoard, board);
}

export function eliminateFromThermometers(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    if (!settings.thermometers) {
        return;
    }
    for (const thermometer of settings.thermometers) {
        // propagate minimums going up
        let minExclusive = 0;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < thermometer.length; i++) {
            const [r, c] = thermometer[i];
            const newSet = origBoard[r][c] & ~(bitMask(minExclusive + 1) - 1);
            board[r][c] &= newSet;
            minExclusive = newSet ? lowestDigit(newSet) : 9;
        }

        // propagate maximums going down
        let maxExclusive = 10;
        for (let i = thermometer.length - 1; i >= 0; i--) {
            const [r, c] = thermometer[i];
            const newSet = origBoard[r][c] & (bitMask(maxExclusive) - 1);
            board[r][c] &= newSet;
            maxExclusive = newSet ? highestDigit(newSet) : 1;
        }
    }
}

export function eliminateIntersections(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    for (let digit = 1; digit <= 9; digit++) {
        forEachGroup(settings, (forEachGroupMember) => {
            // Produce all outcomes of placing the digit anywhere in the group
            const newBoards: ReadonlyBoard[] = [];
            forEachGroupMember((r: number, c: number) => {
                if (origBoard[r][c] & bitMask(digit)) {
                    const newBoard = clone(origBoard);
                    clearFrom(newBoard, digit, r, c, settings);
                    newBoards.push(newBoard);
                }
            });
            // Note: If the digit can only go in one place in group, this is comparable to
            // findHiddenSingles + eliminateObvious
            clearAllExcluded(board, newBoards, digit);
        });
    }
}

export function eliminateNakedSets(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    // Notes:
    // naked set of size 1 does the same thing as eliminateObvious
    // naked set of size 8 is the same as a hidden single
    // more generally, naked set of size N is the same as a hidden set of size 9 - N
    for (let setSize = 2; setSize <= 7; setSize++) {
        forEachGroup(settings, (forEachGroupMember) => {
            const group: Coordinate[] = [];
            forEachGroupMember((r, c) => {
                if (bitCount(origBoard[r][c]) === 1) {
                    // Skip any set containing a solved cell, so we don't duplicate eliminateObvious.
                    // Note this can make solving takes more steps, since including solved cells in
                    // naked sets lets you skip a step of eliminateObvious.
                    // e.g. if you have cells with 1 and 12, including the 1 lets you also immediately
                    // eliminate cells with 2, rather than waiting to first eliminate the 1.
                    return;
                }
                group.push([r, c]);
            });
            forEachSubset(setSize, group, (subset) => {
                let union = 0;
                for (const [r, c] of subset) {
                    union |= origBoard[r][c];
                }
                if (bitCount(union) === setSize) {
                    // we can eliminate the elements of union from all other cells in the group
                    for (let digit = 1; digit <= 9; digit++) {
                        if (union & bitMask(digit)) {
                            for (const [r, c] of group) {
                                if ((origBoard[r][c] | union) !== union) {
                                    // not one of the parts of union
                                    board[r][c] &= ~union;
                                }
                            }
                        }
                    }
                }
            });
        });
    }
}

export function findHiddenSingles(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    for (let digit = 1; digit <= 9; digit++) {
        forEachGroup(settings, (forEachGroupMember) => {
            const possibleCoordinates: Coordinate[] = [];
            forEachGroupMember((r: number, c: number) => {
                if (origBoard[r][c] & bitMask(digit)) {
                    possibleCoordinates.push([r, c]);
                }
            });
            if (possibleCoordinates.length === 1) {
                const [r, c] = possibleCoordinates[0];
                board[r][c] &= bitMask(digit);
            }
        });
    }
}

export function forEachSubset<T>(
    size: number,
    set: readonly T[],
    callback: (subset: readonly T[]) => void,
    i = 0,
    current: T[] = [],
): void {
    if (size > set.length - i) {
        // unsatisfiable
    } else if (size === 0) {
        callback(current);
    } else {
        // either take this member...
        current.push(set[i]);
        forEachSubset(size - 1, set, callback, i + 1, current);
        current.pop();

        // ... or don't take it
        forEachSubset(size, set, callback, i + 1, current);
    }
}

function tryClear(board: Board, digit: number, r: number, c: number): void {
    if (r >= 0 && r < 9 && c >= 0 && c < 9) {
        board[r][c] &= ~bitMask(digit);
    }
}

function clearKing(board: Board, digit: number, r: number, c: number): void {
    // only do corners because orthogonal neighbors are handled by the usual rules
    tryClear(board, digit, r - 1, c - 1);
    tryClear(board, digit, r - 1, c + 1);
    tryClear(board, digit, r + 1, c - 1);
    tryClear(board, digit, r + 1, c + 1);
}

function clearKnight(board: Board, digit: number, r: number, c: number): void {
    tryClear(board, digit, r - 1, c - 2);
    tryClear(board, digit, r - 1, c + 2);
    tryClear(board, digit, r + 1, c - 2);
    tryClear(board, digit, r + 1, c + 2);
    tryClear(board, digit, r - 2, c - 1);
    tryClear(board, digit, r - 2, c + 1);
    tryClear(board, digit, r + 2, c - 1);
    tryClear(board, digit, r + 2, c + 1);
}

function clearOrthogonal(board: Board, digit: number, r: number, c: number): void {
    if (digit >= 1 && digit <= 9) {
        tryClear(board, digit, r + 1, c);
        tryClear(board, digit, r - 1, c);
        tryClear(board, digit, r, c + 1);
        tryClear(board, digit, r, c - 1);
    }
}

function clearFrom(board: Board, digit: number, r: number, c: number, settings: Settings): void {
    // only relevant if board is broken
    // excluding this logic results in weird asymmetry, where all but the last occurrence are X'ed out
    const startedAsPossible = (board[r][c] & bitMask(digit)) !== 0;

    forEachGroup(settings, (forEachGroupMember) => {
        forEachGroupMember((mr: number, mc: number) => {
            tryClear(board, digit, mr, mc);
        });
    }, [r, c]);
    if (settings.antiknight) {
        clearKnight(board, digit, r, c);
    }
    if (settings.antiking) {
        clearKing(board, digit, r, c);
    }
    if (settings.anticonsecutiveOrthogonal) {
        clearOrthogonal(board, digit - 1, r, c);
        clearOrthogonal(board, digit + 1, r, c);
    }
    if (startedAsPossible) {
        board[r][c] = bitMask(digit);
    }
}

function clearAllExcluded(board: Board, newBoards: readonly ReadonlyBoard[], digit: number): void {
    if (newBoards.length === 0) {
        // This only happens if the board is broken
        // Do nothing because we'd otherwise clear the whole board, which is weird
        return;
    }
    // for each cell, if each of the possible outcomes does not have the digit, remove it
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let stillPossible = false;
            for (const newBoard of newBoards) {
                if (newBoard[r][c] & bitMask(digit)) {
                    stillPossible = true;
                    break;
                }
            }
            if (!stillPossible) {
                board[r][c] &= ~bitMask(digit);
            }
        }
    }
}

/*
forEachGroup((forEachGroupMember) => {
    forEachGroupMember((r, c) => {
        // do stuff
    })
})
*/
type MemberCallback = (r: number, c: number) => void;
type ForEachGroupMember = (_: MemberCallback) => void;
type GroupCallback = (_: ForEachGroupMember) => void;

function forEachGroup(settings: Settings, groupCallback: GroupCallback, cell?: Coordinate): void {
    function iterateLinear(r: number, c: number, dr: number, dc: number): void {
        groupCallback((memberCallback) => {
            for (let i = 0; i < 9; i++) {
                memberCallback(r + i * dr, c + i * dc);
            }
        });
    }
    function iterateBlock(R: number, C: number): void {
        groupCallback((memberCallback) => {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    memberCallback(R * 3 + r, C * 3 + c);
                }
            }
        });
    }

    if (cell === undefined) {
        for (let i = 0; i < 9; i++) {
            iterateLinear(i, 0, 0, 1); // row
            iterateLinear(0, i, 1, 0); // col
        }
        for (let R = 0; R < 3; R++) {
            for (let C = 0; C < 3; C++) {
                iterateBlock(R, C);
            }
        }
        if (settings.diagonals) {
            iterateLinear(0, 0, 1, 1);
            iterateLinear(0, 8, 1, -1);
        }
    } else {
        const [r, c] = cell;
        iterateLinear(r, 0, 0, 1); // row
        iterateLinear(0, c, 1, 0); // col
        iterateBlock(Math.floor(r / 3), Math.floor(c / 3));
        if (settings.diagonals) {
            if (r === c) {
                iterateLinear(0, 0, 1, 1);
            }
            if (r === 8 - c) {
                iterateLinear(0, 8, 1, -1);
            }
        }
    }
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
