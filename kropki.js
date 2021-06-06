import * as board_mode from "./board_mode.js";
export class KropkiDots extends board_mode.SupportsConstruction {
    constructor(centerOfCell, 
    // true for consecutive, false for double
    consecutive) {
        super();
        this.centerOfCell = centerOfCell;
        this.consecutive = consecutive;
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.classList.add("kropki-dots");
    }
    render() {
        this.refresh();
        return this.svg;
    }
    refresh() {
        this.svg.innerHTML = "";
        for (const t of this.completed) {
            this.appendDots(t, false);
        }
        this.appendDots(this.underConstruction, true);
    }
    appendDots(dots, underConstruction) {
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
            }
            else {
                dot.classList.add("kropki-dot-double");
            }
            if (underConstruction) {
                dot.classList.add("under-construction");
            }
            this.svg.append(dot);
        }
    }
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    constructor(dots, consecutive) {
        super(dots);
        if (consecutive) {
            this.name = "Add consecutive kropki dots";
        }
        else {
            this.name = "Add double kropki dots";
        }
    }
    finishConstruction(coordinates) {
        return coordinates;
    }
}
export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode {
    constructor(dots, consecutive) {
        super(dots);
        if (consecutive) {
            this.name = "Delete consecutive kropki dots";
        }
        else {
            this.name = "Delete double kropki dots";
        }
    }
}
