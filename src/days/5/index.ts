import { l, loadInput, setCurrentDay } from "../../shared/util.js";

setCurrentDay("5");

type Range = [number, bigint, bigint];

const parse = (lines: string[]) => {
  const ids: Set<bigint> = new Set();
  const ranges: Range[] = [];

  let phase = 0;
  let i = 0;
  for (const line of lines) {
    if (line === "") {
      phase = 1;
      continue;
    }

    if (phase === 0) {
      const [start, stop] = line.split("-").map(BigInt) as [bigint, bigint];
      if ([start, stop].find((x) => Number.isNaN(x))) {
        throw Error("invalid number");
      }

      ranges.push([i++, start, stop]);
      continue;
    }

    ids.add(BigInt(line));
  }

  return {
    ids,
    ranges,
  };
};

// inclusive
const binarySearchLowerBound = (arr: bigint[], x: bigint) => {
  let lo = 0;
  let hi = arr.length;

  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid]! < x) lo = mid + 1;
    else hi = mid;
  }

  return lo;
};

// bigint-safe max for two bigints
const bigintMax = (a: bigint, b: bigint) => (a > b ? a : b);

const binarySearchUtil = (ranges: Range[]) => {
  const sortedByStart: [bigint, number][] = [];
  const sortedByEnd: [bigint, number][] = [];

  ranges.forEach((range: Range) => {
    const [i, start, end] = range;
    sortedByStart.push([start, i]);
    sortedByEnd.push([end, i]);
  });

  const _sort = (a: [bigint, number], b: [bigint, number]) =>
    a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;

  sortedByStart.sort(_sort);
  sortedByEnd.sort(_sort);

  const s1 = sortedByStart.map((v) => v[0]); // start number
  const s2 = sortedByStart.map((v) => v[1]); // start idx

  const e1 = sortedByEnd.map((v) => v[0]); // end number
  const e2 = sortedByEnd.map((v) => v[1]); // end idx

  return {
    search: (x: bigint) => {
      const startIdx = binarySearchLowerBound(s1, x);
      const endIdx = binarySearchLowerBound(e1, x);

      if (startIdx === 0 || endIdx === e1.length) {
        return false;
      }

      const x1 = new Set(s2.slice(0, startIdx));
      const x2 = new Set(e2.slice(endIdx));

      const intersection = x1.intersection(x2);

      const r = intersection.size > 0;

      return r;
    },
  };
};

const part1 = () => {
  const i = loadInput("input1", "lines", undefined, false);
  const p = parse(i);
  const bs = binarySearchUtil(p.ranges);

  let count = 0;
  for (const id of p.ids) {
    if (bs.search(id)) {
      count++;
    }
  }

  return count;
};

const part2 = () => {
  const i = loadInput("input1", "lines", undefined, false);
  const p = parse(i);

  let lastEndpoint: bigint | undefined = undefined;
  const rangesSortedByStart = p.ranges.slice().sort((a, b) => {
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    return 0;
  });

  let count = 0n;
  for (const range of rangesSortedByStart) {
    const [, start, end] = range;

    const realStart =
      lastEndpoint !== undefined ? bigintMax(lastEndpoint + 1n, start) : start;

    if (realStart > end) {
      continue; // already covered
    }

    count += end - realStart + 1n;

    lastEndpoint = end;
  }

  return count;
};

l(part1());
l(part2());
