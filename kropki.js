import * as board_mode from "./board_mode.js";
import { ConsecutiveKropkiDots, DoubleKropkiDots, } from "./constraints/kropki.js";
export class KropkiDots extends board_mode.SupportsConstruction {
    centerOfCell;
    consecutive;
    constructor(centerOfCell, 
    // true for consecutive, false for double
    consecutive) {
        super();
        this.centerOfCell = centerOfCell;
        this.consecutive = consecutive;
        this.svg.classList.add("kropki-dots");
    }
    describe(i) {
        if (this.consecutive) {
            return `Consecutive kropki dots, size ${this.completed[i].members.length}`;
        }
        else {
            return `Double kropki dots, size ${this.completed[i].members.length}`;
        }
    }
    renderConstraint(dots) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        if (this.consecutive) {
            g.classList.add("kropki-dot-consecutive");
        }
        else {
            g.classList.add("kropki-dot-double");
        }
        for (let i = 1; i < dots.members.length; i++) {
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const [x1, y1] = this.centerOfCell(dots.members[i - 1]);
            const [x2, y2] = this.centerOfCell(dots.members[i]);
            const [cx, cy] = [(x1 + x2) / 2, (y1 + y2) / 2];
            dot.setAttribute("cx", cx.toString());
            dot.setAttribute("cy", cy.toString());
            g.append(dot);
        }
        return g;
    }
}
export class ConsecutiveAddMode extends board_mode.CoordinateCollectingBoardMode {
    name = "Add consecutive kropki dots";
    finishConstruction(coordinates) {
        return new ConsecutiveKropkiDots(coordinates);
    }
}
export class DoubleAddMode extends board_mode.CoordinateCollectingBoardMode {
    name = "Add double kropki dots";
    finishConstruction(coordinates) {
        return new DoubleKropkiDots(coordinates);
    }
}
