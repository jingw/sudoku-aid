import { Coordinate } from "../sudoku.js";
import { BruteForceConstraint } from "./constraint.js";

function sum(xs: number[]): number {
  let result = 0;
  for (const x of xs) {
    result += x;
  }
  return result;
}

function min(xs: number[]): number {
  return Math.min(...xs);
}

function max(xs: number[]): number {
  return Math.max(...xs);
}

export class GeneralBooleanConstraint extends BruteForceConstraint {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  readonly fn: Function;

  constructor(
    members: readonly Coordinate[],
    // Arbitrary JavaScript code that evaluates to a boolean given an array of digits `x`
    readonly expression: string,
  ) {
    super(members);

    // for convenience, translate x[-1] to x[x.length-1]
    const js = "return " + this.expression.replaceAll("x[-", "x[x.length-");
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    this.fn = Function("x", "sum", "min", "max", js);
  }

  isValid(digits: readonly number[]): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.fn(digits, sum, min, max);
  }
}
