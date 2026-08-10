import { ProcessedSettings } from "../constraints/constraint.js";
import * as sudoku from "../sudoku.js";
import * as all from "./all.js";

declare const QUnit: any;

export function solve(
  settings: ProcessedSettings,
  board: sudoku.ReadonlyBoard,
): [sudoku.ReadonlyBoard, number] {
  const MAX_ITERATIONS = 100;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const next = sudoku.clone(board);
    all.applyAllStrategies(settings, board, next);
    if (sudoku.areBoardsEqual(board, next)) {
      return [board, i];
    }
    board = next;
  }
  return [board, MAX_ITERATIONS];
}

QUnit.assert.cleanExceptForDigit = function (
  board: sudoku.ReadonlyBoard,
  digit: number,
): void {
  const EMPTY_CELL = sudoku.emptyCell(board.length);
  const digitMask = sudoku.bitMask(digit);
  const notDigitMask = EMPTY_CELL & ~digitMask;
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board.length; c++) {
      const set = board[r][c];
      if (
        set !== EMPTY_CELL &&
        set !== digitMask &&
        set !== notDigitMask &&
        set !== 0
      ) {
        this.pushResult({
          result: false,
          message:
            sudoku.coordinateToStr(r, c) +
            ` has a change other than digit ${digit}:\n` +
            sudoku.dump(board, { verbose: true }),
        });
        return;
      }
    }
  }
};
