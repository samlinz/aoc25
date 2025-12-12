import { lessEq, Model, solve } from "yalps";
import { l } from "../../shared/util";

// copypasted from github, just testing

const model: Model = {
  direction: "maximize" as const,
  objective: "profit",
  constraints: {
    wood: { max: 300 },
    labor: { max: 110 }, // labor should be <= 110
    storage: lessEq(400), // you can use the helper functions instead
  },
  variables: {
    table: { wood: 30, labor: 5, profit: 1200, storage: 30 },
    dresser: { wood: 20, labor: 10, profit: 1600, storage: 50 },
  },
  integers: ["table", "dresser"], // these variables must have an integer value in the solution
};

const solution = solve(model);
l(solution);
