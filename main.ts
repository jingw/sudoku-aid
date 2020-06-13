import * as color from "./color.js";
import * as sudoku from "./sudoku.js";
import { History } from "./history.js";
import { Selection } from "./selection.js";

type ReadonlyHighlights = ReadonlyArray<ReadonlyArray<number>>
const HIGHLIGHT_ALPHA = 0.5;
const HIGHLIGHT_COLORS: readonly color.Rgba[] = [
    [0, 0, 0, 0], // White
    color.withAlpha(211, 211, 211, HIGHLIGHT_ALPHA), // LightGray
    color.withAlpha(173, 216, 230, HIGHLIGHT_ALPHA), // LightBlue
    color.withAlpha(240, 128, 128, HIGHLIGHT_ALPHA), // LightCoral
    color.withAlpha(224, 255, 255, HIGHLIGHT_ALPHA), // LightCyan
    color.withAlpha(144, 238, 144, HIGHLIGHT_ALPHA), // LightGreen
    color.withAlpha(255, 182, 193, HIGHLIGHT_ALPHA), // LightPink
    color.withAlpha(255, 160, 122, HIGHLIGHT_ALPHA), // LightSalmon
    color.withAlpha(32, 178, 170, HIGHLIGHT_ALPHA), // LightSeaGreen
    color.withAlpha(135, 206, 250, HIGHLIGHT_ALPHA), // LightSkyBlue
    color.withAlpha(119, 136, 153, HIGHLIGHT_ALPHA), // LightSlateGray
    color.withAlpha(176, 196, 222, HIGHLIGHT_ALPHA), // LightSteelBlue
    // skipped LightGoldenRodYellow and LightYellow
];
const SELECTION_COLOR: color.Rgba = color.withAlpha(255, 235, 117, 0.5);
const FOUND_COLOR: color.Rgba = [152, 251, 152, 0.5];

const cells: HTMLTableCellElement[][] = [];
let currentFind = 0;

const CHAR_CODE_ZERO = 48;
const CHAR_CODE_ZERO_NUMPAD = 96;

const selection = new Selection();

interface State {
    readonly board: sudoku.ReadonlyBoard;
    readonly highlights: ReadonlyHighlights;
}
let history: History<State>;

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

    const nextBoard = sudoku.clone(history.current().board);
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
    history.push({board: nextBoard});
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

function highlight(index: number): void {
    const newHighlights = history.current().highlights.map(x => x.slice());
    for (const [r, c] of selection) {
        newHighlights[r][c] = index;
    }
    history.push({highlights: newHighlights});
    refreshAll();
}

function refresh(r: number, c: number): void {
    const set = history.current().board[r][c];
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
    let background = HIGHLIGHT_COLORS[history.current().highlights[r][c]];
    if (set & currentFind) {
        background = color.composite(background, FOUND_COLOR);
    }
    if (selection.isSelected(r, c)) {
        background = color.composite(background, SELECTION_COLOR);
    }
    color.setBackgroundColor(cell, background);
}

function refreshAll(): void {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            refresh(r, c);
        }
    }
}

function initializeSudoku(): void {
    const startingHighlights = [];
    for (let r = 0; r < 9; r++) {
        cells.push(new Array<HTMLTableCellElement>(9));
        startingHighlights.push(new Array<number>(9).fill(0));
    }

    history = new History({
        board: sudoku.emptyBoard(),
        highlights: startingHighlights,
    });

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

    const highlightButtons = document.getElementById("highlight")!;
    for (let i = 0; i < HIGHLIGHT_COLORS.length; i++) {
        const button = document.createElement("button");
        button.classList.add("highlight");
        color.setBackgroundColor(button, HIGHLIGHT_COLORS[i]);
        button.addEventListener("click", () => highlight(i));
        highlightButtons.append(button);
        highlightButtons.append(document.createTextNode(" "));
    }

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
    const origBoard = history.current().board;
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
    history.push({board: nextBoard});
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
    history.push({board: board});
    refreshAll();
}

window.addEventListener("DOMContentLoaded", initializeSudoku);
