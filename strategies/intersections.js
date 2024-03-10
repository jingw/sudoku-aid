import * as base from "./base.js";
import { bitMask, groupToStr, unpackRC, } from "../sudoku.js";
export function eliminateIntersections(settings, origBoard, board) {
    for (const group of settings.groups) {
        const required = group.requiredDigits(origBoard);
        for (let digit = 1; digit <= 9; digit++) {
            if (required & bitMask(digit)) {
                // Intersect all eliminated options from placing the digit anywhere in the group
                const toIntersect = [];
                for (const [r, c] of group.members) {
                    if (origBoard[r][c] & bitMask(digit)) {
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
                        const digitMask = bitMask(digit);
                        if (board[r][c] & digitMask) {
                            base.logRemoval(r, c, digit, `intersection, group=${groupToStr(group.members)}`);
                            board[r][c] &= ~digitMask;
                        }
                    }
                }
            }
        }
    }
}
