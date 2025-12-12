import { l, loadInput, setCurrentDay } from "../../shared/util.js";

setCurrentDay("12");

type PresentGrid = boolean[][];

type PresentIndex = string;
type Present = {
  id: PresentIndex;
  w: number;
  h: number;
  grid: PresentGrid;
  presentSize: number;
};

type Tree = {
  w: number;
  h: number;
  requiredPresents: Record<PresentIndex, number>;
};

const parse = (lines: string[]) => {
  const presents: Record<PresentIndex, Present> = {};
  const trees: Tree[] = [];

  let currentPresent: undefined | Present = undefined;

  for (const line of lines) {
    const isPresentIndex = line.endsWith(":");
    const isEmptyLine = line.length === 0;

    if (isEmptyLine) {
      if (currentPresent) {
        presents[currentPresent.id] = {
          ...currentPresent,
          h: currentPresent.grid.length,
        };
        currentPresent = undefined;
      }
      continue;
    }

    if (isPresentIndex) {
      if (currentPresent) throw Error("invalid");
      const index = parseInt(line, 10);

      currentPresent = {
        id: index.toString(),
        grid: [],
        h: -1,
        w: -1,
        presentSize: 0,
      };
      continue;
    }

    if (currentPresent) {
      // read present grid
      currentPresent.w = line.length;
      const cl: boolean[] = [];
      let lineSize = 0;
      for (const c of line) {
        const isSolid = c === "#";
        cl.push(isSolid);
        if (isSolid) lineSize++;
      }
      currentPresent.grid.push(cl);
      currentPresent.presentSize += lineSize;
      continue;
    }

    const isTreeLine = line.includes(":");
    if (!isTreeLine) throw Error("invalid");

    const [sizePart, rest] = line.split(":");
    const [treeW, treeH] = sizePart!.split("x").map(Number);
    const requiredPresents: Record<PresentIndex, number> = {};

    const reqParts = rest!.trim().split(" ");
    for (let i = 0; i < reqParts.length; i++) {
      const rp = Number(reqParts[i]);
      if (rp === 0) continue;
      requiredPresents[i.toString()] = rp;
    }

    trees.push({
      w: treeW!,
      h: treeH!,
      requiredPresents,
    });
  }

  return {
    trees,
    presents,
  };
};

const decisionFactor = 1.2; // heuristic
const part1 = (lines: string[]) => {
  const { presents, trees } = parse(lines);

  let willDefinitelyFit = 0;
  let willDefinitelyNotFit = 0;
  let maybeFit = 0;

  for (const tree of trees) {
    const treeArea = tree.w * tree.h;
    const requiredPresents = tree.requiredPresents;
    let totalRequiredAreaByPresents = 0;
    for (const [presentIndexStr, count] of Object.entries(requiredPresents)) {
      const present = presents[presentIndexStr];
      totalRequiredAreaByPresents += present!.presentSize * count;
    }

    //   l(tree, totalRequiredAreaByPresents, treeArea);

    const adjustedRequiredArea = totalRequiredAreaByPresents * decisionFactor;
    if (adjustedRequiredArea < treeArea) {
      willDefinitelyFit++;
    } else if (totalRequiredAreaByPresents > treeArea) {
      willDefinitelyNotFit++;
    } else {
      maybeFit++;
    }
  }

  return {
    willDefinitelyFit,
    willDefinitelyNotFit,
    maybeFit,
  };
};

// const i = loadInput("testinput1", "lines", undefined, false);
const i = loadInput("input1", "lines", undefined, false);
l(part1(i));
