import { Coordinate } from "./sudoku.js";

function buildEmptySelectedArray(): boolean[][] {
    const result = [];
    for (let r = 0; r < 9; r++) {
        result.push(new Array<boolean>(9));
    }
    return result;
}

export class Selection {
    private selected: boolean[][] = buildEmptySelectedArray();
    private currentlyAdding = true;

    *[Symbol.iterator](): Iterator<Coordinate> {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.selected[r][c]) {
                    yield [r, c];
                }
            }
        }
    }

    isSelected(r: number, c: number): boolean {
        return this.selected[r][c];
    }

    clear(): void {
        this.selected = buildEmptySelectedArray();
    }

    start(r: number, c: number, ctrlKey: boolean): void {
        if (ctrlKey) {
            // add to selection or remove if already present
            this.currentlyAdding = !this.selected[r][c];
        } else {
            // otherwise reset selection
            this.clear();
            this.currentlyAdding = true;
        }
        this.selected[r][c] = this.currentlyAdding;
    }

    continue(r: number, c: number): void {
        this.selected[r][c] = this.currentlyAdding;
    }
}
