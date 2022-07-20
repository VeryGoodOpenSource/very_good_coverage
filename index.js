const core = require('@actions/core');
const github = require('@actions/github'); /// https://octokit.github.io/
const minimatch = require('minimatch');
const parse = require('lcov-parse');
const fs = require('fs');

/// The comment signature helps us identify a previous comment.
///
/// We identify comments as "ours" if it was commented by a bot and
/// the body of the comment contains the signature.
const commentSignature = `VeryGoodCoverage`;

function run() {
  const lcovPath = core.getInput('path');
  const minCoverage = core.getInput('min_coverage');
  const excluded = core.getInput('exclude');
  const excludedFiles = excluded.split(' ');
  const githubToken = core.getInput('github_token');
  const reportCoverageComment = core.getInput('report_coverage_comment');

  if (!canParse(lcovPath)) {
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

    const coverage = (totalHits / totalFinds) * 100;
    const reachedCoverage = coverage >= minCoverage;
    const linesMissingCoverageByFile = Object.entries(linesMissingCoverage).map(
      ([file, lines]) => {
        return `- ${file}: ${lines.join(', ')}`;
      }
    );

    if (!reachedCoverage) {
      const linesMissingCoverageByFile = Object.entries(
        linesMissingCoverage
      ).map(([file, lines]) => {
        return `${file}: ${lines.join(', ')}`;
      });
      core.setFailed(
        `${coverage} is less than min_coverage ${minCoverage}\n\n` +
          'Lines not covered:\n' +
          linesMissingCoverageByFile.map((line) => `  ${line}`).join('\n')
      );
    }

    if (reportCoverageComment && githubToken) {
      const coverageDifference = coverage - minCoverage;
      let message = `\
## ${reachedCoverage ? '✅' : '❌'} ${commentSignature}

Coverage: ${coverage}% (${totalHits} of ${totalFinds} lines)
Min coverage difference: ${coverageDifference}% (${coverage}% / ${minCoverage}%)
`;

      if (linesMissingCoverageByFile.length > 0) {
        message += `\
<details>
<summary>Lines not covered</summary>
${linesMissingCoverageByFile.map((line) => `  ${line}`).join('\n')}
</details>
`;
      }

      postOrUpdateComment(githubToken, message);
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

/**
 * Comments on the GitHub PR with the given message.
 *
 * If a comment already exists, it will be updated. In order to avoid
 * polluting the comment history.
 *
 * To be able to identify "our" comments, the message must
 * contain the `commentSignature`.
 *
 * @param {string} githubToken
 * @param {string} message
 * @returns
 */
async function postOrUpdateComment(githubToken, message) {
  if (!githubToken) return;

  const octokit = github.getOctokit(githubToken);
  const context = github.context;

  const githubIssueData = {
    ...context.repo,
    issue_number: context.issue.number,
  };

  let commentIdentifier;
  const previousComments = await octokit.rest.issues.listComments(
    githubIssueData
  );
  for (let i = 0; i < previousComments.data.length; i++) {
    const comment = previousComments.data[i];
    if (
      comment.user.type === 'Bot' &&
      comment.body.includes(commentSignature)
    ) {
      commentIdentifier = comment.id;
      break;
    }
  }

  const comment = {
    ...githubIssueData,
    body: message,
    comment_id: commentIdentifier,
  };
  if (commentIdentifier) {
    octokit.rest.issues.updateComment(comment);
  } else {
    octokit.rest.issues.createComment(comment);
  }
}

run();
