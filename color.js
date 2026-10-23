/** Compute the result of layering `top` on top of `bottom` */
export function composite(bottom, top) {
    const ba = bottom[3];
    const ta = top[3];
    function component(b, t) {
        return (t * ta + b * ba * (1 - ta)) / (ta + ba * (1 - ta));
    }
    const result = [
        0,
        0,
        0,
        ta + ba * (1 - ta),
    ];
    for (let i = 0; i < 3; i++) {
        result[i] = component(bottom[i], top[i]);
    }
    return result;
}
export function setBackgroundColor(element, [r, g, b, a]) {
    element.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
}
