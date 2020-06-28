import * as sudoku from "./sudoku.js";
import * as thermometers from "./thermometers.js";
import { SudokuUI } from "./main.js";

declare const QUnit: any;

function count(s: string, re: RegExp): number {
    return (s.match(re) ?? []).length;
}

QUnit.module("main");

QUnit.test("basic rendering", (assert: any) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);
    const board = sudoku.emptyBoard();
    board[0][0] &= ~1;
    board[0][1] = 1;
    board[0][2] = 0;
    ui["history"].push({board: board});
    ui["boardUI"].refreshAll();
    assert.ok(root.innerHTML.includes("234<br />567<br />89"));
    assert.ok(root.innerHTML.includes(">1</td>"));
    assert.ok(root.innerHTML.includes(">X</td>"));
});

QUnit.test("add thermometer and solve", (assert: any) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);
    (root.querySelectorAll("input[name=mode]")[1] as HTMLInputElement).click();

    for (let c = 0; c < 9; c++) {
        ui["boardUI"]["_mode"]!.onMouseDown(0, c, new MouseEvent(""));
    }
    assert.ok(root.innerHTML.includes("under-construction"));

    (root.querySelector(".options button") as HTMLButtonElement).click();
    assert.notOk(root.innerHTML.includes("under-construction"));
    assert.ok(root.innerHTML.includes("polyline"));

    const allButton = root.querySelector(".stepControl > button:nth-child(6)") as HTMLButtonElement;
    assert.equal(allButton.textContent, "All");
    allButton.click();

    assert.equal((root.innerHTML.match(/solved/g) ?? []).length, 9);
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

QUnit.test("add and delete thermometer", (assert: any) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);

    (root.querySelectorAll("input[name=mode]")[1] as HTMLInputElement).click();
    ui["boardUI"]["_mode"]!.onMouseDown(0, 0, new MouseEvent(""));
    ui["boardUI"]["_mode"]!.onMouseDown(0, 1, new MouseEvent(""));
    (root.querySelector(".options button") as HTMLButtonElement).click();

    ui["boardUI"]["_mode"]!.onMouseDown(0, 0, new MouseEvent(""));
    ui["boardUI"]["_mode"]!.onMouseDown(1, 0, new MouseEvent(""));
    (root.querySelector(".options button") as HTMLButtonElement).click();

    assert.deepEqual(ui["thermometers"].completed, [
        [[0, 0], [0, 1]],
        [[0, 0], [1, 0]],
    ]);

    (root.querySelectorAll("input[name=mode]")[2] as HTMLInputElement).click();
    ui["boardUI"]["_mode"]!.onMouseDown(0, 0, new MouseEvent(""));
    assert.deepEqual(ui["thermometers"].completed, [
        [[0, 0], [0, 1]],
    ]);
});

QUnit.test("delete thermometer during construction", (assert: any) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);

    (root.querySelectorAll("input[name=mode]")[1] as HTMLInputElement).click();
    ui["boardUI"]["_mode"]!.onMouseDown(0, 0, new MouseEvent(""));
    ui["boardUI"]["_mode"]!.onMouseDown(0, 1, new MouseEvent(""));

    const mode = ui["allModes"][1] as thermometers.AddMode;
    assert.deepEqual(mode["collector"]["underConstruction"], [[0, 0], [0, 1]]);
    assert.deepEqual(ui["thermometers"].completed, []);

    (root.querySelectorAll("input[name=mode]")[2] as HTMLInputElement).click();
    assert.deepEqual(mode["collector"]["underConstruction"], []);
    assert.deepEqual(ui["thermometers"].completed, []);
});

QUnit.test("find", (assert: any) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);

    ui["textInput"].value = "123456789".repeat(9);
    const loadButton = root.querySelector("div:nth-child(6) > button:nth-child(1)") as HTMLButtonElement;
    assert.equal(loadButton.textContent, "Load from text");
    loadButton.click();

    assert.equal(root.innerHTML.match(/color: rgba\(152, 251, 152, 0\.5\)/g), null);
    // +1 for the highlight button
    assert.equal((root.innerHTML.match(/color: rgba\(0, 0, 0, 0\)/g) ?? []).length, 9 * 9 + 1);

    const find2Button = root.querySelector(".find > button:nth-child(2)") as HTMLButtonElement;
    assert.equal(find2Button.textContent, "2");
    find2Button.click();

    assert.equal(count(root.innerHTML, /color: rgba\(3, 192, 60, 0\.5\)/g), 9);
    assert.equal(count(root.innerHTML, /color: rgba\(0, 0, 0, 0\)/g), 9 * 8 + 1);
});

QUnit.test("select and highlight", (assert: any) => {
    const root = document.createElement("div");
    const ui = new SudokuUI(root);

    ui["boardUI"]["_mode"]!.onMouseDown(0, 0, new MouseEvent(""));
    ui["boardUI"]["_mode"]!.onDrag(1, 0, new MouseEvent(""));
    ui["boardUI"]["_mode"]!.onDrag(2, 0, new MouseEvent(""));

    assert.equal(count(root.innerHTML, /color: rgba\(255, 215, 0, 0\.5\)/g), 3);

    const highlightButton = root.querySelector(".highlight > button:nth-child(2)") as HTMLButtonElement;
    highlightButton.click();

    assert.equal(count(root.innerHTML, /color: rgba\(255, 215, 0, 0\.5\)/g), 0);
    assert.equal(count(root.innerHTML, /color: rgba\(204, 172, 0, 0\.624\)/g), 3);

    ui["boardUI"]["_mode"]!.onMouseDown(8, 8, new MouseEvent(""));

    assert.equal(count(root.innerHTML, /color: rgba\(255, 215, 0, 0\.5\)/g), 1);
    assert.equal(count(root.innerHTML, /color: rgba\(0, 0, 0, 0\.25\)/g), 3 + 1);
});
