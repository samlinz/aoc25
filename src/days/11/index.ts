import { l, loadInput, setCurrentDay } from "../../shared/util.js";

setCurrentDay("11");

const parse = (lines: string[]) => {
  const connections: Record<string, string[]> = {};
  const reverseConnections: Record<string, string[]> = {};
  const connectionsWithOutputs: Set<string> = new Set();

  for (const line of lines) {
    const [name, outputs] = line.split(":").map((s) => s.trim());
    const outputNames = outputs!.split(" ").map((s) => s.trim());

    if (!name) throw new Error("parse");
    if (outputNames.length === 0) throw new Error("parse");

    for (const out of outputNames) {
      if (!connections[name]) connections[name] = [];
      if (!reverseConnections[out]) reverseConnections[out] = [];

      connections[name].push(out);
      reverseConnections[out].push(name);

      if (out === "out") {
        connectionsWithOutputs.add(name);
      }
    }
  }

  return {
    connections,
    connectionsWithOutputs,
    reverseConnections,
  };
};

type Val = ReturnType<typeof parse>;
type Path = string[];

const getPath = (
  curr: string,
  props: Val,
  path: Path,
  pathSet: Set<string>,
  leadsToYou: Map<string, number>,
) => {
  const ltyValue = leadsToYou.get(curr);
  if ((ltyValue !== undefined && ltyValue > 0) || curr === "you") {
    return ltyValue ?? 1;
  }

  const upwards = props.reverseConnections![curr];
  if (!upwards || upwards.length === 0 || ltyValue === 0) {
    return 0;
  }

  const newPathSet = new Set(pathSet);
  newPathSet.add(curr);

  const newPath = path.slice();
  newPath.push(curr);

  if (pathSet.has(curr)) return 0; // loop, already visited this

  let t = 0;
  for (const next of upwards!) {
    if (pathSet.has(next)) continue; // loop, already visited this

    const r = getPath(next, props, newPath, newPathSet, leadsToYou);

    if (r > 0) {
      t += r;
      leadsToYou.set(curr, (leadsToYou.get(curr) ?? 0) + r);
    }
  }

  if (t === 0) {
    leadsToYou.set(curr, 0);
  }

  return t;
};

const getPath3 = (
  curr: string,
  props: Val,
  pathSet: Set<string>,
  cache: Map<
    string,
    {
      leadsToYou: number;
      leadsToYouWithFft: number;
      leadsToYouWithDac: number;
      leadsToYouWithFftAndDac: number;
    }
  >,
  hasFft: boolean,
  hasDac: boolean,
) => {
  // ISSUE 1: hasFft/hasDac should be checked BEFORE checking cache
  // The cache is state-independent but paths are state-dependent
  if (curr == "fft") hasFft = true;
  if (curr == "dac") hasDac = true;

  if (curr === "svr") {
    return {
      leadsToYou: 1,
      leadsToYouWithFft: hasFft ? 1 : 0,
      leadsToYouWithDac: hasDac ? 1 : 0,
      leadsToYouWithFftAndDac: hasDac && hasFft ? 1 : 0,
    };
  }

  // ISSUE 2: Cache key doesn't include hasFft/hasDac state
  // Different calls with same 'curr' but different flags will incorrectly share cache
  // const cacheKey = `${curr}-${hasFft}-${hasDac}`;
  const cacheKey = curr;
  const ltyValue = cache.get(cacheKey);

  if (ltyValue !== undefined) {
    const newLeadsToYouWithFft = hasFft
      ? ltyValue.leadsToYouWithDac
      : ltyValue.leadsToYouWithFft;
    const newLeadsToYouWithDac = hasDac
      ? ltyValue.leadsToYouWithFft
      : ltyValue.leadsToYouWithDac;
    const newLeadsToYouWithFftAndDac =
      hasFft && hasDac
        ? ltyValue.leadsToYouWithFftAndDac
        : hasFft
          ? ltyValue.leadsToYouWithDac
          : hasDac
            ? ltyValue.leadsToYouWithFft
            : 0;
    return {
      leadsToYou: ltyValue.leadsToYou,
      leadsToYouWithFft: newLeadsToYouWithFft,
      leadsToYouWithDac: newLeadsToYouWithDac,
      leadsToYouWithFftAndDac: newLeadsToYouWithFftAndDac,
    };
  }

  const upwards = props.reverseConnections![curr];
  // ISSUE 3: Comparing ltyValue === 0 when it could be undefined
  if (!upwards || upwards.length === 0) {
    const result = {
      leadsToYou: 0,
      leadsToYouWithFft: 0,
      leadsToYouWithDac: 0,
      leadsToYouWithFftAndDac: 0,
    };
    cache.set(cacheKey, result);
    return result;
  }

  const newPathSet = new Set(pathSet);
  newPathSet.add(curr);

  if (pathSet.has(curr)) {
    return {
      leadsToYou: 0,
      leadsToYouWithFft: 0,
      leadsToYouWithDac: 0,
      leadsToYouWithFftAndDac: 0,
    };
  }

  let t = {
    leadsToYou: 0,
    leadsToYouWithFft: 0,
    leadsToYouWithDac: 0,
    leadsToYouWithFftAndDac: 0,
  };

  for (const next of upwards!) {
    if (pathSet.has(next)) continue;

    // ISSUE 4: Passing current hasFft/hasDac state, but they should propagate
    const response = getPath3(next, props, newPathSet, cache, hasFft, hasDac);

    // ISSUE 5: Cache update logic is redundant - should just accumulate in 't'
    t.leadsToYou += response.leadsToYou;
    t.leadsToYouWithFft += response.leadsToYouWithFft;
    t.leadsToYouWithDac += response.leadsToYouWithDac;
    t.leadsToYouWithFftAndDac += response.leadsToYouWithFftAndDac;
  }

  cache.set(cacheKey, t);
  return t;
};

