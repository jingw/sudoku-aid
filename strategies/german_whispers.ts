import * as base from "./base.js";
import { Board, EMPTY_CELL, ReadonlyBoard, bitMask } from "../sudoku.js";

const BAD_NEIGHBORS: number[] = [];
for (let d = 1; d <= 9; d++) {
  const low = Math.max(d - 4, 1);
  const high = Math.min(d + 4, 9);
  // everything in the range [low, high] inclusive is bad
  const bad = (bitMask(high + 1) - 1) & ~(bitMask(low) - 1);
  BAD_NEIGHBORS.push(bad);
}

export function eliminateFromGermanWhispers(
  settings: base.ProcessedSettings,
  origBoard: ReadonlyBoard,
  board: Board,
): void {
  if (!settings.germanWhispers) {
    return;
  }
  for (const line of settings.germanWhispers) {
    for (let i = 0; i < line.length; i++) {
      const [r, c] = line[i];
      let bannedNeighborCandidates = EMPTY_CELL;
      for (let d = 1; d <= 9; d++) {
        if (origBoard[r][c] & bitMask(d)) {
          bannedNeighborCandidates &= BAD_NEIGHBORS[d - 1];
        }
      }
      if (i > 0) {
        const [nr, nc] = line[i - 1];
        board[nr][nc] &= ~bannedNeighborCandidates;
      }
      if (i < line.length - 1) {
        const [nr, nc] = line[i + 1];
        board[nr][nc] &= ~bannedNeighborCandidates;
      }
    }
  }
  // future improvement:
  // - rather than naive application of rules, propagate whole line at once
  // - intelligently handle cells where neighbors see each other, restricting 4/6
}
