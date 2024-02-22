import * as base from "./base.js";
import * as sudoku from "../sudoku.js";
import { eliminateFromGeneralBooleanConstraints } from "./general_boolean.js";

declare const QUnit: any;

QUnit.module("strategies/general_boolean");

QUnit.test("eliminateFromGeneralBooleanConstraints", (assert: any) => {
  const settings = base.processSettings({
    generalBooleanConstraints: [
      {
        members: [
          [0, 0],
          [0, 1],
          [0, 2],
        ],
        expression: "x[0] === 1 && x[1] === sum([x[-1], 2])",
      },
    ],
  });
  const board = sudoku.emptyBoard();
  board[0][1] &= sudoku.bitMask(5);
  const next = sudoku.clone(board);
  eliminateFromGeneralBooleanConstraints(settings, board, next);
  assert.equal(
    sudoku.dump(next),
    `\
153 ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...`,
  );
});
