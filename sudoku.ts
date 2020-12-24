export const EMPTY_CELL = (1 << 9) - 1;
export type Coordinate = readonly [number, number]
export type Board = number[][]
export type ReadonlyBoard = ReadonlyArray<ReadonlyArray<number>>
export type Thermometer = readonly Coordinate[]
export type EqualityConstraint = readonly Coordinate[]
export interface Cage {
    readonly members: readonly Coordinate[];
    readonly sum: number;
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
    eliminateFromCages(settings, origBoard, board);
    eliminateFromEqualities(settings, origBoard, board);
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

export function eliminateFromCages(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    if (!settings.cages) {
        return;
    }
    for (const cage of settings.cages) {
        if (cage.sum) {
            const bitSets = [];
            for (const [r, c] of cage.members) {
                bitSets.push(origBoard[r][c]);
            }
            const possible = possibleWaysToSum(bitSets, cage.sum)[0];
            for (let i = 0; i < possible.length; i++) {
                const [r, c] = cage.members[i];
                board[r][c] &= possible[i];
            }
        }
    }
}

export function possibleWaysToSumCage(cage: Cage, board: ReadonlyBoard): number[] {
    if (!cage.sum) {
        throw new Error("cage has no sum constraint");
    }
    const bitSets = [];
    for (const [r, c] of cage.members) {
        bitSets.push(board[r][c]);
    }
    const possibleCombinedBitSets = new Set<number>();
    forEachAssignment(bitSets, assignment => {
        let sum = 0;
        for (const bitSet of assignment) {
            sum += lowestDigit(bitSet);
        }
        if (sum === cage.sum) {
            let combined = 0;
            for (const bitSet of assignment) {
                combined |= bitSet;
            }
            possibleCombinedBitSets.add(combined);
        }
    });
    return Array.from(possibleCombinedBitSets);
}

/**
 * Given candidates for each cell, return
 * - filtered candidates for each cell
 * - digits which must be used
 */
export function possibleWaysToSum(bitSets: number[], targetSum: number): [number[], number] {
    const possible = new Array(bitSets.length).fill(0);
    let mandatory = EMPTY_CELL;
    forEachAssignment(bitSets, assignment => {
        let sum = 0;
        for (const bitSet of assignment) {
            sum += lowestDigit(bitSet);
        }
        if (sum === targetSum) {
            let used = 0;
            for (let i = 0; i < assignment.length; i++) {
                possible[i] |= assignment[i];
                used |= assignment[i];
            }
            mandatory &= used;
        }
    });
    return [possible, mandatory];
}

/** Return true if the cage must contain each of its possible members */
function isCageComplete(cage: Cage, board: ReadonlyBoard): boolean {
    const union = unionPossibilities(cage.members, board);
    return bitCount(union) === cage.members.length;
}

export function eliminateFromEqualities(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    if (!settings.equalities) {
        return;
    }
    for (const equalityConstraint of settings.equalities) {
        let intersection = EMPTY_CELL;
        for (const [r, c] of equalityConstraint) {
            intersection &= origBoard[r][c];
        }
        for (const [r, c] of equalityConstraint) {
            board[r][c] &= intersection;
        }
    }
}

function forEachAssignment(bitSets: number[], callback: (assignment: number[]) => void, used = 0, current: number[] = []): void {
    if (current.length === bitSets.length) {
        callback(current);
    } else {
        let set = bitSets[current.length] & ~used;
        while (set) {
            const lowestBit = set & -set;
            current.push(lowestBit);
            forEachAssignment(bitSets, callback, used | lowestBit, current);
            current.pop();
            set &= ~lowestBit;
        }
    }
}

export function eliminateIntersections(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    forEachLockedCandidate(settings, origBoard, (digit, forEachGroupMember) => {
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

export function eliminateNakedSets(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    // Notes:
    // naked set of size 1 does the same thing as eliminateObvious
    // naked set of size 8 is the same as a hidden single
    // more generally, naked set of size N is the same as a hidden set of size 9 - N
    for (let setSize = 2; setSize <= 7; setSize++) {
        forEachGroup(settings, null, (forEachGroupMember) => {
            const group: Coordinate[] = [];
            forEachGroupMember((r, c) => {
                if (bitCount(origBoard[r][c]) <= 1) {
                    // Skip any set containing a solved cell, so we don't duplicate eliminateObvious.
                    // Note this can make solving takes more steps, since including solved cells in
                    // naked sets lets you skip a step of eliminateObvious.
                    // e.g. if you have cells with 1 and 12, including the 1 lets you also immediately
                    // eliminate cells with 2, rather than waiting to first eliminate the 1.
                    //
                    // Also skip broken cells with no possibilities, since it leads to strange
                    // behavior sudokus that aren't 9x9.
                    return;
                }
                group.push([r, c]);
            });
            forEachSubset(setSize, group, (subset) => {
                const union = unionPossibilities(subset, origBoard);
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

function unionPossibilities(coords: readonly Coordinate[], board: ReadonlyBoard): number {
    let union = 0;
    for (const [r, c] of coords) {
        union |= board[r][c];
    }
    return union;
}

export function eliminateFish(_: Settings, origBoard: ReadonlyBoard, board: Board): void {
    // For every fish in the rows of size N, there's an opposite fish in the columns of size 9 - N
    // If within N rows, the digit only appears in N columns, then in the other 9 - N columns,
    // the digit must appears only in 9 - N rows.
    // Thus it suffices to only search the rows.
    // Note fish of size 1 or 8 is a hidden single.
    for (let digit = 1; digit <= 9; digit++) {
        const positions: number[] = [];
        const digitMask = bitMask(digit);
        const sizes = [];
        for (let r = 0; r < 9; r++) {
            let set = 0;
            let size = 0;
            for (let c = 0; c < 9; c++) {
                if (origBoard[r][c] & digitMask) {
                    set |= 1 << c;
                    size += 1;
                }
            }
            positions.push(set);
            sizes.push(size);
        }
        for (let size = 2; size <= 7; size++) {
            const candidates = [];
            for (let r = 0; r < 9; r++) {
                if (2 <= sizes[r] && sizes[r] <= size) {
                    candidates.push(r);
                }
            }
            forEachSubset(size, candidates, (rows) => {
                let colsInFish = 0;
                let rowsInFish = 0;
                for (const r of rows) {
                    colsInFish |= positions[r];
                    rowsInFish |= 1 << r;
                }
                // if bit count is less than size, puzzle is broken
                if (bitCount(colsInFish) === size) {
                    // eliminate from the columns
                    for (let r = 0; r < 9; r++) {
                        // if not one of rows of fish, but is one of cols of fish
                        if (!(rowsInFish & (1 << r))) {
                            for (let c = 0; c < 9; c++) {
                                if (colsInFish & (1 << c)) {
                                    board[r][c] &= ~digitMask;
                                }
                            }
                        }
                    }
                }
            });
        }
    }
}

export function findHiddenSingles(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    forEachLockedCandidate(settings, origBoard, (digit, forEachGroupMember) => {
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

    forEachGroup(settings, [r, c], (forEachGroupMember) => {
        forEachGroupMember((mr: number, mc: number) => {
            tryClear(board, digit, mr, mc);
        });
    });
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
forEachGroup(..., (forEachGroupMember) => {
    forEachGroupMember((r, c) => {
        // do stuff
    })
})
*/
type MemberCallback = (r: number, c: number) => void;
type ForEachGroupMember = (_: MemberCallback) => void;
type GroupCallback = (_: ForEachGroupMember) => void;
type LockedCandidateCallback = (candidate: number, _: ForEachGroupMember) => void;

function forEachGroup(
    settings: Settings,
    cell: Coordinate | null,
    groupCallback: GroupCallback,
): void {
    function iterateLinear(r: number, c: number, dr: number, dc: number): void {
        groupCallback((memberCallback) => {
            for (let i = 0; i < 9; i++) {
                memberCallback(r + i * dr, c + i * dc);
            }
        });
    }
    function iterateBlock(R: number, C: number, increment: number): void {
        groupCallback((memberCallback) => {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    memberCallback(R + r * increment, C + c * increment);
                }
            }
        });
    }
    function iterateArray(arr: readonly Coordinate[]): void {
        groupCallback((memberCallback) => {
            for (const [r, c] of arr) {
                memberCallback(r, c);
            }
        });
    }

    if (cell === null) {
        for (let i = 0; i < 9; i++) {
            iterateLinear(i, 0, 0, 1); // row
            iterateLinear(0, i, 1, 0); // col
        }
        if (!settings.irregular) {
            for (let R = 0; R < 3; R++) {
                for (let C = 0; C < 3; C++) {
                    iterateBlock(R * 3, C * 3, 1);
                }
            }
        }
        if (settings.digitsNotInSamePosition) {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    iterateBlock(r, c, 3);
                }
            }
        }
        if (settings.diagonals) {
            iterateLinear(0, 0, 1, 1);
            iterateLinear(0, 8, 1, -1);
        }
        if (settings.cages) {
            for (const cage of settings.cages) {
                iterateArray(cage.members);
            }
        }
        if (settings.thermometers) {
            for (const thermometer of settings.thermometers) {
                iterateArray(thermometer);
            }
        }
    } else {
        const [r, c] = cell;
        iterateLinear(r, 0, 0, 1); // row
        iterateLinear(0, c, 1, 0); // col
        if (!settings.irregular) {
            iterateBlock(Math.floor(r / 3) * 3, Math.floor(c / 3) * 3, 1);
        }
        if (settings.digitsNotInSamePosition) {
            iterateBlock(r % 3, c % 3, 3);
        }
        if (settings.diagonals) {
            if (r === c) {
                iterateLinear(0, 0, 1, 1);
            }
            if (r === 8 - c) {
                iterateLinear(0, 8, 1, -1);
            }
        }
        if (settings.cages) {
            for (const cage of settings.cages) {
                if (coordinatesContains(cage.members, cell)) {
                    iterateArray(cage.members);
                }
            }
        }
        if (settings.thermometers) {
            for (const thermometer of settings.thermometers) {
                if (coordinatesContains(thermometer, cell)) {
                    iterateArray(thermometer);
                }
            }
        }
    }
}

function forEachLockedCandidate(
    settings: Settings,
    board: ReadonlyBoard,
    lockedCandidateCallback: LockedCandidateCallback,
): void {
    function iterateLinear(d: number, r: number, c: number, dr: number, dc: number): void {
        lockedCandidateCallback(d, (memberCallback) => {
            for (let i = 0; i < 9; i++) {
                memberCallback(r + i * dr, c + i * dc);
            }
        });
    }
    function iterateBlock(d: number, R: number, C: number, increment: number): void {
        lockedCandidateCallback(d, (memberCallback) => {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    memberCallback(R + r * increment, C + c * increment);
                }
            }
        });
    }
    function iterateArray(d: number, arr: readonly Coordinate[]): void {
        lockedCandidateCallback(d, (memberCallback) => {
            for (const [r, c] of arr) {
                memberCallback(r, c);
            }
        });
    }

    for (let d = 1; d <= 9; d++) {
        for (let i = 0; i < 9; i++) {
            iterateLinear(d, i, 0, 0, 1); // row
            iterateLinear(d, 0, i, 1, 0); // col
        }
        if (!settings.irregular) {
            for (let R = 0; R < 3; R++) {
                for (let C = 0; C < 3; C++) {
                    iterateBlock(d, R * 3, C * 3, 1);
                }
            }
        }
        if (settings.digitsNotInSamePosition) {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    iterateBlock(d, r, r, 3);
                }
            }
        }
        if (settings.diagonals) {
            iterateLinear(d, 0, 0, 1, 1);
            iterateLinear(d, 0, 8, 1, -1);
        }
    }
    if (settings.cages) {
        for (const cage of settings.cages) {
            if (cage.sum) {
                const bitSets = [];
                for (const [r, c] of cage.members) {
                    bitSets.push(board[r][c]);
                }
                const required = possibleWaysToSum(bitSets, cage.sum)[1];
                for (let d = 1; d <= 9; d++) {
                    if (required & bitMask(d)) {
                        iterateArray(d, cage.members);
                    }
                }
            } else if (isCageComplete(cage, board)) {
                for (let d = 1; d <= 9; d++) {
                    iterateArray(d, cage.members);
                }
            }
        }
    }
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
