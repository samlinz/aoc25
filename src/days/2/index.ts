import { l, loadInput, setCurrentDay } from "../../shared/util.js";

setCurrentDay("2");

/**
 * Part 1:
 * - find invalid id sequences
 * - invalid sequence is made of sequence of digits repeated twice
 * - 55, 6464, 123123
 * - no leading zeroes
 * - add up invalid ids
 * - repeat TWICE for full length
 *
 * Part 2:
 * - repeat AT LEAST TWICE for full length
 * e.g. 123123123
 */

const getInput = (filename: string) =>
  loadInput(filename, "plain")
    .split("\n")
    .map((line: string) => line.trim())
    .filter(Boolean)
    .flatMap((line: string) => line.split(","))
    .filter(Boolean)
    .map((str: string) => str.split("-"));

const cache: Record<string, string[]> = {};

type Input = [string, string][];

const process1 = (nmb: string): boolean => {
  if (nmb.length === 1) return false;
  if (nmb.length % 2 !== 0) return false;

  const half = nmb.length / 2;
  const p1 = nmb.slice(0, half);
  const p2 = nmb.slice(half, nmb.length);

  if (p1.charAt(0) === "0") return false;
  if (p1 === p2) return true;

  return false;
};

const process2 = (nmb: string): string[] => {
  if (nmb.length === 1) return [];

  const cached = cache[nmb];
  if (cached !== undefined) return cached;

  const maxLen = Math.floor(nmb.length / 2);
  const repeatingParts: string[] = [];

  for (let len = 1; len <= maxLen; len++) {
    const rp = nmb.slice(0, len);
    let doesRepeat = true;

    let fullRepeatingPart = rp;

    for (let pos = len; pos < nmb.length; pos += len) {
      const nextRepeatingPart = nmb.slice(pos, pos + len);
      if (nextRepeatingPart !== rp) {
        doesRepeat = false;
        break;
      }

      fullRepeatingPart += nextRepeatingPart;
    }

    if (doesRepeat) repeatingParts.push(fullRepeatingPart);
  }

  cache[nmb] = repeatingParts;
  return repeatingParts;
};

const part1 = (input: Input) => {
  const invalidIds = new Set<number>();
  for (const [start, stop] of input) {
    for (let i = parseInt(start, 10); i <= parseInt(stop, 10); i++) {
      const isInvalid = process1(i.toString());
      if (isInvalid) {
        invalidIds.add(i);
      }
    }
  }

  const sum = Array.from(invalidIds).reduce((a, b) => a + b, 0);
  return sum;
};

const part2 = (input: Input) => {
  const invalidIds = new Set<number>();
  for (const [start, stop] of input) {
    for (let i = parseInt(start, 10); i <= parseInt(stop, 10); i++) {
      const invalidParts = process2(i.toString());
      invalidParts.forEach((ip) => invalidIds.add(Number(ip)));
    }
  }

  const sum = Array.from(invalidIds).reduce((a, b) => a + b, 0);
  return sum;
};

// l(part1(getInput("testinput1")));
// l(part2(getInput("testinput1")));

l(part1(getInput("input1")));
l(part2(getInput("input1")));
