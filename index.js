const core = require("@actions/core");
const parse = require("lcov-parse");

function run() {
  const lcovPath = core.getInput("path");
  core.debug(lcovPath);

  parse(lcovPath, function (err, data) {
    if (err) {
      core.setFailed("parsing error!");
    }
    core.debug(JSON.stringify(data));
  });
}

run();
