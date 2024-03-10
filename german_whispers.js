import * as board_mode from "./board_mode.js";
export class GermanWhispers extends board_mode.SupportsConstruction {
    constructor(centerOfCell) {
        super();
        this.centerOfCell = centerOfCell;
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        // Allow forming a circle.
        // This only makes sense if the number of distinct cells is even, but we don't enforce that.
        this.allowDuplicateCells = true;
    }
    render() {
        this.refresh();
        return this.svg;
    }
    refresh() {
        this.svg.innerHTML = "";
        for (const line of this.completed) {
            this.appendGermanWhisper(line, false);
        }
        this.appendGermanWhisper(this.underConstruction, true);
    }
    appendGermanWhisper(germanWhisper, underConstruction) {
        if (germanWhisper.length === 0) {
            return;
        }
        const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
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
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    constructor() {
        super(...arguments);
        this.name = "Add german whisper";
    }
    finishConstruction(coordinates) {
        return coordinates;
    }
}
export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode {
    constructor() {
        super(...arguments);
        this.name = "Delete german whisper";
    }
}
