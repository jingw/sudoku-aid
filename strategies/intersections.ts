import * as base from "./base.js";
import { Board, ReadonlyBoard, groupToStr, unpackRC } from "../sudoku.js";
import { bitMask } from "../bitset.js";

export function eliminateIntersections(
  settings: base.ProcessedSettings,
  origBoard: ReadonlyBoard,
  board: Board,
): void {
  for (const group of settings.groups) {
    const required = group.requiredDigits(origBoard);
    for (let i = 0; i < board.length; i++) {
      if (required & bitMask(i)) {
        // Intersect all eliminated options from placing the digit anywhere in the group
        const toIntersect = [];

        for (const [r, c] of group.members) {
          if (origBoard[r][c] & bitMask(i)) {
            toIntersect.push(settings.cellVisibilityGraphAsSet[r][c]);
          }
        }
        // If this check fails, the board is broken, since it means a required digit can't
        // go anywhere.
        if (toIntersect.length > 0) {
          const intersectionOfVisibilities = base.setIntersection(toIntersect);
          // Note: If the digit can only go in one place in group, this is comparable to
          // findHiddenSingles + eliminateObvious
          for (const rc of intersectionOfVisibilities) {
            const [r, c] = unpackRC(rc);
            const digitMask = bitMask(i);
            if (board[r][c] & digitMask) {
              base.logRemoval(
                r,
                c,
                i,
                `intersection, group=${groupToStr(group.members, board.length)}`,
              );
              board[r][c] &= ~digitMask;
            }
          }
        }
      }
    }
  }
}
