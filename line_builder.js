import { SupportsConstruction } from "./board_mode.js";
export class LineBuilder extends SupportsConstruction {
    centerOfCell;
    constructor(centerOfCell) {
        super();
        this.centerOfCell = centerOfCell;
    }
    renderConstraint(constraint) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        line.classList.add(this.cssClassName);
        for (const member of constraint.members) {
            const pt = this.svg.createSVGPoint();
            [pt.x, pt.y] = this.centerOfCell(member);
            line.points.appendItem(pt);
        }
        if (constraint.members.length === 1) {
            // draw a degenerate point if we'd otherwise draw nothing
            line.points.appendItem(line.points[0]);
        }
        return line;
    }
}
