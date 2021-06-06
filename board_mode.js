import * as sudoku from "./sudoku.js";
export class BoardMode {
    render() {
        return document.createElement("div");
    }
    onMouseDown(_r, _c, _e) {
        // nothing by default
    }
    onDrag(_r, _c, _e) {
        // nothing by default
    }
    onLeave() {
        // nothing by default
    }
}
export class SupportsConstruction {
    constructor() {
        this.completed = [];
        this.underConstruction = [];
    }
}
export class CoordinateCollectingBoardMode extends BoardMode {
    constructor(collector) {
        super();
        this.collector = collector;
        this.onDrag = this.onMouseDown;
    }
    finishButton() {
        const finish = document.createElement("button");
        finish.textContent = "Finish";
        finish.addEventListener("click", () => {
            if (this.collector.underConstruction.length > 0) {
                this.collector.completed.push(this.finishConstruction(this.collector.underConstruction));
                this.collector.underConstruction = [];
                this.collector.refresh();
            }
        });
        return finish;
    }
    render() {
        return this.finishButton();
    }
    onMouseDown(r, c) {
        if (sudoku.coordinatesContains(this.collector.underConstruction, [r, c])) {
            // refuse to add duplicates
            return;
        }
        this.collector.underConstruction.push([r, c]);
        this.collector.refresh();
    }
    onLeave() {
        this.collector.underConstruction = [];
        this.collector.refresh();
    }
}
export class CoordinateCollectingDeleteBoardMode extends BoardMode {
    constructor(collector) {
        super();
        this.collector = collector;
    }
    onMouseDown(r, c) {
        for (let i = this.collector.completed.length - 1; i >= 0; i--) {
            const coordinates = toCoordinates(this.collector.completed[i]);
            if (sudoku.coordinatesContains(coordinates, [r, c])) {
                this.collector.completed.splice(i, 1);
                this.collector.refresh();
                return;
            }
        }
    }
}
function toCoordinates(item) {
    if ("members" in item) {
        return item.members;
    }
    else {
        return item;
    }
}
