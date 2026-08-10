import * as base from "../strategies/base.js";
import {
  Board,
  Coordinate,
  PackedCoordinate,
  ReadonlyBoard,
  lowestDigit,
  packRC,
} from "../sudoku.js";
import { ProcessedSettings } from "./constraint.js";
import { Constraint } from "./constraint.js";

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

export class GeneralBooleanConstraint extends Constraint {
  constructor(
    members: readonly Coordinate[],
    // Arbitrary JavaScript code that evaluates to a boolean given an array of digits `x`
    readonly expression: string,
  ) {
    super(members);
  }

  performElimination(
    settings: ProcessedSettings,
    origBoard: ReadonlyBoard,
    board: Board,
  ): void {
    const distinctMembers: Coordinate[] = [];
    const rcToIndex = new Map<PackedCoordinate, number>();
    for (const [r, c] of this.members) {
      const rc = packRC(r, c);
      if (!rcToIndex.has(rc)) {
        rcToIndex.set(rc, distinctMembers.length);
        distinctMembers.push([r, c]);
      }
    }

    const bitSets = [];
    for (const [r, c] of distinctMembers) {
      bitSets.push(origBoard[r][c]);
    }

    // Give up if too many possibilities to brute force
    if (base.countPossibilities(bitSets) > 1e6) {
      return;
    }

    // for convenience, translate x[-1] to x[x.length-1]
    const js = "return " + this.expression.replaceAll("x[-", "x[x.length-");
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const f = Function("x", "sum", "min", "max", js);

    // Exhaustively try all possibilities
    const candidatesPerMember = new Array(distinctMembers.length).fill(0);
    base.forEachAssignment(
      bitSets,
      (assignment) => {
        const x = [];
        for (const [r, c] of this.members) {
          x.push(
            lowestDigit(assignment[rcToIndex.get(packRC(r, c))!]) +
              settings.startDigit -
              1,
          );
        }
        if (!f(x, sum, min, max)) {
          return;
        }
        if (
          base.isAssignmentConflicting(
            assignment,
            distinctMembers,
            settings.cellVisibilityGraphAsSet,
          )
        ) {
          return;
        }
        // it's possible
        for (let i = 0; i < assignment.length; i++) {
          candidatesPerMember[i] |= assignment[i];
        }
      },
      true,
    );

    for (const [r, c] of this.members) {
      board[r][c] &= candidatesPerMember[rcToIndex.get(packRC(r, c))!];
    }
  }
}
