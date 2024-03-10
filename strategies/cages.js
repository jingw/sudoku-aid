var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SumGroup_candidatesPerMember, _SumGroup_requiredDigits, _SumGroup_cachedBoardStr;
import * as base from "./base.js";
import { EMPTY_CELL, lowestDigit, } from "../sudoku.js";
export class SumGroup {
    constructor(members, sum) {
        this.members = members;
        this.sum = sum;
        _SumGroup_candidatesPerMember.set(this, void 0);
        _SumGroup_requiredDigits.set(this, 0);
        _SumGroup_cachedBoardStr.set(this, "");
        if (!sum) {
            throw new Error("no sum constraint");
        }
        __classPrivateFieldSet(this, _SumGroup_candidatesPerMember, new Array(members.length).fill(0), "f");
    }
    compute(board) {
        const boardStr = board.toString();
        if (__classPrivateFieldGet(this, _SumGroup_cachedBoardStr, "f") === boardStr) {
            return;
        }
        __classPrivateFieldGet(this, _SumGroup_candidatesPerMember, "f").fill(0);
        __classPrivateFieldSet(this, _SumGroup_requiredDigits, EMPTY_CELL, "f");
        const bitSets = [];
        for (const [r, c] of this.members) {
            bitSets.push(board[r][c]);
        }
        base.forEachAssignment(bitSets, (assignment) => {
            let sum = 0;
            for (const bitSet of assignment) {
                sum += lowestDigit(bitSet);
            }
            if (sum === this.sum) {
                let used = 0;
                for (let i = 0; i < assignment.length; i++) {
                    __classPrivateFieldGet(this, _SumGroup_candidatesPerMember, "f")[i] |= assignment[i];
                    used |= assignment[i];
                }
                __classPrivateFieldSet(this, _SumGroup_requiredDigits, __classPrivateFieldGet(this, _SumGroup_requiredDigits, "f") & used, "f");
            }
        });
    }
    candidatesPerMember(board) {
        this.compute(board);
        return __classPrivateFieldGet(this, _SumGroup_candidatesPerMember, "f");
    }
    requiredDigits(board) {
        this.compute(board);
        return __classPrivateFieldGet(this, _SumGroup_requiredDigits, "f");
    }
}
_SumGroup_candidatesPerMember = new WeakMap(), _SumGroup_requiredDigits = new WeakMap(), _SumGroup_cachedBoardStr = new WeakMap();
export function eliminateFromCages(settings, origBoard, board) {
    if (!settings.cages) {
        return;
    }
    for (const group of settings.groups) {
        if (group instanceof SumGroup) {
            const possible = group.candidatesPerMember(origBoard);
            for (let i = 0; i < possible.length; i++) {
                const [r, c] = group.members[i];
                board[r][c] &= possible[i];
            }
        }
    }
}
/* Return a list of bit sets, each of which is a set of digits that sums to the target */
export function possibleWaysToSumCage(cage, board) {
    if (!cage.sum) {
        throw new Error("cage has no sum constraint");
    }
    const bitSets = [];
    for (const [r, c] of cage.members) {
        bitSets.push(board[r][c]);
    }
    const possibleCombinedBitSets = new Set();
    base.forEachAssignment(bitSets, (assignment) => {
        let sum = 0;
        for (const bitSet of assignment) {
            sum += lowestDigit(bitSet);
        }
        if (sum === cage.sum) {
            let combined = 0;
            for (const bitSet of assignment) {
                combined |= bitSet;
            }
            possibleCombinedBitSets.add(combined);
        }
    });
    return Array.from(possibleCombinedBitSets);
}
