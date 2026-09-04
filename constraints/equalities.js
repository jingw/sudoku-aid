import { ALL_ONES } from "../sudoku.js";
import { Constraint } from "./constraint.js";
export class EqualityConstraint extends Constraint {
    name;
    constructor(members, name) {
        super(members);
        this.name = name;
    }
    performElimination(_, origBoard, board) {
        let intersection = ALL_ONES;
        for (const [r, c] of this.members) {
            intersection &= origBoard[r][c];
        }
        for (const [r, c] of this.members) {
            board[r][c] &= intersection;
        }
    }
}
