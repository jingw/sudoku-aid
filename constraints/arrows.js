import { BruteForceConstraint } from "./constraint.js";
export class Arrow extends BruteForceConstraint {
    sumCells;
    constructor(members, sumCells) {
        super(members);
        this.sumCells = sumCells;
    }
    isValid(digits) {
        let expectedSum = 0;
        for (let i = 0; i < this.sumCells; i++) {
            expectedSum *= 10;
            expectedSum += digits[i];
        }
        let sum = 0;
        for (let i = this.sumCells; i < digits.length; i++) {
            sum += digits[i];
        }
        return sum === expectedSum;
    }
}
