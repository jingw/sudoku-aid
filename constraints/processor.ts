import {
  Coordinate,
  PackedCoordinate,
  SIZE_TO_BOX_COUNTS,
  packRC,
  unpackRC,
} from "../sudoku.js";
import {
  NonRepeatingGroup,
  ProcessedSettings,
  Settings,
} from "./constraint.js";
import { EqualityConstraint } from "./equalities.js";

export function processSettings(settings: Settings): ProcessedSettings {
  const constraints =
    settings.constraints === undefined ? [] : [...settings.constraints];
  const boardSize = settings.boardSize ?? 9;
  const startDigit = settings.startDigit ?? 1;

  function buildLinearGroup(
    r: number,
    c: number,
    dr: number,
    dc: number,
  ): NonRepeatingGroup {
    const members: Coordinate[] = [];
    for (let i = 0; i < boardSize; i++) {
      members.push([r + i * dr, c + i * dc]);
    }
    return new NonRepeatingGroup(members);
  }
  function buildBlockGroup(
    r0: number,
    c0: number,
    height: number,
    width: number,
    dr: number,
    dc: number,
  ): NonRepeatingGroup {
    const members: Coordinate[] = [];
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        members.push([r0 + r * dr, c0 + c * dc]);
      }
    }
    return new NonRepeatingGroup(members);
  }

  for (let i = 0; i < boardSize; i++) {
    constraints.push(buildLinearGroup(i, 0, 0, 1)); // row
    constraints.push(buildLinearGroup(0, i, 1, 0)); // col
  }
  if (!settings.irregular && boardSize in SIZE_TO_BOX_COUNTS) {
    const [boxesWide, boxesTall] = SIZE_TO_BOX_COUNTS[boardSize];
    const boxWidth = boardSize / boxesWide;
    const boxHeight = boardSize / boxesTall;

    for (let R = 0; R < boxesTall; R++) {
      for (let C = 0; C < boxesWide; C++) {
        constraints.push(
          buildBlockGroup(
            R * boxHeight,
            C * boxWidth,
            boxHeight,
            boxWidth,
            1,
            1,
          ),
        );
      }
    }
    if (settings.digitsNotInSamePosition) {
      for (let r = 0; r < boxHeight; r++) {
        for (let c = 0; c < boxWidth; c++) {
          constraints.push(
            buildBlockGroup(r, c, boxesTall, boxesWide, boxHeight, boxWidth),
          );
        }
      }
    }
  }
  if (settings.diagonals) {
    constraints.push(buildLinearGroup(0, 0, 1, 1));
    constraints.push(buildLinearGroup(0, boardSize - 1, 1, -1));
  }

  const cellVisibilityGraphRaw: Set<PackedCoordinate>[][] = [];
  for (let r = 0; r < boardSize; r++) {
    cellVisibilityGraphRaw.push([]);
    for (let c = 0; c < boardSize; c++) {
      cellVisibilityGraphRaw[r].push(new Set<PackedCoordinate>());
    }
  }

  for (const constraint of constraints) {
    if (constraint.allowDuplicateDigits) {
      continue;
    }
    for (const [r1, c1] of constraint.members) {
      for (const [r2, c2] of constraint.members) {
        if (r1 !== r2 || c1 !== c2) {
          cellVisibilityGraphRaw[r1][c1].add(packRC(r2, c2));
        }
      }
    }
  }
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const adjacent = cellVisibilityGraphRaw[r][c];
      function add(r2: number, c2: number): void {
        if (r2 >= 0 && r2 < boardSize && c2 >= 0 && c2 < boardSize) {
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
  for (const constraint of settings.constraints ?? []) {
    if (!(constraint instanceof EqualityConstraint)) {
      continue;
    }
    const unionNeighbors = new Set<PackedCoordinate>();
    for (const [r, c] of constraint.members) {
      for (const neighbor of cellVisibilityGraphRaw[r][c]) {
        unionNeighbors.add(neighbor);
      }
    }
    for (const neighbor of unionNeighbors) {
      for (const [r, c] of constraint.members) {
        // all members share vision
        cellVisibilityGraphRaw[r][c].add(neighbor);
        // and the reverse edge
        const [r2, c2] = unpackRC(neighbor);
        cellVisibilityGraphRaw[r2][c2].add(packRC(r, c));
      }
    }
  }

  // double check graph is symmetric
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      for (const neighbor of cellVisibilityGraphRaw[r][c]) {
        const [r2, c2] = unpackRC(neighbor);
        if (!cellVisibilityGraphRaw[r2][c2].has(packRC(r, c))) {
          throw new Error(`${r} ${c} -> ${r2} ${c2} not symmetric`);
        }
      }
    }
  }

  const cellVisibilityGraph: Coordinate[][][] = [];
  for (let r = 0; r < boardSize; r++) {
    cellVisibilityGraph.push([]);
    for (let c = 0; c < boardSize; c++) {
      cellVisibilityGraph[r].push([]);
      for (const member of cellVisibilityGraphRaw[r][c]) {
        cellVisibilityGraph[r][c].push(unpackRC(member));
      }
    }
  }

  return {
    ...settings,
    startDigit,
    boardSize,
    constraints,
    cellVisibilityGraph,
    cellVisibilityGraphAsSet: cellVisibilityGraphRaw,
  };
}
