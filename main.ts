import * as sudoku from "./sudoku.js";
import { History } from "./history.js";
import { Selection } from "./selection.js";

const cells: HTMLTableCellElement[][] = [];
let currentFind = 0;

const CHAR_CODE_ZERO = 48;
const CHAR_CODE_ZERO_NUMPAD = 96;

const selection = new Selection();

let history: History<sudoku.ReadonlyBoard>;

const KEY_TO_MOVEMENT: {readonly [key: string]: readonly [number, number]} = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    Tab: [0, 1],
};

function onKeyDown(e: KeyboardEvent): void {
    if (e.target instanceof HTMLTextAreaElement) {
        return;
    }

    if (e.key === "y" && e.ctrlKey) {
        history.redo();
        refreshAll();
        return;
    }
    if (e.key === "z" && e.ctrlKey) {
        history.undo();
        refreshAll();
        return;
    }
    if (e.key in KEY_TO_MOVEMENT) {
        const dr = KEY_TO_MOVEMENT[e.key][0];
        let dc = KEY_TO_MOVEMENT[e.key][1];
        if (e.key === "Tab" && e.shiftKey) {
            dc = -dc;
        }
        const success = selection.move(dr, dc);
        if (success) {
            e.preventDefault();
            refreshAll();
        }
        return;
    }

    const nextBoard = sudoku.clone(history.current());
    for (const [r, c] of selection) {
        if (e.key === "Backspace" || e.key === "Delete") {
            if (e.ctrlKey) {
                nextBoard[r][c] = 0;
            } else {
                nextBoard[r][c] = sudoku.EMPTY_CELL;
            }
        } else {
            const n = e.keyCode >= CHAR_CODE_ZERO_NUMPAD
                ? e.keyCode - CHAR_CODE_ZERO_NUMPAD
                : e.keyCode - CHAR_CODE_ZERO;
            if (n >= 1 && n <= 9) {
                if (e.ctrlKey) {
                    nextBoard[r][c] ^= sudoku.bitMask(n);
                } else {
                    nextBoard[r][c] = sudoku.bitMask(n);
                }
            }
        }
    }
    history.push(nextBoard);
    refreshAll();
}

function onMouseDown(r: number, c: number, e: MouseEvent): void {
    if (e.buttons !== 1) {
        // if no buttons or multiple buttons, ignore
        return;
    }
    selection.start(r, c, e.ctrlKey);
    refreshAll();
}

function onMouseOver(r: number, c: number, e: MouseEvent): void {
    if (e.buttons !== 1) {
        // if no buttons or multiple buttons, ignore
        return;
    }
    selection.continue(r, c);
    refresh(r, c);
}

function refresh(r: number, c: number): void {
    const set = history.current()[r][c];
    const cell = cells[r][c];
    cell.className = "cell";
    const count = sudoku.bitCount(set);
    if (count === 0) {
        cell.textContent = "X";
        cell.classList.add("broken");
    } else if (count === 1) {
        cell.textContent = sudoku.lowestDigit(set).toString();
        cell.classList.add("solved");
    } else {
        let txt = "";
        let numNumbers = 0;
        for (let digit = 1; digit <= 9; digit++) {
            if (set & sudoku.bitMask(digit)) {
                if (count >= 5 && numNumbers % 3 === 0 && numNumbers > 0) {
                    txt += "<br/>";
                }
                txt += digit;
                numNumbers += 1;
            }
        }
        cell.innerHTML = txt;
        cell.classList.add("pencil");
    }
    if (set & currentFind) {
        cell.classList.add("found");
    }
    if (selection.isSelected(r, c)) {
        cell.classList.add("selected");
    }
}

function refreshAll(): void {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            refresh(r, c);
        }
    }
}

function initializeSudoku(): void {
    for (let r = 0; r < 9; r++) {
        cells.push(new Array<HTMLTableCellElement>(9));
    }

    history = new History(sudoku.emptyBoard());

    const div = document.getElementById("sudoku")!;
    const table = document.createElement("table");
    table.classList.add("whole");
    for (let R = 0; R < 3; R++) {
        const tr = document.createElement("tr");
        table.append(tr);
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
                    cells[R * 3 + r][C * 3 + c] = td2;

                    td2.addEventListener("mousedown", (e: MouseEvent) => {
                        onMouseDown(R * 3 + r, C * 3 + c, e);
                    });
                    td2.addEventListener("mouseover", (e: MouseEvent) => {
                        onMouseOver(R * 3 + r, C * 3 + c, e);
                    });
                }
            }
        }
    }
    refreshAll();
    div.append(table);

    const findButtons = document.getElementById("find")!;
    for (let digit = 1; digit <= 9; digit++) {
        const button = document.createElement("button");
        button.textContent = digit.toString();
        button.addEventListener("click", () => toggleFind(digit));
        findButtons.append(button);
        findButtons.append(document.createTextNode(" "));
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", (e: MouseEvent) => {
        const isTargetBoring = (
            e.target instanceof HTMLBodyElement
            || e.target instanceof HTMLDivElement
            || e.target instanceof HTMLParagraphElement
            || e.target instanceof HTMLUListElement
            || e.target instanceof HTMLLIElement
        );
        if (isTargetBoring && e.buttons === 1) {
            selection.clear();
            refreshAll();
        }
    });

    document.getElementById("eliminateObvious")!.addEventListener("click", () => step(sudoku.eliminateObvious));
    document.getElementById("eliminateIntersections")!.addEventListener("click", () => step(sudoku.eliminateIntersections));
    document.getElementById("eliminateNakedSets")!.addEventListener("click", () => step(sudoku.eliminateNakedSets));
    document.getElementById("findHiddenSingles")!.addEventListener("click", () => step(sudoku.findHiddenSingles));
    document.getElementById("step")!.addEventListener("click", () => step());
    document.getElementById("loadFromText")!.addEventListener("click", loadFromText);
}

function toggleFind(digit: number): void {
    const mask = sudoku.bitMask(digit);
    if (currentFind === mask) {
        currentFind = 0;
    } else {
        currentFind = mask;
    }
    refreshAll();
}

function step(fn?: (settings: sudoku.Settings, orig: sudoku.ReadonlyBoard, next: sudoku.Board) => void): void {
    const origBoard = history.current();
    const nextBoard = sudoku.clone(origBoard);
    const settings = collectSettings();
    if (fn) {
        fn(settings, origBoard, nextBoard);
    } else {
        sudoku.eliminateObvious(settings, origBoard, nextBoard);
        sudoku.eliminateIntersections(settings, origBoard, nextBoard);
        sudoku.eliminateNakedSets(settings, origBoard, nextBoard);
        sudoku.findHiddenSingles(settings, origBoard, nextBoard);
    }
    history.push(nextBoard);
    refreshAll();
}

function collectSettings(): sudoku.Settings {
    return {
        antiknight: (document.getElementById("antiknight") as HTMLInputElement).checked,
        antiking: (document.getElementById("antiking") as HTMLInputElement).checked,
        diagonals: (document.getElementById("diagonals") as HTMLInputElement).checked,
        anticonsecutiveOrthogonal: (document.getElementById("anticonsecutiveOrthogonal") as HTMLInputElement).checked,
    };
}

function loadFromText(): void {
    const board = sudoku.parse((document.getElementById("textInput") as HTMLInputElement).value);
    history.push(board);
    refreshAll();
}

window.addEventListener("DOMContentLoaded", initializeSudoku);
