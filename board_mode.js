import * as html from "./html.js";
import { coordinatesContains } from "./sudoku.js";
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
    onKeyDown(_e) {
        // nothing by default
    }
}
export class SupportsConstruction {
    completed = [];
    underConstruction = null;
}
export class CoordinateCollectingBoardMode extends BoardMode {
    collector;
    cellsUnderConstruction = [];
    allowDuplicateCells = false;
    constructor(collector) {
        super();
        this.collector = collector;
    }
    finishButton() {
        return html.button("Finish", this.doFinish.bind(this));
    }
    doFinish() {
        if (this.cellsUnderConstruction.length > 0) {
            this.collector.completed.push(this.finishConstruction(this.cellsUnderConstruction));
            this.cellsUnderConstruction = [];
            this.collector.underConstruction = null;
            this.collector.refresh();
        }
    }
    doCancel() {
        this.cellsUnderConstruction = [];
        this.collector.underConstruction = null;
        this.collector.refresh();
    }
    render() {
        return this.finishButton();
    }
    updateUnderConstruction() {
        if (this.cellsUnderConstruction.length > 0) {
            this.collector.underConstruction = this.finishConstruction(this.cellsUnderConstruction);
            this.collector.refresh();
        }
    }
    onMouseDown(r, c) {
        if (!this.allowDuplicateCells &&
            coordinatesContains(this.cellsUnderConstruction, [r, c])) {
            // refuse to add duplicates
            return;
        }
        const last = this.cellsUnderConstruction.at(-1);
        if (last !== undefined) {
            if (r === last[0] && c === last[1]) {
                // refuse to add the same point twice in a row, regardless of allowDuplicateCells
                return;
            }
        }
        this.cellsUnderConstruction.push([r, c]);
        this.updateUnderConstruction();
    }
    onDrag(r, c) {
        this.onMouseDown(r, c);
    }
    onLeave() {
        this.doCancel();
    }
    onKeyDown(e) {
        if (e.key === "Enter") {
            this.doFinish();
        }
        else if (e.key === "Escape") {
            this.doCancel();
        }
    }
}
export class DeleteBoardMode extends BoardMode {
    collectors;
    name = "Delete";
    constructor(collectors) {
        super();
        this.collectors = collectors;
    }
    onMouseDown(r, c) {
        const candidates = [];
        for (const collector of this.collectors) {
            for (let i = 0; i < collector.completed.length; i++) {
                const coordinates = collector.completed[i].members;
                if (coordinatesContains(coordinates, [r, c])) {
                    candidates.push([collector, i]);
                }
            }
        }
        if (candidates.length === 1) {
            const [collector, i] = candidates[0];
            collector.completed.splice(i, 1);
            collector.refresh();
        }
        else if (candidates.length > 1) {
            const dialog = document.createElement("dialog");
            for (const [collector, i] of candidates) {
                const button = html.button(collector.describe(i), () => {
                    collector.completed.splice(i, 1);
                    collector.refresh();
                    dialog.close();
                });
                dialog.appendChild(button);
                dialog.appendChild(document.createElement("br"));
            }
            const cancel = html.button("Cancel", () => {
                dialog.close();
            });
            dialog.addEventListener("close", () => {
                dialog.remove();
            });
            dialog.appendChild(cancel);
            document.body.appendChild(dialog);
            dialog.showModal();
        }
    }
}
