import { forEachAssignment } from "../strategies/base.js";
import {
  Board,
  Coordinate,
  ReadonlyBoard,
  emptyCell,
  lowestDigit,
} from "../sudoku.js";
import { NonRepeatingGroup, ProcessedSettings } from "./constraint.js";

export class Cage extends NonRepeatingGroup {
  #candidatesPerMember: number[];
  #requiredDigits = 0;
  #cachedBoardStr = "";

  constructor(
    members: readonly Coordinate[],
    readonly sum: number,
  ) {
    super(members);
    this.#candidatesPerMember = new Array<number>(members.length).fill(0);
  }

  private compute(board: ReadonlyBoard, startDigit: number): void {
    const boardStr = board.toString();
    if (this.#cachedBoardStr === boardStr) {
      return;
    }
    this.#candidatesPerMember.fill(0);
    this.#requiredDigits = emptyCell(board.length);

    const bitSets = [];
    for (const [r, c] of this.members) {
      bitSets.push(board[r][c]);
    }
    forEachAssignment(bitSets, (assignment) => {
      let sum = 0;
      for (const bitSet of assignment) {
        sum += lowestDigit(bitSet) + startDigit - 1;
      }
      if (sum === this.sum) {
        let used = 0;
        for (let i = 0; i < assignment.length; i++) {
          this.#candidatesPerMember[i] |= assignment[i];
          used |= assignment[i];
        }
        this.#requiredDigits &= used;
      }
    });
  }

  candidatesPerMember(
    board: ReadonlyBoard,
    startDigit: number,
  ): readonly number[] {
    this.compute(board, startDigit);
    return this.#candidatesPerMember;
  }

  override requiredDigits(
    settings: ProcessedSettings,
    board: ReadonlyBoard,
  ): number {
    if (this.sum === 0) {
      return super.requiredDigits(settings, board);
    }
    this.compute(board, settings.startDigit);
    return this.#requiredDigits;
  }

  override performElimination(
    settings: ProcessedSettings,
    origBoard: ReadonlyBoard,
    board: Board,
  ): void {
    if (this.sum === 0) {
      super.performElimination(settings, origBoard, board);
      return;
    }
    const possible = this.candidatesPerMember(origBoard, settings.startDigit);
    for (let i = 0; i < possible.length; i++) {
      const [r, c] = this.members[i];
      board[r][c] &= possible[i];
    }
  }

  /* Return a list of bit sets, each of which is a set of digits that sums to the target */
  possibleWaysToSum(board: ReadonlyBoard, startDigit: number): number[] {
    if (!this.sum) {
      throw new Error("cage has no sum constraint");
    }
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
