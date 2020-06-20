import * as board from "./board.js";
import * as color from "./color.js";
import * as sudoku from "./sudoku.js";
import { History } from "./history.js";

enum BoardMode {
    Select,
    AddThermometer,
    DeleteThermometer,
}
let mode = BoardMode.Select;

function assertUnreachable(x: never): never {
    throw new Error("unexpected value: " + x);
}

const thermometers: sudoku.Thermometer[] = [];
let thermometerUnderConstruction: sudoku.Coordinate[] = [];

const CHAR_CODE_ZERO = 48;
const CHAR_CODE_ZERO_NUMPAD = 96;

let history: History<board.State>;

let boardUI: board.UI;

const KEY_TO_MOVEMENT: {readonly [key: string]: readonly [number, number]} = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    Tab: [0, 1],
};

function pushAndRefreshAll(stateDelta: Partial<board.State>): void {
    history.push(stateDelta);
    boardUI.refreshAll();
}

function onKeyDown(e: KeyboardEvent): void {
    if (e.target instanceof HTMLTextAreaElement) {
        return;
    }

    if (e.key === "y" && e.ctrlKey) {
        history.redo();
        boardUI.refreshAll();
        return;
    }
    if (e.key === "z" && e.ctrlKey) {
        history.undo();
        boardUI.refreshAll();
        return;
    }
    if (e.key in KEY_TO_MOVEMENT) {
        const dr = KEY_TO_MOVEMENT[e.key][0];
        let dc = KEY_TO_MOVEMENT[e.key][1];
        if (e.key === "Tab" && e.shiftKey) {
            dc = -dc;
        }
        const success = boardUI.selection.move(dr, dc);
        if (success) {
            e.preventDefault();
            boardUI.refreshAll();
        }
        return;
    }

    const nextBoard = sudoku.clone(history.current().board);
    for (const [r, c] of boardUI.selection) {
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
    pushAndRefreshAll({board: nextBoard});
}

class AddThermometerMode {
    onMouseDown(r: number, c: number): void {
        appendToCurrentThermometer(r, c);
    }

    onDrag(r: number, c: number): void {
        appendToCurrentThermometer(r, c);
    }
}

class DeleteThermometerMode {
    onMouseDown(r: number, c: number): void {
        deleteLastThermometerAt(r, c);
    }

    onDrag(): void {
        // only handle deletion on click
    }
}

function highlight(index: number): void {
    const newHighlights = history.current().highlights.map(x => x.slice());
    for (const [r, c] of boardUI.selection) {
        newHighlights[r][c] = index;
    }
    pushAndRefreshAll({highlights: newHighlights});
}

function initializeSudoku(): void {
    const startingHighlights = [];
    for (let r = 0; r < 9; r++) {
        startingHighlights.push(new Array<number>(9).fill(0));
    }

    history = new History({
        board: sudoku.emptyBoard(),
        highlights: startingHighlights,
    });

    boardUI = new board.UI(() => history.current());

    const div = document.getElementById("sudoku")!;
    div.append(boardUI.render());

    const highlightButtons = document.getElementById("highlight")!;
    for (let i = 0; i < board.HIGHLIGHT_COLORS.length; i++) {
        const button = document.createElement("button");
        button.classList.add("highlight");
        color.setBackgroundColor(button, board.HIGHLIGHT_COLORS[i]);
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
            boardUI.selection.clear();
            boardUI.refreshAll();
        }
    });

    document.getElementById("eliminateObvious")!.addEventListener("click", () => step(sudoku.eliminateObvious));
    document.getElementById("eliminateIntersections")!.addEventListener("click", () => step(sudoku.eliminateIntersections));
    document.getElementById("eliminateNakedSets")!.addEventListener("click", () => step(sudoku.eliminateNakedSets));
    document.getElementById("findHiddenSingles")!.addEventListener("click", () => step(sudoku.findHiddenSingles));
    document.getElementById("step")!.addEventListener("click", () => step());
    document.getElementById("loadFromText")!.addEventListener("click", loadFromText);

    document.getElementById("addThermometer")!.addEventListener("click", addThermometer);
    document.getElementById("deleteThermometer")!.addEventListener("click", deleteThermometer);
    document.getElementById("finish")!.addEventListener("click", finish);

    transitionBoardMode(BoardMode.Select);
}

function toggleFind(digit: number): void {
    const mask = sudoku.bitMask(digit);
    if (boardUI.find === mask) {
        boardUI.find = 0;
    } else {
        boardUI.find = mask;
    }
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
    pushAndRefreshAll({board: nextBoard});
}

