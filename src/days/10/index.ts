import { l, loadInput, setCurrentDay } from "../../shared/util.js";

setCurrentDay("10");

// part 1
// What is the fewest button presses required to correctly configure the indicator lights on all of the machines?
// all initially OFF

// [.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
const REGEX = /\[([.#]+)\]\s((\(\d(,\d)*\)\s*)+)\{([\d,]+)\}/;
type LightStatus = boolean;

const LIGHT_ON = "#";
// const LIGHT_OFF = ".";
type Button = number[];

type Machine = {
  target: LightStatus[];
  initialState: LightStatus[];
  buttons: Button[];
  joltages: number[];
};

type BinaryMachine = {
  target: number;
  initialState: number;
  buttons: number[];
};

const parseLine = (line: string): Machine => {
  const target: LightStatus[] = [];
  const buttons: Button[] = [];

  let initialState: LightStatus[] = [];

  REGEX.exec(line)
    ?.slice(1)
    .forEach((part, index) => {
      if (index === 0) {
        for (const l of part.split("")) {
          target.push(l === LIGHT_ON);
        }
      } else if (index === 1) {
        const rawButtons = part.match(/\(\d(,\d)*\)/g);
        for (const b of rawButtons!) {
          buttons.push(b.slice(1, -1).split(",").map(Number));
        }
        initialState = new Array(target.length).fill(false);
      }
    });

  const joltages = /\{(.+)\}/.exec(line)![1]!.split(",").map(Number);

  return {
    target,
    buttons,
    initialState,
    joltages,
  };
};

const toBinaryFromBoolean = (input: boolean[]) => {
  let result = 0;

  for (let i = 0; i < input.length; i++) {
    if (input[i]) {
      result |= 1 << i;
    }
  }

  return result;
};

const toBinaryFromNumber = (input: number[]) => {
  let result = 0;

  for (const i of input) {
    result |= 1 << i;
  }

  return result;
};

const transformToBinaryMachine1 = (machine: Machine): BinaryMachine => {
  const result: BinaryMachine = {
    target: 0,
    buttons: [],
    initialState: 0,
  };

  const { buttons, target } = machine;

  buttons.forEach((b) => {
    result.buttons.push(toBinaryFromNumber(b));
  });

  result.target = toBinaryFromBoolean(target);
  result.initialState = 0;

  return result;
};

const parse = (lines: string[]) => lines.map(parseLine);

// const printInBoolean = (binaryMachine: BinaryMachine) => {
//   l("initial", binaryMachine.initialState.toString(2));
//   l("target", binaryMachine.target.toString(2));
//   // l("buttons", binaryMachine.target.toString(2));
//   for (const b of binaryMachine.buttons) {
//     l("button", b.toString(2));
//   }
// };

// const seqHash = (sequence: Seq) => sequence.join(",");
type Seq = number[];
// type SequenceCache = Set<string>;

type BinaryMachineState = {
  lastState: number;
  sequence: Seq;
};

// bfs with caching
const part1HandleMachine = (machine: BinaryMachine) => {
  const cache: Map<number, number> = new Map();

  let nextMachineStates: BinaryMachineState[] = [];
  let machineStates: BinaryMachineState[] = [
    {
      lastState: machine.initialState,
      sequence: [] as Seq,
    },
  ];

  while (true) {
    for (const { lastState, sequence } of machineStates) {
      const lastButtonPressIndex = sequence[sequence.length - 1]!;

      let nextState = lastState;
      if (lastButtonPressIndex !== undefined) {
        const lastButtonPress = machine.buttons[lastButtonPressIndex];
        nextState = lastState ^ lastButtonPress!;

        if (nextState === machine.target) {
          l("found solution", sequence);
          return {
            found: true,
            sequence,
          };
        }

        if (cache.has(nextState)) {
          const cachedSeqLength = cache.get(nextState)!;
          if (cachedSeqLength <= sequence.length) {
            // already found a shorter or equal sequence to this state
            continue;
          }
        }
        cache.set(nextState, sequence.length);
      }

      for (let b = 0; b < machine.buttons.length; b++) {
        if (b === lastButtonPressIndex) continue; // don't press same button twice in a row

        nextMachineStates.push({
          //   machine: copyMachine(machine),
          lastState: nextState,
          sequence: [...sequence, b],
        });
      }
    }

    // next round
    machineStates = nextMachineStates;
    nextMachineStates = [];
  }
};

class MinHeap<T> {
  private data: T[] = [];
  constructor(private score: (x: T) => number) {}

  push(x: T) {
    this.data.push(x);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  get size() {
    return this.data.length;
  }

  private bubbleUp(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.score(this.data[i]!) >= this.score(this.data[p]!)) break;
      [this.data[i], this.data[p]] = [this.data[p]!, this.data[i]!];
      i = p;
    }
  }

  private bubbleDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = i * 2 + 1;
      const r = i * 2 + 2;

      if (
        l < n &&
        this.score(this.data[l]!) < this.score(this.data[smallest]!)
      ) {
        smallest = l;
      }
      if (
        r < n &&
        this.score(this.data[r]!) < this.score(this.data[smallest]!)
      ) {
        smallest = r;
      }
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [
        this.data[smallest]!,
        this.data[i]!,
      ];
      i = smallest;
    }
  }
}

