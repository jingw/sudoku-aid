import * as board_mode from "./board_mode.js";
const exampleExpression = "x[0] + x[-1] === sum(x.slice(1, -1))";
export class GeneralBooleanConstraints extends board_mode.SupportsConstruction {
    constructor(centerOfCell) {
        super();
        this.centerOfCell = centerOfCell;
        this.expressionUnderConstruction = exampleExpression;
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.allowDuplicateCells = true;
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
        this.appendGeneralBooleanConstraint({
            members: this.underConstruction,
            expression: this.expressionUnderConstruction,
        }, true);
    }
    appendGeneralBooleanConstraint(constraint, underConstruction) {
        if (constraint.members.length === 0) {
            return;
        }
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
function buildExpression(onchange) {
    const element = document.createElement("input");
    element.type = "text";
    element.className = "general-boolean-constraint-expression";
    element.value = exampleExpression;
    element.addEventListener("change", onchange);
    return element;
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    constructor() {
        super(...arguments);
        this.name = "Add general boolean constraint";
        this.expressionInput = buildExpression(() => this.onExpressionChange());
    }
    onExpressionChange() {
        this.collector.expressionUnderConstruction = this.expressionInput.value;
        this.collector.refresh();
    }
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
        return {
            members: coordinates,
            expression: this.collector.expressionUnderConstruction,
        };
    }
}
export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode {
    constructor() {
        super(...arguments);
        this.name = "Delete general boolean constraint";
    }
}
