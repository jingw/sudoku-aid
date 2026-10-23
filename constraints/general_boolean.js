import { BruteForceConstraint } from "./constraint.js";
function sum(xs) {
    let result = 0;
    for (const x of xs) {
        result += x;
    }
    return result;
}
function min(xs) {
    return Math.min(...xs);
}
function max(xs) {
    return Math.max(...xs);
}
export class GeneralBooleanConstraint extends BruteForceConstraint {
    expression;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    fn;
    constructor(members, 
    // Arbitrary JavaScript code that evaluates to a boolean given an array of digits `x`
    expression) {
        super(members);
        this.expression = expression;
        // for convenience, translate x[-1] to x[x.length-1]
        const js = "return " + this.expression.replaceAll("x[-", "x[x.length-");
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        this.fn = Function("x", "sum", "min", "max", js);
    }
    isValid(digits) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.fn(digits, sum, min, max);
    }
}
