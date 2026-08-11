import * as board_mode from "./board_mode.js";
import { GeneralBooleanConstraint } from "./constraints/general_boolean.js";
const exampleExpression = "x[0] + x[-1] === sum(x.slice(1, -1))";
export class GeneralBooleanConstraints extends board_mode.SupportsConstruction {
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
        for (const constraint of this.completed) {
            this.appendGeneralBooleanConstraint(constraint, false);
        }
        if (this.underConstruction !== null) {
            this.appendGeneralBooleanConstraint(this.underConstruction, true);
        }
    }
    describe(i) {
        return `General boolean constraint, size ${this.completed[i].members.length}`;
    }
    appendGeneralBooleanConstraint(constraint, underConstruction) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        line.classList.add("general-boolean-constraint");
        for (const member of constraint.members) {
            const pt = this.svg.createSVGPoint();
            [pt.x, pt.y] = this.centerOfCell(member);
            line.points.appendItem(pt);
        }
        if (constraint.members.length === 1) {
            // draw a degenerate point if we'd otherwise draw nothing
            line.points.appendItem(line.points[0]);
        }
        if (underConstruction) {
            line.classList.add("under-construction");
        }
        this.svg.append(line);
    }
}
function buildExpression() {
    const element = document.createElement("input");
    element.type = "text";
    element.className = "general-boolean-constraint-expression";
    element.value = exampleExpression;
    return element;
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    name = "Add general boolean constraint";
    allowDuplicateCells = true;
    expressionInput = buildExpression();
    render() {
        const div = document.createElement("div");
        const label = document.createElement("label");
        label.append("Expression:");
        label.append(document.createElement("br"));
        label.append(this.expressionInput);
        div.append(label);
        div.append(this.finishButton());
        return div;
    }
    finishConstruction(coordinates) {
        return new GeneralBooleanConstraint(coordinates, this.expressionInput.value);
    }
}
