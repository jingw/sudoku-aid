import * as color from "./color.js";
import * as sudoku from "./sudoku.js";
import { Selection } from "./selection.js";

type ReadonlyHighlights = ReadonlyArray<ReadonlyArray<number>>
const HIGHLIGHT_ALPHA = 0.25;
export const HIGHLIGHT_COLORS: readonly color.Rgba[] = [
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
const SELECTION_COLOR: color.Rgba = [255, 215, 0, 0.5];
const FOUND_COLOR: color.Rgba = [3, 192, 60, 0.5];

export interface State {
    readonly board: sudoku.ReadonlyBoard;
    readonly highlights: ReadonlyHighlights;
}

export interface Mode {
    onMouseDown(r: number, c: number, e: MouseEvent): void;
    onDrag(r: number, c: number, e: MouseEvent): void;
}

export class UI {
    private readonly cells: HTMLTableCellElement[][] = [];
    private readonly table: HTMLElement;
    private _mode: Mode = new SelectionMode(this);
    private _find = 0;

    readonly selection = new Selection();

    constructor(private state: () => State) {
        for (let r = 0; r < 9; r++) {
            this.cells.push(new Array<HTMLTableCellElement>(9));
        }

        this.table = document.createElement("table");
        this.table.classList.add("whole");
        for (let R = 0; R < 3; R++) {
            const tr = document.createElement("tr");
            this.table.append(tr);
            for (let C = 0; C < 3; C++) {
                const td = document.createElement("td");
                tr.append(td);
                td.classList.add("block");

                const table2 = document.createElement("table");
                td.append(table2);
                for (let r = 0; r < 3; r++) {
                    const tr2 = document.createElement("tr");
                    table2.append(tr2);
                    for (let c = 0; c < 3; c++) {
                        const td2 = document.createElement("td");
                        tr2.append(td2);
                        this.cells[R * 3 + r][C * 3 + c] = td2;

                        td2.addEventListener("mousedown", (e: MouseEvent) => {
                            if (e.buttons !== 1) {
                                // if no buttons or multiple buttons, ignore
                                return;
                            }
                            this._mode.onMouseDown(R * 3 + r, C * 3 + c, e);
                        });
                        td2.addEventListener("mouseover", (e: MouseEvent) => {
                            if (e.buttons !== 1) {
                                // if no buttons or multiple buttons, ignore
                                return;
                            }
                            this._mode.onDrag(R * 3 + r, C * 3 + c, e);
                        });
                    }
                }
            }
        }
    }

    set mode(mode: Mode | null) {
        this._mode = mode ?? new SelectionMode(this);
    }

    get find(): number {
        return this._find;
    }

    set find(find: number) {
        this._find = find;
        this.refreshAll();
    }

    render(): HTMLElement {
        this.refreshAll();
        return this.table;
    }

    refresh(r: number, c: number): void {
        const set = this.state().board[r][c];
        const cell = this.cells[r][c];
        cell.className = "cell";
        const count = sudoku.bitCount(set);
        if (count === 0) {
            cell.textContent = "X";
            cell.classList.add("broken");
        } else if (count === 9) {
            cell.textContent = "";
        } else if (count === 1) {
            cell.textContent = sudoku.lowestDigit(set).toString();
            cell.classList.add("solved");
        } else {
            cell.innerHTML = "";
            let numNumbers = 0;
            for (let digit = 1; digit <= 9; digit++) {
                if (set & sudoku.bitMask(digit)) {
                    if (count >= 5 && numNumbers % 3 === 0 && numNumbers > 0) {
                        cell.append(document.createElement("br"));
                    }
                    cell.append(digit.toString());
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

    refreshAll(): void {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                this.refresh(r, c);
            }
        }
    }

    centerOfCell([r, c]: sudoku.Coordinate): [number, number] {
        const baseRect = this.table.getBoundingClientRect();
        const rect = this.cells[r][c].getBoundingClientRect();
        return [
            (rect.left + rect.right) / 2 - baseRect.left,
            (rect.top + rect.bottom) / 2 - baseRect.top,
        ];
    }

    /** returns left, right, top, bottom */
    boundingRectOfCell([r, c]: sudoku.Coordinate): [number, number, number, number] {
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

class SelectionMode {
    constructor(private ui: UI) {}

    onMouseDown(r: number, c: number, e: MouseEvent): void {
        this.ui.selection.start(r, c, e.ctrlKey);
        this.ui.refreshAll();
    }

    onDrag(r: number, c: number): void {
        this.ui.selection.continue(r, c);
        this.ui.refresh(r, c);
    }
}
