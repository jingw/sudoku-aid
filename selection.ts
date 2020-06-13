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

    move(dr: number, dc: number): boolean {
        let count = 0;
        let sr = -1, sc = -1;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.selected[r][c]) {
                    count += 1;
                    sr = r;
                    sc = c;
                }
            }
        }
        if (count === 1) {
            this.selected[sr][sc] = false;
            let pos = sr * 9 + sc;
            pos += dr * 9;
            pos += dc;
            pos = Math.min(Math.max(pos, 0), 9 * 9 - 1);
            sr = Math.floor(pos / 9);
            sc = pos % 9;
            this.selected[sr][sc] = true;
            return true;
        } else {
            return false;
        }
    }
}
