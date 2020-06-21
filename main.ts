import * as board from "./board.js";
import * as color from "./color.js";
import * as sudoku from "./sudoku.js";
import { History } from "./history.js";
import { Thermometers } from "./thermometers.js";

const CHAR_CODE_ZERO = 48;
const CHAR_CODE_ZERO_NUMPAD = 96;

const KEY_TO_MOVEMENT: {readonly [key: string]: readonly [number, number]} = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    Tab: [0, 1],
};

enum BoardMode {
    Select,
    AddThermometer,
    DeleteThermometer,
}

function assertUnreachable(x: never): never {
    throw new Error("unexpected value: " + x);
}

function checkbox(): HTMLInputElement {
    const element = document.createElement("input");
    element.type = "checkbox";
    return element;
}

function label(inner: HTMLElement, text: string): HTMLLabelElement {
    const element = document.createElement("label");
    element.append(inner);
    element.append(text);
    return element;
}

function button(text: string, onclick: (e: MouseEvent) => void): HTMLButtonElement {
    const element = document.createElement("button");
    element.textContent = text;
    element.addEventListener("click", onclick);
    return element;
}

export class SudokuUI {
    private mode = BoardMode.Select;
    private readonly thermometers: Thermometers;
    private readonly history: History<board.State>;
    private readonly boardUI: board.UI;

    private readonly antiknight = checkbox();
    private readonly antiking = checkbox();
    private readonly diagonals = checkbox();
    private readonly anticonsecutiveOrthogonal = checkbox();
    private readonly addThermometerButton = button("Add thermometer", () => this.addThermometer());
    private readonly deleteThermometerButton = button("Delete thermometer", () => this.deleteThermometer());
    private readonly finishButton = button("Finish", () => this.finish());
    private readonly textInput = document.createElement("textarea");

    constructor(root: HTMLElement) {
        const startingHighlights = [];
        for (let r = 0; r < 9; r++) {
            startingHighlights.push(new Array<number>(9).fill(0));
        }

        this.history = new History({
            board: sudoku.emptyBoard(),
            highlights: startingHighlights,
        });

        this.boardUI = new board.UI(() => this.history.current());

        this.thermometers = new Thermometers((rc: sudoku.Coordinate) => this.boardUI.centerOfCell(rc));

        const boardDiv = document.createElement("div");
        boardDiv.className = "board";
        boardDiv.append(this.thermometers.render());
        boardDiv.append(this.boardUI.render());
        root.append(boardDiv);

        root.append(this.renderOptions());
        root.append(this.renderHighlightButtons());
        root.append(this.renderStepControl());
        root.append(this.renderFindButtons());
        root.append(this.renderTextInput());

        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("mousedown", (e: MouseEvent) => {
            const isTargetBoring = (
                e.target instanceof HTMLBodyElement
                || e.target instanceof HTMLDivElement
                || e.target instanceof HTMLParagraphElement
                || e.target instanceof HTMLUListElement
                || e.target instanceof HTMLLIElement
            );
            if (isTargetBoring && e.buttons === 1) {
                this.boardUI.selection.clear();
                this.boardUI.refreshAll();
            }
        });

        this.transitionBoardMode(BoardMode.Select);
    }

    private renderOptions(): HTMLElement {
        const options = document.createElement("div");
        options.className = "options";

        options.append(label(this.antiknight, "Antiknight"));
        options.append(label(this.antiking, "Antiking"));
        options.append(label(this.diagonals, "Diagonals"));
        options.append(label(this.anticonsecutiveOrthogonal, "Anticonsecutive orthogonal"));

        options.append(this.addThermometerButton);
        options.append(this.deleteThermometerButton);
        options.append(this.finishButton);

        return options;
    }

    private renderHighlightButtons(): HTMLElement {
        const div = document.createElement("div");
        div.className = "highlight";
        for (let i = 0; i < board.HIGHLIGHT_COLORS.length; i++) {
            const btn = button("", () => this.highlight(i));
            color.setBackgroundColor(btn, board.HIGHLIGHT_COLORS[i]);
            div.append(btn);
        }
        return div;
    }

    private renderStepControl(): HTMLElement {
        const div = document.createElement("div");
        div.className = "stepControl";
        div.append(button("Obvious", () => this.step(sudoku.eliminateObvious)));
        div.append(button("Intersections", () => this.step(sudoku.eliminateIntersections)));
        div.append(button("Naked sets", () => this.step(sudoku.eliminateNakedSets)));
        div.append(button("Hidden singles", () => this.step(sudoku.findHiddenSingles)));
        div.append(button("All", () => this.step()));
        return div;
    }

    private renderFindButtons(): HTMLElement {
        const div = document.createElement("div");
        div.className = "find";
        for (let digit = 1; digit <= 9; digit++) {
            div.append(button(digit.toString(), () => this.toggleFind(digit)));
        }
        return div;
    }

    private renderTextInput(): HTMLElement {
        const div = document.createElement("div");
        div.append(button("Load from text", () => this.loadFromText()));
        div.append(document.createElement("br"));
        div.append(this.textInput);
        return div;
    }

