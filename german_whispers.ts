import * as board_mode from "./board_mode.js";
import * as html from "./html.js";
import * as sudoku from "./sudoku.js";

export class GermanWhispers extends board_mode.SupportsConstruction<sudoku.GermanWhisper> {
  differenceUnderConstruction = 0;

  private readonly svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );

  constructor(
    private centerOfCell: ([r, c]: sudoku.Coordinate) => [number, number],
  ) {
    super();
    // Allow forming a circle.
    // This only makes sense if the number of distinct cells is even, but we don't enforce that.
    this.allowDuplicateCells = true;
  }

  render(): SVGSVGElement {
    this.refresh();
    return this.svg;
  }

  refresh(): void {
    this.svg.innerHTML = "";
    for (const line of this.completed) {
      this.appendGermanWhisper(line.members, false);
    }
    this.appendGermanWhisper(this.underConstruction, true);
  }

  private appendGermanWhisper(
    germanWhisper: readonly sudoku.Coordinate[],
    underConstruction: boolean,
  ): void {
    if (germanWhisper.length === 0) {
      return;
    }

    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline",
    );
    line.classList.add("german-whisper");
    for (const member of germanWhisper) {
      const pt = this.svg.createSVGPoint();
      [pt.x, pt.y] = this.centerOfCell(member);
      line.points.appendItem(pt);
    }
    if (germanWhisper.length === 1) {
      // draw a degenerate point if we'd otherwise draw nothing
      line.points.appendItem(line.points[0]);
    }
    if (underConstruction) {
      line.classList.add("under-construction");
    }
    this.svg.append(line);
  }
}

function buildDifference(onchange: (e: Event) => void): HTMLInputElement {
  const element = document.createElement("input");
  element.type = "number";
  element.min = "2";
  element.max = "8";
  element.className = "whisper-difference";
  element.value = "5";
  element.addEventListener("change", onchange);
  return element;
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<
  sudoku.GermanWhisper,
  GermanWhispers
> {
  name = "Add german whisper";

  private readonly differenceInput = buildDifference(() =>
    this.onDifferenceChange(),
  );

  private onDifferenceChange(): void {
    const difference = parseInt(this.differenceInput.value);
    this.collector.differenceUnderConstruction = isNaN(difference)
      ? 0
      : difference;
    this.collector.refresh();
  }

  override render(): HTMLElement {
    const div = document.createElement("div");

    div.append(html.label(this.differenceInput, "Difference: ", true));

    div.append(this.finishButton());

    return div;
  }

  protected finishConstruction(
    coordinates: readonly sudoku.Coordinate[],
  ): sudoku.GermanWhisper {
    return {
      members: coordinates,
      difference: this.collector.differenceUnderConstruction,
    };
  }
}

export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode<sudoku.GermanWhisper> {
  name = "Delete german whisper";
}
