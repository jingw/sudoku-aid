import * as color from "./color.js";

declare const QUnit: any;

QUnit.module("color");

QUnit.test("compositing with white should invert withAlpha", (assert: any) => {
    const clr = color.withAlpha(100, 200, 150, 0.6);
    const onWhite = color.composite([255, 255, 255, 1], clr);
    assert.deepEqual(onWhite, [100, 200, 150, 1]);
});
