const MAX_SIZE = 9;
export const ALL_ONES = ~0;

export function bitMask(index: number): number {
  return 1 << index;
}

export function bitMask1(oneBasedIndex: number): number {
  return 1 << (oneBasedIndex - 1);
}

export function bitCount(set: number): number {
  let count = 0;
  while (set) {
    set &= set - 1;
    count++;
  }
  return count;
}

const LOWEST_INDEX_CACHE: number[] = [];
for (let i = 0; i < MAX_SIZE; i++) {
  LOWEST_INDEX_CACHE[1 << i] = i;
}

export function lowestIndex(set: number): number {
  if (!set) {
    throw new Error("no bit set");
  }
  return LOWEST_INDEX_CACHE[set & -set];
}

export function highestIndex(set: number): number {
  for (let i = MAX_SIZE - 1; i >= 0; i--) {
    if ((set & bitMask(i)) !== 0) {
      return i;
    }
  }
  throw new Error("no bit set");
}

export function lowestDigit(set: number): number {
  if (!set) {
    throw new Error("no bit set");
  }
  return LOWEST_INDEX_CACHE[set & -set] + 1;
}

export function highestDigit(set: number): number {
  for (let i = MAX_SIZE - 1; i >= 0; i--) {
    if ((set & bitMask(i)) !== 0) {
      return i + 1;
    }
  }
  throw new Error("no bit set");
}

export function ones(count: number): number {
  return (1 << count) - 1;
}

export function dump(set: number, startIndex?: number): string {
  startIndex ??= 1;
  const parts = [];
  for (let i = 0; i < MAX_SIZE; i++) {
    if (set & bitMask(i)) {
      parts.push((i + startIndex).toString());
    } else {
      parts.push(" ");
    }
  }
  return "[" + parts.join("") + "]";
}
