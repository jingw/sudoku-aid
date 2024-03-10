import * as base from "./base.js";
import { bitCount, bitMask, } from "../sudoku.js";
export function eliminateNakedSets(settings, origBoard, board) {
    // Notes:
    // naked set of size 1 does the same thing as eliminateObvious
    // naked set of size 8 is the same as a hidden single
    // more generally, naked set of size N is the same as a hidden set of size 9 - N
    // doing size 8 and 9 just to detect broken sets
    for (let setSize = 2; setSize <= 9; setSize++) {
        for (const group of settings.groups) {
            // Skip any set containing a solved cell, so we don't duplicate eliminateObvious.
            // Note this can make solving takes more steps, since including solved cells in
            // naked sets lets you skip a step of eliminateObvious.
            // e.g. if you have cells with 1 and 12, including the 1 lets you also immediately
            // eliminate cells with 2, rather than waiting to first eliminate the 1.
            //
            // Also skip broken cells with no possibilities, since it leads to strange
            // behavior sudokus that aren't 9x9.
            const nonSolvedMembers = [];
            for (const [r, c] of group.members) {
                if (bitCount(origBoard[r][c]) > 1) {
                    nonSolvedMembers.push([r, c]);
                }
            }
            base.forEachSubset(setSize, nonSolvedMembers, (subset) => {
                const union = base.unionPossibilities(subset, origBoard);
                const unionSize = bitCount(union);
                if (unionSize === setSize) {
                    // we can eliminate the elements of union from all other cells in the group
                    for (let digit = 1; digit <= 9; digit++) {
                        if (union & bitMask(digit)) {
                            for (const [r, c] of group.members) {
                                if ((origBoard[r][c] | union) !== union) {
                                    // not one of the parts of union
                                    board[r][c] &= ~union;
                                }
                            }
                        }
                    }
                }
                else if (unionSize < setSize) {
                    // This subset doesn't have enough choices and is broken.
                    for (const [r, c] of subset) {
                        board[r][c] = 0;
                    }
                }
            });
        }
    }
}
