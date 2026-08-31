import * as board_mode from "./board_mode.js";
import { RenbanLine } from "./constraints/renban.js";
import { LineBuilder } from "./line_builder.js";
import * as sudoku from "./sudoku.js";

export class RenbanLines extends LineBuilder<RenbanLine> {
  protected override cssClassName = "renban-line";

  describe(i: number): string {
    return `Renban line, size ${this.completed[i].members.length}`;
  }
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<RenbanLine> {
  override readonly name = "Add renban line";

  protected finishConstruction(
    coordinates: readonly sudoku.Coordinate[],
  ): RenbanLine {
    return new RenbanLine(coordinates);
  }
}
