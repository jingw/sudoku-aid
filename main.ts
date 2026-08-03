import * as arrows from "./arrows.js";
import * as between from "./between.js";
import * as board from "./board.js";
import * as cages from "./cages.js";
import * as color from "./color.js";
import * as equalities from "./equalities.js";
import * as general_boolean from "./general_boolean.js";
import * as german_whispers from "./german_whispers.js";
import * as html from "./html.js";
import * as kropki from "./kropki.js";
import * as sudoku from "./sudoku.js";
import * as thermometers from "./thermometers.js";
import { BoardMode, DeleteBoardMode } from "./board_mode.js";
import { ProcessedSettings, processSettings } from "./strategies/base.js";
import { History } from "./history.js";
import { applyAllStrategies } from "./strategies/all.js";
import { eliminateFish } from "./strategies/fish.js";
import { eliminateIntersections } from "./strategies/intersections.js";
import { eliminateNakedSets } from "./strategies/naked_sets.js";
import { eliminateObvious } from "./strategies/obvious.js";
import { eliminateXYZWing } from "./strategies/xyz_wing.js";
import { findHiddenSingles } from "./strategies/hidden_singles.js";

const KEY_TO_MOVEMENT: Record<string, readonly [number, number]> = {
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  Tab: [0, 1],
};

export class ResizableSudokuUI {
  private readonly boardSize = this.buildBoardSize();
  private readonly inner = document.createElement("div");

  constructor(root: HTMLElement) {
    root.append(this.inner);
    root.append(html.label(this.boardSize, "Board size: ", true));

    new SudokuUI(this.inner, parseInt(this.boardSize.value));
    this.boardSize.addEventListener("change", () => {
      this.inner.innerHTML = "";
      new SudokuUI(this.inner, parseInt(this.boardSize.value));
    });
  }

  private buildBoardSize(): HTMLInputElement {
    const element = document.createElement("input");
    element.type = "number";
    element.min = "1";
    element.max = "9";
    element.className = "board-size";
    element.value = "9";
    return element;
  }
}

export class SudokuUI {
  private readonly arrows: arrows.Arrows;
  private readonly betweenLines: between.BetweenLines;
  private readonly cages: cages.Cages;
  private readonly equalities: equalities.EqualityConstraints;
  private readonly thermometers: thermometers.Thermometers;
  private readonly consecutiveKropkiDots: kropki.KropkiDots;
  private readonly doubleKropkiDots: kropki.KropkiDots;
  private readonly germanWhispers: german_whispers.GermanWhispers;
  private readonly generalBooleanConstraints: general_boolean.GeneralBooleanConstraints;
  private readonly history: History<board.State>;
  private readonly boardUI: board.UI;

  private readonly antiknight = html.checkbox();
  private readonly antiking = html.checkbox();
  private readonly diagonals = html.checkbox();
  private readonly nonconsecutive = html.checkbox();
  private readonly digitsNotInSamePosition = html.checkbox();
  private readonly irregular = html.checkbox();
  private readonly index159 = html.checkbox();
  private readonly startAt0 = html.checkbox();

  private readonly allModes: BoardMode[];
  private currentModeIndex = 0;
  private currentModeUI: HTMLElement;
  private startDigit = 1;
  private findButtons: HTMLElement;

  private readonly textInput = document.createElement("textarea");

