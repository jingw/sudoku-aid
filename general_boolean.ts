import * as board_mode from "./board_mode.js";
import * as sudoku from "./sudoku.js";

const exampleExpression = "x[0] + x[-1] === sum(x.slice(1, -1))";

export class GeneralBooleanConstraints extends board_mode.SupportsConstruction<sudoku.GeneralBooleanConstraint> {
    expressionUnderConstruction = exampleExpression;

    private readonly svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    constructor(private centerOfCell: ([r, c]: sudoku.Coordinate) => [number, number]) {
        super();
        this.allowDuplicateCells = true;
    }

    render(): SVGSVGElement {
        this.refresh();
        return this.svg;
    }

    refresh(): void {
        this.svg.innerHTML = "";
        for (const constraint of this.completed) {
            this.appendGeneralBooleanConstraint(constraint, false);
        }
        this.appendGeneralBooleanConstraint({members: this.underConstruction, expression: this.expressionUnderConstruction}, true);
    }

    private appendGeneralBooleanConstraint(constraint: sudoku.GeneralBooleanConstraint, underConstruction: boolean): void {
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

function buildExpression(onchange: (e: Event) => void): HTMLInputElement {
    const element = document.createElement("input");
    element.type = "text";
    element.className = "general-boolean-constraint-expression";
    element.value = exampleExpression;
    element.addEventListener("change", onchange);
    return element;
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<sudoku.GeneralBooleanConstraint, GeneralBooleanConstraints> {
    name = "Add general boolean constraint";

    private readonly expressionInput = buildExpression(() => this.onExpressionChange());

    private onExpressionChange(): void {
        this.collector.expressionUnderConstruction = this.expressionInput.value;
        this.collector.refresh();
    }

    override render(): HTMLElement {
        const div = document.createElement("div");

        const label = document.createElement("label");
        label.append("Expression:");
        label.append(document.createElement("br"));
        label.append(this.expressionInput);
        div.append(label);

        div.append(this.finishButton());

        return div;
    }

    protected finishConstruction(coordinates: readonly sudoku.Coordinate[]): sudoku.GeneralBooleanConstraint {
        return {
            members: coordinates,
            expression: this.collector.expressionUnderConstruction,
        };
    }
}

export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode<sudoku.GeneralBooleanConstraint> {
    name = "Delete general boolean constraint";
}
