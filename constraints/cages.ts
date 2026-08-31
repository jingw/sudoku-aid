import { forEachAssignment } from "../strategies/base.js";
import { Coordinate, ReadonlyBoard, lowestDigit } from "../sudoku.js";
import { BruteForceConstraint } from "./constraint.js";

export class Cage extends BruteForceConstraint {
  override readonly allowDuplicateDigits = false;

  constructor(
    members: readonly Coordinate[],
    readonly sum: number,
  ) {
    super(members);
  }

  isValid(digits: readonly number[]): boolean {
    let sum = 0;
    for (const x of digits) {
      sum += x;
    }
    return sum === this.sum;
  }

  /* Return a list of bit sets, each of which is a set of digits that sums to the target */
  possibleWaysToSum(board: ReadonlyBoard, startDigit: number): number[] {
    const bitSets = [];
    for (const [r, c] of this.members) {
      bitSets.push(board[r][c]);
    }
    const possibleCombinedBitSets = new Set<number>();
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
