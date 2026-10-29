import * as board_mode from "./board_mode.js";
import { GermanWhisper } from "./constraints/german_whispers.js";
import * as html from "./html.js";
import { LineBuilder } from "./line_builder.js";
export class GermanWhispers extends LineBuilder {
    cssClassName = "german-whisper";
    describe(i) {
        return `German whisper, size ${this.completed[i].members.length}, difference ${this.completed[i].difference}`;
    }
}
function buildDifference() {
    const element = document.createElement("input");
    element.type = "number";
    element.min = "2";
    element.max = "8";
    element.className = "whisper-difference";
    element.value = "5";
    return element;
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    name = "Add german whisper";
    // Allow forming a circle.
    // This only makes sense if the number of distinct cells is even, but we don't enforce that.
    allowDuplicateCells = true;
    differenceInput = buildDifference();
    render() {
        const div = document.createElement("div");
        div.append(html.label(this.differenceInput, "Difference: ", true));
        div.append(this.finishButton());
        return div;
    }
    finishConstruction(coordinates) {
        let difference = parseInt(this.differenceInput.value);
        difference = isNaN(difference) ? 0 : difference;
        return new GermanWhisper(coordinates, difference);
    }
}
