export const EMPTY_CELL = (1 << 9) - 1;
export function packRC(r, c) {
    return (r << 16) | (c & 0xffff);
}
export function unpackRC(rc) {
    return [rc >> 16, (rc << 16) >> 16];
}
export function bitMask(digit) {
    return 1 << (digit - 1);
}
export function bitCount(set) {
    let count = 0;
    while (set) {
        set &= set - 1;
        count++;
    }
    return count;
}
const LOWEST_DIGIT_CACHE = [];
for (let i = 0; i < 9; i++) {
    LOWEST_DIGIT_CACHE[1 << i] = i + 1;
}
export function lowestDigit(set) {
    if (!set) {
        throw new Error("no bit set");
    }
    return LOWEST_DIGIT_CACHE[set & -set];
}
export function highestDigit(set) {
    for (let digit = 9; digit >= 1; digit--) {
        if ((set & bitMask(digit)) !== 0) {
            return digit;
        }
    }
    throw new Error("no bit set");
}
export function coordinatesContains(arr, [r, c]) {
    for (const [ar, ac] of arr) {
        if (r === ar && c === ac) {
            return true;
        }
    }
    return false;
}
export function clone(board) {
    const result = [];
    for (const row of board) {
        result.push(row.slice());
    }
    return result;
}
export function emptyBoard() {
    const board = [];
    for (let r = 0; r < 9; r++) {
        board.push(new Array(9).fill(EMPTY_CELL));
    }
    return board;
}
export function areBoardsEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
export function dumpBitSet(set) {
    const parts = [];
    for (let d = 1; d <= 9; d++) {
        if (set & bitMask(d)) {
            parts.push(d.toString());
        }
        else {
            parts.push(" ");
        }
    }
    return "[" + parts.join("") + "]";
}
export function dump(board, verbose = false) {
    const output = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const set = board[r][c];
            if (verbose) {
                output.push(dumpBitSet(set));
            }
            else {
                if (!set) {
                    output.push(" ");
                }
                else if (bitCount(set) === 1) {
                    const digit = lowestDigit(set);
                    output.push(digit.toString());
                }
                else {
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
export function parse(boardStr) {
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
export function coordinateToStr(r, c) {
    return `r${r + 1}c${c + 1}`;
}
export function groupToStr(group) {
    if (group.length === 9) {
        if (allSame(group, (rc) => rc[0])) {
            return "row" + (group[0][0] + 1);
        }
        else if (allSame(group, (rc) => rc[1])) {
            return "col" + (group[0][1] + 1);
        }
        else if (allSame(group, boxNumber)) {
            return "box" + boxNumber(group[0]);
        }
    }
    const strParts = [];
    for (const [gr, gc] of group) {
        strParts.push(coordinateToStr(gr, gc));
    }
    return strParts.join(",");
}
function boxNumber([r, c]) {
    return Math.floor(r / 3) * 3 + Math.floor(c / 3) + 1;
}
function allSame(xs, fn) {
    const first = fn(xs[0]);
    for (let i = 1; i < xs.length; i++) {
        if (fn(xs[i]) !== first) {
            return false;
        }
    }
    return true;
}
