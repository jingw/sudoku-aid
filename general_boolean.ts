import * as board_mode from "./board_mode.js";
import { GeneralBooleanConstraint } from "./constraints/general_boolean.js";
import { LineBuilder } from "./line_builder.js";
import { Coordinate } from "./sudoku.js";

const exampleExpression = "x[0] + x[-1] === sum(x.slice(1, -1))";

export class GeneralBooleanConstraints extends LineBuilder<GeneralBooleanConstraint> {
  protected override cssClassName = "general-boolean-constraint";

  describe(i: number): string {
    return `General boolean constraint, size ${this.completed[i].members.length}`;
  }
}

function buildExpression(): HTMLInputElement {
  const element = document.createElement("input");
  element.type = "text";
  element.className = "general-boolean-constraint-expression";
  element.value = exampleExpression;
  return element;
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<GeneralBooleanConstraint> {
  override readonly name = "Add general boolean constraint";
  protected override readonly allowDuplicateCells = true;

  private readonly expressionInput = buildExpression();

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
      this.expressionInput.value,
    );
  }
}
