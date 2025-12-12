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

const getPath = (
  curr: string,
  props: Val,
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

  if (pathSet.has(curr)) return 0; // loop, already visited this

  let t = 0;
  for (const next of upwards!) {
    if (pathSet.has(next)) continue; // loop, already visited this

    const r = getPath(next, props, newPathSet, leadsToYou);

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

type Part2Cache = Map<
  string,
  {
    leadsToYou: number;
    leadsToYouWithFft: number;
    leadsToYouWithDac: number;
    leadsToYouWithFftAndDac: number;
  }
>;

const getPath2 = (
  curr: string,
  props: Val,
  pathSet: Set<string>,
  cache: Part2Cache,
) => {
  const isFft = curr === "fft";
  const isDac = curr === "dac";
  const isSvr = curr === "svr";

  // Search hits end
  if (isSvr) {
    return {
      leadsToYou: 1,
      leadsToYouWithFft: 0,
      leadsToYouWithDac: 0,
      leadsToYouWithFftAndDac: 0,
    };
  }

  const cacheKey = curr;
  const ltyValue = cache.get(cacheKey);

  // Return cached value
  if (ltyValue !== undefined) return ltyValue;

  const upwards = props.reverseConnections![curr];

  // Path ends here without hitting svr
  if (!upwards || upwards.length === 0) {
    return {
      leadsToYou: 0,
      leadsToYouWithFft: 0,
      leadsToYouWithDac: 0,
      leadsToYouWithFftAndDac: 0,
    };
  }

  const newPathSet = new Set(pathSet);
  newPathSet.add(curr);

  const t = {
    leadsToYou: 0,
    leadsToYouWithFft: 0,
    leadsToYouWithDac: 0,
    leadsToYouWithFftAndDac: 0,
  };

  for (const next of upwards!) {
    if (pathSet.has(next)) continue; // avoid loops

    const r = getPath2(next, props, newPathSet, cache);

    t.leadsToYou += r.leadsToYou;
    t.leadsToYouWithFft += r.leadsToYouWithFft + (isFft ? r.leadsToYou : 0);
    t.leadsToYouWithDac += r.leadsToYouWithDac + (isDac ? r.leadsToYou : 0);
    t.leadsToYouWithFftAndDac +=
      r.leadsToYouWithFftAndDac +
      (isFft ? r.leadsToYouWithDac : 0) +
      (isDac ? r.leadsToYouWithFft : 0);
  }

  cache.set(cacheKey, t);
  return t;
};

const part1 = (lines: string[]) => {
  const { connections, connectionsWithOutputs, reverseConnections } =
    parse(lines);

  let result = 0;

  const leadsToYou = new Map<string, number>();

  for (const endpoint of connectionsWithOutputs.values()) {
    const props = { connections, connectionsWithOutputs, reverseConnections };

    getPath(endpoint, props, new Set(), leadsToYou);
  }

  for (const endpoint of connectionsWithOutputs.values()) {
    const count = leadsToYou.get(endpoint) ?? 0;
    result += count;
  }

  return result;
};

const part2 = (lines: string[]) => {
  const { connections, connectionsWithOutputs, reverseConnections } =
    parse(lines);

  let result = 0;

  const leadsToYou: Part2Cache = new Map();

  for (const endpoint of connectionsWithOutputs.values()) {
    const props = { connections, connectionsWithOutputs, reverseConnections };

    getPath2(endpoint, props, new Set(), leadsToYou);
  }

  for (const endpoint of connectionsWithOutputs.values()) {
    const count = leadsToYou.get(endpoint)?.leadsToYouWithFftAndDac ?? 0;
    result += count;
  }

  return result;
};

const i = loadInput("input1", "lines");
l(part1(i));
l(part2(i));
