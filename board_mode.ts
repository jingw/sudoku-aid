import * as html from "./html.js";
import * as sudoku from "./sudoku.js";

export abstract class BoardMode {
  abstract name: string;

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
  underConstruction: sudoku.Coordinate[] = [];
  allowDuplicateCells = false;

  abstract refresh(): void;

  abstract describe(i: number): string;
}

export abstract class CoordinateCollectingBoardMode<
  T,
  S extends SupportsConstruction<T> = SupportsConstruction<T>,
> extends BoardMode {
  constructor(protected readonly collector: S) {
    super();
  }

  protected finishButton(): HTMLButtonElement {
    return html.button("Finish", this.doFinish.bind(this));
  }

  private doFinish(): void {
    if (this.collector.underConstruction.length > 0) {
      this.collector.completed.push(
        this.finishConstruction(this.collector.underConstruction),
      );
      this.collector.underConstruction = [];
      this.collector.refresh();
    }
  }

  private doCancel(): void {
    this.collector.underConstruction = [];
    this.collector.refresh();
  }

  override render(): HTMLElement {
    return this.finishButton();
  }

  override onMouseDown(r: number, c: number): void {
    if (
      !this.collector.allowDuplicateCells &&
      sudoku.coordinatesContains(this.collector.underConstruction, [r, c])
    ) {
      // refuse to add duplicates
      return;
    }
    const last = this.collector.underConstruction.at(-1);
    if (last !== undefined) {
      if (r === last[0] && c === last[1]) {
        // refuse to add the same point twice in a row, regardless of allowDuplicateCells
        return;
      }
    }
    this.collector.underConstruction.push([r, c]);
    this.collector.refresh();
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

  protected abstract finishConstruction(
    coordinates: readonly sudoku.Coordinate[],
  ): T;
}

interface HasCoordinates {
  members: readonly sudoku.Coordinate[];
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
        if (sudoku.coordinatesContains(coordinates, [r, c])) {
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
