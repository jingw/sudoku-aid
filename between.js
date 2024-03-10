import * as board_mode from "./board_mode.js";
export class BetweenLines extends board_mode.SupportsConstruction {
    constructor(centerOfCell) {
        super();
        this.centerOfCell = centerOfCell;
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    }
    render() {
        this.refresh();
        return this.svg;
    }
    refresh() {
        this.svg.innerHTML = "";
        for (const line of this.completed) {
            this.appendBetweenLine(line, false);
        }
        this.appendBetweenLine(this.underConstruction, true);
    }
    appendBetweenLine(betweenLine, underConstruction) {
        if (betweenLine.length === 0) {
            return;
        }
        const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        line.classList.add("between-line");
        for (const member of betweenLine) {
            const pt = this.svg.createSVGPoint();
            [pt.x, pt.y] = this.centerOfCell(member);
            line.points.appendItem(pt);
        }
        if (underConstruction) {
            line.classList.add("under-construction");
        }
        this.svg.append(line);
        for (const i of [0, betweenLine.length - 1]) {
            const end = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const [x, y] = this.centerOfCell(betweenLine[i]);
            end.setAttribute("cx", x.toString());
            end.setAttribute("cy", y.toString());
            end.setAttribute("r", "22");
            end.classList.add("between-line");
            if (underConstruction) {
                end.classList.add("under-construction");
            }
            this.svg.append(end);
        }
    }
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    constructor() {
        super(...arguments);
        this.name = "Add between line";
    }
    finishConstruction(coordinates) {
        return coordinates;
    }
}
export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode {
    constructor() {
        super(...arguments);
        this.name = "Delete between line";
    }
}
