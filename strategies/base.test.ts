import * as base from "./base.js";

declare const QUnit: any;

QUnit.module("strategies/base");

QUnit.test("forEachSubset", (assert: any) => {
    const results1: string[] = [];
    base.forEachSubset(1, [1, 2, 3, 4], (x) => results1.push(x.join("")));
    assert.deepEqual(results1, ["1", "2", "3", "4"]);

    const results2: string[] = [];
    base.forEachSubset(2, [1, 2, 3, 4], (x) => results2.push(x.join("")));
    assert.deepEqual(results2, ["12", "13", "14", "23", "24", "34"]);

    const results3: string[] = [];
    base.forEachSubset(3, [1, 2, 3, 4], (x) => results3.push(x.join("")));
    assert.deepEqual(results3, ["123", "124", "134", "234"]);

    const results4: string[] = [];
    base.forEachSubset(4, [1, 2, 3, 4], (x) => results4.push(x.join("")));
    assert.deepEqual(results4, ["1234"]);
});
