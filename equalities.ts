import * as board_mode from "./board_mode.js";
import * as sudoku from "./sudoku.js";

export class EqualityConstraints extends board_mode.SupportsConstruction<sudoku.EqualityConstraint> {
    private readonly svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    constructor(private boundingRectOfCell: ([r, c]: sudoku.Coordinate) => [number, number, number, number]) {
        super();
    }

    render(): SVGSVGElement {
        this.refresh();
        return this.svg;
    }

    refresh(): void {
        this.svg.innerHTML = "";
        for (let i = 0; i < this.completed.length; i++) {
            this.appendConstraint(
                String.fromCharCode("a".charCodeAt(0) + i),
                this.completed[i],
                false,
            );
        }
        this.appendConstraint(
            String.fromCharCode("a".charCodeAt(0) + this.completed.length),
            this.underConstruction,
            true,
        );
    }

    private appendConstraint(name: string, constraint: sudoku.EqualityConstraint, underConstruction: boolean): void {
        for (const member of constraint) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.classList.add("equality");
            const boundingRect = this.boundingRectOfCell(member);
            text.textContent = name;
            text.setAttribute("x", (boundingRect[1] - 3).toString());
            text.setAttribute("y", (boundingRect[3] - 3).toString());
            if (underConstruction) {
                text.classList.add("under-construction");
            }
            this.svg.append(text);
        }
    }
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<sudoku.EqualityConstraint> {
    name = "Add equality constraint";

    constructor(constraints: EqualityConstraints) {
        super(constraints);
    }

    protected finishConstruction(coordinates: readonly sudoku.Coordinate[]): sudoku.EqualityConstraint {
        return coordinates;
    }
}

export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode<sudoku.EqualityConstraint> {
    name = "Delete equality constraint";

    constructor(constraints: EqualityConstraints) {
        super(constraints);
    }
}
