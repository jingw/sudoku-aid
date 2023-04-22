import * as base from "./base.js";
import {
    Board,
    ReadonlyBoard,
    bitCount,
    bitMask,
    lowestDigit,
} from "../sudoku.js";
import {
    eliminateFromConsecutiveKropkiDots,
    eliminateFromDoubleKropkiDots,
} from "./kropki.js";
import { eliminate159 } from "./index159.js";
import { eliminateFromArrows } from "./arrows.js";
import { eliminateFromBetweenLines } from "./between.js";
import { eliminateFromCages } from "./cages.js";
import { eliminateFromEqualities } from "./equalities.js";
import { eliminateFromGeneralBooleanConstraints } from "./general_boolean.js";
import { eliminateFromGermanWhispers } from "./german_whispers.js";
import { eliminateFromThermometers } from "./thermometers.js";

export function eliminateObvious(settings: base.ProcessedSettings, origBoard: ReadonlyBoard, board: Board): void {
    // Anything cell with a known value should eliminate from everything it sees
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const set = origBoard[r][c];
            const count = bitCount(set);
            if (count === 1) {
                const digit = lowestDigit(set);
                clearFrom(board, digit, r, c, settings);
            }
        }
    }
    eliminateFromArrows(settings, origBoard, board);
    eliminateFromBetweenLines(settings, origBoard, board);
    eliminateFromCages(settings, origBoard, board);
    eliminateFromConsecutiveKropkiDots(settings, origBoard, board);
    eliminateFromDoubleKropkiDots(settings, origBoard, board);
    eliminateFromEqualities(settings, origBoard, board);
    eliminateFromThermometers(settings, origBoard, board);
    eliminate159(settings, origBoard, board);
    eliminateFromGermanWhispers(settings, origBoard, board);
    eliminateFromGeneralBooleanConstraints(settings, origBoard, board);
}

function tryClear(board: Board, digit: number, r: number, c: number): void {
    if (r >= 0 && r < 9 && c >= 0 && c < 9) {
        board[r][c] &= ~bitMask(digit);
    }
}

function clearOrthogonal(board: Board, digit: number, r: number, c: number): void {
    if (digit >= 1 && digit <= 9) {
        tryClear(board, digit, r + 1, c);
        tryClear(board, digit, r - 1, c);
        tryClear(board, digit, r, c + 1);
        tryClear(board, digit, r, c - 1);
    }
}

function clearFrom(board: Board, digit: number, r: number, c: number, settings: base.ProcessedSettings): void {
    // only relevant if board is broken
    // excluding this logic results in weird asymmetry, where all but the last occurrence are X'ed out
    const startedAsPossible = (board[r][c] & bitMask(digit)) !== 0;

    for (const [r2, c2] of settings.cellVisibilityGraph[r][c]) {
        tryClear(board, digit, r2, c2);
    }
    if (settings.nonconsecutive) {
        clearOrthogonal(board, digit - 1, r, c);
        clearOrthogonal(board, digit + 1, r, c);
    }
    if (startedAsPossible) {
        board[r][c] = bitMask(digit);
    }
}
