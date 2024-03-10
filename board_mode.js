var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CoordinateCollectingBoardMode_instances, _CoordinateCollectingBoardMode_doFinish, _CoordinateCollectingBoardMode_doCancel;
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
    onKeyDown(_e) {
        // nothing by default
    }
}
export class SupportsConstruction {
    constructor() {
        this.completed = [];
        this.underConstruction = [];
        this.allowDuplicateCells = false;
    }
}
export class CoordinateCollectingBoardMode extends BoardMode {
    constructor(collector) {
        super();
        _CoordinateCollectingBoardMode_instances.add(this);
        this.collector = collector;
    }
    finishButton() {
        const finish = document.createElement("button");
        finish.textContent = "Finish";
        finish.addEventListener("click", __classPrivateFieldGet(this, _CoordinateCollectingBoardMode_instances, "m", _CoordinateCollectingBoardMode_doFinish).bind(this));
        return finish;
    }
    render() {
        return this.finishButton();
    }
    onMouseDown(r, c) {
        if (!this.collector.allowDuplicateCells &&
            sudoku.coordinatesContains(this.collector.underConstruction, [r, c])) {
            // refuse to add duplicates
            return;
        }
        this.collector.underConstruction.push([r, c]);
        this.collector.refresh();
    }
    onDrag(r, c) {
        this.onMouseDown(r, c);
    }
    onLeave() {
        __classPrivateFieldGet(this, _CoordinateCollectingBoardMode_instances, "m", _CoordinateCollectingBoardMode_doCancel).call(this);
    }
    onKeyDown(e) {
        if (e.key === "Enter") {
            __classPrivateFieldGet(this, _CoordinateCollectingBoardMode_instances, "m", _CoordinateCollectingBoardMode_doFinish).call(this);
        }
        else if (e.key === "Escape") {
            __classPrivateFieldGet(this, _CoordinateCollectingBoardMode_instances, "m", _CoordinateCollectingBoardMode_doCancel).call(this);
        }
    }
}
_CoordinateCollectingBoardMode_instances = new WeakSet(), _CoordinateCollectingBoardMode_doFinish = function _CoordinateCollectingBoardMode_doFinish() {
    if (this.collector.underConstruction.length > 0) {
        this.collector.completed.push(this.finishConstruction(this.collector.underConstruction));
        this.collector.underConstruction = [];
        this.collector.refresh();
    }
}, _CoordinateCollectingBoardMode_doCancel = function _CoordinateCollectingBoardMode_doCancel() {
    this.collector.underConstruction = [];
    this.collector.refresh();
};
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
