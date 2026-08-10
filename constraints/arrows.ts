import {
  countPossibilities,
  forEachAssignment,
  isAssignmentConflicting,
} from "../strategies/base.js";
import { Board, Coordinate, ReadonlyBoard, lowestDigit } from "../sudoku.js";
import { Constraint, ProcessedSettings } from "./constraint.js";

export class Arrow extends Constraint {
  constructor(
    members: readonly Coordinate[],
    readonly sumCells: number,
  ) {
    super(members);
  }

  performElimination(
    settings: ProcessedSettings,
    origBoard: ReadonlyBoard,
    board: Board,
  ): void {
    const bitSets = [];
    for (const [r, c] of this.members) {
      bitSets.push(origBoard[r][c]);
    }

    // Give up if too many possibilities to brute force
    if (countPossibilities(bitSets) > 1e6) {
      return;
    }

    // Exhaustively try all possibilities
    const candidatesPerMember = new Array(this.members.length).fill(0);
    forEachAssignment(
      bitSets,
      (assignment) => {
        let expectedSum = 0;
        for (let i = 0; i < this.sumCells; i++) {
          expectedSum *= 10;
          expectedSum += lowestDigit(assignment[i]) + settings.startDigit - 1;
        }
        let sum = 0;
        for (let i = this.sumCells; i < assignment.length; i++) {
          sum += lowestDigit(assignment[i]) + settings.startDigit - 1;
        }
        if (sum !== expectedSum) {
          return;
        }
        if (
          isAssignmentConflicting(
            assignment,
            this.members,
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

    for (let i = 0; i < candidatesPerMember.length; i++) {
      const [r, c] = this.members[i];
      board[r][c] &= candidatesPerMember[i];
    }
  }
}
