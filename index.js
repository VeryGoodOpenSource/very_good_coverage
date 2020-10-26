const core = require("@actions/core");
const minimatch = require("minimatch");
const parse = require("lcov-parse");

function run() {
  const lcovPath = core.getInput("path");
  const minCoverage = core.getInput("min_coverage");
  const excluded = core.getInput("exclude");
  const excludedFiles = excluded.split(" ");

  parse(lcovPath, function (_, data) {
    if (typeof data === "undefined") {
      core.setFailed("parsing error!");
      return;
    }
    let totalFinds = 0;
    let totalHits = 0;
    data.forEach(element => {
      const fileName = element["file"];
      if (excludedFiles.forEach(element => {
        const isExcluded = minimatch(fileName, element);
        if (isExcluded) return;
      }));
      totalHits += element['lines']['hit'];
      totalFinds += element['lines']['found'];
    });
    const coverage = (totalHits / totalFinds) * 100;
    const isValidBuild = coverage >= minCoverage;
    if (!isValidBuild) {
      core.setFailed(`Coverage ${coverage} is below the minimum ${minCoverage} expected`);
    }
  });
}

run();
