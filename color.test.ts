import * as color from "./color.js";

declare const QUnit: any;

QUnit.module("color");

QUnit.test("compositing", (assert: any) => {
  const white: color.Rgba = [255, 255, 255, 1];

  const black: color.Rgba = [0, 0, 0, 0.5];
  assert.deepEqual(color.composite(white, black), [127.5, 127.5, 127.5, 1]);

  const red: color.Rgba = [255, 0, 0, 0.9];
  assert.deepEqual(
    color.composite(white, red),
    [255, 25.499999999999993, 25.499999999999993, 1],
  );
});
