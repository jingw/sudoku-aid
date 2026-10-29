import * as board_mode from "./board_mode.js";
import { BetweenLine } from "./constraints/between.js";
export class BetweenLines extends board_mode.SupportsConstruction {
    centerOfCell;
    constructor(centerOfCell) {
        super();
        this.centerOfCell = centerOfCell;
    }
    describe(i) {
        return `Between line, size ${this.completed[i].members.length}`;
    }
    renderConstraint(betweenLine) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.classList.add("between-line");
        const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        for (const member of betweenLine.members) {
            const pt = this.svg.createSVGPoint();
            [pt.x, pt.y] = this.centerOfCell(member);
            line.points.appendItem(pt);
        }
        g.append(line);
        for (const i of [0, betweenLine.members.length - 1]) {
            const end = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const [x, y] = this.centerOfCell(betweenLine.members[i]);
            end.setAttribute("cx", x.toString());
            end.setAttribute("cy", y.toString());
            g.append(end);
        }
        return g;
    }
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    name = "Add between line";
    finishConstruction(coordinates) {
        return new BetweenLine(coordinates);
    }
}
