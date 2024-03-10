import * as board_mode from "./board_mode.js";
export class EqualityConstraints extends board_mode.SupportsConstruction {
    constructor(boundingRectOfCell) {
        super();
        this.boundingRectOfCell = boundingRectOfCell;
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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
        this.appendConstraint(String.fromCharCode("a".charCodeAt(0) + this.completed.length), this.underConstruction, true);
    }
    appendConstraint(name, constraint, underConstruction) {
        for (const member of constraint) {
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
    constructor() {
        super(...arguments);
        this.name = "Add equality constraint";
    }
    finishConstruction(coordinates) {
        return coordinates;
    }
}
export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode {
    constructor() {
        super(...arguments);
        this.name = "Delete equality constraint";
    }
}
