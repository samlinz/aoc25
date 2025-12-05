import fsSync from "node:fs";
import path from "node:path";

const rootName = "aoc25";

// i love global state, it's my favourite
let currentDay: string | null = null;

export const setCurrentDay = (day: string) => {
  currentDay = day;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const l = (...args: any[]) => {
  console.log(...args);
};

const isInAoCRoot = () => {
  const cwd = process.cwd();
  return path.basename(cwd) === rootName;
};

const throwIfNoCurrentDay = () => {
  if (!currentDay) {
    throw new Error("Current day is not set. Call setCurrentDay(day) first.");
  }
};

const throwIfNotInAoCRoot = () => {
  if (!isInAoCRoot()) {
    throw new Error(
      `Script must be run from the ${rootName} root folder. Current folder: ${process.cwd()}`,
    );
  }
};

const getPathForDay = (day: string) => path.join("src", "days", day);

export const loadInput = <T = string>(
  filename: string,
  format: string,
  forEachLine?: (line: string) => T,
  removeEmptyLines = true,
) => {
  throwIfNotInAoCRoot();
  throwIfNoCurrentDay();

  const fullpath = path.join(getPathForDay(currentDay!), filename);
  const data = fsSync.readFileSync(fullpath, "utf-8");

  switch (format) {
    case "plain":
      return data;
    case "lines": {
      const rawLines = data
        .split("\n")
        .filter((line) => (removeEmptyLines ? line.length > 0 : true));
      const processedLines = forEachLine
        ? rawLines.map((line) => forEachLine(line))
        : rawLines;
      return processedLines;
    }
    case "csv":
      return data.split(",").map((item) => item.trim());
    case "json":
      return JSON.parse(data);
    default:
      throw new Error(`Unknown format: ${format}`);
  }
};
