import * as base from "./base.js";
import { bitCount, coordinateToStr, lowestDigit, unpackRC, } from "../sudoku.js";
export function eliminateXYZWing(settings, origBoard, board) {
    // loop over all possible pivots
    for (let pr = 0; pr < 9; pr++) {
        for (let pc = 0; pc < 9; pc++) {
            const pivotSet = origBoard[pr][pc];
            const pivotSetCount = bitCount(pivotSet);
            // 2 = XY-wing, 3 = XYZ-wing
            if (pivotSetCount !== 2 && pivotSetCount !== 3) {
                continue;
            }
            // loop over all possible wings
            for (const [wr1, wc1] of settings.cellVisibilityGraph[pr][pc]) {
                const w1set = origBoard[wr1][wc1];
                if (bitCount(w1set) !== 2 ||
                    bitCount(w1set & pivotSet) !== pivotSetCount - 1) {
                    continue;
                }
                for (const [wr2, wc2] of settings.cellVisibilityGraph[pr][pc]) {
                    const w2set = origBoard[wr2][wc2];
                    if (w1set === w2set) {
                        continue;
                    }
                    if (bitCount(w2set) !== 2 ||
                        bitCount(w2set & pivotSet) !== pivotSetCount - 1) {
                        continue;
                    }
                    if (bitCount(pivotSet | w1set | w2set) !== 3) {
                        // This condition is already satisfied by now for an XYZ wing, but needs to
                        // be checked for an XY wing.
                        continue;
                    }
                    const zMask = w1set & w2set;
                    const toIntersect = [
                        settings.cellVisibilityGraphAsSet[wr1][wc1],
                        settings.cellVisibilityGraphAsSet[wr2][wc2],
                    ];
                    if (pivotSetCount === 3) {
                        toIntersect.push(settings.cellVisibilityGraphAsSet[pr][pc]);
                    }
                    const intersection = base.setIntersection(toIntersect);
                    for (const rc of intersection) {
                        const [r, c] = unpackRC(rc);
                        if (board[r][c] & zMask) {
                            base.logRemoval(r, c, lowestDigit(zMask), `XY(Z) wing, pivot=${coordinateToStr(pr, pc)}, wings=${coordinateToStr(wr1, wc1)},${coordinateToStr(wr2, wc2)}`);
                            board[r][c] &= ~zMask;
                        }
                    }
                }
            }
        }
    }
}
