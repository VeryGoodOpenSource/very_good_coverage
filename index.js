const core = require('@actions/core');
const minimatch = require('minimatch');
const parse = require('lcov-parse');

function run() {
  const lcovPath = core.getInput('path');
  const minCoverage = core.getInput('min_coverage');
  const excluded = core.getInput('exclude');
  const excludedFiles = excluded.split(' ');

  parse(lcovPath, (_, data) => {
    if (typeof data === 'undefined') {
      core.setFailed('parsing error!');
      return;
    }
    let totalFinds = 0;
    let totalHits = 0;
    data.forEach((element) => {
      if (shouldCalculateCoverageForFile(element['file'], excludedFiles)) {
        totalHits += element['lines']['hit'];
        totalFinds += element['lines']['found'];
      }
    });
    const coverage = (totalHits / totalFinds) * 100;
    const isValidBuild = coverage >= minCoverage;
    if (!isValidBuild) {
      core.setFailed(`${coverage} is less than min_coverage ${minCoverage}`);
    }
  });
}

function shouldCalculateCoverageForFile(fileName, excludedFiles) {
  for (let i = 0; i < excludedFiles.length; i++) {
    const isExcluded = minimatch(fileName, excludedFiles[i]);
    if (isExcluded) {
      core.debug(`Excluding ${fileName} from coverage`);
      return false;
    }
  }
  return true;
}

run();
