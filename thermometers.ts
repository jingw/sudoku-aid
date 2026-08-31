import * as board_mode from "./board_mode.js";
import { Thermometer } from "./constraints/thermometers.js";
import * as html from "./html.js";
import { Coordinate } from "./sudoku.js";

export class Thermometers extends board_mode.SupportsConstruction<Thermometer> {
  constructor(
    private readonly centerOfCell: ([r, c]: Coordinate) => [number, number],
  ) {
    super();
  }

  describe(i: number): string {
    return `Thermometer, size ${this.completed[i].members.length}`;
  }

  protected renderConstraint(thermometer: Thermometer): SVGElement {
    const bulb = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    const [x, y] = this.centerOfCell(thermometer.members[0]);
    bulb.setAttribute("cx", x.toString());
    bulb.setAttribute("cy", y.toString());

    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline",
    );
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

function buildStrictCheckbox(): HTMLInputElement {
  const element = html.checkbox();
  element.checked = true;
  return element;
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<Thermometer> {
  override readonly name = "Add thermometer";

  private readonly strictCheckbox = buildStrictCheckbox();

  override render(): HTMLElement {
    const div = document.createElement("div");
    div.append(html.label(this.strictCheckbox, "Strict"));
    div.append(this.finishButton());
    return div;
  }

  protected finishConstruction(
    coordinates: readonly Coordinate[],
  ): Thermometer {
    return new Thermometer(coordinates, this.strictCheckbox.checked);
  }
}
