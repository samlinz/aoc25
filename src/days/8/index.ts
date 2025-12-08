import { l, loadInput, setCurrentDay } from "../../shared/util.js";

setCurrentDay("8");

// pairs of juction boxes closest to each other in 3d space

type Point3D = [number, number, number];

const distance3dSquared = (a: Point3D, b: Point3D) =>
  (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

const parseInput = (lines: string[]): Point3D[] =>
  lines.map((l) => {
    const [x, y, z] = l.split(",");
    if (!x || !y || !z) throw new Error("Invalid input line: " + l);
    return [Number(x), Number(y), Number(z)] as Point3D;
  });

const hash = (p: Point3D): string => p.join(",");

type Circuit = {
  id: number;
  points: Set<string>;
};

const part1 = (input: Point3D[], n = 1000, n2 = 3): number => {
  const allConnections = new Map<string, [string, string, number]>();

  for (const p of input) {
    const pHash = hash(p);
    for (const q of input) {
      const qHash = hash(q);
      if (pHash === qHash) continue;
      const connHash = [pHash, qHash].sort().join("|");
      if (allConnections.has(connHash)) continue;

      const dist = distance3dSquared(p, q);
      allConnections.set(connHash, [pHash, qHash, dist]);
    }
  }

  const allConnectionsSortedByDistance = Array.from(
    allConnections.values(),
  ).sort((a, b) => a[2] - b[2]);

  const pointCircuit = new Map<string, number>();
  const circuits: Record<string, Circuit> = {};

  let i = 1;
  for (const [p, q] of allConnectionsSortedByDistance.slice(0, n)) {
    const pCircuit = pointCircuit.get(p);
    const qCircuit = pointCircuit.get(q);

    const createNewCircuit = !pCircuit && !qCircuit;

    if (pCircuit && qCircuit && pCircuit === qCircuit) {
      // both points already in same circuit
      continue;
    }

    // add to existing circuit
    if (pCircuit && qCircuit && pCircuit !== qCircuit) {
      // merge circuits
      const circuitToKeep = circuits[pCircuit]!;
      const circuitToMerge = circuits[qCircuit]!;

      for (const point of circuitToMerge.points) {
        circuitToKeep.points.add(point);
        pointCircuit.set(point, circuitToKeep.id);
      }

      delete circuits[qCircuit];
    } else if (pCircuit) {
      circuits[pCircuit]!.points.add(q);
      pointCircuit.set(q, pCircuit);
    } else if (qCircuit) {
      circuits[qCircuit]!.points.add(p);
      pointCircuit.set(p, qCircuit);
    }

    if (createNewCircuit) {
      const circuitId = i++;
      const newCircuit: Circuit = {
        id: circuitId,
        points: new Set<string>([p, q]),
      };
      circuits[circuitId] = newCircuit;
      pointCircuit.set(p, circuitId);
      pointCircuit.set(q, circuitId);
    }
  }

  const circuitsSortedBySize = Object.values(circuits)
    .sort((a, b) => b.points.size - a.points.size)
    .slice(0, n2);

  return circuitsSortedBySize.reduce((sum, c) => sum * c.points.size, 1);
};

// copypasted and modified part1
const part2 = (input: Point3D[]): number => {
  const allConnections = new Map<string, [string, string, number]>();

  for (const p of input) {
    const pHash = hash(p);
    for (const q of input) {
      const qHash = hash(q);
      if (pHash === qHash) continue;
      const connHash = [pHash, qHash].sort().join("|");
      if (allConnections.has(connHash)) continue;

      const dist = distance3dSquared(p, q);
      allConnections.set(connHash, [pHash, qHash, dist]);
    }
  }

  const allConnectionsSortedByDistance = Array.from(
    allConnections.values(),
  ).sort((a, b) => a[2] - b[2]);

  const pointCircuit = new Map<string, number>();
  const circuits: Map<number, Circuit> = new Map();

  let i = 1;
  for (const [p, q] of allConnectionsSortedByDistance) {
    const pCircuit = pointCircuit.get(p);
    const qCircuit = pointCircuit.get(q);

    const createNewCircuit = !pCircuit && !qCircuit;

    if (pCircuit && qCircuit && pCircuit === qCircuit) {
      // both points already in same circuit
      continue;
    }

    // add to existing circuit
    if (pCircuit && qCircuit && pCircuit !== qCircuit) {
      //   l(p, q, " merging circuits", pCircuit, qCircuit);
      // merge circuits
      const circuitToKeep = circuits.get(pCircuit);
      const circuitToMerge = circuits.get(qCircuit);

      for (const point of circuitToMerge!.points) {
        circuitToKeep!.points.add(point);
        pointCircuit.set(point, circuitToKeep!.id);
      }

      //   delete circuits[qCircuit];
      circuits.delete(qCircuit);
    } else if (pCircuit) {
      circuits.get(pCircuit)!.points.add(q);
      pointCircuit.set(q, pCircuit);
    } else if (qCircuit) {
      circuits.get(qCircuit)!.points.add(p);
      pointCircuit.set(p, qCircuit);
    }

    if (createNewCircuit) {
      const circuitId = i++;
      const newCircuit: Circuit = {
        id: circuitId,
        points: new Set<string>([p, q]),
      };
      circuits.set(circuitId, newCircuit);
      pointCircuit.set(p, circuitId);
      pointCircuit.set(q, circuitId);
    }

    // Full circuit check
    if (pointCircuit.size === input.length && circuits.size === 1) {
      return Number(p.split(",")[0]) * Number(q.split(",")[0]);
    }
  }

  throw new Error("Unfinished");
};

// const i = loadInput("testinput1", "lines");
const i = loadInput("input1", "lines");

l(part1(parseInput(i)));
l(part2(parseInput(i)));

// first attempt with kd-tree (abandoned)

// type Node = {
//   point: Point3D;
//   left: Node | null;
//   right: Node | null;
//   axis: number;
// };

// const buildTree = (points: Point3D[], depth = 0): Node | null => {
//   if (points.length === 0) return null;

//   const axis = depth % 3;
//   points.sort((a, b) => a[axis]! - b[axis]!);

//   const midPoint = Math.floor(points.length / 2);

//   return {
//     point: points[midPoint]!,
//     left: buildTree(points.slice(0, midPoint), depth + 1),
//     right: buildTree(points.slice(midPoint + 1), depth + 1),
//     axis,
//   };
// };

// const findNearest = (
//   treeRoot: Node | null,
//   targetPoint: Point3D,
//   result: Point3D | null,
//   resultDistance: number | null,
//   exclusionSet: Set<string>,
// ): [Point3D, number] => {
//   l("entering ", treeRoot?.point);
//   if (treeRoot === null) return [result!, resultDistance!];

//   const treeRootHash = treeRoot.point.join(",");
//   if (exclusionSet.has(treeRootHash)) {
//     l("skipping excluded point ", treeRoot.point);
//     return [result!, resultDistance!];
//   }

//   const rootPoint = treeRoot.point;

//   // distance from tree root to target
//   const distance = distance3dSquared(rootPoint, targetPoint);
//   const distanceSquared = distance * distance;

//   let newResult: Point3D | null = result;
//   let newResultDistance = resultDistance;

//   // update best guess so far
//   if (distance < (newResultDistance ?? Infinity)) {
//     newResultDistance = distance;
//     newResult = rootPoint;
//     l("updated distance ", newResultDistance, " to point ", newResult);
//   }

//   // near subtree == contains the target point
//   const nearSubTree = distance < 0 ? treeRoot.left : treeRoot.right;
//   // far subtree == the other side
//   const farSubTree = distance < 0 ? treeRoot.right : treeRoot.left;

//   // nearest point and best distance from near subtree
//   const [bestPointFromNear, bestDistanceFromNear] = findNearest(
//     nearSubTree,
//     targetPoint,
//     newResult,
//     newResultDistance,
//     exclusionSet,
//   );

//   l("best from near ", bestPointFromNear, bestDistanceFromNear);

//   if (distanceSquared < (bestDistanceFromNear ?? Infinity)) {
//     l("checking far subtree from point ", treeRoot.point);
//     const [bestPointFromFar, bestDistanceFromFar] = findNearest(
//       farSubTree,
//       targetPoint,
//       bestPointFromNear,
//       bestDistanceFromNear,
//       exclusionSet,
//     );
//     return [bestPointFromFar, bestDistanceFromFar];
//   }

//   return [bestPointFromNear, bestDistanceFromNear];
// };

// const part1 = (input: Point3D[]): number => {
//   const points = parseInput(i);
//   const tree = buildTree(points);

//   //   const target = [0, 0, 0] as Point3D;
//   //   const [nearestPoint, nearestDistance] = findNearest(
//   //     tree!,
//   //     target,
//   //     null,
//   //     null,
//   //   );

//   //   l(nearestPoint, nearestDistance);

//   const pointHash = (p: Point3D) => {
//     if (!p) debugger;
//     return p.join(",");
//   };

//   const closestConnections: [Point3D, Point3D, number][] = [];
//   const connectionsFor: Record<string, string[]> = {};

//   const numConnectionsMax = 10;
//   let createdConnections = 0;

//   while (createdConnections < numConnectionsMax) {
//     for (const point of points) {
//       const pointKey = pointHash(point);
//       if (!connectionsFor[pointKey]) {
//         connectionsFor[pointKey] = [];
//       }
//       const existingConnections = connectionsFor[pointKey] || [];
//       //   const pointsWithoutTarget = points.filter(
//       //     (p) => p !== point && !existingConnections.includes(p),
//       //   );
//       const exclusionSet = new Set<string>();
//       exclusionSet.add(pointKey);
//       for (const connectedPointKey of existingConnections) {
//         exclusionSet.add(connectedPointKey);
//       }

//       const [nearestPoint, nearestPointDistance] = findNearest(
//         tree!,
//         point,
//         null,
//         null,
//         exclusionSet,
//       );

//       if (!nearestPoint) {
//         continue;
//       }

//       const nearestPointKey = pointHash(nearestPoint);
//       if (!connectionsFor[nearestPointKey]) {
//         connectionsFor[nearestPointKey] = [];
//       }

//       connectionsFor[pointKey].push(nearestPointKey);
//       connectionsFor[nearestPointKey].push(pointKey);

//       closestConnections.push([point, nearestPoint, nearestPointDistance]);
//       createdConnections++;
//     }
//   }

//   debugger;
// };