  constructor(
    root: HTMLElement,
    private readonly boardSize: number,
  ) {
    const startingHighlights = [];
    for (let r = 0; r < 9; r++) {
      startingHighlights.push(new Array<number>(9).fill(0));
    }

    this.history = new History({
      board: sudoku.emptyBoard(boardSize),
      highlights: startingHighlights,
    });

    this.boardUI = new board.UI(boardSize, () => this.history.current());

    const boundingRectOfCell = this.boardUI.boundingRectOfCell.bind(
      this.boardUI,
    );
    const centerOfCell = this.boardUI.centerOfCell.bind(this.boardUI);

    this.arrows = new arrows.Arrows(centerOfCell);
    this.thermometers = new thermometers.Thermometers(centerOfCell);
    this.betweenLines = new between.BetweenLines(centerOfCell);
    this.cages = new cages.Cages(boundingRectOfCell);
    this.equalities = new equalities.EqualityConstraints(boundingRectOfCell);
    this.germanWhispers = new german_whispers.GermanWhispers(centerOfCell);
    this.generalBooleanConstraints =
      new general_boolean.GeneralBooleanConstraints(centerOfCell);

    this.consecutiveKropkiDots = new kropki.KropkiDots(centerOfCell, true);
    this.doubleKropkiDots = new kropki.KropkiDots(centerOfCell, false);

    const boardDiv = document.createElement("div");
    boardDiv.className = "board";
    boardDiv.append(this.arrows.render());
    boardDiv.append(this.thermometers.render());
    boardDiv.append(this.betweenLines.render());
    boardDiv.append(this.germanWhispers.render());
    boardDiv.append(this.generalBooleanConstraints.render());
    boardDiv.append(this.consecutiveKropkiDots.render());
    boardDiv.append(this.doubleKropkiDots.render());
    // render text last
    boardDiv.append(this.cages.render());
    boardDiv.append(this.equalities.render());
    boardDiv.append(this.boardUI.render());
    root.append(boardDiv);

    this.allModes = [
      new board.SelectionMode(this.boardUI),
      new thermometers.AddMode(this.thermometers),
      new cages.AddMode(this.cages),
      new cages.DisplaySumsMode(
        this.cages,
        () => this.history.current().board,
        () => this.startDigit,
      ),
      new equalities.AddMode(this.equalities),
      new kropki.AddMode(this.consecutiveKropkiDots, true),
      new kropki.AddMode(this.doubleKropkiDots, false),
      new between.AddMode(this.betweenLines),
      new arrows.AddMode(this.arrows),
      new german_whispers.AddMode(this.germanWhispers),
      new general_boolean.AddMode(this.generalBooleanConstraints),
      new DeleteBoardMode([
        this.thermometers,
        this.cages,
        this.equalities,
        this.consecutiveKropkiDots,
        this.doubleKropkiDots,
        this.betweenLines,
        this.arrows,
        this.germanWhispers,
        this.generalBooleanConstraints,
      ]),
    ];
    const currentMode = this.allModes[this.currentModeIndex];
    this.currentModeUI = currentMode.render();
    this.boardUI.mode = currentMode;

    root.append(this.renderOptions());
    root.append(this.renderHighlightButtons());
    root.append(this.renderStepControl());
    this.findButtons = this.renderFindButtons(this.startDigit);
    root.append(this.findButtons);
    root.append(this.renderTextInput());

    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("mousedown", (e: MouseEvent) => {
      const isTargetBoring =
        e.target instanceof HTMLBodyElement ||
        e.target instanceof HTMLDivElement ||
        e.target instanceof HTMLParagraphElement ||
        e.target instanceof HTMLUListElement ||
        e.target instanceof HTMLLIElement;
      if (isTargetBoring && e.buttons === 1) {
        this.boardUI.selection.clear();
        this.boardUI.refreshAll();
      }
    });

    window.addEventListener("beforeunload", (e: BeforeUnloadEvent) => {
      if (!this.history.isEmpty()) {
        e.preventDefault();
      }
    });
  }

