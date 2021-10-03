import * as base from "./base.js";
import {
    Board,
    ReadonlyBoard,
    bitCount,
    lowestDigit,
    packRC,
} from "../sudoku.js";

export function eliminateFromArrows(settings: base.ProcessedSettings, origBoard: ReadonlyBoard, board: Board): void {
    if (!settings.arrows) {
        return;
    }
    for (const arrow of settings.arrows) {
        const fullMembers = arrow.sumMembers.concat(arrow.members);
        const bitSets = [];
        for (const [r, c] of fullMembers) {
            bitSets.push(origBoard[r][c]);
        }

        // Give up if too many possibilities to brute force
        if (countPossibilities(bitSets) > 1e6) {
            continue;
        }

        // Exhaustively try all possibilities
        const candidatesPerMember = new Array(fullMembers.length).fill(0);
        base.forEachAssignment(bitSets, assignment => {
            let expectedSum = 0;
            for (let i = 0; i < arrow.sumMembers.length; i++) {
                expectedSum *= 10;
                expectedSum += lowestDigit(assignment[i]);
            }
            let sum = 0;
            for (let i = arrow.sumMembers.length; i < assignment.length; i++) {
                sum += lowestDigit(assignment[i]);
            }
            if (sum !== expectedSum) {
                return;
            }
            // Check for conflicts
            for (let i = 0; i < assignment.length; i++) {
                const [r1, c1] = fullMembers[i];
                for (let j = i + 1; j < assignment.length; j++) {
                    const [r2, c2] = fullMembers[j];
                    if (assignment[i] === assignment[j]
                        && settings.cellVisibilityGraphAsSet[r1][c1].has(packRC(r2, c2))) {
                        // conflict, equal digits see each other
                        return;
                    }
                }
            }

            // it's possible
            for (let i = 0; i < assignment.length; i++) {
                candidatesPerMember[i] |= assignment[i];
            }
        }, true);

        for (let i = 0; i < candidatesPerMember.length; i++) {
            const [r, c] = fullMembers[i];
            board[r][c] &= candidatesPerMember[i];
        }
    }
}

function countPossibilities(bitSets: readonly number[]): number {
    let count = 1;
    for (const s of bitSets) {
        count *= bitCount(s);
    }
    return count;
}
