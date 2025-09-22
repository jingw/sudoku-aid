const MAX_SUPPORTED_DIGIT = 9;
export const ALL_ONES = ~0;

export function bitMask(digit: number): number {
  return 1 << (digit - 1);
}

export function bitCount(set: number): number {
  let count = 0;
  while (set) {
    set &= set - 1;
    count++;
  }
  return count;
}

const LOWEST_DIGIT_CACHE: number[] = [];
for (let i = 0; i < MAX_SUPPORTED_DIGIT; i++) {
  LOWEST_DIGIT_CACHE[1 << i] = i + 1;
}

export function lowestDigit(set: number): number {
  if (!set) {
    throw new Error("no bit set");
  }
  return LOWEST_DIGIT_CACHE[set & -set];
}

export function highestDigit(set: number): number {
  for (let digit = MAX_SUPPORTED_DIGIT; digit >= 1; digit--) {
    if ((set & bitMask(digit)) !== 0) {
      return digit;
    }
  }
  throw new Error("no bit set");
}

export function ones(count: number): number {
  return (1 << count) - 1;
}

export function dump(set: number, startDigit?: number): string {
  startDigit ??= 1;
  const parts = [];
  for (let d = 1; d <= MAX_SUPPORTED_DIGIT; d++) {
    if (set & bitMask(d)) {
      parts.push((d + startDigit - 1).toString());
    } else {
      parts.push(" ");
    }
  }
  return "[" + parts.join("") + "]";
}
