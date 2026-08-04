import { ALL_ONES, Board, ReadonlyBoard, bitMask } from "../sudoku.js";
import * as base from "./base.js";

function badNeighbors(d: number, difference: number): number {
  const low = Math.max(d - difference + 1, 1);
  const high = d + difference - 1;
  // everything in the range [low, high] inclusive is bad
  return (bitMask(high + 1) - 1) & ~(bitMask(low) - 1);
}

export function eliminateFromGermanWhispers(
  settings: base.ProcessedSettings,
  origBoard: ReadonlyBoard,
  board: Board,
): void {
  if (!settings.germanWhispers) {
    return;
  }
  for (const whisper of settings.germanWhispers) {
    const line = whisper.members;
    for (let i = 0; i < line.length; i++) {
      const [r, c] = line[i];
      let bannedNeighborCandidates = ALL_ONES;
      for (let d = 1; d <= board.length; d++) {
        if (origBoard[r][c] & bitMask(d)) {
          bannedNeighborCandidates &= badNeighbors(d, whisper.difference);
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
