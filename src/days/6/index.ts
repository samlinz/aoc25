import { l, loadInput, setCurrentDay } from "../../shared/util.js";

setCurrentDay("6");

type Op = "+" | "*";
type Problem = {
  operands: number[];
  operator: Op;
};

const parse1 = (lines: string[]): Problem[] => {
  const problems: Record<number, Problem> = {};

  for (const line of lines) {
    const cols = line.split(" ").filter(Boolean);

    for (let c = 0; c < cols.length; c++) {
      const value = cols[c];
      if (!value) throw Error("parsing error");

      const maybeNumber = parseInt(value, 10);
      const isOperator = Number.isNaN(maybeNumber);

      if (!problems[c])
        problems[c] = {
          operands: [],
          operator: undefined!,
        };

      if (!isOperator) {
        problems[c]!.operands.push(maybeNumber);
        continue;
      }

      problems[c]!.operator = value as Op;
    }
  }
  return Object.values(problems);
};

const parse2 = (lines: string[]): Problem[] => {
  const problems: Record<number, Problem> = {};

  const cols: string[][] = [];
  const operators = lines[lines.length - 1]?.split(" ").filter(Boolean) || [];

  const columnsLength = lines[0]!.split(" ").filter(Boolean).length;
  const linesWithoutOperandLine = lines.length - 1;

  // calculate max width per column, can't be determined from single line
  const maxLengthPerColumn: number[] = new Array(columnsLength).fill(0);
  for (let l = 0; l < linesWithoutOperandLine; l++) {
    const line = lines[l]!;
    const colsForLine: string[] = line.split(" ").filter(Boolean);

    for (let c = 0; c < colsForLine.length; c++) {
      const colLen = colsForLine[c]!.length;
      if (colLen > maxLengthPerColumn[c]!) {
        maxLengthPerColumn[c] = colLen;
      }
    }
  }

  for (let l = 0; l < linesWithoutOperandLine; l++) {
    const line = lines[l]!;

    const chars = line.split("");
    let iCol = 0;
    let currentNum = "";

    for (let c = 0; c < line.length; c++) {
      const char = chars[c]!;

      // skip space and move to next column if currentNum is complete
      if (currentNum.length === maxLengthPerColumn[iCol]!) {
        cols[iCol] = cols[iCol] ?? [];
        cols[iCol]!.push(currentNum);
        iCol++;
        currentNum = "";
        continue;
      }

      currentNum += char;
    }

    // last column
    cols[iCol] = cols[iCol] ?? [];
    cols[iCol]!.push(currentNum);
  }

  const numOperands = cols[0]!.length;

  for (let c = 0; c < cols.length; c++) {
    const operandsForColumn: string[] = [];
    const operatorForColumn = operators[c];
    for (let i = 0; i < numOperands; i++) {
      operandsForColumn.push(cols[c]![i]!);
    }

    const longest = maxLengthPerColumn[c]!;

    for (let i = longest - 1; i >= 0; i--) {
      let value = "";
      for (let o = 0; o < operandsForColumn.length; o++) {
        const char = operandsForColumn[o]![i] || " ";
        if (char === " ") continue;

        value += char;
      }

      if (!problems[c]) {
        problems[c] = {
          operands: [],
          operator: operatorForColumn as Op,
        };
      }

      const numValue = parseInt(value, 10);
      if (Number.isNaN(numValue)) throw Error("parsing error");
      problems[c]!.operands.push(numValue);
    }
  }

  return Object.values(problems);
};

const part1 = (problems: Problem[]) => {
  let total = 0;
  for (const problem of problems) {
    const { operands, operator } = problem;
    let result = 0;
    switch (operator) {
      case "+":
        result = operands.reduce((a, b) => a + b, 0);
        break;
      case "*":
        result = operands.reduce((a, b) => a * b, 1);
        break;
    }
    total += result;
  }

  return total;
};

// const i = loadInput("testinput1", "lines");
const i = loadInput("input1", "lines");

l(part1(parse1(i)));
l(part1(parse2(i)));
