import * as sudoku from "./sudoku.js";

export abstract class BoardMode {
    /* eslint-disable @typescript-eslint/no-unused-vars */

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
}

export abstract class SupportsConstruction<T> {
    readonly completed: T[] = [];
    underConstruction: sudoku.Coordinate[] = [];

    abstract refresh(): void;
}

export abstract class CoordinateCollectingBoardMode<T, S extends SupportsConstruction<T> = SupportsConstruction<T>> extends BoardMode {
    constructor(protected readonly collector: S) {
        super();
    }

    protected finishButton(): HTMLButtonElement {
        const finish = document.createElement("button");
        finish.textContent = "Finish";
        finish.addEventListener("click", () => {
            if (this.collector.underConstruction.length > 0) {
                this.collector.completed.push(
                    this.finishConstruction(this.collector.underConstruction),
                );
                this.collector.underConstruction = [];
                this.collector.refresh();
            }
        });
        return finish;
    }

    render(): HTMLElement {
        return this.finishButton();
    }

    onMouseDown(r: number, c: number): void {
        if (sudoku.coordinatesContains(this.collector.underConstruction, [r, c])) {
            // refuse to add duplicates
            return;
        }
        this.collector.underConstruction.push([r, c]);
        this.collector.refresh();
    }

    onDrag = this.onMouseDown;

    onLeave(): void {
        this.collector.underConstruction = [];
        this.collector.refresh();
    }

    protected abstract finishConstruction(coordinates: readonly sudoku.Coordinate[]): T;
}

type HasCoordinates = readonly sudoku.Coordinate[] | {members: readonly sudoku.Coordinate[]}

export abstract class CoordinateCollectingDeleteBoardMode<T extends HasCoordinates> extends BoardMode {
    constructor(protected readonly collector: SupportsConstruction<T>) {
        super();
    }

    onMouseDown(r: number, c: number): void {
        for (let i = this.collector.completed.length - 1; i >= 0; i--) {
            const coordinates = toCoordinates(this.collector.completed[i]);
            if (sudoku.coordinatesContains(coordinates, [r, c])) {
                this.collector.completed.splice(i, 1);
                this.collector.refresh();
                return;
            }
        }
    }
}

function toCoordinates(item: HasCoordinates): readonly sudoku.Coordinate[] {
    if ("members" in item) {
        return item.members;
    } else {
        return item;
    }
}
