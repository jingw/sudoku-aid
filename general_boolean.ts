import * as board_mode from "./board_mode.js";
import { GeneralBooleanConstraint } from "./constraints/general_boolean.js";
import { Coordinate } from "./sudoku.js";

const exampleExpression = "x[0] + x[-1] === sum(x.slice(1, -1))";

export class GeneralBooleanConstraints extends board_mode.SupportsConstruction<GeneralBooleanConstraint> {
  expressionUnderConstruction = exampleExpression;

  private readonly svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );

  constructor(
    private readonly centerOfCell: ([r, c]: Coordinate) => [number, number],
  ) {
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
      this.appendGeneralBooleanConstraint(constraint.members, false);
    }
    this.appendGeneralBooleanConstraint(this.underConstruction, true);
  }

  describe(i: number): string {
    return `General boolean constraint, size ${this.completed[i].members.length}`;
  }

  private appendGeneralBooleanConstraint(
    constraint: readonly Coordinate[],
    underConstruction: boolean,
  ): void {
    if (constraint.length === 0) {
      return;
    }

    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline",
    );
    line.classList.add("general-boolean-constraint");
    for (const member of constraint) {
      const pt = this.svg.createSVGPoint();
      [pt.x, pt.y] = this.centerOfCell(member);
      line.points.appendItem(pt);
    }
    if (constraint.length === 1) {
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

export class AddMode extends board_mode.CoordinateCollectingBoardMode<
  GeneralBooleanConstraint,
  GeneralBooleanConstraints
> {
  name = "Add general boolean constraint";

  private readonly expressionInput = buildExpression(() =>
    this.onExpressionChange(),
  );

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

  protected finishConstruction(
    coordinates: readonly Coordinate[],
  ): GeneralBooleanConstraint {
    return new GeneralBooleanConstraint(
      coordinates,
      this.collector.expressionUnderConstruction,
    );
  }
}
