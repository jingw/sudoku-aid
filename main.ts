import * as board from "./board.js";
import * as cages from "./cages.js";
import * as color from "./color.js";
import * as equalities from "./equalities.js";
import * as sudoku from "./sudoku.js";
import * as thermometers from "./thermometers.js";
import { BoardMode } from "./board_mode.js";
import { History } from "./history.js";

const CHAR_CODE_ZERO = 48;
const CHAR_CODE_ZERO_NUMPAD = 96;

const KEY_TO_MOVEMENT: {readonly [key: string]: readonly [number, number]} = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    Tab: [0, 1],
};

function checkbox(): HTMLInputElement {
    const element = document.createElement("input");
    element.type = "checkbox";
    return element;
}

function radio(name: string, value: string): HTMLInputElement {
    const element = document.createElement("input");
    element.type = "radio";
    element.name = name;
    element.value = value;
    return element;
}

function label(inner: HTMLElement, text: string, textFirst = false): HTMLLabelElement {
    const element = document.createElement("label");
    if (textFirst) {
        element.append(text);
    }
    element.append(inner);
    if (!textFirst) {
        element.append(text);
    }
    return element;
}

function button(text: string, onclick: (e: MouseEvent) => void): HTMLButtonElement {
    const element = document.createElement("button");
    element.textContent = text;
    element.addEventListener("click", onclick);
    return element;
}

export class SudokuUI {
    private readonly cages: cages.Cages;
    private readonly equalities: equalities.EqualityConstraints;
    private readonly thermometers: thermometers.Thermometers;
    private readonly history: History<board.State>;
    private readonly boardUI: board.UI;

    private readonly antiknight = checkbox();
    private readonly antiking = checkbox();
    private readonly diagonals = checkbox();
    private readonly anticonsecutiveOrthogonal = checkbox();
    private readonly irregular = checkbox();

    private readonly allModes: BoardMode[];
    private currentModeIndex = 0;
    private currentModeUI: HTMLElement;

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

        this.thermometers = new thermometers.Thermometers((rc: sudoku.Coordinate) => this.boardUI.centerOfCell(rc));
        const boundingRectOfCell = this.boardUI.boundingRectOfCell.bind(this.boardUI);
        this.cages = new cages.Cages(boundingRectOfCell);
        this.equalities = new equalities.EqualityConstraints(boundingRectOfCell);

        const boardDiv = document.createElement("div");
        boardDiv.className = "board";
        boardDiv.append(this.thermometers.render());
        boardDiv.append(this.cages.render());
        boardDiv.append(this.equalities.render());
        boardDiv.append(this.boardUI.render());
        root.append(boardDiv);

        this.allModes = [
            new board.SelectionMode(this.boardUI),
            new thermometers.AddMode(this.thermometers),
            new thermometers.DeleteMode(this.thermometers),
            new cages.AddMode(this.cages),
            new cages.DeleteMode(this.cages),
            new cages.DisplaySumsMode(
                this.cages,
                () => this.history.current().board,
            ),
            new equalities.AddMode(this.equalities),
            new equalities.DeleteMode(this.equalities),
        ];
        const currentMode = this.allModes[this.currentModeIndex];
        this.currentModeUI = currentMode.render();
        this.boardUI.mode = currentMode;

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
    }

    private renderOptions(): HTMLElement {
        const options = document.createElement("div");
        options.className = "options";

        options.append(label(this.antiknight, "Antiknight"));
        options.append(label(this.antiking, "Antiking"));
        options.append(label(this.diagonals, "Diagonals"));
        options.append(label(this.anticonsecutiveOrthogonal, "Anticonsecutive orthogonal"));
        options.append(label(this.irregular, "Irregular"));

        const modeHeading = document.createElement("div");
        modeHeading.className = "mode-heading";
        modeHeading.textContent = "Mode:";
        options.append(modeHeading);

        const form = document.createElement("form");

        for (let i = 0; i < this.allModes.length; i++) {
            const r = radio("mode", i.toString());
            if (i === this.currentModeIndex) {
                r.checked = true;
            }
            form.append(label(r, this.allModes[i].name));
            r.addEventListener("change", (e: Event) => {
                this.transitionBoardMode(parseInt((e.target as HTMLInputElement).value));
            });
        }

        options.append(form);

        options.append(this.currentModeUI);

        this.irregular.addEventListener("change", () => {
            this.boardUI.irregular = this.irregular.checked;
        });

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
        div.append("Strategies: ");
        div.append(button("Obvious", () => this.step(sudoku.eliminateObvious)));
        div.append(button("Intersections", () => this.step(sudoku.eliminateIntersections)));
        div.append(button("Naked sets", () => this.step(sudoku.eliminateNakedSets)));
        div.append(button("Fish", () => this.step(sudoku.eliminateFish)));
        div.append(button("Hidden singles", () => this.step(sudoku.findHiddenSingles)));
        div.append(button("All", () => this.step()));
        return div;
    }

    private renderFindButtons(): HTMLElement {
        const div = document.createElement("div");
        div.className = "find";
        div.append("Find: ");
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
        if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
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
        if (e.key === "i" && e.ctrlKey) {
            this.boardUI.selection.invert();
            this.boardUI.refreshAll();
            e.preventDefault();
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
            sudoku.eliminateFish(settings, origBoard, nextBoard);
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
            irregular: this.irregular.checked,
            thermometers: this.thermometers.completed,
            cages: this.cages.completed,
            equalities: this.equalities.completed,
        };
    }

    private loadFromText(): void {
        const newBoard = sudoku.parse(this.textInput.value);
        this.pushAndRefreshAll({board: newBoard});
    }

    private transitionBoardMode(newModeIndex: number): void {
        const oldMode = this.allModes[this.currentModeIndex];
        const newMode = this.allModes[newModeIndex];

        oldMode.onLeave();
        this.boardUI.mode = newMode;
        const newUI = newMode.render();
        this.currentModeUI.replaceWith(newUI);
        this.currentModeUI = newUI;
        this.currentModeIndex = newModeIndex;
    }
}
