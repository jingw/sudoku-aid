import * as cages from "./cages.js";
import { bitCount, coordinateToStr, packRC, unpackRC, } from "../sudoku.js";
class PlainGroup {
    constructor(members) {
        this.members = members;
    }
    requiredDigits(board) {
        // If we don't have any spare possible digits, then all possible digits are required.
        const union = unionPossibilities(this.members, board);
        if (bitCount(union) <= this.members.length) {
            return union;
        }
        else {
            return 0;
        }
    }
}
export function processSettings(settings) {
    const groups = [];
    function buildLinearGroup(r, c, dr, dc) {
        const members = [];
        for (let i = 0; i < 9; i++) {
            members.push([r + i * dr, c + i * dc]);
        }
        return new PlainGroup(members);
    }
    function buildBlockGroup(R, C, increment) {
        const members = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                members.push([R + r * increment, C + c * increment]);
            }
        }
        return new PlainGroup(members);
    }
    for (let i = 0; i < 9; i++) {
        groups.push(buildLinearGroup(i, 0, 0, 1)); // row
        groups.push(buildLinearGroup(0, i, 1, 0)); // col
    }
    if (!settings.irregular) {
        for (let R = 0; R < 3; R++) {
            for (let C = 0; C < 3; C++) {
                groups.push(buildBlockGroup(R * 3, C * 3, 1));
            }
        }
    }
    if (settings.digitsNotInSamePosition) {
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                groups.push(buildBlockGroup(r, c, 3));
            }
        }
    }
    if (settings.diagonals) {
        groups.push(buildLinearGroup(0, 0, 1, 1));
        groups.push(buildLinearGroup(0, 8, 1, -1));
    }
    if (settings.cages) {
        for (const cage of settings.cages) {
            if (cage.sum) {
                groups.push(new cages.SumGroup(cage.members, cage.sum));
            }
            else {
                groups.push(new PlainGroup(cage.members));
            }
        }
    }
    if (settings.thermometers) {
        for (const thermometer of settings.thermometers) {
            if (thermometer.strict) {
                groups.push(new PlainGroup(thermometer.members));
            }
        }
    }
    const cellVisibilityGraphRaw = [];
    for (let r = 0; r < 9; r++) {
        cellVisibilityGraphRaw.push([]);
        for (let c = 0; c < 9; c++) {
            cellVisibilityGraphRaw[r].push(new Set());
        }
    }
    for (const group of groups) {
        for (const [r1, c1] of group.members) {
            for (const [r2, c2] of group.members) {
                if (r1 !== r2 || c1 !== c2) {
                    cellVisibilityGraphRaw[r1][c1].add(packRC(r2, c2));
                }
            }
        }
    }
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const adjacent = cellVisibilityGraphRaw[r][c];
            // eslint-disable-next-line no-inner-declarations
            function add(r2, c2) {
                if (r2 >= 0 && r2 < 9 && c2 >= 0 && c2 < 9) {
                    adjacent.add(packRC(r2, c2));
                }
            }
            if (settings.antiknight) {
                add(r - 1, c - 2);
                add(r - 1, c + 2);
                add(r + 1, c - 2);
                add(r + 1, c + 2);
                add(r - 2, c - 1);
                add(r - 2, c + 1);
                add(r + 2, c - 1);
                add(r + 2, c + 1);
            }
            if (settings.antiking) {
                // only do corners because orthogonal neighbors are handled by the usual rules
                add(r - 1, c - 1);
                add(r - 1, c + 1);
                add(r + 1, c - 1);
                add(r + 1, c + 1);
            }
        }
    }
    // For each group of cells that are equal, make their adjacency lists the same.
    // Does not attempt to handle chains of equalities not expressed as one equality.
    if (settings.equalities) {
        for (const equalityConstraint of settings.equalities) {
            const unionNeighbors = new Set();
            for (const [r, c] of equalityConstraint) {
                for (const neighbor of cellVisibilityGraphRaw[r][c]) {
                    unionNeighbors.add(neighbor);
                }
            }
            for (const neighbor of unionNeighbors) {
                for (const [r, c] of equalityConstraint) {
                    // all members share vision
                    cellVisibilityGraphRaw[r][c].add(neighbor);
                    // and the reverse edge
                    const [r2, c2] = unpackRC(neighbor);
                    cellVisibilityGraphRaw[r2][c2].add(packRC(r, c));
                }
            }
        }
    }
    // double check graph is symmetric
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            for (const neighbor of cellVisibilityGraphRaw[r][c]) {
                const [r2, c2] = unpackRC(neighbor);
                if (!cellVisibilityGraphRaw[r2][c2].has(packRC(r, c))) {
                    throw new Error(`${r} ${c} -> ${r2} ${c2} not symmetric`);
                }
            }
        }
    }
    const cellVisibilityGraph = [];
    for (let r = 0; r < 9; r++) {
        cellVisibilityGraph.push([]);
        for (let c = 0; c < 9; c++) {
            cellVisibilityGraph[r].push([]);
            for (const member of cellVisibilityGraphRaw[r][c]) {
                cellVisibilityGraph[r][c].push(unpackRC(member));
            }
        }
    }
    const processedSettings = {
        groups: groups,
        cellVisibilityGraph: cellVisibilityGraph,
        cellVisibilityGraphAsSet: cellVisibilityGraphRaw,
    };
    Object.assign(processedSettings, settings);
    return processedSettings;
}
export function setIntersection(sets) {
    const intersection = new Set(sets[0]);
    for (let i = 1; i < sets.length; i++) {
        for (const element of intersection) {
            if (!sets[i].has(element)) {
                intersection.delete(element);
            }
        }
    }
    return intersection;
}
export function forEachSubset(size, set, callback, i = 0, current = []) {
    if (size > set.length - i) {
        // unsatisfiable
    }
    else if (size === 0) {
        callback(current);
    }
    else {
        // either take this member...
        current.push(set[i]);
        forEachSubset(size - 1, set, callback, i + 1, current);
        current.pop();
        // ... or don't take it
        forEachSubset(size, set, callback, i + 1, current);
    }
}
export function forEachAssignment(bitSets, callback, allowDuplicates = false, used = 0, current = []) {
    if (current.length === bitSets.length) {
        callback(current);
    }
    else {
        let set = bitSets[current.length];
        if (!allowDuplicates) {
            set &= ~used;
        }
        while (set) {
            const lowestBit = set & -set;
            current.push(lowestBit);
            forEachAssignment(bitSets, callback, allowDuplicates, used | lowestBit, current);
            current.pop();
            set &= ~lowestBit;
        }
    }
}
/** return true if equal digits see each other */
export function isAssignmentConflicting(assignment, coordinates, cellVisibilityGraphAsSet) {
    // Check for conflicts
    for (let i = 0; i < assignment.length; i++) {
        const [r1, c1] = coordinates[i];
        for (let j = i + 1; j < assignment.length; j++) {
            const [r2, c2] = coordinates[j];
            if (assignment[i] === assignment[j] &&
                cellVisibilityGraphAsSet[r1][c1].has(packRC(r2, c2))) {
                // conflict, equal digits see each other
                return true;
            }
        }
    }
    return false;
}
export function countPossibilities(bitSets) {
    let count = 1;
    for (const s of bitSets) {
        count *= bitCount(s);
    }
    return count;
}
export function unionPossibilities(coords, board) {
    let union = 0;
    for (const [r, c] of coords) {
        union |= board[r][c];
    }
    return union;
}
export function logRemoval(r, c, digit, reason) {
    console.log(`${coordinateToStr(r, c)}: ${digit} removed by ${reason}`);
}
