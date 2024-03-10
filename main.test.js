/* eslint-disable @typescript-eslint/dot-notation --
 * using obj["x"] instead of obj.x to cheat private fields
 */
import * as sudoku from "./sudoku.js";
import { SudokuUI } from "./main.js";
function count(s, re) {
    var _a;
    return ((_a = s.match(re)) !== null && _a !== void 0 ? _a : []).length;
}
function transitionBoardMode(ui, root, index) {
    if (navigator.userAgent.includes("Firefox")) {
        root.querySelectorAll("input[name=mode]")[index].click();
    }
    else {
        ui["transitionBoardMode"](index);
    }
}
QUnit.module("main");
QUnit.test("basic rendering", (assert) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);
    const board = sudoku.emptyBoard();
    board[0][0] &= ~1;
    board[0][1] = 1;
    board[0][2] = 0;
    ui["history"].push({ board: board });
    ui["boardUI"].refreshAll();
    assert.ok(root.innerHTML.includes("234<br>567<br>89"));
    assert.ok(root.innerHTML.includes(">1</td>"));
    assert.ok(root.innerHTML.includes(">X</td>"));
});
QUnit.test("find", (assert) => {
    var _a;
    const root = document.createElement("div");
    const ui = new SudokuUI(root);
    ui["textInput"].value = "123456789".repeat(9);
    const loadButton = root.querySelector("div:nth-child(6) > button:nth-child(1)");
    assert.equal(loadButton.textContent, "Load from text");
    loadButton.click();
    assert.equal(root.innerHTML.match(/color: rgba\(152, 251, 152, 0\.5\)/g), null);
    // +1 for the highlight button
    assert.equal(((_a = root.innerHTML.match(/color: rgba\(0, 0, 0, 0\)/g)) !== null && _a !== void 0 ? _a : []).length, 9 * 9 + 1);
    const find2Button = root.querySelector(".find > button:nth-child(2)");
    assert.equal(find2Button.textContent, "2");
    find2Button.click();
    assert.equal(count(root.innerHTML, /color: rgba\(3, 192, 60, 0\.5\)/g), 9);
    assert.equal(count(root.innerHTML, /color: rgba\(0, 0, 0, 0\)/g), 9 * 8 + 1);
});
QUnit.test("select and highlight", (assert) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);
    ui["boardUI"]["_mode"].onMouseDown(0, 0, new MouseEvent(""));
    ui["boardUI"]["_mode"].onDrag(1, 0, new MouseEvent(""));
    ui["boardUI"]["_mode"].onDrag(2, 0, new MouseEvent(""));
    assert.equal(count(root.innerHTML, /color: rgba\(255, 215, 0, 0\.5\)/g), 3);
    const highlightButton = root.querySelector(".highlight > button:nth-child(2)");
    highlightButton.click();
    assert.equal(count(root.innerHTML, /color: rgba\(255, 215, 0, 0\.5\)/g), 0);
    assert.equal(count(root.innerHTML, /color: rgba\(204, 172, 0, 0\.625\)/g), 3);
    ui["boardUI"]["_mode"].onMouseDown(8, 8, new MouseEvent(""));
    assert.equal(count(root.innerHTML, /color: rgba\(255, 215, 0, 0\.5\)/g), 1);
    assert.equal(count(root.innerHTML, /color: rgba\(0, 0, 0, 0\.25\)/g), 3 + 1);
});
QUnit.module("main / thermometer UI");
QUnit.test("add thermometer and solve", (assert) => {
    var _a;
    const root = document.createElement("div");
    const ui = new SudokuUI(root);
    transitionBoardMode(ui, root, 1);
    for (let c = 0; c < 9; c++) {
        ui["boardUI"]["_mode"].onMouseDown(0, c, new MouseEvent(""));
    }
    assert.ok(root.innerHTML.includes("under-construction"));
    root.querySelector(".options button").click();
    assert.notOk(root.innerHTML.includes("under-construction"));
    assert.ok(root.innerHTML.includes("polyline"));
    const allButton = root.querySelector(".stepControl > button:last-child");
    assert.equal(allButton.textContent, "All");
    allButton.click();
    assert.equal(((_a = root.innerHTML.match(/solved/g)) !== null && _a !== void 0 ? _a : []).length, 9);
    assert.ok(root.innerHTML.includes(">1<"));
    assert.equal(sudoku.dump(ui["history"].current().board), `\
123 456 789
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...

... ... ...
... ... ...
... ... ...`);
});
QUnit.test("add and delete thermometer", (assert) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);
    transitionBoardMode(ui, root, 1);
    ui["boardUI"]["_mode"].onMouseDown(0, 0, new MouseEvent(""));
    ui["boardUI"]["_mode"].onMouseDown(0, 1, new MouseEvent(""));
    root.querySelector(".options button").click();
    ui["boardUI"]["_mode"].onMouseDown(0, 0, new MouseEvent(""));
    ui["boardUI"]["_mode"].onMouseDown(1, 0, new MouseEvent(""));
    root.querySelector(".options button").click();
    assert.deepEqual(ui["thermometers"].completed, [
        {
            members: [
                [0, 0],
                [0, 1],
            ],
            strict: true,
        },
        {
            members: [
                [0, 0],
                [1, 0],
            ],
            strict: true,
        },
    ]);
    transitionBoardMode(ui, root, 2);
    ui["boardUI"]["_mode"].onMouseDown(0, 0, new MouseEvent(""));
    assert.deepEqual(ui["thermometers"].completed, [
        {
            members: [
                [0, 0],
                [0, 1],
            ],
            strict: true,
        },
    ]);
});
QUnit.test("abandon thermometer construction", (assert) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);
    transitionBoardMode(ui, root, 1);
    ui["boardUI"]["_mode"].onMouseDown(0, 0, new MouseEvent(""));
    ui["boardUI"]["_mode"].onMouseDown(0, 1, new MouseEvent(""));
    const mode = ui["allModes"][1];
    assert.deepEqual(mode["collector"]["underConstruction"], [
        [0, 0],
        [0, 1],
    ]);
    assert.deepEqual(ui["thermometers"].completed, []);
    transitionBoardMode(ui, root, 0);
    assert.deepEqual(mode["collector"]["underConstruction"], []);
    assert.deepEqual(ui["thermometers"].completed, []);
});
QUnit.module("main / cage UI");
QUnit.test("add cage and solve", (assert) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);
    transitionBoardMode(ui, root, 3);
    ui["cages"]["sumUnderConstruction"] = 10;
    for (let c = 0; c < 4; c++) {
        ui["boardUI"]["_mode"].onMouseDown(0, c, new MouseEvent(""));
    }
    assert.ok(root.innerHTML.includes("under-construction"));
    root.querySelector(".options button").click();
    assert.notOk(root.innerHTML.includes("under-construction"));
    assert.ok(root.innerHTML.includes("polygon"));
    const allButton = root.querySelector(".stepControl > button:last-child");
    assert.equal(allButton.textContent, "All");
    allButton.click();
    assert.equal(count(root.innerHTML, />1234</g), 4);
});
QUnit.test("display possible cage sums", (assert) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);
    transitionBoardMode(ui, root, 3);
    ui["cages"]["sumUnderConstruction"] = 12;
    for (let c = 0; c < 4; c++) {
        ui["boardUI"]["_mode"].onMouseDown(0, c, new MouseEvent(""));
    }
    root.querySelector(".options button").click();
    assert.ok(root.innerHTML.includes("polygon"));
    transitionBoardMode(ui, root, 5);
    ui["boardUI"]["_mode"].onMouseDown(0, 0, new MouseEvent(""));
    assert.ok(root.innerHTML.includes(">1236<br>1245<"));
});
QUnit.module("main / equality UI");
QUnit.test("add equality and solve", (assert) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);
    const board = sudoku.emptyBoard();
    board[0][0] = 1 | 2 | 4;
    ui["history"].push({ board: board });
    transitionBoardMode(ui, root, 6);
    for (let i = 0; i < 3; i++) {
        ui["boardUI"]["_mode"].onMouseDown(i * 3, i * 3, new MouseEvent(""));
    }
    assert.ok(root.innerHTML.includes("under-construction"));
    root.querySelector(".options button").click();
    assert.notOk(root.innerHTML.includes("under-construction"));
    assert.ok(root.innerHTML.includes("text"));
    const allButton = root.querySelector(".stepControl > button:last-child");
    assert.equal(allButton.textContent, "All");
    allButton.click();
    assert.equal(count(root.innerHTML, />123</g), 3);
});
