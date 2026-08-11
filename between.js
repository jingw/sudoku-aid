import * as board_mode from "./board_mode.js";
import { BetweenLine } from "./constraints/between.js";
export class BetweenLines extends board_mode.SupportsConstruction {
    centerOfCell;
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    constructor(centerOfCell) {
        super();
        this.centerOfCell = centerOfCell;
    }
    render() {
        this.refresh();
        return this.svg;
    }
    refresh() {
        this.svg.innerHTML = "";
        for (const line of this.completed) {
            this.appendBetweenLine(line, false);
        }
        if (this.underConstruction !== null) {
            this.appendBetweenLine(this.underConstruction, true);
        }
    }
    describe(i) {
        return `Between line, size ${this.completed[i].members.length}`;
    }
    appendBetweenLine(betweenLine, underConstruction) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        line.classList.add("between-line");
        for (const member of betweenLine.members) {
            const pt = this.svg.createSVGPoint();
            [pt.x, pt.y] = this.centerOfCell(member);
            line.points.appendItem(pt);
        }
        if (underConstruction) {
            line.classList.add("under-construction");
        }
        this.svg.append(line);
        for (const i of [0, betweenLine.members.length - 1]) {
            const end = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const [x, y] = this.centerOfCell(betweenLine.members[i]);
            end.setAttribute("cx", x.toString());
            end.setAttribute("cy", y.toString());
            end.setAttribute("r", "22");
            end.classList.add("between-line");
            if (underConstruction) {
                end.classList.add("under-construction");
            }
            this.svg.append(end);
        }
    }
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    name = "Add between line";
    finishConstruction(coordinates) {
        return new BetweenLine(coordinates);
    }
}
