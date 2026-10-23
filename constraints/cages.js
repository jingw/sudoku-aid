import { forEachAssignment } from "../strategies/base.js";
import { lowestDigit } from "../sudoku.js";
import { BruteForceConstraint } from "./constraint.js";
export class Cage extends BruteForceConstraint {
    sum;
    allowDuplicateDigits = false;
    constructor(members, sum) {
        super(members);
        this.sum = sum;
    }
    isValid(digits) {
        let sum = 0;
        for (const x of digits) {
            sum += x;
        }
        return sum === this.sum;
    }
    /* Return a list of bit sets, each of which is a set of digits that sums to the target */
    possibleWaysToSum(board, startDigit) {
        const bitSets = [];
        for (const [r, c] of this.members) {
            bitSets.push(board[r][c]);
        }
        const possibleCombinedBitSets = new Set();
        forEachAssignment(bitSets, (assignment) => {
            let sum = 0;
            for (const bitSet of assignment) {
                sum += lowestDigit(bitSet) + startDigit - 1;
            }
            if (sum === this.sum) {
                let combined = 0;
                for (const bitSet of assignment) {
                    combined |= bitSet;
                }
                possibleCombinedBitSets.add(combined);
            }
        });
        return Array.from(possibleCombinedBitSets);
    }
}
