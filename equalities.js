import * as board_mode from "./board_mode.js";
import { EqualityConstraint } from "./constraints/equalities.js";
export class EqualityConstraints extends board_mode.SupportsConstruction {
    boundingRectOfCell;
    constructor(boundingRectOfCell) {
        super();
        this.boundingRectOfCell = boundingRectOfCell;
    }
    describe(i) {
        return "Equality " + String.fromCharCode("a".charCodeAt(0) + i);
    }
    renderConstraint(constraint) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.classList.add("equality");
        for (const member of constraint.members) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            const boundingRect = this.boundingRectOfCell(member);
            text.textContent = constraint.name;
            text.setAttribute("x", (boundingRect[1] - 3).toString());
            text.setAttribute("y", (boundingRect[3] - 3).toString());
            g.append(text);
        }
        return g;
    }
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    name = "Add equality constraint";
    finishConstruction(coordinates) {
        const usedNames = new Set();
        for (const constraint of this.collector.completed) {
            usedNames.add(constraint.name);
        }
        for (let i = 0;; i++) {
            const name = String.fromCharCode("a".charCodeAt(0) + i);
            if (!usedNames.has(name)) {
                return new EqualityConstraint(coordinates, name);
            }
        }
    }
}
