import * as board_mode from "./board_mode.js";
import { EqualityConstraint } from "./constraints/equalities.js";
export class EqualityConstraints extends board_mode.SupportsConstruction {
    boundingRectOfCell;
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    constructor(boundingRectOfCell) {
        super();
        this.boundingRectOfCell = boundingRectOfCell;
    }
    render() {
        this.refresh();
        return this.svg;
    }
    refresh() {
        this.svg.innerHTML = "";
        for (let i = 0; i < this.completed.length; i++) {
            this.appendConstraint(String.fromCharCode("a".charCodeAt(0) + i), this.completed[i], false);
        }
        if (this.underConstruction !== null) {
            this.appendConstraint(String.fromCharCode("a".charCodeAt(0) + this.completed.length), this.underConstruction, true);
        }
    }
    describe(i) {
        return "Equality " + String.fromCharCode("a".charCodeAt(0) + i);
    }
    appendConstraint(name, constraint, underConstruction) {
        for (const member of constraint.members) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.classList.add("equality");
            const boundingRect = this.boundingRectOfCell(member);
            text.textContent = name;
            text.setAttribute("x", (boundingRect[1] - 3).toString());
            text.setAttribute("y", (boundingRect[3] - 3).toString());
            if (underConstruction) {
                text.classList.add("under-construction");
            }
            this.svg.append(text);
        }
    }
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    name = "Add equality constraint";
    finishConstruction(coordinates) {
        return new EqualityConstraint(coordinates);
    }
}
