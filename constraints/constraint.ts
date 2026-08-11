import { forEachAssignment, unionPossibilities } from "../strategies/base.js";
import {
  Board,
  Coordinate,
  PackedCoordinate,
  ReadonlyBoard,
  bitCount,
  emptyCell,
  lowestDigit,
  packRC,
} from "../sudoku.js";

export interface Settings {
  readonly boardSize?: number;
  readonly antiknight?: boolean;
  readonly antiking?: boolean;
  readonly diagonals?: boolean;
  readonly nonconsecutive?: boolean;
  readonly digitsNotInSamePosition?: boolean;
  readonly irregular?: boolean;
  readonly index159?: boolean;
  readonly startDigit?: number;
  readonly constraints?: readonly Constraint[];
}

export interface ProcessedSettings extends Settings {
  readonly startDigit: number;
  readonly constraints: readonly Constraint[];

  /**
   * Adjacency list of all the cells each cell sees
   * cellVisibilityGraph[r][c] gives a list of cells that the cell sees
   */
  readonly cellVisibilityGraph: ReadonlyArray<
    ReadonlyArray<ReadonlyArray<Coordinate>>
  >;

  /** same data as cellVisibilityGraph, but with Coordinate packed as a number */
  readonly cellVisibilityGraphAsSet: ReadonlyArray<
    ReadonlyArray<Set<PackedCoordinate>>
  >;
}

export abstract class Constraint {
  readonly allowDuplicateDigits: boolean = true;

  constructor(readonly members: readonly Coordinate[]) {}

  /** Return digits this group must contain as a bit set */
  requiredDigits(_settings: ProcessedSettings, board: ReadonlyBoard): number {
    if (this.allowDuplicateDigits) {
      return 0;
    }
    // If we don't have any spare possible digits, then all possible digits are required.
    const union = unionPossibilities(this.members, board);
    if (bitCount(union) <= this.members.length) {
      return union;
    } else {
      return 0;
    }
  }

  abstract performElimination(
    settings: ProcessedSettings,
    origBoard: ReadonlyBoard,
    board: Board,
  ): void;
}

export class NonRepeatingGroup extends Constraint {
  override readonly allowDuplicateDigits = false;

  performElimination(
    _settings: Settings,
    _origBoard: ReadonlyBoard,
    _board: Board,
  ): void {
    // handled automatically by visibility
  }
}

export abstract class BruteForceConstraint extends Constraint {
  private cachedCandidatesPerMember: number[] = [];
  private cachedRequiredDigits = 0;
  private cachedBoardStr = "";

  abstract isValid(digits: number[]): boolean;

  private compute(board: ReadonlyBoard, settings: ProcessedSettings): void {
    const boardStr = board.toString();
    if (this.cachedBoardStr === boardStr) {
      return;
    }
    this.cachedBoardStr = boardStr;

    const distinctMembers: Coordinate[] = [];
    const candidatesPerDistinctMember = new Array<number>(
      this.members.length,
    ).fill(0);
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
      bitSets.push(board[r][c]);
    }

    this.cachedCandidatesPerMember = [];
    // Give up if too many possibilities to brute force
    if (this.allowDuplicateDigits && countPossibilities(bitSets) > 1e6) {
      this.cachedRequiredDigits = 0;
      return;
    }
    this.cachedRequiredDigits = emptyCell(board.length);

    // Exhaustively try all possibilities
    const x = new Array<number>(this.members.length);
    forEachAssignment(
      bitSets,
      (assignment) => {
        for (let i = 0; i < this.members.length; i++) {
          const [r, c] = this.members[i];
          x[i] =
            lowestDigit(assignment[rcToIndex.get(packRC(r, c))!]) +
            settings.startDigit -
            1;
        }
        if (!this.isValid(x)) {
          return;
        }
        // optimization: cannot have conflicting assignment if not allowing duplicates
        if (
          this.allowDuplicateDigits &&
          isAssignmentConflicting(
            assignment,
            distinctMembers,
            settings.cellVisibilityGraphAsSet,
          )
        ) {
          return;
        }
        // it's possible
        let used = 0;
        for (let i = 0; i < assignment.length; i++) {
          candidatesPerDistinctMember[i] |= assignment[i];
          used |= assignment[i];
        }
        this.cachedRequiredDigits &= used;
      },
      this.allowDuplicateDigits,
    );

    for (const [r, c] of distinctMembers) {
      this.cachedCandidatesPerMember.push(
        candidatesPerDistinctMember[rcToIndex.get(packRC(r, c))!],
      );
    }
  }

  override requiredDigits(
    settings: ProcessedSettings,
    board: ReadonlyBoard,
  ): number {
    this.compute(board, settings);
    return this.cachedRequiredDigits;
  }

  performElimination(
    settings: ProcessedSettings,
    origBoard: ReadonlyBoard,
    board: Board,
  ): void {
    this.compute(origBoard, settings);
    const possible = this.cachedCandidatesPerMember;
    for (let i = 0; i < possible.length; i++) {
      const [r, c] = this.members[i];
      board[r][c] &= possible[i];
    }
  }
}

/** return true if equal digits see each other */
function isAssignmentConflicting(
  assignment: readonly number[],
  coordinates: readonly Coordinate[],
  cellVisibilityGraphAsSet: ReadonlyArray<ReadonlyArray<Set<number>>>,
): boolean {
  // Check for conflicts
  for (let i = 0; i < assignment.length; i++) {
    const [r1, c1] = coordinates[i];
    for (let j = i + 1; j < assignment.length; j++) {
      const [r2, c2] = coordinates[j];
      if (
        assignment[i] === assignment[j] &&
        cellVisibilityGraphAsSet[r1][c1].has(packRC(r2, c2))
      ) {
        // conflict, equal digits see each other
        return true;
      }
    }
  }
  return false;
}

function countPossibilities(bitSets: readonly number[]): number {
  let count = 1;
  for (const s of bitSets) {
    count *= bitCount(s);
  }
  return count;
}
