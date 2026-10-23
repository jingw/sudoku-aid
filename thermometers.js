import * as board_mode from "./board_mode.js";
import { Thermometer } from "./constraints/thermometers.js";
import * as html from "./html.js";
export class Thermometers extends board_mode.SupportsConstruction {
    centerOfCell;
    constructor(centerOfCell) {
        super();
        this.centerOfCell = centerOfCell;
    }
    describe(i) {
        return `Thermometer, size ${this.completed[i].members.length}`;
    }
    renderConstraint(thermometer) {
        const bulb = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const [x, y] = this.centerOfCell(thermometer.members[0]);
        bulb.setAttribute("cx", x.toString());
        bulb.setAttribute("cy", y.toString());
        const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        for (const member of thermometer.members) {
            const pt = this.svg.createSVGPoint();
            [pt.x, pt.y] = this.centerOfCell(member);
            line.points.appendItem(pt);
        }
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.append(bulb);
        g.append(line);
        g.classList.add("thermometer");
        return g;
    }
}
function buildStrictCheckbox() {
    const element = html.checkbox();
    element.checked = true;
    return element;
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    name = "Add thermometer";
    strictCheckbox = buildStrictCheckbox();
    render() {
        const div = document.createElement("div");
        div.append(html.label(this.strictCheckbox, "Strict"));
        div.append(this.finishButton());
        return div;
    }
    finishConstruction(coordinates) {
        return new Thermometer(coordinates, this.strictCheckbox.checked);
    }
}
