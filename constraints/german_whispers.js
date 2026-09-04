import { ALL_ONES, bitMask } from "../sudoku.js";
import { Constraint } from "./constraint.js";
function badNeighbors(d, difference) {
    const low = Math.max(d - difference + 1, 1);
    const high = d + difference - 1;
    // everything in the range [low, high] inclusive is bad
    return (bitMask(high + 1) - 1) & ~(bitMask(low) - 1);
}
export class GermanWhisper extends Constraint {
    difference;
    constructor(members, difference) {
        super(members);
        this.difference = difference;
    }
    performElimination(_, origBoard, board) {
        const line = this.members;
        for (let i = 0; i < line.length; i++) {
            const [r, c] = line[i];
            let bannedNeighborCandidates = ALL_ONES;
            for (let d = 1; d <= board.length; d++) {
                if (origBoard[r][c] & bitMask(d)) {
                    bannedNeighborCandidates &= badNeighbors(d, this.difference);
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
}
