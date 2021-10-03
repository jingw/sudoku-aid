import * as base from "./base.js";
import * as sudoku from "../sudoku.js";
import { eliminateFish } from "./fish.js";
import { eliminateIntersections } from "./intersections.js";
import { eliminateNakedSets } from "./naked_sets.js";
import { eliminateObvious } from "./obvious.js";
import { eliminateXYZWing } from "./xyz_wing.js";
import { findHiddenSingles } from "./hidden_singles.js";

export function applyAllStrategies(
    settings: base.ProcessedSettings,
    origBoard: sudoku.ReadonlyBoard,
    nextBoard: sudoku.Board,
): void {
    eliminateObvious(settings, origBoard, nextBoard);
    findHiddenSingles(settings, origBoard, nextBoard);
    eliminateIntersections(settings, origBoard, nextBoard);
    eliminateNakedSets(settings, origBoard, nextBoard);
    eliminateFish(settings, origBoard, nextBoard);
    eliminateXYZWing(settings, origBoard, nextBoard);
}
