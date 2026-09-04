import * as color from "./color.js";
QUnit.module("color");
QUnit.test("compositing", (assert) => {
    const white = [255, 255, 255, 1];
    const black = [0, 0, 0, 0.5];
    assert.deepEqual(color.composite(white, black), [127.5, 127.5, 127.5, 1]);
    const red = [255, 0, 0, 0.9];
    assert.deepEqual(color.composite(white, red), [255, 25.499999999999993, 25.499999999999993, 1]);
});
