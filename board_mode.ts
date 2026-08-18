import * as html from "./html.js";
import { Coordinate, coordinatesContains } from "./sudoku.js";

export abstract class BoardMode {
  abstract readonly name: string;

  render(): HTMLElement {
    return document.createElement("div");
  }
  onMouseDown(_r: number, _c: number, _e: MouseEvent): void {
    // nothing by default
  }
  onDrag(_r: number, _c: number, _e: MouseEvent): void {
    // nothing by default
  }
  onLeave(): void {
    // nothing by default
  }
  onKeyDown(_e: KeyboardEvent): void {
    // nothing by default
  }
}

export abstract class SupportsConstruction<T> {
  readonly completed: T[] = [];
  underConstruction: T | null = null;

  abstract refresh(): void;

  abstract describe(i: number): string;
}

export abstract class CoordinateCollectingBoardMode<T> extends BoardMode {
  private cellsUnderConstruction: Coordinate[] = [];
  protected readonly allowDuplicateCells: boolean = false;

  constructor(protected readonly collector: SupportsConstruction<T>) {
    super();
  }

  protected finishButton(): HTMLButtonElement {
    return html.button("Finish", this.doFinish.bind(this));
  }

  private doFinish(): void {
    if (this.cellsUnderConstruction.length > 0) {
      this.collector.completed.push(
        this.finishConstruction(this.cellsUnderConstruction),
      );
      this.cellsUnderConstruction = [];
      this.collector.underConstruction = null;
      this.collector.refresh();
    }
  }

  private doCancel(): void {
    this.cellsUnderConstruction = [];
    this.collector.underConstruction = null;
    this.collector.refresh();
  }

  override render(): HTMLElement {
    return this.finishButton();
  }

  updateUnderConstruction(): void {
    if (this.cellsUnderConstruction.length > 0) {
      this.collector.underConstruction = this.finishConstruction(
        this.cellsUnderConstruction,
      );
      this.collector.refresh();
    }
  }

  override onMouseDown(r: number, c: number): void {
    if (
      !this.allowDuplicateCells &&
      coordinatesContains(this.cellsUnderConstruction, [r, c])
    ) {
      // refuse to add duplicates
      return;
    }
    const last = this.cellsUnderConstruction.at(-1);
    if (last !== undefined) {
      if (r === last[0] && c === last[1]) {
        // refuse to add the same point twice in a row, regardless of allowDuplicateCells
        return;
      }
    }
    this.cellsUnderConstruction.push([r, c]);
    this.updateUnderConstruction();
  }

  override onDrag(r: number, c: number): void {
    this.onMouseDown(r, c);
  }

  override onLeave(): void {
    this.doCancel();
  }

  override onKeyDown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      this.doFinish();
    } else if (e.key === "Escape") {
      this.doCancel();
    }
  }

  protected abstract finishConstruction(coordinates: readonly Coordinate[]): T;
}

export interface HasCoordinates {
  members: readonly Coordinate[];
}

export class DeleteBoardMode extends BoardMode {
  name = "Delete";

  constructor(
    protected readonly collectors: SupportsConstruction<HasCoordinates>[],
  ) {
    super();
  }

  override onMouseDown(r: number, c: number): void {
    const candidates: [SupportsConstruction<HasCoordinates>, number][] = [];
    for (const collector of this.collectors) {
      for (let i = 0; i < collector.completed.length; i++) {
        const coordinates = collector.completed[i].members;
        if (coordinatesContains(coordinates, [r, c])) {
          candidates.push([collector, i]);
        }
      }
    }
    if (candidates.length === 1) {
      const [collector, i] = candidates[0];
      collector.completed.splice(i, 1);
      collector.refresh();
    } else if (candidates.length > 1) {
      const dialog = document.createElement("dialog");
      for (const [collector, i] of candidates) {
        const button = html.button(collector.describe(i), () => {
          collector.completed.splice(i, 1);
          collector.refresh();
          dialog.close();
        });
        dialog.appendChild(button);
        dialog.appendChild(document.createElement("br"));
      }
      const cancel = html.button("Cancel", () => {
        dialog.close();
      });
      dialog.addEventListener("close", () => {
        dialog.remove();
      });
      dialog.appendChild(cancel);
      document.body.appendChild(dialog);
      dialog.showModal();
    }
  }
}
