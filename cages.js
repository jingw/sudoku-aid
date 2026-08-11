import * as board_mode from "./board_mode.js";
import { Cage } from "./constraints/cages.js";
import { NonRepeatingGroup } from "./constraints/constraint.js";
import * as html from "./html.js";
import { bitMask, coordinatesContains, lowestDigit, packRC, unpackRC, } from "./sudoku.js";
import * as vector from "./vector.js";
const CAGE_OFFSET = 0.1;
export class Cages extends board_mode.SupportsConstruction {
    boundingRectOfCell;
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    constructor(boundingRectOfCell) {
        super();
        this.boundingRectOfCell = boundingRectOfCell;
    }
    render() {
        this.refresh();
        return this.svg;
    }
    describe(i) {
        let description = "Cage";
        if (this.completed[i] instanceof Cage) {
            description += `, sum ${this.completed[i].sum}`;
        }
        description += `, size ${this.completed[i].members.length}`;
        return description;
    }
    refresh() {
        this.svg.innerHTML = "";
        for (const cage of this.completed) {
            this.appendCage(cage, false);
        }
        if (this.underConstruction !== null) {
            this.appendCage(this.underConstruction, true);
        }
    }
    appendCage(cage, underConstruction) {
        for (const border of traceSudokuBorder(cage.members)) {
            const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.classList.add("cage");
            for (const borderPt of border) {
                const pt = this.svg.createSVGPoint();
                [pt.x, pt.y] = computeOffsetPoint(borderPt, this.boundingRectOfCell(borderPt[0]));
                polygon.points.appendItem(pt);
            }
            if (underConstruction) {
                polygon.classList.add("under-construction");
            }
            this.svg.append(polygon);
        }
        if (cage instanceof Cage) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.classList.add("cage");
            const first = firstCell(cage.members);
            const boundingRect = this.boundingRectOfCell(first);
            text.textContent = cage.sum.toString();
            text.setAttribute("x", (boundingRect[0] + 1).toString());
            text.setAttribute("y", (boundingRect[2] + 1).toString());
            if (underConstruction) {
                text.classList.add("under-construction");
            }
            this.svg.append(text);
            const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            background.classList.add("text-background");
            const textBBox = text.getBBox();
            background.setAttribute("x", textBBox.x.toString());
            background.setAttribute("y", textBBox.y.toString());
            background.setAttribute("width", textBBox.width.toString());
            background.setAttribute("height", textBBox.height.toString());
            text.before(background);
        }
    }
}
function buildCageSum(onchange) {
    const element = document.createElement("input");
    element.type = "number";
    element.min = "0";
    element.max = "45";
    element.className = "cage-sum";
    element.placeholder = "any";
    element.addEventListener("change", onchange);
    return element;
}
export class AddMode extends board_mode.CoordinateCollectingBoardMode {
    name = "Add cage";
    cageSumInput = buildCageSum(() => this.updateUnderConstruction());
    render() {
        const div = document.createElement("div");
        div.append(html.label(this.cageSumInput, "Sum: ", true));
        div.append(this.finishButton());
        return div;
    }
    finishConstruction(coordinates) {
        let sum = parseInt(this.cageSumInput.value);
        sum = isNaN(sum) ? 0 : sum;
        if (sum === 0) {
            return new NonRepeatingGroup(coordinates);
        }
        else {
            return new Cage(coordinates, sum);
        }
    }
}
export class DisplaySumsMode extends board_mode.BoardMode {
    cages;
    board;
    startDigit;
    name = "Display possible sums";
    output = document.createElement("div");
    constructor(cages, board, startDigit) {
        super();
        this.cages = cages;
        this.board = board;
        this.startDigit = startDigit;
    }
    render() {
        return this.output;
    }
    onMouseDown(r, c) {
        for (const cage of this.cages.completed) {
            if (coordinatesContains(cage.members, [r, c])) {
                if (!(cage instanceof Cage)) {
                    this.output.textContent = "Cage has no sum constraint";
                    return;
                }
                this.output.innerHTML = "";
                for (let set of cage.possibleWaysToSum(this.board(), this.startDigit())) {
                    while (set) {
                        const digit = lowestDigit(set);
                        this.output.append((digit + this.startDigit() - 1).toString());
                        set &= ~bitMask(digit);
                    }
                    this.output.append(document.createElement("br"));
                }
                return;
            }
        }
        this.output.textContent = "No cage";
    }
}
/**
 * Returns list of borders
 * Each border is a list of cells and two numbers describing the corner
 *   0 for top, 1 for bottom
 *   0 for left, 1 for right
 */
