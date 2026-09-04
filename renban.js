import * as board_mode from "./board_mode.js";
import { RenbanLine } from "./constraints/renban.js";
import { LineBuilder } from "./line_builder.js";
export class RenbanLines extends LineBuilder {
    cssClassName = "renban-line";
    describe(i) {
        return `Renban line, size ${this.completed[i].members.length}`;
    }
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    name = "Add renban line";
    finishConstruction(coordinates) {
        return new RenbanLine(coordinates);
    }
}