function collectSettings(): sudoku.Settings {
    return {
        antiknight: (document.getElementById("antiknight") as HTMLInputElement).checked,
        antiking: (document.getElementById("antiking") as HTMLInputElement).checked,
        diagonals: (document.getElementById("diagonals") as HTMLInputElement).checked,
        anticonsecutiveOrthogonal: (document.getElementById("anticonsecutiveOrthogonal") as HTMLInputElement).checked,
        thermometers: thermometers,
    };
}

function loadFromText(): void {
    const newBoard = sudoku.parse((document.getElementById("textInput") as HTMLInputElement).value);
    pushAndRefreshAll({board: newBoard});
}

function transitionBoardMode(newMode: BoardMode): void {
    const addThermometerButton = document.getElementById("addThermometer") as HTMLButtonElement;
    const deleteThermometerButton = document.getElementById("deleteThermometer") as HTMLButtonElement;
    const finishButton = document.getElementById("finish") as HTMLButtonElement;
    addThermometerButton.disabled = newMode === BoardMode.AddThermometer;
    deleteThermometerButton.disabled = newMode === BoardMode.DeleteThermometer;
    const finishEnabled = newMode === BoardMode.AddThermometer || newMode === BoardMode.DeleteThermometer;
    finishButton.style.display = finishEnabled ? "" : "none";

    switch (newMode) {
    case BoardMode.AddThermometer:
        boardUI.mode = new AddThermometerMode();
        break;
    case BoardMode.Select:
        boardUI.mode = null;
        break;
    case BoardMode.DeleteThermometer:
        boardUI.mode = new DeleteThermometerMode();
        break;
    default:
        assertUnreachable(newMode);
    }

    mode = newMode;
}

function appendToCurrentThermometer(r: number, c: number): void {
    for (const [tr, tc] of thermometerUnderConstruction) {
        if (tr === r && tc === c) {
            // refuse to add a loop
            return;
        }
    }
    thermometerUnderConstruction.push([r, c]);
    redrawThermometers();
}

function deleteLastThermometerAt(r: number, c: number): void {
    for (let i = thermometers.length - 1; i >= 0; i--) {
        for (const [tr, tc] of thermometers[i]) {
            if (tr === r && tc === c) {
                thermometers.splice(i, 1);
                redrawThermometers();
                return;
            }
        }
    }
}

function addThermometer(): void {
    switch (mode) {
    case BoardMode.AddThermometer:
        throw new Error("unexpected mode");

    case BoardMode.Select:
    case BoardMode.DeleteThermometer:
        transitionBoardMode(BoardMode.AddThermometer);
        break;

    default:
        assertUnreachable(mode);
    }
}

function deleteThermometer(): void {
    switch (mode) {
    case BoardMode.AddThermometer:
        thermometerUnderConstruction = [];
        transitionBoardMode(BoardMode.Select);
        redrawThermometers();
        break;

    case BoardMode.Select:
    case BoardMode.DeleteThermometer:
        transitionBoardMode(BoardMode.DeleteThermometer);
        break;

    default:
        assertUnreachable(mode);
    }
}

function finish(): void {
    switch (mode) {
    case BoardMode.Select:
        throw new Error("unexpected mode");

    case BoardMode.AddThermometer:
        if (thermometerUnderConstruction.length > 0) {
            thermometers.push(thermometerUnderConstruction);
            thermometerUnderConstruction = [];
            redrawThermometers();
        }
        transitionBoardMode(BoardMode.Select);
        break;

    case BoardMode.DeleteThermometer:
        transitionBoardMode(BoardMode.Select);
        break;

    default:
        assertUnreachable(mode);
    }
}

function appendThermometerSVG(svg: SVGSVGElement, thermometer: sudoku.Thermometer, underConstruction: boolean): void {
    if (thermometer.length === 0) {
        return;
    }

    const bulb = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const [x, y] = boardUI.centerOfCell(thermometer[0], svg);
    bulb.setAttribute("cx", x.toString());
    bulb.setAttribute("cy", y.toString());
    bulb.setAttribute("r", "15");
    bulb.classList.add("thermometer");

    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.classList.add("thermometer");
    for (const member of thermometer) {
        const pt = svg.createSVGPoint();
        [pt.x, pt.y] = boardUI.centerOfCell(member, svg);
        line.points.appendItem(pt);
    }

    if (underConstruction) {
        bulb.classList.add("under-construction");
        line.classList.add("under-construction");
    }

    svg.append(bulb);
    svg.append(line);
}

function redrawThermometers(): void {
    const svg = document.getElementById("background") as unknown as SVGSVGElement;
    svg.innerHTML = "";
    for (const t of thermometers) {
        appendThermometerSVG(svg, t, false);
    }
    appendThermometerSVG(svg, thermometerUnderConstruction, true);
}

window.addEventListener("DOMContentLoaded", initializeSudoku);
