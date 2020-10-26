# Very Good Coverage

[![Very Good Ventures](https://raw.githubusercontent.com/VGVentures/very_good_analysis/main/assets/vgv_logo.png)](https://verygood.ventures)

Developed with 💙 by [Very Good Ventures](https://verygood.ventures) 🦄

[![ci](https://github.com/VGVentures/very-good-coverage/workflows/ci/badge.svg)](https://github.com/VGVentures/very_good_analysis/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A Github Action which helps enforce a minimum code coverage threshold.

## Inputs

### `path`

**Optional** The path to the `lcov.info` file.

**Default** `./coverage/lcov.info`

### `min_coverage`

**Optional** The minimum coverage percentage allowed.

**Default** 100

## Example usage

```yaml
uses: VGVentures/very-good-coverage@v1.0.0
with:
  path: "./coverage/lcov.info"
  min_coverage: 95
```

### `exclude`

**Optional** List of files that you want to exclude from the coverage report, and separated by an empty space ` `. You can also use `globs` to describe file patterns.

## Example usage

```yaml
uses: VGVentures/very-good-coverage@v1.0.0
with:
  path: "./coverage/lcov.95.info"
  min_coverage: 100
  exclude: "**/*_observer.dart **/change.dart"
```