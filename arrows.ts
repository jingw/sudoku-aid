import * as board_mode from "./board_mode.js";
import { Arrow } from "./constraints/arrows.js";
import * as html from "./html.js";
import * as sudoku from "./sudoku.js";
import * as vector from "./vector.js";

export class Arrows extends board_mode.SupportsConstruction<Arrow> {
  private readonly svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );

  sumCellsUnderConstruction = 1;

  constructor(
    private centerOfCell: ([r, c]: sudoku.Coordinate) => [number, number],
  ) {
    super();
  }

  render(): SVGSVGElement {
    this.refresh();
    return this.svg;
  }

  refresh(): void {
    this.svg.innerHTML = "";
    for (const arrow of this.completed) {
      this.appendArrow(arrow, false);
    }
    this.appendArrow(
      new Arrow(this.underConstruction, this.sumCellsUnderConstruction),
      true,
    );
  }

  describe(i: number): string {
    return `Arrow, size ${this.completed[i].members.length}`;
  }

  private appendArrow(arrow: Arrow, underConstruction: boolean): void {
    if (arrow.members.length === 0) {
      return;
    }

    let sumMembers = arrow.members.slice(0, arrow.sumCells);

    const bulbOuter = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline",
    );
    const bulbInner = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline",
    );
    if (sumMembers.length === 1) {
      // cheat a polyline with no length
      sumMembers = sumMembers.concat(sumMembers);
    }
    for (const sumMember of sumMembers) {
      const pt = this.svg.createSVGPoint();
      [pt.x, pt.y] = this.centerOfCell(sumMember);
      bulbOuter.points.appendItem(pt);
      bulbInner.points.appendItem(pt);
    }
    bulbInner.classList.add("arrow-bulb-inner");
    bulbOuter.classList.add("arrow-bulb-outer");

    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline",
    );
    line.classList.add("arrow-shaft");
    const lineMembers = arrow.members.slice(arrow.sumCells - 1);
    for (const member of lineMembers) {
      const pt = this.svg.createSVGPoint();
      [pt.x, pt.y] = this.centerOfCell(member);
      line.points.appendItem(pt);
    }

    const tip = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );
    tip.classList.add("arrow-tip");
    if (lineMembers.length >= 2) {
      const [r1, c1] = lineMembers[lineMembers.length - 2];
      const [r2, c2] = lineMembers[lineMembers.length - 1];
      const dirToTip = vector.normalize([c2 - c1, r2 - r1]);
      const dir1 = vector.rotateCCW(dirToTip, (Math.PI * 3) / 4);
      const dir2 = vector.rotateCCW(dirToTip, (-Math.PI * 3) / 4);

      const tipSize = 15;

      const tipPt = this.svg.createSVGPoint();
      const tipVec = vector.add(
        this.centerOfCell([r2, c2]),
        vector.multiply(dirToTip, tipSize / 2),
      );
      [tipPt.x, tipPt.y] = tipVec;

      const leftPt = this.svg.createSVGPoint();
      [leftPt.x, leftPt.y] = vector.add(tipVec, vector.multiply(dir1, tipSize));
      const rightPt = this.svg.createSVGPoint();
      [rightPt.x, rightPt.y] = vector.add(
        tipVec,
        vector.multiply(dir2, tipSize),
      );
      tip.points.appendItem(tipPt);
      tip.points.appendItem(leftPt);
      tip.points.appendItem(rightPt);
    }

    if (underConstruction) {
      bulbInner.classList.add("under-construction");
      bulbOuter.classList.add("under-construction");
      line.classList.add("under-construction");
      tip.classList.add("under-construction");
    }

    this.svg.append(line);
    this.svg.append(bulbOuter);
    this.svg.append(bulbInner);
    this.svg.append(tip);
  }
}

function buildSumCells(onchange: (e: Event) => void): HTMLInputElement {
  const element = document.createElement("input");
  element.type = "number";
  element.min = "1";
  element.max = "3";
  element.value = "1";
  element.className = "arrow-sum-cells";
  element.addEventListener("change", onchange);
  return element;
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<
  Arrow,
  Arrows
> {
  name = "Add arrow";

  private readonly sumCellsInput = buildSumCells(() => this.onSumCellsChange());

  private onSumCellsChange(): void {
    const sumCells = parseInt(this.sumCellsInput.value);
    this.collector.sumCellsUnderConstruction = isNaN(sumCells) ? 1 : sumCells;
    this.collector.refresh();
  }

  override render(): HTMLElement {
    const div = document.createElement("div");
    div.append(html.label(this.sumCellsInput, "Sum cells: ", true));
    div.append(this.finishButton());
    return div;
  }

  protected finishConstruction(
    coordinates: readonly sudoku.Coordinate[],
  ): Arrow {
    return new Arrow(coordinates, this.collector.sumCellsUnderConstruction);
  }
}
