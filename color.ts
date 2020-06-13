export type Rgba = readonly [number, number, number, number]

/** compute new RGBA such that compositing it on white would produce RGB */
export function withAlpha(r: number, g: number, b: number, alpha: number): Rgba {
    function f(x: number): number {
        return (x - 255 * (1 - alpha)) / alpha;
    }
    return [f(r), f(g), f(b), alpha];
}

/** Compute the result of layering `top` on top of `bottom` */
export function composite(bottom: Rgba, top: Rgba): Rgba {
    const ba = bottom[3];
    const ta = top[3];
    function component(b: number, t: number): number {
        return (t * ta + b * ba * (1 - ta)) / (ta + ba * (1 - ta));
    }
    const result: [number, number, number, number] = [0, 0, 0, ta + ba * (1 - ta)];
    for (let i = 0; i < 3; i++) {
        result[i] = component(bottom[i], top[i]);
    }
    return result;
}

export function setBackgroundColor(element: HTMLElement, [r, g, b, a]: Rgba): void {
    element.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
}
