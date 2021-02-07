import * as board_mode from "./board_mode.js";
import * as sudoku from "./sudoku.js";

export class KropkiDots extends board_mode.SupportsConstruction<sudoku.KropkiDots> {
    private readonly svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    constructor(
        private centerOfCell: ([r, c]: sudoku.Coordinate) => [number, number],
        // true for consecutive, false for double
        private consecutive: boolean,
    ) {
        super();
        this.svg.classList.add("kropki-dots");
    }

    render(): SVGSVGElement {
        this.refresh();
        return this.svg;
    }

    refresh(): void {
        this.svg.innerHTML = "";
        for (const t of this.completed) {
            this.appendDots(t, false);
        }
        this.appendDots(this.underConstruction, true);
    }

    private appendDots(dots: sudoku.KropkiDots, underConstruction: boolean): void {
        for (let i = 1; i < dots.length; i++) {
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const [x1, y1] = this.centerOfCell(dots[i - 1]);
            const [x2, y2] = this.centerOfCell(dots[i]);
            const [cx, cy] = [(x1 + x2) / 2, (y1 + y2) / 2];
            dot.setAttribute("cx", cx.toString());
            dot.setAttribute("cy", cy.toString());
            dot.setAttribute("r", "8");
            if (this.consecutive) {
                dot.classList.add("kropki-dot-consecutive");
            } else {
                dot.classList.add("kropki-dot-double");
            }
            if (underConstruction) {
                dot.classList.add("under-construction");
            }
            this.svg.append(dot);
        }
    }
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<sudoku.KropkiDots> {
    name: string;

    constructor(dots: KropkiDots, consecutive: boolean) {
        super(dots);
        if (consecutive) {
            this.name = "Add consecutive kropki dots";
        } else {
            this.name = "Add double kropki dots";
        }
    }

    protected finishConstruction(coordinates: readonly sudoku.Coordinate[]): sudoku.KropkiDots {
        return coordinates;
    }
}

export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode<sudoku.KropkiDots> {
    name: string;

    constructor(dots: KropkiDots, consecutive: boolean) {
        super(dots);
        if (consecutive) {
            this.name = "Delete consecutive kropki dots";
        } else {
            this.name = "Delete double kropki dots";
        }
    }
}
