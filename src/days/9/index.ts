import { l, loadInput, setCurrentDay } from "../../shared/util.js";
import * as Geo from "geometric";

setCurrentDay("9");

type Loc = [number, number]; // x, y
type Line = [Loc, Loc];
type Polygon = Loc[];

const area2d = (a: Loc, b: Loc): number => {
  return (Math.abs(a[0] - b[0]) + 1) * (Math.abs(a[1] - b[1]) + 1);
};

const parseInput = (input: string[]): Loc[] =>
  input.map((x) => x.split(",").map(Number) as Loc);

// adapted from geometric, allows points being ON lines
export function lineIntersectsLineModified(lineA: Line, lineB: Line) {
  const [[a0x, a0y], [a1x, a1y]] = lineA,
    [[b0x, b0y], [b1x, b1y]] = lineB;

  const denom = (b1y - b0y) * (a1x - a0x) - (b1x - b0x) * (a1y - a0y);

  if (denom === 0) return false;

  const deltaY = a0y - b0y,
    deltaX = a0x - b0x,
    numer0 = (b1x - b0x) * deltaY - (b1y - b0y) * deltaX,
    numer1 = (a1x - a0x) * deltaY - (a1y - a0y) * deltaX,
    quotA = numer0 / denom,
    quotB = numer1 / denom;

  return quotA > 0 && quotA < 1 && quotB > 0 && quotB < 1;
}

// adapted from geometric
// checks that line CROSSES polycon edges, but allows points being ON edges
export function lineIntersectsPolygonModified(line: Line, closed: Polygon) {
  let intersects = false;

  for (let i = 0, l = closed.length - 1; i < l; i++) {
    const v0 = closed[i],
      v1 = closed[i + 1];

    if (lineIntersectsLineModified(line, [v0!, v1!])) {
      intersects = true;
      break;
    }
  }

  return intersects;
}

// largest approach
const part1 = (lines: string[]) => {
  const locs = parseInput(lines);

  let largest = -Infinity;

  for (const loc of locs) {
    for (const loc2 of locs) {
      if (loc === loc2) continue;
      const area = area2d(loc, loc2);
      if (area > largest) {
        largest = area;
      }
    }
  }

  return largest;
};

const part2 = (lines: string[]) => {
  const polygon: Polygon = parseInput(lines);

  // close polygon
  polygon.push(polygon[0]!);

  const polygonEdges: [Loc, Loc][] = [];
  for (let i = 0; i < polygon.length - 1; i++) {
    const a = polygon[i]!;
    const b = polygon[i + 1]!;
    polygonEdges.push([a, b]);
  }

  let largest = -Infinity;
  for (const loc of polygon) {
    for (const loc2 of polygon) {
      if (loc === loc2) continue;

      const smallerX = Math.min(loc[0], loc2[0]);
      const biggerX = Math.max(loc[0], loc2[0]);
      const smallerY = Math.min(loc[1], loc2[1]);
      const biggerY = Math.max(loc[1], loc2[1]);

      const area = area2d(loc, loc2);

      // filter out definitely smaller areas
      if (area <= largest) continue;

      // potentially larger box

      // box is inside polygon IF
      // - all vertices are inside polygon
      // - no edges intersect polygon edges

      // box vertices
      const vertices = [
        [smallerX, smallerY],
        [smallerX, biggerY],
        [biggerX, smallerY],
        [biggerX, biggerY],
      ];

      // box edges
      const edges = [
        [
          [smallerX, smallerY],
          [smallerX, biggerY],
        ],
        [
          [smallerX, biggerY],
          [biggerX, biggerY],
        ],
        [
          [biggerX, biggerY],
          [biggerX, smallerY],
        ],
        [
          [biggerX, smallerY],
          [smallerX, smallerY],
        ],
      ];

      // all vertices inside polygon?
      if (
        !vertices.every(
          (v) =>
            Geo.pointInPolygon(v as Loc, polygon) ||
            Geo.pointOnPolygon(v as Loc, polygon),
        )
      )
        continue;

      // check if any edges intersect polygon edges
      const intersects = edges.find((e) =>
        lineIntersectsPolygonModified(e as [Loc, Loc], polygon),
      );

      if (intersects) continue;

      largest = area;
    }
  }

  return largest;
};

// const i = loadInput("testinput1", "lines");
const i = loadInput("input1", "lines");
l(part1(i));
l(part2(i));

// const visualize = (
//   w: number,
//   h: number,
//   cache: Map<number, Set<number>>,
//   polygon: Polygon,
// ) => {
//   let output = "";
//   for (let y = 0; y < h; y++) {
//     for (let x = 0; x < w; x++) {
//       if (cache.has(x) && cache.get(x)!.has(y)) {
//         output += "#";
//       } else {
//         output += ".";
//       }
//     }
//     output += "\n";
//   }
//   for (const p of polygon) {
//     const index = p[1] * (w + 1) + p[0];
//     output = output.slice(0, index) + "X" + output.slice(index + 1);
//   }
//   l(output);
// };
