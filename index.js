const core = require('@actions/core');
const minimatch = require('minimatch');
const parse = require('lcov-parse');
const fs = require('fs');

function run() {
  const lcovPath = core.getInput('path');
  const minCoverageInput = core.getInput('min_coverage');
  const excluded = core.getInput('exclude');
  const excludedFiles = excluded.split(' ');
  const minCoverage = parseMinCoverage(minCoverageInput);

  if (minCoverage === null || !canParse(lcovPath)) {
    return;
  }

  parse(lcovPath, (err, data) => {
    if (typeof data === 'undefined') {
      core.setFailed('parsing error!');
      return;
    }

    const linesMissingCoverage = [];

    let totalFinds = 0;
    let totalHits = 0;
    data.forEach((element) => {
      if (shouldCalculateCoverageForFile(element['file'], excludedFiles)) {
        totalFinds += element['lines']['found'];
        totalHits += element['lines']['hit'];

        for (const lineDetails of element['lines']['details']) {
          const hits = lineDetails['hit'];

          if (hits === 0) {
            const fileName = element['file'];
            const lineNumber = lineDetails['line'];
            linesMissingCoverage[fileName] =
              linesMissingCoverage[fileName] || [];
            linesMissingCoverage[fileName].push(lineNumber);
          }
        }
      }
    });
    const coverage = totalFinds === 0 ? 0 : (totalHits / totalFinds) * 100;
    const isValidBuild = coverage >= minCoverage;
    const linesMissingCoverageByFile = Object.entries(linesMissingCoverage).map(
      ([file, lines]) => {
        return `- ${file}: ${lines.join(', ')}`;
      },
    );
    let linesMissingCoverageMessage =
      `Lines not covered:\n` +
      linesMissingCoverageByFile.map((line) => `  ${line}`).join('\n');
    if (!isValidBuild) {
      core.setFailed(
        `${coverage} is less than min_coverage ${minCoverage}\n\n` +
          linesMissingCoverageMessage,
      );
    } else {
      var resultMessage = `Coverage: ${coverage}%.\n`;
      if (coverage < 100) {
        resultMessage += `${coverage} is greater than or equal to min_coverage ${minCoverage}.\n\n`;
        resultMessage += linesMissingCoverageMessage;
      }
      core.info(resultMessage);
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

function canParse(path) {
  if (!fs.existsSync(path)) {
    core.setFailed(
      `❌ Failed to find an lcov file at ${path}. 
Make sure to generate an lcov file before running VeryGoodCoverage and set the \
path input to the correct location.

For example:
  uses: VeryGoodOpenSource/very_good_coverage@v2
  with:
    path: 'my_project/coverage/lcov.info'      
`,
    );
    return false;
  }

  if (fs.readFileSync(path).length === 0) {
    core.setFailed(
      `❌ Found an empty lcov file at "${path}".
An empty lcov file was found but with no coverage data. This might be because \
you have no test files or your tests are not generating any coverage data.
`,
    );
    return false;
  }

  return true;
}

function parseMinCoverage(input) {
  if (input === '') {
    return 100;
  }

  const asNumber = Number(input);
  if (isNaN(asNumber)) {
    core.setFailed(
      '❌ Failed to parse min_coverage. Make sure to enter a valid number.',
    );
    return null;
  }

  return asNumber;
}

run();
