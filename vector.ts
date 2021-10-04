export type Vector = readonly [x: number, y: number]

/** Rotate the vector counterclockwise by the angle in radians */
export function rotateCCW([x, y]: Vector, angle: number): Vector {
    return [
        Math.cos(angle) * x - Math.sin(angle) * y,
        Math.sin(angle) * x + Math.cos(angle) * y,
    ];
}

export function normalize(v: Vector): Vector {
    return multiply(v, 1 / magnitude(v));
}

export function magnitude([x, y]: Vector): number {
    return Math.sqrt(x * x + y * y);
}

export function add([a, b]: Vector, [c, d]: Vector): Vector {
    return [a + c, b + d];
}

export function multiply([x, y]: Vector, k: number): Vector {
    return [x * k, y * k];
}
