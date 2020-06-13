import { History } from "./history.js";

declare const QUnit: any;

QUnit.module("history");

QUnit.test("duplicates should be ignored", (assert: any) => {
    const history = new History<{x: number}>({x: 100});
    history.push({x: 50});
    history.push({x: 50});
    history.push({x: 100});
    assert.equal(history.current().x, 100);
    history.undo();
    assert.equal(history.current().x, 50);
    history.undo();
    assert.equal(history.current().x, 100);
});

QUnit.test("undo/redo at border should noop", (assert: any) => {
    const history = new History<{x: number}>({x: 100});
    history.push({x: 20});
    assert.equal(history.current().x, 20);
    history.redo();
    assert.equal(history.current().x, 20);
    history.undo();
    assert.equal(history.current().x, 100);
    history.undo();
    assert.equal(history.current().x, 100);
});

QUnit.test("should accept partial updates", (assert: any) => {
    const history = new History<{x: number; y: string}>({x: 100, y: "a"});
    history.push({y: "b"});
    assert.deepEqual(history.current(), {x: 100, y: "b"});
    history.push({x: 100});
    assert.deepEqual(history.current(), {x: 100, y: "b"});
    history.undo();
    assert.deepEqual(history.current(), {x: 100, y: "a"});
});
