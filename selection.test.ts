import { Selection } from "./selection.js";

declare const QUnit: any;

function makeSelection(assert: any): Selection {
    const selection = new Selection();
    selection.start(1, 3, false);
    selection.continue(0, 0);
    assert.deepEqual([[0, 0], [1, 3]], Array.from(selection));
    return selection;
}

QUnit.module("selection");

QUnit.test("select with ctrl should add", (assert: any) => {
    const selection = makeSelection(assert);
    selection.start(5, 4, true);
    assert.deepEqual([[0, 0], [1, 3], [5, 4]], Array.from(selection));
    selection.continue(5, 5);
    assert.deepEqual([[0, 0], [1, 3], [5, 4], [5, 5]], Array.from(selection));
});

QUnit.test("select with ctrl should remove", (assert: any) => {
    const selection = makeSelection(assert);
    selection.start(1, 3, true);
    assert.deepEqual([[0, 0]], Array.from(selection));
    selection.continue(0, 0);
    assert.deepEqual([], Array.from(selection));
});

QUnit.test("select without ctrl should reset", (assert: any) => {
    const selection = makeSelection(assert);
    selection.start(5, 4, false);
    assert.deepEqual([[5, 4]], Array.from(selection));
    selection.continue(5, 5);
    assert.deepEqual([[5, 4], [5, 5]], Array.from(selection));
});

QUnit.test("isSelected", (assert: any) => {
    const selection = makeSelection(assert);
    assert.ok(selection.isSelected(1, 3));
    assert.ok(selection.isSelected(0, 0));
    assert.notOk(selection.isSelected(3, 1));
});

QUnit.test("moving multiple cells should do nothing", (assert: any) => {
    const selection = makeSelection(assert);
    assert.notOk(selection.move(1, 0));
    assert.deepEqual([[0, 0], [1, 3]], Array.from(selection));
});

QUnit.test("moving one cell should work", (assert: any) => {
    const selection = new Selection();
    selection.start(0, 8, false);
    assert.ok(selection.move(0, 1));
    // expect wrap to next row
    assert.deepEqual([[1, 0]], Array.from(selection));
    assert.ok(selection.move(0, -1));
    // and the reverse
    assert.deepEqual([[0, 8]], Array.from(selection));

    // go to beginning and stay there
    assert.ok(selection.move(-1, 0));
    assert.deepEqual([[0, 0]], Array.from(selection));
    assert.ok(selection.move(0, -1));
    assert.deepEqual([[0, 0]], Array.from(selection));
});
