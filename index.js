const core = require('@actions/core');
const github = require('@actions/github'); /// https://octokit.github.io/
const minimatch = require('minimatch');
const parse = require('lcov-parse'); /// https://www.npmjs.com/package/lcov-parse
const fs = require('fs');

/// The comment signature helps us identify a previous comment.
///
/// We identify comments as "ours" if it was commented by a bot and
/// the body of the comment contains the signature.
const commentSignature = `<!-- VeryGoodCoverage Bot Message -->`;

async function run() {
  const lcovPath = core.getInput('path');
  if (!canParse(lcovPath)) return;

  const minCoverage = core.getInput('min_coverage');
  const excluded = core.getInput('exclude');
  const excludedFiles = excluded.split(' ');
  const githubToken = core.getInput('github_token');
  const reportCoverageComment = core.getInput('report_coverage_comment');

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
    const reachedCoverage = coverage >= minCoverage;
    const linesMissingCoverageByFile = Object.entries(linesMissingCoverage).map(
      ([file, lines]) => {
        return `- ${file}: ${lines.join(', ')}`;
      }
    );
  
    if (!reachedCoverage) {
      core.setFailed(
        `${coverage} is less than min_coverage ${minCoverage}\n\n` +
          'Lines not covered:\n' +
          linesMissingCoverageByFile.map((line) => `  ${line}`).join('\n')
      );
    }
  
    if (reportCoverageComment && githubToken) {
      const commentIdentifier = await getSignedBotCommentIdentifier();
      const message = formatCoverageAsMessage({
        linesMissingCoverageByFile,
        coverage,
        minCoverage,
      });
  
      if (commentIdentifier) {
         updateGitHubComment(githubToken, commentIdentifier, message);
      } else {
        postGitHubComment(githubToken, message);
      }
    }
  });


}

/**
 * Whether the given file should be included in the coverage calculation.
 * 
 * @param {string} fileName - The name of the file.
 * @param {string[]} excludedFiles - The list of files to exclude.
 */
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

/**
 * Whether the lcov file can be parsed or not.
 * 
 * @param {string} path - The path to the lcov file.
 */
function canParse(path) {
  if (fs.existsSync(path) && fs.readFileSync(path).length === 0) {
    core.setFailed('lcov is empty!');
    return false;
  }
  return true;
}

/**
 * Formats the coverage information as a human readable string to be used
 * as a comment on the GitHub PR.
 * 
 * @param {number} coverage
 * @param {number} minCoverage
 * 
 * @returns 
 */
function formatCoverageAsMessage({
  linesMissingCoverageByFile,
  coverage,
  totalHits,
  totalFinds,
  minCoverage,
}) {
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

  return message;
}

/**
 * Retrieves the comment identifier of the comment posted by the bot with the
 * given signature.
 * 
 * If no comment was found, `undefined` is returned. If more than one comment was
 * found, the first one is returned.
 * 
 * @param {string} githubToken 
 * @param {string} signature
 * @returns {Promise<number?>} The comment identifier, or `undefined` if no comment was found.
 */
async function getSignedBotCommentIdentifier(githubToken, signature) {
  if (!githubToken) return;

  const octokit = github.getOctokit(githubToken);
  const context = github.context;
  const githubIssueData = {
    ...context.repo,
    issue_number: context.issue.number,
  };

  const previousComments = await octokit.rest.issues.listComments(
    githubIssueData
  );
  for (let i = 0; i < previousComments.data.length; i++) {
    const comment = previousComments.data[i];
    if (
      comment.user.type === 'Bot' &&
      comment.body.includes(signature)
    ) {
      return comment.id;
    }
  }
}

/**
 * Updates an existing comment on the GitHub PR. 
 * 
 * Updating a comment completely replaces the previous comment with the new
 * message.
 * 
 * @param {string} githubToken
 * @param {number} commentId - The identifier of the comment to update.
 * @param {string} message - The message to update.
 */
async function updateGitHubComment(githubToken, commentId, message) {
  if (!githubToken) return;

  const octokit = github.getOctokit(githubToken);
  const context = github.context;
  const comment = {
    ...context.repo,
    issue_number: context.issue.number,
    comment_id: commentId,
    body: message,
  };
  await octokit.rest.issues.updateComment(comment);
}

/**
 * Posts a new comment on the GitHub PR.
 * 
 * @param {string} githubToken
 * @param {string} message - The message to post.
 * @returns
 **/
async function postGitHubComment(githubToken, message) {
  if (!githubToken) return;

  const octokit = github.getOctokit(githubToken);
  const context = github.context;
  const comment = {
    ...context.repo,
    issue_number: context.issue.number,
    body: message,
  };
  await octokit.rest.issues.createComment(comment);
}

run();
