import {
  Coordinate,
  ReadonlyBoard,
  bitCount,
  coordinateToStr,
  packRC,
} from "../sudoku.js";

export function setIntersection<T>(sets: ReadonlyArray<Set<T>>): Set<T> {
  const intersection = new Set(sets[0]);
  for (let i = 1; i < sets.length; i++) {
    for (const element of intersection) {
      if (!sets[i].has(element)) {
        intersection.delete(element);
      }
    }
  }
  return intersection;
}

export function forEachSubset<T>(
  size: number,
  set: readonly T[],
  callback: (subset: readonly T[]) => void,
  i = 0,
  current: T[] = [],
): void {
  if (size > set.length - i) {
    // unsatisfiable
  } else if (size === 0) {
    callback(current);
  } else {
    // either take this member...
    current.push(set[i]);
    forEachSubset(size - 1, set, callback, i + 1, current);
    current.pop();

    // ... or don't take it
    forEachSubset(size, set, callback, i + 1, current);
  }
}

export function forEachAssignment(
  bitSets: number[],
  callback: (assignment: readonly number[]) => void,
  allowDuplicates = false,
  used = 0,
  current: number[] = [],
): void {
  if (current.length === bitSets.length) {
    callback(current);
  } else {
    let set = bitSets[current.length];
    if (!allowDuplicates) {
      set &= ~used;
    }
    while (set) {
      const lowestBit = set & -set;
      current.push(lowestBit);
      forEachAssignment(
        bitSets,
        callback,
        allowDuplicates,
        used | lowestBit,
        current,
      );
      current.pop();
      set &= ~lowestBit;
    }
  }
}

/** return true if equal digits see each other */
export function isAssignmentConflicting(
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

export function countPossibilities(bitSets: readonly number[]): number {
  let count = 1;
  for (const s of bitSets) {
    count *= bitCount(s);
  }
  return count;
}

export function unionPossibilities(
  coords: readonly Coordinate[],
  board: ReadonlyBoard,
): number {
  let union = 0;
  for (const [r, c] of coords) {
    union |= board[r][c];
  }
  return union;
}

export function logRemoval(
  r: number,
  c: number,
  digit: number,
  reason: string,
): void {
  console.log(`${coordinateToStr(r, c)}: ${digit} removed by ${reason}`);
}
