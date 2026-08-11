import { Coordinate, ReadonlyBoard, coordinateToStr } from "../sudoku.js";

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
