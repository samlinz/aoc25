import { l, loadInput, setCurrentDay } from "../../shared/util.js";

setCurrentDay("3");

// part 1
// labeled by joltage
// 1-9
// each lines is bank
// Within each bank, you need to turn on exactly two batteries
// the joltage that the bank produces is equal to the number formed by the digits on the batteries you've turned on
// You'll need to find the largest possible joltage each bank can produce
// The total output joltage is the sum of the maximum joltage from each bank

// part 2
// n=12 instead of 2

const _sort = (a: [number, number], b: [number, number]) => b[0] - a[0];

const bankMaxJoltage = (bank: number[]) => {
  const originalPositions: [number, number][] = [];

  for (let i = 0; i < bank.length; i++) {
    originalPositions.push([bank[i]!, i]);
  }

  const positionsSortedByNumber = [...originalPositions].sort(_sort);

  let largestNum = -1;
  for (let i = 0; i < bank.length; i++) {
    const numAtPos = bank[i];
    let secondNumAtPos = -1;

    // find the largest number AFTER current position
    for (const p2 of positionsSortedByNumber) {
      if (p2[1] > i) {
        secondNumAtPos = p2[0];
        break;
      }
    }

    let finalNum = -1;
    if (secondNumAtPos === -1) {
      // final number is just the one at pos
      finalNum = numAtPos!;
    } else {
      finalNum = numAtPos! * 10 + secondNumAtPos;
    }

    if (finalNum > largestNum) {
      largestNum = finalNum;
    }
  }

  return largestNum;
};

const bankMaxJoltage2 = (bank: number[], n = 12) => {
  const originalPositions: [number, number][] = [];

  for (let i = 0; i < bank.length; i++) {
    originalPositions.push([bank[i]!, i]);
  }

  // build positions sorted from largest to smallest, and for ties, smallest to largest position for faster lookup
  const positionsSortedByNumber = [...originalPositions].sort((a, b) => {
    if (b[0] !== a[0]) return b[0] - a[0];
    return a[1] - b[1];
  });

  let largestNum = -1;

  // indexes up to length - n + 1
  for (let i = 0; i <= bank.length - n; i++) {
    const numAtPos = bank[i];
    const parts = [numAtPos];
    let lastPositionUsed = i;

    // find the largest number AFTER current position
    while (parts.length < n) {
      let foundNext = false;

      for (const p2 of positionsSortedByNumber) {
        const [p2Num, p2Pos] = p2;

        const numbersNeeded = n - parts.length;
        const positionsAfterP2 = bank.length - p2Pos;

        if (positionsAfterP2 < numbersNeeded) continue;
        if (p2Pos <= lastPositionUsed) continue; // must be after lastPositionUsed

        parts.push(p2Num);
        lastPositionUsed = p2Pos;
        foundNext = true;

        break;
      }

      if (!foundNext) break;
    }

    if (parts.length < n) {
      continue; // couldn't find enough parts
    }

    const finalNum = Number(parts.join(""));
    if (finalNum > largestNum) {
      largestNum = finalNum;
    }
  }

  return largestNum;
};

const process = (input: number[][], fn = bankMaxJoltage2) => {
  const maxVoltages: number[] = [];

  for (const bank of input) {
    maxVoltages.push(fn(bank));
  }

  return maxVoltages.reduce((a, b) => a + b, 0);
};

const i = loadInput("input1", "lines", (line) =>
  line.split("").map(Number),
) as number[][];

l(process(i, bankMaxJoltage));
l(process(i, bankMaxJoltage2));
