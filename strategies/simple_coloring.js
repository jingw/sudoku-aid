import { bitMask, coordinateToStr, packRC, unpackRC, } from "../sudoku.js";
import * as base from "./base.js";
export function eliminateSimpleColoring(settings, origBoard, board) {
    for (let digit = 1; digit <= board.length; digit++) {
        const digitMask = bitMask(digit);
        // two cells are linked if exactly one of them must contain the digit
        const links = new Map();
        function addLink(rc1, rc2) {
            let neighbors = links.get(rc1);
            if (neighbors === undefined) {
                neighbors = new Set();
                links.set(rc1, neighbors);
            }
            neighbors.add(rc2);
        }
        for (const constraint of settings.constraints) {
            const required = constraint.requiredDigits(settings, origBoard);
            if (!(required & digitMask)) {
                continue;
            }
            const candidatePositions = [];
            for (const [r, c] of constraint.members) {
                if (origBoard[r][c] & digitMask) {
                    candidatePositions.push(packRC(r, c));
                }
            }
            if (candidatePositions.length === 2) {
                const [rc1, rc2] = candidatePositions;
                addLink(rc1, rc2);
                addLink(rc2, rc1);
            }
        }
        const visited = new Set();
        // 2-color each connected component of the links graph
        for (const startRC of links.keys()) {
            if (visited.has(startRC)) {
                continue;
            }
            // this is a component we haven't explored yet
            const colors = new Map();
            const possible = colorConnectedComponent(origBoard, links, visited, colors, startRC, true);
            if (!possible) {
                // not 2-colorable => puzzle is broken
                for (const rc of colors.keys()) {
                    const [r, c] = unpackRC(rc);
                    board[r][c] = 0;
                }
                continue;
            }
            // anything seen by both colors cannot be a candidate
            const seenByBoth = findCoordinatesSeenByBothColors(colors, settings.cellVisibilityGraphAsSet);
            for (const rc of seenByBoth) {
                const [r, c] = unpackRC(rc);
                if (board[r][c] & digitMask) {
                    base.logRemoval(r, c, digit + settings.startDigit - 1, "simple coloring");
                    board[r][c] &= ~digitMask;
                }
            }
        }
    }
}
// return true if the connected component is 2-colorable
function colorConnectedComponent(origBoard, links, visited, colors, rc, color) {
    const existingColor = colors.get(rc);
    if (existingColor !== undefined) {
        return existingColor === color;
    }
    if (visited.has(rc)) {
        const [r, c] = unpackRC(rc);
        throw new Error(`Should not have visited ${coordinateToStr(r, c)} already`);
    }
    visited.add(rc);
    colors.set(rc, color);
    let possible = true;
    for (const neighbor of links.get(rc)) {
        // Don't short-circuit for the purpose of X-ing out the whole connected
        // component if broken.
        possible &&= colorConnectedComponent(origBoard, links, visited, colors, neighbor, !color);
    }
    return possible;
}
function findCoordinatesSeenByBothColors(colors, cellVisibilityGraphAsSet) {
    const seen1 = new Set();
    const seen2 = new Set();
    for (const [rc, color] of colors) {
        const [r, c] = unpackRC(rc);
        for (const neighborRC of cellVisibilityGraphAsSet[r][c]) {
            if (color) {
                seen1.add(neighborRC);
            }
            else {
                seen2.add(neighborRC);
            }
        }
    }
    return seen1.intersection(seen2);
}
