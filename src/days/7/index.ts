import { l, loadInput, setCurrentDay } from "../../shared/util.js";

setCurrentDay("7");

type Loc = [number, number];
const parse = (input: string[]) => {
  const splittersByLevel = new Map<number, Set<number>>();
  const startPoints: Loc[] = [];

  const rows = input.length;

  let h = 0;
  let w = 0;
  for (let y = 0; y < rows; y++) {
    const row = input[y];
    if (!row) continue;
    h++;

    const chars = row.split("");
    w = Math.max(w, chars.length);

    for (let x = 0; x < chars.length; x++) {
      const char = chars[x];
      switch (char) {
        case "S":
          startPoints.push([x, y]);
          break;
        case "^":
          if (!splittersByLevel.has(y)) {
            splittersByLevel.set(y, new Set<number>());
          }
          splittersByLevel.get(y)?.add(x);
          break;
      }
    }
  }

  return {
    splittersByLevel,
    startPoints,
    height: h,
    width: w,
  };
};

// const visualize = (w: number, h: number, beams: Loc[], splitters: Loc[]) => {
//   const beamSet = new Set<string>(beams.map(([x, y]) => `${x},${y}`));
//   const splitterSet = new Set<string>(splitters.map(([x, y]) => `${x},${y}`));

//   for (let y = 0; y < h; y++) {
//     let row = "";
//     for (let x = 0; x < w; x++) {
//       if (beamSet.has(`${x},${y}`)) {
//         row += "|";
//       } else if (splitterSet.has(`${x},${y}`)) {
//         row += "^";
//       } else {
//         row += ".";
//       }
//     }
//     l(row);
//   }
// };

const part1 = (input: string[]) => {
  const { splittersByLevel, startPoints, height, width } = parse(input);
  let beams: Loc[] = startPoints;
  let beamsSet = new Set<string>();
  let splits = 0;

  while (true) {
    const nextBeams: Loc[] = [];
    beamsSet = new Set<string>(beams.map(([x, y]) => `${x},${y}`));

    const maybeAddBeam = (loc: Loc) => {
      const key = `${loc[0]},${loc[1]}`;
      if (!beamsSet.has(key)) {
        nextBeams.push(loc);
        beamsSet.add(key);
      }
    };

    for (const beam of beams) {
      const [x, y] = beam;
      const splitters = splittersByLevel.get(y + 1);

      if (splitters && splitters.has(x)) {
        maybeAddBeam([x - 1, y + 1]);
        maybeAddBeam([x + 1, y + 1]);

        splits++;
      } else if (y + 1 < height) {
        maybeAddBeam([x, y + 1]);
      }
    }

    if (nextBeams.length === 0) {
      return splits;
    }

    beams = nextBeams;
  }
};

type LocCache = Map<number, Map<number, number>>;

const part2Recurse = (
  splittersByLevel: Map<number, Set<number>>,
  cache: LocCache,
  x: number,
  y: number,
  h: number,
): number => {
  const ny = y + 1;

  // stop condition when reaching bottom
  if (ny >= h) return 1;

  const nl = x - 1;
  const nr = x + 1;

  // has splitter below
  if (splittersByLevel.get(ny)?.has(x)) {
    const cached = cache.get(y)?.get(x);
    if (cached !== undefined) return cached;

    const cl = part2Recurse(splittersByLevel, cache, nl, ny, h);
    const cr = part2Recurse(splittersByLevel, cache, nr, ny, h);

    const result = cl + cr;
    cache.set(y, cache.get(y) || new Map<number, number>());
    cache.get(y)!.set(x, result);

    return result;
  } else {
    // continue down
    return part2Recurse(splittersByLevel, cache, x, ny, h);
  }
};

const part2 = (input: string[]) => {
  const { splittersByLevel, startPoints, height, width } = parse(input);

  const cache: LocCache = new Map<number, Map<number, number>>();

  const startPoint = startPoints[0]!;
  return part2Recurse(
    splittersByLevel,
    cache,
    startPoint[0],
    startPoint[1],
    height,
  );
};

// const i = loadInput("testinput1", "lines");
const i = loadInput("input1", "lines");

l(part1(i));
l(part2(i));
