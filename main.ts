import * as arrows from "./arrows.js";
import * as between from "./between.js";
import * as board from "./board.js";
import * as cages from "./cages.js";
import * as color from "./color.js";
import * as equalities from "./equalities.js";
import * as html from "./html.js";
import * as kropki from "./kropki.js";
import * as sudoku from "./sudoku.js";
import * as thermometers from "./thermometers.js";
import {
    ProcessedSettings,
    processSettings,
} from "./strategies/base.js";
import { BoardMode } from "./board_mode.js";
import { History } from "./history.js";
import { applyAllStrategies } from "./strategies/all.js";
import { eliminateFish } from "./strategies/fish.js";
import { eliminateIntersections } from "./strategies/intersections.js";
import { eliminateNakedSets } from "./strategies/naked_sets.js";
import { eliminateObvious } from "./strategies/obvious.js";
import { eliminateXYZWing } from "./strategies/xyz_wing.js";
import { findHiddenSingles } from "./strategies/hidden_singles.js";

const CHAR_CODE_ZERO = 48;
const CHAR_CODE_ZERO_NUMPAD = 96;

const KEY_TO_MOVEMENT: {readonly [key: string]: readonly [number, number]} = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    Tab: [0, 1],
};

export class SudokuUI {
    private readonly arrows: arrows.Arrows;
    private readonly betweenLines: between.BetweenLines;
    private readonly cages: cages.Cages;
    private readonly equalities: equalities.EqualityConstraints;
    private readonly thermometers: thermometers.Thermometers;
    private readonly consecutiveKropkiDots: kropki.KropkiDots;
    private readonly doubleKropkiDots: kropki.KropkiDots;
    private readonly history: History<board.State>;
    private readonly boardUI: board.UI;

    private readonly antiknight = html.checkbox();
    private readonly antiking = html.checkbox();
    private readonly diagonals = html.checkbox();
    private readonly anticonsecutiveOrthogonal = html.checkbox();
    private readonly digitsNotInSamePosition = html.checkbox();
    private readonly irregular = html.checkbox();

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

        const boundingRectOfCell = this.boardUI.boundingRectOfCell.bind(this.boardUI);
        const centerOfCell = this.boardUI.centerOfCell.bind(this.boardUI);

        this.arrows = new arrows.Arrows(centerOfCell);
        this.thermometers = new thermometers.Thermometers(centerOfCell);
        this.betweenLines = new between.BetweenLines(centerOfCell);
        this.cages = new cages.Cages(boundingRectOfCell);
        this.equalities = new equalities.EqualityConstraints(boundingRectOfCell);

        this.consecutiveKropkiDots = new kropki.KropkiDots(centerOfCell, true);
        this.doubleKropkiDots = new kropki.KropkiDots(centerOfCell, false);

        const boardDiv = document.createElement("div");
        boardDiv.className = "board";
        boardDiv.append(this.arrows.render());
        boardDiv.append(this.thermometers.render());
        boardDiv.append(this.betweenLines.render());
        boardDiv.append(this.cages.render());
        boardDiv.append(this.equalities.render());
        boardDiv.append(this.consecutiveKropkiDots.render());
        boardDiv.append(this.doubleKropkiDots.render());
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
            new kropki.AddMode(this.consecutiveKropkiDots, true),
            new kropki.DeleteMode(this.consecutiveKropkiDots, true),
            new kropki.AddMode(this.doubleKropkiDots, false),
            new kropki.DeleteMode(this.doubleKropkiDots, false),
            new between.AddMode(this.betweenLines),
            new between.DeleteMode(this.betweenLines),
            new arrows.AddMode(this.arrows),
            new arrows.DeleteMode(this.arrows),
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

        window.addEventListener("beforeunload", (e: BeforeUnloadEvent) => {
            if (!this.history.isEmpty()) {
                e.preventDefault(); // HTML specification
                e.returnValue = ""; // Needed for Chrome
            }
        });
    }

    private renderOptions(): HTMLElement {
        const options = document.createElement("div");
        options.className = "options";

        options.append(html.label(this.antiknight, "Antiknight"));
        options.append(html.label(this.antiking, "Antiking"));
        options.append(html.label(this.diagonals, "Diagonals"));
        options.append(html.label(this.anticonsecutiveOrthogonal, "Anticonsecutive orthogonal"));
        options.append(html.label(this.digitsNotInSamePosition, "Digits not in same position"));
        options.append(html.label(this.irregular, "Irregular"));

        const modeHeading = document.createElement("div");
        modeHeading.className = "mode-heading";
        modeHeading.textContent = "Mode:";
        options.append(modeHeading);

        const form = document.createElement("form");

        for (let i = 0; i < this.allModes.length; i++) {
            const r = html.radio("mode", i.toString());
            if (i === this.currentModeIndex) {
                r.checked = true;
            }
            form.append(html.label(r, this.allModes[i].name));
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
            const btn = html.button("", () => this.highlight(i));
            color.setBackgroundColor(btn, board.HIGHLIGHT_COLORS[i]);
            div.append(btn);
        }
        return div;
    }

    private renderStepControl(): HTMLElement {
        const div = document.createElement("div");
        div.className = "stepControl";
        div.append("Strategies: ");
        div.append(html.button("Obvious", () => this.step(eliminateObvious)));
        div.append(html.button("Hidden singles", () => this.step(findHiddenSingles)));
        div.append(html.button("Intersections", () => this.step(eliminateIntersections)));
        div.append(html.button("Naked sets", () => this.step(eliminateNakedSets)));
        div.append(html.button("Fish", () => this.step(eliminateFish)));
        div.append(html.button("XY(Z) wings", () => this.step(eliminateXYZWing)));
        div.append(html.button("All", () => this.step()));
        return div;
    }

    private renderFindButtons(): HTMLElement {
        const div = document.createElement("div");
        div.className = "find";
        div.append("Find: ");
        for (let digit = 1; digit <= 9; digit++) {
            div.append(html.button(digit.toString(), () => this.toggleFind(digit)));
        }
        return div;
    }

    private renderTextInput(): HTMLElement {
        const div = document.createElement("div");
        div.append(html.button("Load from text", () => this.loadFromText()));
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

    private step(fn?: (settings: ProcessedSettings, orig: sudoku.ReadonlyBoard, next: sudoku.Board) => void): void {
        const origBoard = this.history.current().board;
        const nextBoard = sudoku.clone(origBoard);
        const settings = this.collectSettings();
        if (fn) {
            fn(settings, origBoard, nextBoard);
        } else {
            applyAllStrategies(settings, origBoard, nextBoard);
        }
        this.pushAndRefreshAll({board: nextBoard});
    }

    private collectSettings(): ProcessedSettings {
        return processSettings({
            antiknight: this.antiknight.checked,
            antiking: this.antiking.checked,
            diagonals: this.diagonals.checked,
            anticonsecutiveOrthogonal: this.anticonsecutiveOrthogonal.checked,
            digitsNotInSamePosition: this.digitsNotInSamePosition.checked,
            irregular: this.irregular.checked,
            thermometers: this.thermometers.completed,
            cages: this.cages.completed,
            equalities: this.equalities.completed,
            consecutiveKropkiDots: this.consecutiveKropkiDots.completed,
            doubleKropkiDots: this.doubleKropkiDots.completed,
            betweenLines: this.betweenLines.completed,
            arrows: this.arrows.completed,
        });
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
