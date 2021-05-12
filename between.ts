import * as board_mode from "./board_mode.js";
import * as sudoku from "./sudoku.js";

export class BetweenLines extends board_mode.SupportsConstruction<sudoku.BetweenLine> {
    private readonly svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    constructor(private centerOfCell: ([r, c]: sudoku.Coordinate) => [number, number]) {
        super();
    }

    render(): SVGSVGElement {
        this.refresh();
        return this.svg;
    }

    refresh(): void {
        this.svg.innerHTML = "";
        for (const line of this.completed) {
            this.appendBetweenLine(line, false);
        }
        this.appendBetweenLine(this.underConstruction, true);
    }

    private appendBetweenLine(betweenLine: readonly sudoku.Coordinate[], underConstruction: boolean): void {
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

export class AddMode extends board_mode.CoordinateCollectingBoardMode<sudoku.BetweenLine> {
    name = "Add between line";

    constructor(lines: BetweenLines) {
        super(lines);
    }

    protected finishConstruction(coordinates: readonly sudoku.Coordinate[]): sudoku.BetweenLine {
        return coordinates;
    }
}

export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode<sudoku.BetweenLine> {
    name = "Delete between line";

    constructor(lines: BetweenLines) {
        super(lines);
    }
}
