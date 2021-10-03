import * as base from "./base.js";
import {
    Board,
    ReadonlyBoard,
    Settings,
    bitCount,
    bitMask,
} from "../sudoku.js";

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
            base.forEachSubset(size, candidates, (rows) => {
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
