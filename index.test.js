const process = require('process');
const cp = require('child_process'); /// https://nodejs.org/api/child_process.html
const path = require('path');
const { fail } = require('assert');
const github = require('@actions/github');
const {
  getSignedBotCommentIdentifier,
  updateGitHubComment,
  createGitHubComment,
  formatCoverageAsMessage,
} = require('./index.js');

const getErrorOutput = (error) => {
  const output = Array(...error.output)
    .filter((line) => !!line)
    .map((line) => line.toString().replace(/%0A/g, '\n'))
    .filter((line) => line.trim().length > 0)
    .join('\n');
  return output;
};

test('empty LCOV throws an error', () => {
  const lcovPath = './fixtures/lcov.empty.info';
  process.env['INPUT_PATH'] = lcovPath;
  const ip = path.join(__dirname, 'index.js');
  try {
    cp.execSync(`node ${ip}`, { env: process.env });
    fail('this code should fail');
  } catch (err) {
    expect(err).toBeDefined();

    const errorMessage = err.stdout.toString();
    expect(errorMessage).toContain('lcov is empty!');
  }
});

test('invalid LCOV format throws an error', () => {
  const lcovPath = './fixtures/lcov.error.info';
  process.env['INPUT_PATH'] = lcovPath;
  const ip = path.join(__dirname, 'index.js');
  try {
    cp.execSync(`node ${ip}`, { env: process.env }).toString();
    fail('this code should fail');
  } catch (err) {
    expect(err).toBeDefined();

    const errorMessage = err.stdout.toString();
    expect(errorMessage).toContain('parsing error!');
  }
});

test('completes when the coverage is 100 and min_coverage is not provided', () => {
  const lcovPath = './fixtures/lcov.100.info';
  process.env['INPUT_PATH'] = lcovPath;
  const ip = path.join(__dirname, 'index.js');
  cp.execSync(`node ${ip}`, { env: process.env }).toString();
});

test('completes when the coverage is higher than the threshold after excluding files', () => {
  const lcovPath = './fixtures/lcov.100.info';
  const exclude = '**/*_observer.dart';
  process.env['INPUT_PATH'] = lcovPath;
  process.env['INPUT_EXCLUDE'] = exclude;
  const ip = path.join(__dirname, 'index.js');
  cp.execSync(`node ${ip}`, { env: process.env }).toString();
});

test('fails when the coverage is not 100 and min_coverage is not provided', () => {
  const lcovPath = './fixtures/lcov.95.info';
  process.env['INPUT_PATH'] = lcovPath;
  const ip = path.join(__dirname, 'index.js');
  try {
    cp.execSync(`node ${ip}`, { env: process.env }).toString();
    fail('this code should fail');
  } catch (err) {
    expect(err).toBeDefined();
  }
});

test('fails when the coverage is below the min_coverage, even if we exclude files', () => {
  const lcovPath = './fixtures/lcov.100.info';
  const exclude = '**/does_not_exist.dart';
  process.env['INPUT_PATH'] = lcovPath;
  process.env['INPUT_EXCLUDE'] = exclude;
  const ip = path.join(__dirname, 'index.js');
  try {
    cp.execSync(`node ${ip}`, { env: process.env }).toString();
    fail('this code should fail');
  } catch (err) {
    expect(err).toBeDefined();
  }
});

test('completes when the coverage is above the given min_threshold', () => {
  const lcovPath = './fixtures/lcov.95.info';
  const minCoverage = 80;
  process.env['INPUT_PATH'] = lcovPath;
  process.env['INPUT_MIN_COVERAGE'] = minCoverage;
  const ip = path.join(__dirname, 'index.js');
  cp.execSync(`node ${ip}`, { env: process.env }).toString();
});

test('fails when the coverage is below the given min_threshold', () => {
  const lcovPath = './fixtures/lcov.95.info';
  const minCoverage = 98;
  process.env['INPUT_PATH'] = lcovPath;
  process.env['INPUT_MIN_COVERAGE'] = minCoverage;
  const ip = path.join(__dirname, 'index.js');
  try {
    cp.execSync(`node ${ip}`, { env: process.env }).toString();
    fail('this code should fail');
  } catch (err) {
    expect(err).toBeDefined();
  }
});

test('shows lines that are missing coverage when failure occurs', () => {
  const lcovPath = './fixtures/lcov.95.info';
  const minCoverage = 100;
  process.env['INPUT_PATH'] = lcovPath;
  process.env['INPUT_MIN_COVERAGE'] = minCoverage;
  const ip = path.join(__dirname, 'index.js');
  try {
    cp.execSync(`node ${ip}`, { env: process.env }).toString();
    fail('this code should fail');
  } catch (err) {
    const output = getErrorOutput(err);
    expect(output).toContain('Lines not covered');
    expect(output).toContain(
      '/Users/felix/Development/github.com/felangel/bloc/packages/bloc/lib/src/bloc_observer.dart: 20, 27, 36, 43, 51'
    );
  }
});

