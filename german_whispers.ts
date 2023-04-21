import * as board_mode from "./board_mode.js";
import * as sudoku from "./sudoku.js";

export class GermanWhispers extends board_mode.SupportsConstruction<sudoku.GermanWhisper> {
    private readonly svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    constructor(private centerOfCell: ([r, c]: sudoku.Coordinate) => [number, number]) {
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
            this.appendGermanWhisper(line, false);
        }
        this.appendGermanWhisper(this.underConstruction, true);
    }

    private appendGermanWhisper(germanWhisper: readonly sudoku.Coordinate[], underConstruction: boolean): void {
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
        if (underConstruction) {
            line.classList.add("under-construction");
        }
        this.svg.append(line);
    }
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<sudoku.GermanWhisper> {
    name = "Add german whisper";

    constructor(lines: GermanWhispers) {
        super(lines);
    }

    protected finishConstruction(coordinates: readonly sudoku.Coordinate[]): sudoku.GermanWhisper {
        return coordinates;
    }
}

export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode<sudoku.GermanWhisper> {
    name = "Delete german whisper";

    constructor(lines: GermanWhispers) {
        super(lines);
    }
}
