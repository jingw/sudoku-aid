import * as board_mode from "./board_mode.js";
import { Thermometer } from "./constraints/thermometers.js";
import * as html from "./html.js";
export class Thermometers extends board_mode.SupportsConstruction {
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
        for (const t of this.completed) {
            this.appendThermometer(t, false);
        }
        if (this.underConstruction !== null) {
            this.appendThermometer(this.underConstruction, true);
        }
    }
    describe(i) {
        return `Thermometer, size ${this.completed[i].members.length}`;
    }
    appendThermometer(thermometer, underConstruction) {
        const bulb = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const [x, y] = this.centerOfCell(thermometer.members[0]);
        bulb.setAttribute("cx", x.toString());
        bulb.setAttribute("cy", y.toString());
        bulb.setAttribute("r", "15");
        bulb.classList.add("thermometer");
        const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        line.classList.add("thermometer");
        for (const member of thermometer.members) {
            const pt = this.svg.createSVGPoint();
            [pt.x, pt.y] = this.centerOfCell(member);
            line.points.appendItem(pt);
        }
        if (underConstruction) {
            bulb.classList.add("under-construction");
            line.classList.add("under-construction");
        }
        this.svg.append(bulb);
        this.svg.append(line);
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
