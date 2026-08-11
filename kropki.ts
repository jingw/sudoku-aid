import * as board_mode from "./board_mode.js";
import {
  ConsecutiveKropkiDots,
  DoubleKropkiDots,
} from "./constraints/kropki.js";
import { Coordinate } from "./sudoku.js";

export class KropkiDots extends board_mode.SupportsConstruction<
  ConsecutiveKropkiDots | DoubleKropkiDots
> {
  private readonly svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );

  constructor(
    private readonly centerOfCell: ([r, c]: Coordinate) => [number, number],
    // true for consecutive, false for double
    private readonly consecutive: boolean,
  ) {
    super();
    this.svg.classList.add("kropki-dots");
  }

  render(): SVGSVGElement {
    this.refresh();
    return this.svg;
  }

  refresh(): void {
    this.svg.innerHTML = "";
    for (const dots of this.completed) {
      this.appendDots(dots, false);
    }
    if (this.underConstruction !== null) {
      this.appendDots(this.underConstruction, true);
    }
  }

  describe(i: number): string {
    if (this.consecutive) {
      return `Consecutive kropki dots, size ${this.completed[i].members.length}`;
    } else {
      return `Double kropki dots, size ${this.completed[i].members.length}`;
    }
  }

  private appendDots(
    dots: ConsecutiveKropkiDots | DoubleKropkiDots,
    underConstruction: boolean,
  ): void {
    for (let i = 1; i < dots.members.length; i++) {
      const dot = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      const [x1, y1] = this.centerOfCell(dots.members[i - 1]);
      const [x2, y2] = this.centerOfCell(dots.members[i]);
      const [cx, cy] = [(x1 + x2) / 2, (y1 + y2) / 2];
      dot.setAttribute("cx", cx.toString());
      dot.setAttribute("cy", cy.toString());
      dot.setAttribute("r", "8");
      if (this.consecutive) {
        dot.classList.add("kropki-dot-consecutive");
      } else {
        dot.classList.add("kropki-dot-double");
      }
      if (underConstruction) {
        dot.classList.add("under-construction");
      }
      this.svg.append(dot);
    }
  }
}

export class ConsecutiveAddMode extends board_mode.CoordinateCollectingBoardMode<ConsecutiveKropkiDots> {
  name = "Add consecutive kropki dots";

  protected finishConstruction(
    coordinates: readonly Coordinate[],
  ): ConsecutiveKropkiDots {
    return new ConsecutiveKropkiDots(coordinates);
  }
}

export class DoubleAddMode extends board_mode.CoordinateCollectingBoardMode<DoubleKropkiDots> {
  name = "Add double kropki dots";

  protected finishConstruction(
    coordinates: readonly Coordinate[],
  ): ConsecutiveKropkiDots | DoubleKropkiDots {
    return new DoubleKropkiDots(coordinates);
  }
}
