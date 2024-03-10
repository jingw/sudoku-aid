import { bitMask, highestDigit, lowestDigit, packRC, } from "../sudoku.js";
export function eliminateFromThermometers(settings, origBoard, board) {
    if (!settings.thermometers) {
        return;
    }
    for (const thermometer of settings.thermometers) {
        // propagate minimums going up
        const [r0, c0] = thermometer.members[0];
        let minInclusive = origBoard[r0][c0] === 0 ? 10 : lowestDigit(origBoard[r0][c0]);
        for (let i = 1; i < thermometer.members.length; i++) {
            const [r, c] = thermometer.members[i];
            let increment;
            if (thermometer.strict ||
                settings.cellVisibilityGraphAsSet[r][c].has(packRC(...thermometer.members[i - 1]))) {
                increment = 1;
            }
            else {
                increment = 0;
            }
            const newSet = origBoard[r][c] & ~(bitMask(minInclusive + increment) - 1);
            board[r][c] &= newSet;
            minInclusive = newSet ? lowestDigit(newSet) : 10;
        }
        // propagate maximums going down
        const [r1, c1] = thermometer.members[thermometer.members.length - 1];
        let maxInclusive = origBoard[r1][c1] === 0 ? 0 : highestDigit(origBoard[r1][c1]);
        for (let i = thermometer.members.length - 2; i >= 0; i--) {
            const [r, c] = thermometer.members[i];
            let increment;
            if (thermometer.strict ||
                settings.cellVisibilityGraphAsSet[r][c].has(packRC(...thermometer.members[i + 1]))) {
                increment = 1;
            }
            else {
                increment = 0;
            }
            const newSet = maxInclusive === 0
                ? 0
                : origBoard[r][c] & (bitMask(maxInclusive + 1 - increment) - 1);
            board[r][c] &= newSet;
            maxInclusive = newSet ? highestDigit(newSet) : 0;
        }
    }
}
