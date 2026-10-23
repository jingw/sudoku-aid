import { eliminateFish } from "./fish.js";
import { findHiddenSingles } from "./hidden_singles.js";
import { eliminateIntersections } from "./intersections.js";
import { eliminateNakedSets } from "./naked_sets.js";
import { eliminateObvious } from "./obvious.js";
import { eliminateSimpleColoring } from "./simple_coloring.js";
import { eliminateXYZWing } from "./xyz_wing.js";
export function applyAllStrategies(settings, origBoard, nextBoard) {
    eliminateObvious(settings, origBoard, nextBoard);
    findHiddenSingles(settings, origBoard, nextBoard);
    eliminateIntersections(settings, origBoard, nextBoard);
    eliminateNakedSets(settings, origBoard, nextBoard);
    eliminateFish(settings, origBoard, nextBoard);
    eliminateXYZWing(settings, origBoard, nextBoard);
    eliminateSimpleColoring(settings, origBoard, nextBoard);
}