// const getPath3 = (
//   curr: string,
//   props: Val,
//   // path: Path,
//   pathSet: Set<string>,
//   leadsToYou: Record<string, Set<string>>,
//   leadsToYouCount: Record<string, number>,
//   hasDac: boolean,
//   hasFft: boolean,
// ) => {
//   if (curr == "fft") hasFft = true;
//   if (curr == "dac") hasDac = true;
//   // if (curr === "svr") {
//   if (curr === "you") {
//     // const validPath = hasFft && hasDac;
//     // return validPath ? 1 : 0;
//     return 1;
//   }

//   const ltyValue = leadsToYou[curr]?.size;
//   if (ltyValue !== undefined && ltyValue > 0) {
//     return ltyValue;
//   }

//   const upwards = props.reverseConnections![curr];
//   if (!upwards || upwards.length === 0 || ltyValue === 0) {
//     return 0;
//   }

//   const newPathSet = new Set(pathSet);
//   newPathSet.add(curr);

//   // const newPath = path.slice();
//   // newPath.push(curr);

//   let t = 0;
//   for (const next of upwards!) {
//     if (newPathSet.has(next)) continue; // loop, already visited this

//     const r = getPath3(
//       next,
//       props,
//       // newPath,
//       newPathSet,
//       leadsToYou,
//       leadsToYouCount,
//       hasDac,
//       hasFft,
//     );

//     if (r > 0) {
//       t += r;
//       // leadsToYou.set(curr, (leadsToYou.get(curr) ?? 0) + r);
//       if (!leadsToYou[curr]) leadsToYou[curr] = new Set();
//       leadsToYou[curr].add(next);
//       leadsToYouCount[curr] = (leadsToYouCount[curr] ?? 0) + r;
//     }
//   }

//   if (t === 0) {
//     // leadsToYou.set(curr, 0);
//     leadsToYou[curr] = new Set();
//     leadsToYouCount[curr] = 0;
//   }

//   return t;
// };

const part1 = (lines: string[]) => {
  const { connections, connectionsWithOutputs, reverseConnections } =
    parse(lines);

  let result = 0;

  // const leadsToYou = new Map<string, number>();
  const leadsToYou = new Map<string, any>();

  for (const endpoint of connectionsWithOutputs.values()) {
    const props = { connections, connectionsWithOutputs, reverseConnections };

    getPath3(endpoint, props, new Set(), leadsToYou, false, false);
  }

  for (const endpoint of connectionsWithOutputs.values()) {
    const count = leadsToYou.get(endpoint)?.leadsToYouWithFftAndDac ?? 0;
    result += count;
  }

  return result;
};

const buildPaths = (
  curr: string,
  leadsToYou: Record<string, Set<string>>,
  hasFft: boolean,
  hasDac: boolean,
) => {
  // const paths: string[][] = [];

  if (curr === "svr") {
    // return [[curr]];
    if (hasFft && hasDac) {
      return 1;
    }

    return 0;
  }

  let nextHasFft = hasFft;
  let nextHasDac = hasDac;
  if (curr === "fft") nextHasFft = true;
  if (curr === "dac") nextHasDac = true;

  let paths = 0;
  for (const next of leadsToYou[curr] || []) {
    const sr = buildPaths(next, leadsToYou, nextHasFft, nextHasDac);
    paths += sr;
    // for (const sp of subPaths) {
    //   paths.push([curr, ...sp]);
    // }
  }

  return paths;
};

const part3 = (lines: string[]) => {
  const { connections, connectionsWithOutputs, reverseConnections } =
    parse(lines);

  let result = 0;

  const leadsToYou: Record<string, Set<string>> = {};
  const leadsToYouCount: Record<string, number> = {};

  for (const endpoint of connectionsWithOutputs.values()) {
    const props = { connections, connectionsWithOutputs, reverseConnections };
    getPath3(
      endpoint,
      props,
      new Set(),
      leadsToYou,
      leadsToYouCount,
      false,
      false,
    );
    // result += r;
  }

  for (const endpoint of connectionsWithOutputs.values()) {
    const count = leadsToYouCount[endpoint] ?? 0;
    result += count;
  }

  return result;
};
const part2 = (lines: string[]) => {
  const { connections, connectionsWithOutputs, reverseConnections } =
    parse(lines);

  let result = 0;

  const leadsToYou: Record<string, Set<string>> = {};

  for (const endpoint of connectionsWithOutputs.values()) {
    const props = { connections, connectionsWithOutputs, reverseConnections };
    const r = getPath3(endpoint, props, new Set(), leadsToYou, false, false);
    result += r;
  }

  // build paths
  // for (const endpoint of connectionsWithOutputs.values()) {
  //   result += buildPaths(endpoint, leadsToYou, false, false);
  //   // const paths = buildPaths(endpoint, leadsToYou);

  //   // for (const p of paths) {
  //   //   if (!p.includes("fft")) continue;
  //   //   if (!p.includes("dac")) continue;
  //   //   result++;
  //   // }
  // }

  return result;
};

// const i = loadInput("testinput1", "lines");
const i = loadInput("testinput2", "lines");
// const i = loadInput("input1", "lines");
// l(part1(i));
// l(part1(i));
// l(part2(i));
l(part1(i));
