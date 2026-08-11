import * as board_mode from "./board_mode.js";
import { EqualityConstraint } from "./constraints/equalities.js";
import { Coordinate } from "./sudoku.js";

export class EqualityConstraints extends board_mode.SupportsConstruction<EqualityConstraint> {
  private readonly svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );

  constructor(
    private readonly boundingRectOfCell: ([r, c]: Coordinate) => [
      number,
      number,
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
    for (let i = 0; i < this.completed.length; i++) {
      this.appendConstraint(
        String.fromCharCode("a".charCodeAt(0) + i),
        this.completed[i].members,
        false,
      );
    }
    this.appendConstraint(
      String.fromCharCode("a".charCodeAt(0) + this.completed.length),
      this.underConstruction,
      true,
    );
  }

  describe(i: number): string {
    return "Equality " + String.fromCharCode("a".charCodeAt(0) + i);
  }

  private appendConstraint(
    name: string,
    constraint: readonly Coordinate[],
    underConstruction: boolean,
  ): void {
    for (const member of constraint) {
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.classList.add("equality");
      const boundingRect = this.boundingRectOfCell(member);
      text.textContent = name;
      text.setAttribute("x", (boundingRect[1] - 3).toString());
      text.setAttribute("y", (boundingRect[3] - 3).toString());
      if (underConstruction) {
        text.classList.add("under-construction");
      }
      this.svg.append(text);
    }
  }
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<EqualityConstraint> {
  name = "Add equality constraint";

  protected finishConstruction(
    coordinates: readonly Coordinate[],
  ): EqualityConstraint {
    return new EqualityConstraint(coordinates);
  }
}