export function traceSudokuBorder(cells) {
    const members = new Set();
    for (const [r, c] of cells) {
        members.add(packRC(r * 2, c * 2));
        members.add(packRC(r * 2 + 1, c * 2));
        members.add(packRC(r * 2, c * 2 + 1));
        members.add(packRC(r * 2 + 1, c * 2 + 1));
    }
    // undo doubling
    return traceAllBorders(members).map((doubleBorder) => doubleBorder.map((rc) => {
        const [r, c] = unpackRC(rc);
        return [[r >> 1, c >> 1], r % 2, c % 2];
    }));
}
/**
 * Requirement: the members of the shape to trace must already be pre-doubled.
 *
 * This provides the following guarantees:
 * - A border position cannot be connected to two different border positions.
 * - The border does not require visiting positions twice.
 */
export function traceAllBorders(members) {
    const visited = new Set();
    const borders = [];
    for (const rc of members) {
        if (visited.has(rc)) {
            continue;
        }
        else if (findNext(rc, members, null) === null) {
            // interior point
            continue;
        }
        else {
            borders.push(traceStartingAt(rc, members, visited));
        }
    }
    return borders;
}
function traceStartingAt(startRC, members, visited) {
    if (visited.has(startRC)) {
        throw new Error("Already visited");
    }
    if (!members.has(startRC)) {
        throw new Error("Not a member");
    }
    let current = startRC;
    const result = [current];
    visited.add(current);
    let next;
    while ((next = findNext(current, members, visited)) !== null) {
        visited.add(next);
        result.push(next);
        current = next;
    }
    // beginning should be neighbor of end
    const [r1, c1] = unpackRC(result[0]);
    const [r2, c2] = unpackRC(result[result.length - 1]);
    // should have moved exactly 1
    if (Math.abs(r2 - r1) + Math.abs(c2 - c1) !== 1) {
        throw new Error("Did not loop back to start");
    }
    if (result.length < 4) {
        throw new Error("Path too short");
    }
    return result;
}
function findNext(rc, members, visited) {
    const [r, c] = unpackRC(rc);
    // current position is "."
    // assume it is already a member
    //   ABC
    //   D.F
    //   GHI
    // can go up to B if B is a member and at least one of ACDF is not a member
    // AD both not member => tracing side or entering outward-pointing corner
    // only A not member => leaving inward-pointing corner
    // only D not member => entering inward-pointing corner
    // CF symmetrical
    for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ]) {
        const r2 = r + dr;
        const c2 = c + dc;
        const candidate = packRC(r2, c2);
        if (members.has(candidate) && !visited?.has(candidate)) {
            const A = members.has(packRC(r2 - dc, c2 + dr));
            const C = members.has(packRC(r2 + dc, c2 - dr));
            const D = members.has(packRC(r - dc, c - dr));
            const F = members.has(packRC(r + dc, c + dr));
            if (!A || !C || !D || !F) {
                return candidate;
            }
        }
    }
    return null;
}
/**
 * Given a corner of a cell (pt), and the bounding rectangle of the cell, compute the coordinates of
 * the corner of the rectangle, offset inwards.
 */
function computeOffsetPoint(pt, [l, r, t, b]) {
    const center = [(l + r) / 2, (t + b) / 2];
    const originalCorner = [pt[2] ? r : l, pt[1] ? b : t];
    // Weighted average of corner and center
    return vector.add(vector.multiply(center, CAGE_OFFSET), vector.multiply(originalCorner, 1 - CAGE_OFFSET));
}
function firstCell(pts) {
    if (pts.length === 0) {
        throw new Error("empty");
    }
    let [minR, minC] = [Infinity, Infinity];
    for (const [r, c] of pts) {
        if (r < minR || (r === minR && c < minC)) {
            [minR, minC] = [r, c];
        }
    }
    return [minR, minC];
}
