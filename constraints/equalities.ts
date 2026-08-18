import { ALL_ONES, Board, Coordinate, ReadonlyBoard } from "../sudoku.js";
import { ProcessedSettings } from "./constraint.js";
import { Constraint } from "./constraint.js";

export class EqualityConstraint extends Constraint {
  constructor(
    members: readonly Coordinate[],
    readonly name: string,
  ) {
    super(members);
  }

  performElimination(
    _: ProcessedSettings,
    origBoard: ReadonlyBoard,
    board: Board,
  ): void {
    let intersection = ALL_ONES;
    for (const [r, c] of this.members) {
      intersection &= origBoard[r][c];
    }
    for (const [r, c] of this.members) {
      board[r][c] &= intersection;
    }
  }
}
