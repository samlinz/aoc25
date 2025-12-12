import { equalTo, Model, solve } from "yalps";
import { l, loadInput, setCurrentDay } from "../../shared/util.js";
import { Mode } from "fs";

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

type Seq = number[];

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

const part2SolveMachine = (machine: Machine) => {
  const { buttons, initialState, joltages, target } = machine;

  const colName = (i: number) => `col_${i}`;
  const constraints = joltages.reduce(
    (acc, j, i) => ({ ...acc, [colName(i!)]: equalTo(j) }),
    {},
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variables: any = {};

  for (let bi = 0; bi < buttons.length; bi++) {
    const b = buttons[bi]!;
    const name = `btn_${bi}`;

    variables[name] = {
      cost: 1,
    };

    for (const b2 of b) {
      variables[name][colName(b2)] = 1;
    }
  }

  const model: Model = {
    direction: "minimize" as const,
    objective: "cost",
    constraints,
    variables,
    integers: Object.keys(variables),
  };

  const result = solve(model);
  if (!result || result.status !== "optimal")
    throw new Error("no solution found");

  return result.result;
};

const part2 = (lines: string[]) => {
  const machines = parse(lines);

  let total = 0;
  for (const m of machines) {
    total += part2SolveMachine(m);
  }

  return total;
};

const i = loadInput("input1", "lines");

l(part1(i));
l(part2(i));
