const process = require("process");
const cp = require("child_process");
const path = require("path");

test("test runs", () => {
  const lcovPath = "./lcov.info";
  process.env["INPUT_PATH"] = lcovPath;
  const ip = path.join(__dirname, "index.js");
  const actual = cp.execSync(`node ${ip}`, { env: process.env }).toString();
  const expected = "::debug::./lcov.info\n";
  expect(actual).toEqual(expected);
});
