/** Rotate the vector counterclockwise by the angle in radians */
export function rotateCCW([x, y], angle) {
    return [
        Math.cos(angle) * x - Math.sin(angle) * y,
        Math.sin(angle) * x + Math.cos(angle) * y,
    ];
}
export function normalize(v) {
    return multiply(v, 1 / magnitude(v));
}
export function magnitude([x, y]) {
    return Math.sqrt(x * x + y * y);
}
export function add([a, b], [c, d]) {
    return [a + c, b + d];
}
export function multiply([x, y], k) {
    return [x * k, y * k];
}
