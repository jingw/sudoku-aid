import { Selection } from "./selection.js";
import QUnit from "qunit";

function makeSelection(assert: Assert): Selection {
  const selection = new Selection(9);
  selection.start(1, 3, false);
  selection.continue(0, 0);
  assert.deepEqual(Array.from(selection), [
    [0, 0],
    [1, 3],
  ]);
  return selection;
}

QUnit.module("selection");

QUnit.test("select with ctrl should add", (assert: Assert) => {
  const selection = makeSelection(assert);
  selection.start(5, 4, true);
  assert.deepEqual(Array.from(selection), [
    [0, 0],
    [1, 3],
    [5, 4],
  ]);
  selection.continue(5, 5);
  assert.deepEqual(Array.from(selection), [
    [0, 0],
    [1, 3],
    [5, 4],
    [5, 5],
  ]);
});

QUnit.test("select with ctrl should remove", (assert: Assert) => {
  const selection = makeSelection(assert);
  selection.start(1, 3, true);
  assert.deepEqual(Array.from(selection), [[0, 0]]);
  selection.continue(0, 0);
  assert.deepEqual(Array.from(selection), []);
});

QUnit.test("select without ctrl should reset", (assert: Assert) => {
  const selection = makeSelection(assert);
  selection.start(5, 4, false);
  assert.deepEqual(Array.from(selection), [[5, 4]]);
  selection.continue(5, 5);
  assert.deepEqual(Array.from(selection), [
    [5, 4],
    [5, 5],
  ]);
});

QUnit.test("isSelected", (assert: Assert) => {
  const selection = makeSelection(assert);
  assert.true(selection.isSelected(1, 3));
  assert.true(selection.isSelected(0, 0));
  assert.false(selection.isSelected(3, 1));
});

QUnit.test("moving multiple cells should do nothing", (assert: Assert) => {
  const selection = makeSelection(assert);
  assert.false(selection.move(1, 0));
  assert.deepEqual(Array.from(selection), [
    [0, 0],
    [1, 3],
  ]);
});

QUnit.test("moving one cell should work", (assert: Assert) => {
  const selection = new Selection(9);
  selection.start(0, 8, false);
  assert.true(selection.move(0, 1));
  // expect wrap to next row
  assert.deepEqual(Array.from(selection), [[1, 0]]);
  assert.true(selection.move(0, -1));
  // and the reverse
  assert.deepEqual(Array.from(selection), [[0, 8]]);

  // go to beginning and stay there
  assert.true(selection.move(-1, 0));
  assert.deepEqual(Array.from(selection), [[0, 0]]);
  assert.true(selection.move(0, -1));
  assert.deepEqual(Array.from(selection), [[0, 0]]);
});

QUnit.test("invert", (assert: Assert) => {
  const selection = new Selection(9);
  selection.start(0, 0, false);
  assert.strictEqual(Array.from(selection).length, 1);
  selection.invert();
  assert.strictEqual(Array.from(selection).length, 9 * 9 - 1);
});
