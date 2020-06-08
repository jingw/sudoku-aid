import { History } from "./history.js";

declare const QUnit: any;

QUnit.module("history");

QUnit.test("duplicates should be ignored", (assert: any) => {
    const history = new History<number>(100);
    history.push(50);
    history.push(50);
    history.push(100);
    assert.equal(history.current(), 100);
    history.undo();
    assert.equal(history.current(), 50);
    history.undo();
    assert.equal(history.current(), 100);
});

QUnit.test("undo/redo at border should noop", (assert: any) => {
    const history = new History<number>(100);
    history.push(20);
    assert.equal(history.current(), 20);
    history.redo();
    assert.equal(history.current(), 20);
    history.undo();
    assert.equal(history.current(), 100);
    history.undo();
    assert.equal(history.current(), 100);
});