  private renderOptions(): HTMLElement {
    const options = document.createElement("div");
    options.className = "options";

    options.append(html.label(this.antiknight, "Antiknight"));
    options.append(html.label(this.antiking, "Antiking"));
    options.append(html.label(this.diagonals, "Diagonals"));
    options.append(html.label(this.nonconsecutive, "Nonconsecutive"));
    if (this.boardSize in sudoku.SIZE_TO_BOX_COUNTS) {
      options.append(
        html.label(this.digitsNotInSamePosition, "Digits not in same position"),
      );
      options.append(html.label(this.irregular, "Irregular"));
    }
    if (this.boardSize === 9) {
      options.append(html.label(this.index159, "159 indexing"));
    }
    options.append(html.label(this.startAt0, "Start at 0"));

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
        this.transitionBoardMode(
          parseInt((e.target as HTMLInputElement).value),
        );
      });
    }

    options.append(form);

    options.append(this.currentModeUI);

    this.irregular.addEventListener("change", () => {
      this.boardUI.irregular = this.irregular.checked;
    });
    if (!(this.boardSize in sudoku.SIZE_TO_BOX_COUNTS)) {
      this.boardUI.irregular = true;
    }

    this.startAt0.addEventListener("change", () => {
      this.startDigit = this.startAt0.checked ? 0 : 1;
      this.boardUI.startDigit = this.startDigit;
      const newFindButtons = this.renderFindButtons(this.startDigit);
      this.findButtons.replaceWith(newFindButtons);
      this.findButtons = newFindButtons;
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
    div.append(
      html.button("Hidden singles", () => this.step(findHiddenSingles)),
    );
    div.append(
      html.button("Intersections", () => this.step(eliminateIntersections)),
    );
    div.append(html.button("Naked sets", () => this.step(eliminateNakedSets)));
    div.append(html.button("Fish", () => this.step(eliminateFish)));
    div.append(html.button("XY(Z) wings", () => this.step(eliminateXYZWing)));
    div.append(html.button("All", () => this.step()));
    return div;
  }

  private renderFindButtons(startDigit: number): HTMLElement {
    const div = document.createElement("div");
    div.className = "find";
    div.append("Find: ");
    for (let digit = 1; digit <= this.boardSize; digit++) {
      div.append(
        html.button((digit + startDigit - 1).toString(), () =>
          this.toggleFind(digit),
        ),
      );
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
    if (
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLInputElement
    ) {
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

    const EMPTY_CELL = sudoku.emptyCell(this.boardSize);
    if (e.key === "Backspace" || e.key === "Delete") {
      const nextBoard = sudoku.clone(this.history.current().board);
      for (const [r, c] of this.boardUI.selection) {
        if (e.ctrlKey) {
          nextBoard[r][c] = 0;
        } else {
          nextBoard[r][c] = EMPTY_CELL;
        }
      }
      this.pushAndRefreshAll({ board: nextBoard });
      return;
    }

    const minChar = String.fromCharCode("0".charCodeAt(0) + this.startDigit);
    const maxChar = String.fromCharCode(
      "0".charCodeAt(0) + this.boardSize + this.startDigit - 1,
    );
    if (e.key.length === 1 && e.key >= minChar && e.key <= maxChar) {
      const n = e.key.charCodeAt(0) - "0".charCodeAt(0);
      const nextBoard = sudoku.clone(this.history.current().board);
      for (const [r, c] of this.boardUI.selection) {
        if (e.ctrlKey) {
          nextBoard[r][c] ^= sudoku.bitMask(n - this.startDigit + 1);
        } else {
          nextBoard[r][c] = sudoku.bitMask(n - this.startDigit + 1);
        }
      }
      this.pushAndRefreshAll({ board: nextBoard });
      return;
    }

    this.allModes[this.currentModeIndex].onKeyDown(e);
  }

  private highlight(index: number): void {
    const newHighlights = this.history
      .current()
      .highlights.map((x) => x.slice());
    for (const [r, c] of this.boardUI.selection) {
      newHighlights[r][c] = index;
    }
    this.pushAndRefreshAll({ highlights: newHighlights });
  }

  private toggleFind(digit: number): void {
    const mask = sudoku.bitMask(digit);
    if (this.boardUI.find === mask) {
      this.boardUI.find = 0;
    } else {
      this.boardUI.find = mask;
    }
  }

  private step(
    fn?: (
      settings: ProcessedSettings,
      orig: sudoku.ReadonlyBoard,
      next: sudoku.Board,
    ) => void,
  ): void {
    const origBoard = this.history.current().board;
    const nextBoard = sudoku.clone(origBoard);
    const settings = this.collectSettings();
    if (fn) {
      fn(settings, origBoard, nextBoard);
    } else {
      applyAllStrategies(settings, origBoard, nextBoard);
    }
    this.pushAndRefreshAll({ board: nextBoard });
  }

  private collectSettings(): ProcessedSettings {
    return processSettings({
      boardSize: this.boardSize,
      antiknight: this.antiknight.checked,
      antiking: this.antiking.checked,
      diagonals: this.diagonals.checked,
      nonconsecutive: this.nonconsecutive.checked,
      digitsNotInSamePosition: this.digitsNotInSamePosition.checked,
      irregular: this.irregular.checked,
      index159: this.index159.checked,
      startDigit: this.startAt0.checked ? 0 : 1,
      thermometers: this.thermometers.completed,
      cages: this.cages.completed,
      equalities: this.equalities.completed,
      consecutiveKropkiDots: this.consecutiveKropkiDots.completed,
      doubleKropkiDots: this.doubleKropkiDots.completed,
      betweenLines: this.betweenLines.completed,
      arrows: this.arrows.completed,
      germanWhispers: this.germanWhispers.completed,
      generalBooleanConstraints: this.generalBooleanConstraints.completed,
    });
  }

  private loadFromText(): void {
    const newBoard = sudoku.parse(
      this.textInput.value,
      this.boardSize,
      this.startDigit,
    );
    this.pushAndRefreshAll({ board: newBoard });
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
