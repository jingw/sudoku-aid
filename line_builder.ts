import { HasCoordinates, SupportsConstruction } from "./board_mode.js";
import * as sudoku from "./sudoku.js";

export abstract class LineBuilder<
  T extends HasCoordinates,
> extends SupportsConstruction<T> {
  private readonly svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  protected abstract cssClassName: string;

  constructor(
    private readonly centerOfCell: ([r, c]: sudoku.Coordinate) => [
      number,
      number,
    ],
  ) {
    super();
  }

  render(): SVGSVGElement {
    this.refresh();
    return this.svg;
  }

  refresh(): void {
    this.svg.innerHTML = "";
    for (const constraint of this.completed) {
      this.appendConstraint(constraint, false);
    }
    if (this.underConstruction !== null) {
      this.appendConstraint(this.underConstruction, true);
    }
  }

  private appendConstraint(constraint: T, underConstruction: boolean): void {
    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline",
    );
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
    if (underConstruction) {
      line.classList.add("under-construction");
    }
    this.svg.append(line);
  }
}
