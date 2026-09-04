import { bitMask, groupToStr, unpackRC, } from "../sudoku.js";
import * as base from "./base.js";
export function eliminateIntersections(settings, origBoard, board) {
    for (const constraint of settings.constraints) {
        const required = constraint.requiredDigits(settings, origBoard);
        for (let digit = 1; digit <= board.length; digit++) {
            if (required & bitMask(digit)) {
                // Intersect all eliminated options from placing the digit anywhere in the group
                const toIntersect = [];
                for (const [r, c] of constraint.members) {
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
                            base.logRemoval(r, c, digit + settings.startDigit - 1, `intersection, group=${groupToStr(constraint.members, board.length)}`);
                            board[r][c] &= ~digitMask;
                        }
                    }
                }
            }
        }
    }
}
