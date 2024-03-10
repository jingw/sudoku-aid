function buildEmptySelectedArray() {
    const result = [];
    for (let r = 0; r < 9; r++) {
        result.push(new Array(9));
    }
    return result;
}
export class Selection {
    constructor() {
        this.selected = buildEmptySelectedArray();
        this.currentlyAdding = true;
    }
    *[Symbol.iterator]() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.selected[r][c]) {
                    yield [r, c];
                }
            }
        }
    }
    isSelected(r, c) {
        return this.selected[r][c];
    }
    clear() {
        this.selected = buildEmptySelectedArray();
    }
    start(r, c, ctrlKey) {
        if (ctrlKey) {
            // add to selection or remove if already present
            this.currentlyAdding = !this.selected[r][c];
        }
        else {
            // otherwise reset selection
            this.clear();
            this.currentlyAdding = true;
        }
        this.selected[r][c] = this.currentlyAdding;
    }
    continue(r, c) {
        this.selected[r][c] = this.currentlyAdding;
    }
    move(dr, dc) {
        let count = 0;
        let sr = -1;
        let sc = -1;
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
        }
        else {
            return false;
        }
    }
    invert() {
        for (const arr of this.selected) {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = !arr[i];
            }
        }
    }
}
