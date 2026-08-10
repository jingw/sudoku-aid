import { unionPossibilities } from "../strategies/base.js";
import {
  Board,
  Coordinate,
  PackedCoordinate,
  ReadonlyBoard,
  bitCount,
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
