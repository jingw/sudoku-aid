import * as board_mode from "./board_mode.js";
import { GermanWhisper } from "./constraints/german_whispers.js";
import * as html from "./html.js";
import { LineBuilder } from "./line_builder.js";
import * as sudoku from "./sudoku.js";

export class GermanWhispers extends LineBuilder<GermanWhisper> {
  protected override cssClassName = "german-whisper";

  describe(i: number): string {
    return `German whisper, size ${this.completed[i].members.length}, difference ${this.completed[i].difference}`;
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
