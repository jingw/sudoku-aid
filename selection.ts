import { Coordinate } from "./sudoku.js";

function buildEmptySelectedArray(boardSize: number): boolean[][] {
  const result = [];
  for (let r = 0; r < boardSize; r++) {
    result.push(new Array<boolean>(boardSize));
  }
  return result;
}

export class Selection {
  private selected: boolean[][];
  private currentlyAdding = true;

  constructor(private readonly boardSize: number) {
    this.selected = buildEmptySelectedArray(boardSize);
  }

  *[Symbol.iterator](): Iterator<Coordinate> {
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
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
    this.selected = buildEmptySelectedArray(this.boardSize);
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
    } else {
      return false;
    }
  }

  invert(): void {
    for (const arr of this.selected) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = !arr[i];
      }
    }
  }
}
