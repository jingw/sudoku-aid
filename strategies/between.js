import { EMPTY_CELL, bitMask, highestDigit, lowestDigit, } from "../sudoku.js";
export function eliminateFromBetweenLines(settings, origBoard, board) {
    if (!settings.betweenLines) {
        return;
    }
    for (const line of settings.betweenLines) {
        // apply ends to insides
        // min and max are exclusive
        let minEnd = 9;
        let maxEnd = 1;
        for (const i of [0, line.length - 1]) {
            const [r, c] = line[i];
            minEnd = Math.min(minEnd, lowestDigit(origBoard[r][c]));
            maxEnd = Math.max(maxEnd, highestDigit(origBoard[r][c]));
        }
        const endMask = (bitMask(maxEnd) - 1) & ~(bitMask(minEnd + 1) - 1);
        for (let i = 1; i < line.length - 1; i++) {
            const [r, c] = line[i];
            board[r][c] &= endMask;
        }
        // apply insides to ends
        let endGreaterThan = 1;
        let endLessThan = 9;
        for (let i = 1; i < line.length - 1; i++) {
            const [r, c] = line[i];
            // if some line member is at least X, then one end must be greater than X
            endGreaterThan = Math.max(endGreaterThan, lowestDigit(origBoard[r][c]));
            // if some line member is at most Y, then one end must be less than Y
            endLessThan = Math.min(endLessThan, highestDigit(origBoard[r][c]));
        }
        const maskLessThan = bitMask(endLessThan) - 1;
        const maskGreaterThan = EMPTY_CELL & ~(bitMask(endGreaterThan + 1) - 1);
        const maskBoth = maskLessThan | maskGreaterThan;
        const [r1, c1] = line[0];
        const [r2, c2] = line[line.length - 1];
        const end1 = origBoard[r1][c1];
        const end2 = origBoard[r2][c2];
        // cannot be in middle
        board[r1][c1] &= maskBoth;
        board[r2][c2] &= maskBoth;
        if (!(end1 & maskGreaterThan) || !(end2 & maskLessThan)) {
            // either:
            // - end1 cannot be the big side, so it must be the small side
            // - end2 cannot be the small side, so it must be the big side
            board[r1][c1] &= maskLessThan;
            board[r2][c2] &= maskGreaterThan;
        }
        if (!(end1 & maskLessThan) || !(end2 & maskGreaterThan)) {
            // and the reverse
            board[r1][c1] &= maskGreaterThan;
            board[r2][c2] &= maskLessThan;
        }
    }
}
