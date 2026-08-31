/* eslint-disable @typescript-eslint/dot-notation --
 * using obj["x"] instead of obj.x to cheat private fields
 */
import * as sudoku from "../sudoku.js";
import { BruteForceConstraint } from "./constraint.js";
import { processSettings } from "./processor.js";

declare const QUnit: any;

QUnit.module("constraints/constraint");

class TestConstraint extends BruteForceConstraint {
  isValid(digits: readonly number[]): boolean {
    return digits[0] === 1;
  }
}

QUnit.test(
  "BruteForceConstraint gives up with too many possibilities",
  (assert: any) => {
    const members: sudoku.Coordinate[] = [];
    for (let i = 0; i < 8; i++) {
      members.push([0, i]);
    }
    const constraint = new TestConstraint(members);
    const settings = processSettings({ constraints: [constraint] });
    const board = sudoku.emptyBoard(9);
    const next = sudoku.clone(board);
    constraint.performElimination(settings, board, next);
    assert.deepEqual(board, next);
    assert.deepEqual(constraint["cachedCandidatesPerMember"], []);
    assert.equal(constraint["cachedRequiredDigits"], 0);
    assert.notEqual(constraint["cachedBoardStr"], "");
  },
);

QUnit.test(
  "BruteForceConstraint works with sufficiently few possibilities",
  (assert: any) => {
    const members: sudoku.Coordinate[] = [];
    for (let i = 0; i < 2; i++) {
      members.push([0, i]);
    }
    const constraint = new TestConstraint(members);
    const settings = processSettings({ constraints: [constraint] });
    const board = sudoku.emptyBoard(9);
    const next = sudoku.clone(board);
    const EMPTY_CELL = sudoku.emptyCell(board.length);
    constraint.performElimination(settings, board, next);
    assert.equal(next[0][0], sudoku.bitMask(1));
    assert.equal(next[0][1], EMPTY_CELL & ~sudoku.bitMask(1));
    assert.deepEqual(constraint["cachedCandidatesPerMember"], [
      sudoku.bitMask(1),
      EMPTY_CELL & ~sudoku.bitMask(1),
    ]);
    assert.equal(constraint["cachedRequiredDigits"], sudoku.bitMask(1));
    assert.notEqual(constraint["cachedBoardStr"], "");
  },
);
