import { BruteForceConstraint } from "./constraint.js";

export class RenbanLine extends BruteForceConstraint {
  override readonly allowDuplicateDigits = false;

  isValid(digits: readonly number[]): boolean {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const d of digits) {
      if (d < min) {
        min = d;
      }
      if (d > max) {
        max = d;
      }
    }
    return max - min === digits.length - 1;
  }
}
