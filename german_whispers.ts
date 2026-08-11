import * as board_mode from "./board_mode.js";
import { GermanWhisper } from "./constraints/german_whispers.js";
import * as html from "./html.js";
import * as sudoku from "./sudoku.js";

export class GermanWhispers extends board_mode.SupportsConstruction<GermanWhisper> {
  private readonly svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );

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
    for (const line of this.completed) {
      this.appendGermanWhisper(line, false);
    }
    if (this.underConstruction !== null) {
      this.appendGermanWhisper(this.underConstruction, true);
    }
  }

  describe(i: number): string {
    return `German whisper, size ${this.completed[i].members.length}, difference ${this.completed[i].difference}`;
  }

  private appendGermanWhisper(
    germanWhisper: GermanWhisper,
    underConstruction: boolean,
  ): void {
    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline",
    );
    line.classList.add("german-whisper");
    for (const member of germanWhisper.members) {
      const pt = this.svg.createSVGPoint();
      [pt.x, pt.y] = this.centerOfCell(member);
      line.points.appendItem(pt);
    }
    if (germanWhisper.members.length === 1) {
      // draw a degenerate point if we'd otherwise draw nothing
      line.points.appendItem(line.points[0]);
    }
    if (underConstruction) {
      line.classList.add("under-construction");
    }
    this.svg.append(line);
  }
}

function buildDifference(): HTMLInputElement {
  const element = document.createElement("input");
  element.type = "number";
  element.min = "2";
  element.max = "8";
  element.className = "whisper-difference";
  element.value = "5";
  return element;
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<GermanWhisper> {
  override readonly name = "Add german whisper";
  // Allow forming a circle.
  // This only makes sense if the number of distinct cells is even, but we don't enforce that.
  protected override readonly allowDuplicateCells = true;

  private readonly differenceInput = buildDifference();

  override render(): HTMLElement {
    const div = document.createElement("div");
    div.append(html.label(this.differenceInput, "Difference: ", true));
    div.append(this.finishButton());
    return div;
  }

  protected finishConstruction(
    coordinates: readonly sudoku.Coordinate[],
  ): GermanWhisper {
    let difference = parseInt(this.differenceInput.value);
    difference = isNaN(difference) ? 0 : difference;
    return new GermanWhisper(coordinates, difference);
  }
}
