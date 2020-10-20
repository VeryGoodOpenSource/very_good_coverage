const core = require("@actions/core");

async function run() {
  try {
    const lcovPath = core.getInput("path");
    core.debug(lcovPath);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
