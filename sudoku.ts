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
// A single KropkiDots constraint represents a chain of dots where digits cannot repeat
export type KropkiDots = readonly Coordinate[];

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
}

export interface Group {
    readonly members: readonly Coordinate[];
    /** Return digits this group must contain as a bit set */
    requiredDigits(board: ReadonlyBoard): number;
}

class PlainGroup implements Group {
    constructor(readonly members: readonly Coordinate[]) {
    }

    requiredDigits(board: ReadonlyBoard): number {
        // If we don't have any spare possible digits, then all possible digits are required.
        const union = unionPossibilities(this.members, board);
        if (bitCount(union) <= this.members.length) {
            return union;
        } else {
            return 0;
        }
    }
}

class SumGroup implements Group {
    #candidatesPerMember: number[];
    #requiredDigits = 0;
    #cachedBoardStr = "";

    constructor(readonly members: readonly Coordinate[], readonly sum: number) {
        if (!sum) {
            throw new Error("no sum constraint");
        }
        this.#candidatesPerMember = new Array(members.length).fill(0);
    }

    private compute(board: ReadonlyBoard): void {
        const boardStr = board.toString();
        if (this.#cachedBoardStr === boardStr) {
            return;
        }
        this.#candidatesPerMember.fill(0);
        this.#requiredDigits = EMPTY_CELL;

        const bitSets = [];
        for (const [r, c] of this.members) {
            bitSets.push(board[r][c]);
        }
        forEachAssignment(bitSets, assignment => {
            let sum = 0;
            for (const bitSet of assignment) {
                sum += lowestDigit(bitSet);
            }
            if (sum === this.sum) {
                let used = 0;
                for (let i = 0; i < assignment.length; i++) {
                    this.#candidatesPerMember[i] |= assignment[i];
                    used |= assignment[i];
                }
                this.#requiredDigits &= used;
            }
        });
    }

    candidatesPerMember(board: ReadonlyBoard): readonly number[] {
        this.compute(board);
        return this.#candidatesPerMember;
    }

    requiredDigits(board: ReadonlyBoard): number {
        this.compute(board);
        return this.#requiredDigits;
    }
}

export interface ProcessedSettings extends Settings {
    /**
     * Adjacency list of all the cells each cell sees
     * cellVisibilityGraph[r][c] gives a list of cells that the cell sees
     */
    readonly cellVisibilityGraph: ReadonlyArray<ReadonlyArray<ReadonlyArray<Coordinate>>>;

    /** List of groups of cells that must have distinct digits */
    readonly groups: readonly Group[];
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

export function processSettings(settings: Settings): ProcessedSettings {
    const groups: Group[] = [];

    function buildLinearGroup(r: number, c: number, dr: number, dc: number): Group {
        const members: Coordinate[] = [];
        for (let i = 0; i < 9; i++) {
            members.push([r + i * dr, c + i * dc]);
        }
        return new PlainGroup(members);
    }
    function buildBlockGroup(R: number, C: number, increment: number): Group {
        const members: Coordinate[] = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                members.push([R + r * increment, C + c * increment]);
            }
        }
        return new PlainGroup(members);
    }

    for (let i = 0; i < 9; i++) {
        groups.push(buildLinearGroup(i, 0, 0, 1)); // row
        groups.push(buildLinearGroup(0, i, 1, 0)); // col
    }
    if (!settings.irregular) {
        for (let R = 0; R < 3; R++) {
            for (let C = 0; C < 3; C++) {
                groups.push(buildBlockGroup(R * 3, C * 3, 1));
            }
        }
    }
    if (settings.digitsNotInSamePosition) {
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                groups.push(buildBlockGroup(r, c, 3));
            }
        }
    }
    if (settings.diagonals) {
        groups.push(buildLinearGroup(0, 0, 1, 1));
        groups.push(buildLinearGroup(0, 8, 1, -1));
    }
    if (settings.cages) {
        for (const cage of settings.cages) {
            if (cage.sum) {
                groups.push(new SumGroup(cage.members, cage.sum));
            } else {
                groups.push(new PlainGroup(cage.members));
            }
        }
    }
    if (settings.thermometers) {
        for (const thermometer of settings.thermometers) {
            groups.push(new PlainGroup(thermometer));
        }
    }

    const cellVisibilityGraphRaw: Set<number>[][] = [];
    for (let r = 0; r < 9; r++) {
        cellVisibilityGraphRaw.push([]);
        for (let c = 0; c < 9; c++) {
            cellVisibilityGraphRaw[r].push(new Set<number>());
        }
    }

    for (const group of groups) {
        for (const [r1, c1] of group.members) {
            for (const [r2, c2] of group.members) {
                if (r1 !== r2 || c1 !== c2) {
                    cellVisibilityGraphRaw[r1][c1].add(r2 * 9 + c2);
                }
            }
        }
    }
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const adjacent = cellVisibilityGraphRaw[r][c];
            // eslint-disable-next-line no-inner-declarations
            function add(r2: number, c2: number): void {
                if (r2 >= 0 && r2 < 9 && c2 >= 0 && c2 < 9) {
                    adjacent.add(r2 * 9 + c2);
                }
            }

            if (settings.antiknight) {
                add(r - 1, c - 2);
                add(r - 1, c + 2);
                add(r + 1, c - 2);
                add(r + 1, c + 2);
                add(r - 2, c - 1);
                add(r - 2, c + 1);
                add(r + 2, c - 1);
                add(r + 2, c + 1);
            }
            if (settings.antiking) {
                // only do corners because orthogonal neighbors are handled by the usual rules
                add(r - 1, c - 1);
                add(r - 1, c + 1);
                add(r + 1, c - 1);
                add(r + 1, c + 1);
            }
        }
    }

    const cellVisibilityGraph: Coordinate[][][] = [];
    for (let r = 0; r < 9; r++) {
        cellVisibilityGraph.push([]);
        for (let c = 0; c < 9; c++) {
            cellVisibilityGraph[r].push([]);
            for (const member of cellVisibilityGraphRaw[r][c]) {
                cellVisibilityGraph[r][c].push([Math.floor(member / 9), member % 9]);
            }
        }
    }

    const processedSettings: ProcessedSettings = {
        groups: groups,
        cellVisibilityGraph: cellVisibilityGraph,
    };
    Object.assign(processedSettings, settings);
    return processedSettings;
}

