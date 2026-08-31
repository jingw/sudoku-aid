import { Coordinate } from "../sudoku.js";
import { BruteForceConstraint } from "./constraint.js";

export class Arrow extends BruteForceConstraint {
  constructor(
    members: readonly Coordinate[],
    readonly sumCells: number,
  ) {
    super(members);
  }

  isValid(digits: readonly number[]): boolean {
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