    private pushAndRefreshAll(stateDelta: Partial<board.State>): void {
        this.history.push(stateDelta);
        this.boardUI.refreshAll();
    }

    private onKeyDown(e: KeyboardEvent): void {
        if (e.target instanceof HTMLTextAreaElement) {
            return;
        }

        if (e.key === "y" && e.ctrlKey) {
            this.history.redo();
            this.boardUI.refreshAll();
            return;
        }
        if (e.key === "z" && e.ctrlKey) {
            this.history.undo();
            this.boardUI.refreshAll();
            return;
        }
        if (e.key in KEY_TO_MOVEMENT) {
            const dr = KEY_TO_MOVEMENT[e.key][0];
            let dc = KEY_TO_MOVEMENT[e.key][1];
            if (e.key === "Tab" && e.shiftKey) {
                dc = -dc;
            }
            const success = this.boardUI.selection.move(dr, dc);
            if (success) {
                e.preventDefault();
                this.boardUI.refreshAll();
            }
            return;
        }

        const nextBoard = sudoku.clone(this.history.current().board);
        for (const [r, c] of this.boardUI.selection) {
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
        this.pushAndRefreshAll({board: nextBoard});
    }

    private highlight(index: number): void {
        const newHighlights = this.history.current().highlights.map(x => x.slice());
        for (const [r, c] of this.boardUI.selection) {
            newHighlights[r][c] = index;
        }
        this.pushAndRefreshAll({highlights: newHighlights});
    }

    private toggleFind(digit: number): void {
        const mask = sudoku.bitMask(digit);
        if (this.boardUI.find === mask) {
            this.boardUI.find = 0;
        } else {
            this.boardUI.find = mask;
        }
    }

    private step(fn?: (settings: sudoku.Settings, orig: sudoku.ReadonlyBoard, next: sudoku.Board) => void): void {
        const origBoard = this.history.current().board;
        const nextBoard = sudoku.clone(origBoard);
        const settings = this.collectSettings();
        if (fn) {
            fn(settings, origBoard, nextBoard);
        } else {
            sudoku.eliminateObvious(settings, origBoard, nextBoard);
            sudoku.eliminateIntersections(settings, origBoard, nextBoard);
            sudoku.eliminateNakedSets(settings, origBoard, nextBoard);
            sudoku.findHiddenSingles(settings, origBoard, nextBoard);
        }
        this.pushAndRefreshAll({board: nextBoard});
    }

    private collectSettings(): sudoku.Settings {
        return {
            antiknight: this.antiknight.checked,
            antiking: this.antiking.checked,
            diagonals: this.diagonals.checked,
            anticonsecutiveOrthogonal: this.anticonsecutiveOrthogonal.checked,
            thermometers: this.thermometers.completed,
        };
    }

    private loadFromText(): void {
        const newBoard = sudoku.parse(this.textInput.value);
        this.pushAndRefreshAll({board: newBoard});
    }

    private transitionBoardMode(newMode: BoardMode): void {
        this.addThermometerButton.disabled = newMode === BoardMode.AddThermometer;
        this.deleteThermometerButton.disabled = newMode === BoardMode.DeleteThermometer;
        const finishEnabled = newMode === BoardMode.AddThermometer || newMode === BoardMode.DeleteThermometer;
        this.finishButton.style.display = finishEnabled ? "" : "none";

        switch (newMode) {
        case BoardMode.AddThermometer:
            this.boardUI.mode = this.thermometers.addMode;
            break;
        case BoardMode.Select:
            this.boardUI.mode = null;
            break;
        case BoardMode.DeleteThermometer:
            this.boardUI.mode = this.thermometers.deleteMode;
            break;
        default:
            assertUnreachable(newMode);
        }

        this.mode = newMode;
    }

    private addThermometer(): void {
        switch (this.mode) {
        case BoardMode.AddThermometer:
            throw new Error("unexpected mode");

        case BoardMode.Select:
        case BoardMode.DeleteThermometer:
            this.transitionBoardMode(BoardMode.AddThermometer);
            break;

        default:
            assertUnreachable(this.mode);
        }
    }

    private deleteThermometer(): void {
        switch (this.mode) {
        case BoardMode.AddThermometer:
            this.thermometers.underConstruction = [];
            this.transitionBoardMode(BoardMode.Select);
            this.thermometers.refresh();
            break;

        case BoardMode.Select:
        case BoardMode.DeleteThermometer:
            this.transitionBoardMode(BoardMode.DeleteThermometer);
            break;

        default:
            assertUnreachable(this.mode);
        }
    }

    private finish(): void {
        switch (this.mode) {
        case BoardMode.Select:
            throw new Error("unexpected mode");

        case BoardMode.AddThermometer:
            this.thermometers.finishConstruction();
            this.transitionBoardMode(BoardMode.Select);
            break;

        case BoardMode.DeleteThermometer:
            this.transitionBoardMode(BoardMode.Select);
            break;

        default:
            assertUnreachable(this.mode);
        }
    }
}