export function eliminateObvious(settings: ProcessedSettings, origBoard: ReadonlyBoard, board: Board): void {
    // Anything cell with a known value should eliminate from everything it sees
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
    eliminateFromConsecutiveKropkiDots(settings, origBoard, board);
    eliminateFromDoubleKropkiDots(settings, origBoard, board);
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

export function eliminateFromCages(settings: ProcessedSettings, origBoard: ReadonlyBoard, board: Board): void {
    if (!settings.cages) {
        return;
    }
    for (const group of settings.groups) {
        if (group instanceof SumGroup) {
            const possible = group.candidatesPerMember(origBoard);
            for (let i = 0; i < possible.length; i++) {
                const [r, c] = group.members[i];
                board[r][c] &= possible[i];
            }
        }
    }
}

/* Return a list of bit sets, each of which is a set of digits that sums to the target */
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

/**
 * Compute shift(set1, 0) & shift(set2, 1) & shift(set3, 2) & ...
 */
function intersectWithShift(
    board: ReadonlyBoard,
    coordinates: readonly Coordinate[],
    shift: (set: number, i: number) => number,
): number {
    let start = EMPTY_CELL;
    for (let i = 0; i < coordinates.length; i++) {
        const [r, c] = coordinates[i];
        start &= shift(board[r][c], i);
    }
    return start;
}

export function eliminateFromConsecutiveKropkiDots(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    if (!settings.consecutiveKropkiDots) {
        return;
    }
    for (const dots of settings.consecutiveKropkiDots) {
        // get all possible values for first cell if ascending or descending
        const startAscending = intersectWithShift(origBoard, dots, (s, i) => s >>> i);
        const startDescending = intersectWithShift(origBoard, dots, (s, i) => s << i);
        // apply to whole chain
        for (let i = 0; i < dots.length; i++) {
            const [r, c] = dots[i];
            board[r][c] &= (
                (startAscending << i)
                | ((startDescending >>> i) & EMPTY_CELL)
            );
        }
    }
}

export function shiftMultiply(set: number, factor: number): number {
    let result = 0;
    for (let d = 1; d <= 9; d++) {
        if ((set & bitMask(d)) && d * factor <= 9) {
            result |= bitMask(d * factor);
        }
    }
    return result;
}

export function shiftDivide(set: number, factor: number): number {
    let result = 0;
    for (let d = 1; d <= 9; d++) {
        if ((set & bitMask(d)) && d % factor === 0) {
            result |= bitMask(d / factor);
        }
    }
    return result;
}

export function eliminateFromDoubleKropkiDots(settings: Settings, origBoard: ReadonlyBoard, board: Board): void {
    if (!settings.doubleKropkiDots) {
        return;
    }
    for (const dots of settings.doubleKropkiDots) {
        // get all possible values for first cell if ascending or descending
        const startAscending = intersectWithShift(origBoard, dots, (s, i) => shiftDivide(s, 1 << i));
        const startDescending = intersectWithShift(origBoard, dots, (s, i) => shiftMultiply(s, 1 << i));
        // apply to whole chain
        for (let i = 0; i < dots.length; i++) {
            const [r, c] = dots[i];
            board[r][c] &= (
                shiftMultiply(startAscending, 1 << i)
                | shiftDivide(startDescending, 1 << i)
            );
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

export function eliminateIntersections(settings: ProcessedSettings, origBoard: ReadonlyBoard, board: Board): void {
    for (const group of settings.groups) {
        const required = group.requiredDigits(origBoard);
        for (let digit = 1; digit <= 9; digit++) {
            if (required & bitMask(digit)) {
                // Intersect all eliminated options from placing the digit anywhere in the group
                let intersectionOfVisibilities: Set<number> | null = null;

                for (const [r, c] of group.members) {
                    if (origBoard[r][c] & bitMask(digit)) {
                        const visible = coordinatesAsSet(settings.cellVisibilityGraph[r][c]);
                        if (intersectionOfVisibilities === null) {
                            intersectionOfVisibilities = visible;
                        } else {
                            for (const element of intersectionOfVisibilities) {
                                if (!visible.has(element)) {
                                    intersectionOfVisibilities.delete(element);
                                }
                            }
                        }
                    }
                }
                // If this check fails, the board is broken, since it means a required digit can't
                // go anywhere.
                if (intersectionOfVisibilities) {
                    // Note: If the digit can only go in one place in group, this is comparable to
                    // findHiddenSingles + eliminateObvious
                    for (const rc of intersectionOfVisibilities) {
                        const r = Math.floor(rc / 9);
                        const c = rc % 9;
                        board[r][c] &= ~bitMask(digit);
                    }
                }
            }
        }
    }
}

function coordinatesAsSet(coords: readonly Coordinate[]): Set<number> {
    const set = new Set<number>();
    for (const [r, c] of coords) {
        set.add(r * 9 + c);
    }
    return set;
}

export function eliminateNakedSets(settings: ProcessedSettings, origBoard: ReadonlyBoard, board: Board): void {
    // Notes:
    // naked set of size 1 does the same thing as eliminateObvious
    // naked set of size 8 is the same as a hidden single
    // more generally, naked set of size N is the same as a hidden set of size 9 - N
    for (let setSize = 2; setSize <= 7; setSize++) {
        for (const group of settings.groups) {
            // Skip any set containing a solved cell, so we don't duplicate eliminateObvious.
            // Note this can make solving takes more steps, since including solved cells in
            // naked sets lets you skip a step of eliminateObvious.
            // e.g. if you have cells with 1 and 12, including the 1 lets you also immediately
            // eliminate cells with 2, rather than waiting to first eliminate the 1.
            //
            // Also skip broken cells with no possibilities, since it leads to strange
            // behavior sudokus that aren't 9x9.
            const nonSolvedMembers: Coordinate[] = [];
            for (const [r, c] of group.members) {
                if (bitCount(origBoard[r][c]) > 1) {
                    nonSolvedMembers.push([r, c]);
                }
            }
            forEachSubset(setSize, nonSolvedMembers, (subset) => {
                const union = unionPossibilities(subset, origBoard);
                if (bitCount(union) === setSize) {
                    // we can eliminate the elements of union from all other cells in the group
                    for (let digit = 1; digit <= 9; digit++) {
                        if (union & bitMask(digit)) {
                            for (const [r, c] of group.members) {
                                if ((origBoard[r][c] | union) !== union) {
                                    // not one of the parts of union
                                    board[r][c] &= ~union;
                                }
                            }
                        }
                    }
                }
            });
        }
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

export function findHiddenSingles(settings: ProcessedSettings, origBoard: ReadonlyBoard, board: Board): void {
    for (const group of settings.groups) {
        const required = group.requiredDigits(origBoard);
        for (let digit = 1; digit <= 9; digit++) {
            if (required & bitMask(digit)) {
                const possibleCoordinates: Coordinate[] = [];
                for (const [r, c] of group.members) {
                    if (origBoard[r][c] & bitMask(digit)) {
                        possibleCoordinates.push([r, c]);
                    }
                }
                if (possibleCoordinates.length === 1) {
                    const [r, c] = possibleCoordinates[0];
                    board[r][c] &= bitMask(digit);
                }
            }
        }
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

function clearOrthogonal(board: Board, digit: number, r: number, c: number): void {
    if (digit >= 1 && digit <= 9) {
        tryClear(board, digit, r + 1, c);
        tryClear(board, digit, r - 1, c);
        tryClear(board, digit, r, c + 1);
        tryClear(board, digit, r, c - 1);
    }
}

function clearFrom(board: Board, digit: number, r: number, c: number, settings: ProcessedSettings): void {
    // only relevant if board is broken
    // excluding this logic results in weird asymmetry, where all but the last occurrence are X'ed out
    const startedAsPossible = (board[r][c] & bitMask(digit)) !== 0;

    for (const [r2, c2] of settings.cellVisibilityGraph[r][c]) {
        tryClear(board, digit, r2, c2);
    }
    if (settings.anticonsecutiveOrthogonal) {
        clearOrthogonal(board, digit - 1, r, c);
        clearOrthogonal(board, digit + 1, r, c);
    }
    if (startedAsPossible) {
        board[r][c] = bitMask(digit);
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
