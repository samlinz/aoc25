import { l, loadInput, setCurrentDay } from "../../shared/util.js";

setCurrentDay("1");

const DIR_L = -1;
const DIR_R = 1;

type Input = [number, number][];

const parseLine = (line: string): Input[number] | null => {
  if (!line) return null;

  const first = line.charAt(0);
  const rest = parseInt(line.slice(1), 10);

  if (Number.isNaN(rest)) {
    throw new Error(`Could not parse line: ${line}`);
  }

  return [first === "L" ? DIR_L : DIR_R, rest] as const;
};

const getInput = (file: string) => {
  const input = loadInput(file, "lines");
  const parsed = input.map(parseLine).filter(Boolean);
  return parsed;
};

const wrapper = () => {
  const min = 0;
  const max = 99;

  return {
    part1(input: Input) {
      const rangeSize = max - min + 1;

      let pos = 50;

      const rotate = (direction: number, amount: number) => {
        // can overflow multiple times the range!
        const newPosition = pos + amount * direction;

        // handle both negative and positive overflow
        // negative case: 5 - 10 = -5 % 100 = -5 + 100 = 95 % 100 = 95
        // positive case: 95 + 10 = 105 % 100 = 5 + 100 = 105 % 100 = 5
        // multiple times: 5 - 250 = -245 % 100 = -45 + 100 = 55 % 100 = 55
        const normalized =
          (((newPosition - min) % rangeSize) + rangeSize) % rangeSize;

        return min + normalized;
      };

      let timesAtZero = 0;

      for (const [dir, amount] of input) {
        pos = rotate(dir, amount);

        if (pos === 0) {
          timesAtZero += 1;
        }
      }

      return timesAtZero;
    },

    // brute forcee
    part2(input: Input) {
      let pos = 50;
      let count = 0;

      for (const [dir, amount] of input) {
        for (let i = 0; i < amount; i++) {
          pos = pos + dir;

          if (pos < min) pos = max;
          if (pos > max) pos = min;
          if (pos === 0) count++;
        }
      }

      return count;
    },
  };
};

// test
// l(wrapper()(getInput("testinput1")));

// part 1
l(wrapper().part1(getInput("input1")));

// part2 test
// l(
//   wrapper().part2([
//     [-1, 200],
//     [1, 150],
//     [-1, 1],
//     [1, 2],
//   ]),
// );

// part 2 - same input
l(wrapper().part2(getInput("input1")));
