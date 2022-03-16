const core = require('@actions/core');
const github = require('@actions/github');
const minimatch = require('minimatch');
const parse = require('lcov-parse');
const fs = require('fs');

function run() {
  const lcovPath = core.getInput('path');
  const minCoverage = core.getInput('min_coverage');
  const excluded = core.getInput('exclude');
  const excludedFiles = excluded.split(' ');
  const reportCoverageCommentFlag = core.getInput('report_coverage_comment');

  if (!canParse(lcovPath)) {
    return;
  }

  parse(lcovPath, async (err, data) => {
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
    const coverage = (totalHits / totalFinds) * 100;
    const coverageString = coverage.toFixed(1);
    const linesMissingCoverageByFile = Object.entries(linesMissingCoverage).map(
      ([file, lines]) => {
        return `${file}: ${lines.join(', ')}`;
      }
    );

    if (reportCoverageCommentFlag) {
      await reportCoverageComment(
        linesMissingCoverageByFile,
        totalFinds,
        totalHits,
        coverageString
      );
    }

    const isValidBuild = coverage >= minCoverage;
    if (!isValidBuild) {
      core.setFailed(
        `${coverageString} is less than min_coverage ${minCoverage}\n\n` +
          'Lines not covered:\n' +
          linesMissingCoverageByFile.map((line) => `  ${line}`).join('\n')
      );
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
  if (fs.existsSync(path) && fs.readFileSync(path).length === 0) {
    core.setFailed('lcov is empty!');
    return false;
  }

  return true;
}

async function reportCoverageComment(
  linesMissingCoverageByFile,
  totalFinds,
  totalHits,
  coverageString
) {
  const gitHubToken = core.getInput('github-token').trim();
  const projectNameInput = core.getInput('project_name');
  if (gitHubToken !== '' && github.context.eventName === 'pull_request') {
    try {
      const octokit = github.getOctokit(gitHubToken);
      const sha = github.context.payload.pull_request.head.sha;
      const shaShort = sha.substr(0, 7);

      const summary = `Summary coverage rate: \n  ${coverageString}% (${totalHits} of ${totalFinds} lines)`;

      const missedLines = linesMissingCoverageByFile
        .map((line) => `  ${line}`)
        .join('\n');

      const projectName = projectNameInput || github.context.workflow;
      const missedLinesString =
        linesMissingCoverageByFile.length === 0
          ? ''
          : `Missed lines:\n${missedLines}`;

      const coverageMet = linesMissingCoverageByFile.length === 0;
      const coverageStatus = coverageMet
        ? `✅ Minimum coverage met`
        : `❌ Minimum coverage treshold not met!`;

      let body = `### [LCOV](https://github.com/marketplace/actions/report-lcov) of commit [<code>${shaShort}</code>](${github.context.payload.pull_request.number}/commits/${sha}) during [${projectName} #${github.context.runNumber}](../actions/runs/${github.context.runId})\n<pre>${coverageStatus}\n\n${summary}\n\n${missedLinesString}</pre>`;

      await postOrUpdateComment(body, octokit, projectName);
    } catch (error) {
      core.setFailed(error.message);
    }
  }
}

async function postOrUpdateComment(commentBody, octokit, projectName) {
  const commentInfo = {
    ...github.context.repo,
    issue_number: github.context.issue.number,
  };

  let commentId;
  try {
    const comments = (await octokit.issues.listComments(commentInfo)).data;
    for (let i = comments.length; i--; ) {
      const c = comments[i];
      if (isCommentByBot(c, projectName)) {
        commentId = c.id;
        break;
      }
    }
  } catch (e) {
    core.setFailed('Error checking for previous comments!');
  }

  if (commentId) {
    try {
      await octokit.issues.updateComment({
        ...github.context.repo,
        comment_id: commentId,
        body: commentBody,
      });
    } catch (e) {
      commentId = null;
    }
  }

  if (!commentId) {
    try {
      await octokit.issues.createComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.payload.pull_request.number,
        body: commentBody,
      });
    } catch (e) {
      core.setFailed(`Error creating comment: ${e.message}`);
    }
  }
}

function isCommentByBot(comment, projectName) {
  return (
    comment.user.type === 'Bot' &&
    comment.body.includes('LCOV') &&
    comment.body.includes(projectName)
  );
}

run();
