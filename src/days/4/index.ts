import { l, loadInput, setCurrentDay } from "../../shared/util.js";

setCurrentDay("4");

type Lookup = Map<number, Set<number>>;

const parse = (lines: string[]) => {
  const lookup = new Map<number, Set<number>>() as Lookup;
  const rolls: [number, number][] = [];

  let y = 0;
  for (const line of lines) {
    if (!line) continue;

    const chars = line.split("");

    if (!lookup.has(y)) {
      lookup.set(y, new Set<number>());
    }

    for (let x = 0; x < chars.length; x++) {
      const c = chars[x];
      if (c === "@") {
        lookup.get(y)!.add(x);
        rolls.push([x, y]);
      }
    }

    y++;
  }

  return {
    lookup,
    rolls,
  };
};

const deltasWithDiagonals: [number, number][] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const countNeighbors = (lookup: Lookup) => (x: number, y: number) => {
  let r = 0;
  for (const [dx, dy] of deltasWithDiagonals) {
    if (lookup.get(y + dy)?.has(x + dx)) r++;
  }

  return r;
};

const part1 = (lines: string[]) => {
  const { lookup, rolls } = parse(lines);

  const cn = countNeighbors(lookup);

  let total = 0;
  for (const [x, y] of rolls) {
    const rollNeighbors = cn(x, y);
    if (rollNeighbors < 4) {
      total++;
    }
    // total += rollNeighbors;
  }

  return total;
};

const part2 = (lines: string[]) => {
  const { lookup, rolls } = parse(lines);

  const cn = countNeighbors(lookup);

  let total = 0;

  outer: while (true) {
    for (let i = 0; i < rolls.length; i++) {
      const [x, y] = rolls[i] as [number, number];
      const rollNeighbors = cn(x, y);
      if (rollNeighbors < 4) {
        total++;
        lookup.get(y)!.delete(x);
        rolls.splice(i, 1);
        continue outer; // start again
      }
    }

    break; // no changes
  }

  return total;
};

// const input = loadInput("testinput1", "lines");
const input = loadInput("input1", "lines");

l(part1(input));
l(part2(input));
