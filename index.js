const core = require("@actions/core");
const parse = require("lcov-parse");

function run() {
  const lcovPath = core.getInput("path");

  parse(lcovPath, function (err, data) {
    if (err) {
      core.setFailed("parsing error!");
    }
    let totalFinds = 0;
    let totalHits = 0;
    data.forEach(element => {
      totalHits += element['lines']['hit'];
      totalFinds += element['lines']['found'];
    });
    core.debug((totalHits / totalFinds) * 100);
  });
}

run();
