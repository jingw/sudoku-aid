import { BoardMode } from "./board_mode.js";
import * as color from "./color.js";
import { Selection } from "./selection.js";
import * as sudoku from "./sudoku.js";
const HIGHLIGHT_ALPHA = 0.25;
export const HIGHLIGHT_COLORS = [
    [0, 0, 0, 0], // White
    [0, 0, 0, HIGHLIGHT_ALPHA], // Gray
    [0, 0, 255, HIGHLIGHT_ALPHA], // Blue
    [0, 255, 255, HIGHLIGHT_ALPHA], // Cyan
    [0, 255, 0, HIGHLIGHT_ALPHA], // Green
    [255, 255, 0, HIGHLIGHT_ALPHA], // Yellow
    [255, 127, 0, HIGHLIGHT_ALPHA], // Orange
    [255, 0, 0, HIGHLIGHT_ALPHA], // Red
    [255, 0, 255, HIGHLIGHT_ALPHA], // Magenta
];
const SELECTION_COLOR = [255, 215, 0, 0.5];
const FOUND_COLOR = [3, 192, 60, 0.5];
export class UI {
    boardSize;
    state;
    cells = [];
    table;
    _mode = null;
    _find = 0;
    _startDigit = 1;
    selection;
    constructor(boardSize, state) {
        this.boardSize = boardSize;
        this.state = state;
        for (let r = 0; r < this.boardSize; r++) {
            this.cells.push(new Array(this.boardSize));
        }
        this.selection = new Selection(this.boardSize);
        let boxesWide, boxesTall;
        if (this.boardSize in sudoku.SIZE_TO_BOX_COUNTS) {
            [boxesWide, boxesTall] = sudoku.SIZE_TO_BOX_COUNTS[this.boardSize];
        }
        else {
            boxesWide = boxesTall = 1;
        }
        const boxWidth = this.boardSize / boxesWide;
        const boxHeight = this.boardSize / boxesTall;
        this.table = document.createElement("table");
        this.table.classList.add("whole");
        for (let R = 0; R < boxesTall; R++) {
            const tr = document.createElement("tr");
            this.table.append(tr);
            for (let C = 0; C < boxesWide; C++) {
                const td = document.createElement("td");
                tr.append(td);
                td.classList.add("block");
                const table2 = document.createElement("table");
                td.append(table2);
                for (let r = 0; r < boxHeight; r++) {
                    const tr2 = document.createElement("tr");
                    table2.append(tr2);
                    for (let c = 0; c < boxWidth; c++) {
                        const td2 = document.createElement("td");
                        tr2.append(td2);
                        this.cells[R * boxHeight + r][C * boxWidth + c] = td2;
                        td2.addEventListener("mousedown", (e) => {
                            if (e.buttons !== 1) {
                                // if no buttons or multiple buttons, ignore
                                return;
                            }
                            this._mode?.onMouseDown(R * boxHeight + r, C * boxWidth + c, e);
                        });
                        td2.addEventListener("mouseover", (e) => {
                            if (e.buttons !== 1) {
                                // if no buttons or multiple buttons, ignore
                                return;
                            }
                            this._mode?.onDrag(R * boxHeight + r, C * boxWidth + c, e);
                        });
                    }
                }
            }
        }
    }
    set mode(mode) {
        this._mode = mode;
    }
    get find() {
        return this._find;
    }
    set find(find) {
        this._find = find;
        this.refresh();
    }
    set irregular(irregular) {
        this.table.classList.toggle("irregular", irregular);
    }
    set startDigit(startDigit) {
        this._startDigit = startDigit;
        this.refresh();
    }
    render() {
        this.refresh();
        return this.table;
    }
    refreshCell(r, c) {
        const set = this.state().board[r][c];
        const cell = this.cells[r][c];
        cell.className = "cell";
        const count = sudoku.bitCount(set);
        if (count === 0) {
            cell.textContent = "X";
            cell.classList.add("broken");
        }
        else if (count === 1) {
            cell.textContent = (sudoku.lowestDigit(set) +
                this._startDigit -
                1).toString();
            cell.classList.add("solved");
        }
        else if (count === this.boardSize) {
            cell.textContent = "";
        }
        else {
            cell.innerHTML = "";
            let numNumbers = 0;
            for (let digit = 1; digit <= this.boardSize; digit++) {
                if (set & sudoku.bitMask(digit)) {
                    if (count >= 5 && numNumbers % 3 === 0 && numNumbers > 0) {
                        cell.append(document.createElement("br"));
                    }
                    cell.append((digit + this._startDigit - 1).toString());
                    numNumbers += 1;
                }
            }
            cell.classList.add("pencil");
        }
        let background = HIGHLIGHT_COLORS[this.state().highlights[r][c]];
        if (set & this.find) {
            background = color.composite(background, FOUND_COLOR);
        }
        if (this.selection.isSelected(r, c)) {
            background = color.composite(background, SELECTION_COLOR);
        }
        color.setBackgroundColor(cell, background);
    }
    refresh() {
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                this.refreshCell(r, c);
            }
        }
    }
    centerOfCell([r, c]) {
        const baseRect = this.table.getBoundingClientRect();
        const rect = this.cells[r][c].getBoundingClientRect();
        return [
            (rect.left + rect.right) / 2 - baseRect.left,
            (rect.top + rect.bottom) / 2 - baseRect.top,
        ];
    }
    /** returns left, right, top, bottom */
    boundingRectOfCell([r, c]) {
        const baseRect = this.table.getBoundingClientRect();
        const rect = this.cells[r][c].getBoundingClientRect();
        return [
            rect.left - baseRect.left,
            rect.right - baseRect.left,
            rect.top - baseRect.top,
            rect.bottom - baseRect.top,
        ];
    }
}
export class SelectionMode extends BoardMode {
    ui;
    name = "Select";
    constructor(ui) {
        super();
        this.ui = ui;
    }
    onMouseDown(r, c, e) {
        this.ui.selection.start(r, c, e.ctrlKey);
        this.ui.refresh();
    }
    onDrag(r, c) {
        this.ui.selection.continue(r, c);
        this.ui.refreshCell(r, c);
    }
}