const part2HandleMachine = (machine: Machine) => {
  type State = {
    values: number[];
    sequence: Seq;
    cost: number;
  };

  const distance = (target: number[], a: number[]) => {
    let dist = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = target[i]! - a[i]!;
      if (diff < 0) {
        return -1;
      }
      dist += diff;
    }
    return dist;
  };

  const initialValues = machine.initialState.map(() => 0);
  const initialState: State = {
    values: initialValues,
    sequence: [],
    cost: distance(machine.joltages, initialValues),
  };

  const calculateNext = (values: number[], b: number[]): number[] => {
    const next = values.slice();

    b.forEach((buttonIndex) => {
      next[buttonIndex] = next[buttonIndex]! + 1;
    });
    // machine.buttons.forEach((_, i) => {
    //   next[i] = next[i]! + b[i]!;
    // });

    return next;
  };

  const forEachButton = (fn: (b: number) => void) => {
    for (let b = 0; b < machine.buttons.length; b++) {
      fn(b);
    }
  };

  // const cache: Map<string, number> = new Map();
  // const states: State[] = [initialState];
  const states = new MinHeap<State>((s) =>
    distance(machine.joltages, s.values),
  );

  states.push(initialState);
  // let head = 0;

  // const cache: Set<string> = new Set();
  const cache: Record<string, number> = {};
  while (states.size > 0) {
    const currentState = states.pop()!;

    l("best cost " + currentState.cost);

    // const d = distance(machine.joltages, currentState.values);
    if (currentState.cost === currentState.sequence.length) {
      l("found solution", currentState.sequence);
      return currentState;
    }

    forEachButton((b) => {
      const next = calculateNext(currentState.values, machine.buttons[b]!);
      const hash = next.join(",");
      // const hash = next.map((n, i) =>

      const nextDistance = distance(machine.joltages, next);
      if (nextDistance === -1) return;

      const nextCost = currentState.sequence.length + 1 + nextDistance;
      if (nextCost >= currentState.cost) return;

      const cachedCost = cache[hash];
      // if (cachedCost) return;
      if (cachedCost !== undefined && cachedCost <= nextCost) {
        return;
      }

      cache[hash] = nextCost;

      states.push({
        cost: nextCost,
        values: next,
        sequence: [...currentState.sequence, b],
      });
    });
  }

  throw new Error("no solution found");
};

const part1 = (lines: string[]) => {
  const machines = parse(lines).map(transformToBinaryMachine1);

  let total = 0;
  for (const m of machines) {
    const { sequence } = part1HandleMachine(m);
    const len = sequence.length;
    // l(m, "=>", sequence, "length:", len);
    total += len;
  }

  return total;
};

const part2 = (lines: string[]) => {
  const machines = parse(lines);

  let total = 0;
  for (const m of machines) {
    const { sequence } = part2HandleMachine(m)!;
    const len = sequence.length;
    l(sequence, "length:", len);
    // run garbage collection to free memory
    // global.gc?.();
    total += len;
  }

  return total;
};

//   i.forEach(printInBoolean);
//   let total = 0;

// const i = loadInput("testinput1", "lines");
const i = loadInput("input1", "lines");
// l(parse(i));

// l(part1(i));
l(part2(i));
