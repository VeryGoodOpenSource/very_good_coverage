const process = require('process');
const cp = require('child_process');
const path = require('path');
const { fail } = require('assert');

const getErrorOutput = (error) => {
  const output = Array(...error.output)
    .filter((line) => !!line)
    .map((line) => line.toString().replace(/%0A/g, '\n'))
    .filter((line) => line.trim().length > 0)
    .join('\n');
  return output;
};

afterEach(() => {
  delete process.env['INPUT_PATH'];
  delete process.env['INPUT_EXCLUDE'];
  delete process.env['INPUT_MIN_COVERAGE'];
});

test('empty LCOV throws an error', () => {
  const lcovPath = './fixtures/lcov.empty.info';
  process.env['INPUT_PATH'] = lcovPath;
  const ip = path.join(__dirname, 'index.js');
  try {
    cp.execSync(`node ${ip}`, { env: process.env });
    fail('this code should fail');
  } catch (err) {
    expect(err).toBeDefined();

    const errorMessage = err.stdout.toString().replace(/%0A/g, '\n');
    expect(errorMessage).toContain(
      `❌ Found an empty lcov file at "${lcovPath}".
An empty lcov file was found but with no coverage data. This might be because \
you have no test files or your tests are not generating any coverage data.
`,
    );
  }
});

test('non-existent LCOV throws an error', () => {
  const lcovPath = './fixtures/not-found.info';
  process.env['INPUT_PATH'] = lcovPath;
  const ip = path.join(__dirname, 'index.js');
  try {
    cp.execSync(`node ${ip}`, { env: process.env });
    fail('this code should fail');
  } catch (err) {
    expect(err).toBeDefined();

    const errorMessage = err.stdout.toString().replace(/%0A/g, '\n');
    expect(errorMessage).toContain(
      `❌ Failed to find an lcov file at ${lcovPath}. 
Make sure to generate an lcov file before running VeryGoodCoverage and set the \
path input to the correct location.

For example:
  uses: VeryGoodOpenSource/very_good_coverage@v2
  with:
    path: 'my_project/coverage/lcov.info'      
`,
    );
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

test('logs message when the coverage is 100 and min_coverage is not provided', () => {
  const lcovPath = './fixtures/lcov.100.info';
  process.env['INPUT_PATH'] = lcovPath;
  const ip = path.join(__dirname, 'index.js');
  let result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
  expect(result).toContain('Coverage: 100%.');
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
    cp.execSync(`node ${ip}`, { env: process.env });
    fail('this code should fail');
  } catch (err) {
    const output = getErrorOutput(err);
    expect(output).toContain('95 is less than min_coverage 100');
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

test('show message when the coverage is above the given min_threshold', () => {
  const lcovPath = './fixtures/lcov.95.info';
  const minCoverage = 80;
  process.env['INPUT_PATH'] = lcovPath;
  process.env['INPUT_MIN_COVERAGE'] = minCoverage;
  const ip = path.join(__dirname, 'index.js');
  cp.execSync(`node ${ip}`, { env: process.env }).toString();
});

test('show message when the coverage is above the given min_threshold', () => {
  const lcovPath = './fixtures/lcov.95.info';
  const minCoverage = 80;
  process.env['INPUT_PATH'] = lcovPath;
  process.env['INPUT_MIN_COVERAGE'] = minCoverage;
  const ip = path.join(__dirname, 'index.js');
  cp.execSync(`node ${ip}`, { env: process.env }).toString();
  let result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
  expect(result).toContain(
    'Coverage: 95%.\n95 is greater than or equal to min_coverage 80.',
  );
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
      '/Users/felix/Development/github.com/felangel/bloc/packages/bloc/lib/src/bloc_observer.dart: 20, 27, 36, 43, 51',
    );
  }
});

test('shows lines that are missing coverage when coverage is less than 100%', () => {
  const lcovPath = './fixtures/lcov.95.info';
  const minCoverage = 80;
  process.env['INPUT_PATH'] = lcovPath;
  process.env['INPUT_MIN_COVERAGE'] = minCoverage;
  const ip = path.join(__dirname, 'index.js');
  let result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
  expect(result).toContain('Lines not covered');
  expect(result).toContain(
    '/Users/felix/Development/github.com/felangel/bloc/packages/bloc/lib/src/bloc_observer.dart: 20, 27, 36, 43, 51',
  );
});

test('reports 0 coverage when no lines are found ', () => {
  const lcovPath = './fixtures/lcov.0.info';
  const minCoverage = 100;
  process.env['INPUT_PATH'] = lcovPath;
  process.env['INPUT_MIN_COVERAGE'] = minCoverage;
  const ip = path.join(__dirname, 'index.js');
  try {
    cp.execSync(`node ${ip}`, { env: process.env }).toString();
    fail('this code should fail');
  } catch (err) {
    expect(err).toBeDefined();
    const errorMessage = err.stdout.toString();
    expect(errorMessage).toContain('0 is less than min_coverage 100');
  }
});

test('fails when min_coverage is not a number', () => {
  process.env['INPUT_MIN_COVERAGE'] = '10%';
  const ip = path.join(__dirname, 'index.js');
  try {
    cp.execSync(`node ${ip}`, { env: process.env });
    fail('this code should fail');
  } catch (err) {
    const output = getErrorOutput(err);
    expect(output).toContain(
      '❌ Failed to parse min_coverage. Make sure to enter a valid number.',
    );
  }
});
