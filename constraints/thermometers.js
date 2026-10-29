import { lowestBit, packRC, } from "../sudoku.js";
import { Constraint } from "./constraint.js";
export class Thermometer extends Constraint {
    allowDuplicateDigits;
    constructor(members, strict) {
        super(members);
        this.allowDuplicateDigits = !strict;
    }
    mustBeDifferent(i, j, settings) {
        if (!this.allowDuplicateDigits) {
            return true;
        }
        const [ri, ci] = this.members[i];
        const [rj, cj] = this.members[j];
        return settings.cellVisibilityGraphAsSet[ri][ci].has(packRC(rj, cj));
    }
    performElimination(settings, origBoard, board) {
        const newCandidates = this.members.map(([r, c]) => origBoard[r][c]);
        // propagate minimums going up
        for (let i = 0; i < this.members.length; i++) {
            for (let j = i - 1; j >= 0; j--) {
                if (newCandidates[i] === 0 ||
                    lowestBit(newCandidates[i]) >
                        (lowestBit(newCandidates[i - 1]) || Infinity)) {
                    // It suffices to stop as soon as any tightening is found, since
                    // the lower bounds are monotonically increasing.
                    break;
                }
                // keep bits greater than or equal to the minimum
                let allowedBits = fillUpperBits(newCandidates[j]);
                if (this.mustBeDifferent(i, j, settings)) {
                    allowedBits <<= 1;
                }
                newCandidates[i] &= allowedBits;
            }
        }
        // propagate maximums going down
        for (let i = this.members.length - 1; i >= 0; i--) {
            for (let j = i + 1; j < this.members.length; j++) {
                if (newCandidates[i] === 0 ||
                    Math.clz32(newCandidates[i]) > Math.clz32(newCandidates[i + 1])) {
                    break;
                }
                // keep bits less than or equal to the maximum
                let allowedBits = fillLowerBits(newCandidates[j]);
                if (this.mustBeDifferent(i, j, settings)) {
                    allowedBits >>>= 1;
                }
                newCandidates[i] &= allowedBits;
            }
        }
        for (let i = 0; i < this.members.length; i++) {
            const [r, c] = this.members[i];
            board[r][c] &= newCandidates[i];
        }
    }
}
/* fill in all bits lower than the highest bit */
function fillLowerBits(n) {
    // copy the highest bit to every possible lower position
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return n;
}
/* fill in all bits higher than the lowest bit */
function fillUpperBits(n) {
    return ~(lowestBit(n) - 1);
}
