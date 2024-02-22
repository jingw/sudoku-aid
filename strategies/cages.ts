import * as base from "./base.js";
import {
  Board,
  Cage,
  Coordinate,
  EMPTY_CELL,
  ReadonlyBoard,
  lowestDigit,
} from "../sudoku.js";

export class SumGroup implements base.Group {
  #candidatesPerMember: number[];
  #requiredDigits = 0;
  #cachedBoardStr = "";

  constructor(
    readonly members: readonly Coordinate[],
    readonly sum: number,
  ) {
    if (!sum) {
      throw new Error("no sum constraint");
    }
    this.#candidatesPerMember = new Array<number>(members.length).fill(0);
  }

  private compute(board: ReadonlyBoard): void {
    const boardStr = board.toString();
    if (this.#cachedBoardStr === boardStr) {
      return;
    }
    this.#candidatesPerMember.fill(0);
    this.#requiredDigits = EMPTY_CELL;

    const bitSets = [];
    for (const [r, c] of this.members) {
      bitSets.push(board[r][c]);
    }
    base.forEachAssignment(bitSets, (assignment) => {
      let sum = 0;
      for (const bitSet of assignment) {
        sum += lowestDigit(bitSet);
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

  candidatesPerMember(board: ReadonlyBoard): readonly number[] {
    this.compute(board);
    return this.#candidatesPerMember;
  }

  requiredDigits(board: ReadonlyBoard): number {
    this.compute(board);
    return this.#requiredDigits;
  }
}

export function eliminateFromCages(
  settings: base.ProcessedSettings,
  origBoard: ReadonlyBoard,
  board: Board,
): void {
  if (!settings.cages) {
    return;
  }
  for (const group of settings.groups) {
    if (group instanceof SumGroup) {
      const possible = group.candidatesPerMember(origBoard);
      for (let i = 0; i < possible.length; i++) {
        const [r, c] = group.members[i];
        board[r][c] &= possible[i];
      }
    }
  }
}

/* Return a list of bit sets, each of which is a set of digits that sums to the target */
export function possibleWaysToSumCage(
  cage: Cage,
  board: ReadonlyBoard,
): number[] {
  if (!cage.sum) {
    throw new Error("cage has no sum constraint");
  }
  const bitSets = [];
  for (const [r, c] of cage.members) {
    bitSets.push(board[r][c]);
  }
  const possibleCombinedBitSets = new Set<number>();
  base.forEachAssignment(bitSets, (assignment) => {
    let sum = 0;
    for (const bitSet of assignment) {
      sum += lowestDigit(bitSet);
    }
    if (sum === cage.sum) {
      let combined = 0;
      for (const bitSet of assignment) {
        combined |= bitSet;
      }
      possibleCombinedBitSets.add(combined);
    }
  });
  return Array.from(possibleCombinedBitSets);
}
