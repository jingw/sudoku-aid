import { BruteForceConstraint } from "./constraint.js";

function checkDifference(digits: number[], diff: number): boolean {
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] - digits[i - 1] !== diff) {
      return false;
    }
  }
  return true;
}
function checkMultiple(digits: number[], multiple: number): boolean {
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] / digits[i - 1] !== multiple) {
      return false;
    }
  }
  return true;
}

export class ConsecutiveKropkiDots extends BruteForceConstraint {
  isValid(digits: number[]): boolean {
    return checkDifference(digits, 1) || checkDifference(digits, -1);
  }
}

export class DoubleKropkiDots extends BruteForceConstraint {
  isValid(digits: number[]): boolean {
    return checkMultiple(digits, 2) || checkMultiple(digits, 0.5);
  }
}
