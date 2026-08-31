import * as board_mode from "./board_mode.js";
import {
  ConsecutiveKropkiDots,
  DoubleKropkiDots,
} from "./constraints/kropki.js";
import { Coordinate } from "./sudoku.js";

export class KropkiDots extends board_mode.SupportsConstruction<
  ConsecutiveKropkiDots | DoubleKropkiDots
> {
  constructor(
    private readonly centerOfCell: ([r, c]: Coordinate) => [number, number],
    // true for consecutive, false for double
    private readonly consecutive: boolean,
  ) {
    super();
    this.svg.classList.add("kropki-dots");
  }

  describe(i: number): string {
    if (this.consecutive) {
      return `Consecutive kropki dots, size ${this.completed[i].members.length}`;
    } else {
      return `Double kropki dots, size ${this.completed[i].members.length}`;
    }
  }

  protected renderConstraint(
    dots: ConsecutiveKropkiDots | DoubleKropkiDots,
  ): SVGElement {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    if (this.consecutive) {
      g.classList.add("kropki-dot-consecutive");
    } else {
      g.classList.add("kropki-dot-double");
    }
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
      g.append(dot);
    }
    return g;
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
