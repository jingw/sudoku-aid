function buildEmptySelectedArray(boardSize) {
    const result = [];
    for (let r = 0; r < boardSize; r++) {
        result.push(new Array(boardSize));
    }
    return result;
}
export class Selection {
    boardSize;
    selected;
    currentlyAdding = true;
    constructor(boardSize) {
        this.boardSize = boardSize;
        this.selected = buildEmptySelectedArray(boardSize);
    }
    *[Symbol.iterator]() {
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
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
        this.selected = buildEmptySelectedArray(this.boardSize);
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
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.selected[r][c]) {
                    count += 1;
                    sr = r;
                    sc = c;
                }
            }
        }
        if (count === 1) {
            this.selected[sr][sc] = false;
            let pos = sr * this.boardSize + sc;
            pos += dr * this.boardSize;
            pos += dc;
            pos = Math.min(Math.max(pos, 0), this.boardSize * this.boardSize - 1);
            sr = Math.floor(pos / this.boardSize);
            sc = pos % this.boardSize;
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