test('createsComment when reportCoverageComment and githubToken are provided and no previous comment', async () => {
  const lcovPath = './fixtures/lcov.95.info';
  const minCoverage = 98;
  const reportCoverageComment = true;
  const githubToken = 'token';

  process.env['INPUT_PATH'] = lcovPath;
  process.env['INPUT_MIN_COVERAGE'] = minCoverage;
  process.env['GITHUB_REPOSITORY'] = 'VeryGoodOpenSource/very_good_coverage';
  process.env['INPUT_REPORT_COVERAGE_COMMENT'] = reportCoverageComment;
  process.env['INPUT_GITHUB_TOKEN'] = githubToken;
  const ip = path.join(__dirname, 'index.js');

  const createComment = jest.fn((_) => {});
  const octokit = {
    rest: {
      issues: {
        createComment: createComment,
      },
    },
  };
  github.getOctokit = (_) => octokit;
  const context = {
    repo: {},
    issue: { number: 1 },
  };
  github.context = context;

  try {
  } catch (err) {
    expect(err).toBeDefined();
  }

  // TODO(alestiago): Figure out how we want to test this, since
  // we are mocking the github context and octokit but we seem to
  // be unable to do so within the cp.execSync call.
  // expect(createComment).toHaveBeenCalled();
});

test('getSignedBotCommentIdentifier returns undefined when token is null', async () => {
  const result = await getSignedBotCommentIdentifier(null, 'signature');
  expect(result).toBe(undefined);
});

test('getSignedBotCommentIdentifier returns undefined when signature is null', async () => {
  const result = await getSignedBotCommentIdentifier('token', null);
  expect(result).toBe(undefined);
});

test('getSignedBotCommentIdentifier returns undefined when no comment contains signature', async () => {
  const comment1 = {
    id: 1,
    user: { type: 'Bot' },
    body: 'some comment',
  };
  const comments = { data: [comment1] };
  const octokit = {
    rest: {
      issues: {
        listComments: (_) => comments,
      },
    },
  };
  github.getOctokit = (_) => octokit;
  const context = {
    repo: {},
    issue: { number: 1 },
  };
  github.context = context;

  const result = await getSignedBotCommentIdentifier('token', 'signature');
  expect(result).toBe(undefined);
});

test('getSignedBotCommentIdentifier returns identifier when comment contains signature', async () => {
  const signature = 'some signature';
  const comment1 = {
    id: 1,
    user: { type: 'Bot' },
    body: 'some comment',
  };
  const comment2 = {
    id: 2,
    user: { type: 'Bot' },
    body: 'some comment ' + signature,
  };
  const comments = { data: [comment1, comment2] };
  const octokit = {
    rest: {
      issues: {
        listComments: (_) => comments,
      },
    },
  };
  github.getOctokit = (_) => octokit;
  const context = {
    repo: {},
    issue: { number: 1 },
  };
  github.context = context;

  const result = await getSignedBotCommentIdentifier('token', signature);
  expect(result).toBe(comment2.id);
});

test('updateGitHubComment does nothing when token is null', async () => {
  const updateComment = jest.fn((_) => {});
  const octokit = {
    rest: {
      issues: {
        updateComment: updateComment,
      },
    },
  };
  github.getOctokit = (_) => octokit;

  await updateGitHubComment(null, 1, 'comment');
  expect(updateComment).not.toHaveBeenCalled();
});

test('updateGitHubComment does nothing when identifier is null', async () => {
  const updateComment = jest.fn((_) => {});
  const octokit = {
    rest: {
      issues: {
        updateComment: updateComment,
      },
    },
  };
  github.getOctokit = (_) => octokit;

  await updateGitHubComment('token', null, 'comment');
  expect(updateComment).not.toHaveBeenCalled();
});

test('updateGitHubComment is called with correct data', async () => {
  const updateComment = jest.fn((_) => {});

  const octokit = {
    rest: {
      issues: {
        updateComment: updateComment,
      },
    },
  };
  github.getOctokit = (_) => octokit;
  const context = {
    repo: {},
    issue: { number: 1 },
  };
  github.context = context;

  const comment = {
    id: 1,
    body: 'some comment',
  };
  await updateGitHubComment('token', comment.id, comment.body);
  expect(updateComment).toHaveBeenCalledWith({
    ...context.repo,
    issue_number: context.issue.number,
    comment_id: comment.id,
    body: comment.body,
  });
});

test('createGitHubComment does nothing when token is null', async () => {
  const createComment = jest.fn((_) => {});
  const octokit = {
    rest: {
      issues: {
        createComment: createComment,
      },
    },
  };
  github.getOctokit = (_) => octokit;

  await createGitHubComment(null, 1, 'comment');
  expect(createComment).not.toHaveBeenCalled();
});

test('createGitHubComment is called with correct data', async () => {
  const createComment = jest.fn((_) => {});
  const octokit = {
    rest: {
      issues: {
        createComment: createComment,
      },
    },
  };
  github.getOctokit = (_) => octokit;
  const context = {
    repo: {},
    issue: { number: 1 },
  };
  github.context = context;

  const comment = 'some comment';
  await createGitHubComment('token', comment);
  expect(createComment).toHaveBeenCalledWith({
    ...context.repo,
    issue_number: context.issue.number,
    body: comment,
  });
});

test('formatCoverageAsMessage returns normally', () => {
  const coverage = 0.5;
  const totalHits = 5;
  const totalFinds = 10;
  const minCoverage = 0.6;
  const linesMissingCoverageByFile = ['line1: 1, 2, 3', 'line2: 1, 2, 3'];

  const result = formatCoverageAsMessage({
    coverage,
    minCoverage,
    totalHits,
    totalFinds,
    linesMissingCoverageByFile,
  });
  expect(result).toBeDefined();
});
