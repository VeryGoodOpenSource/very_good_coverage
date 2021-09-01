<p align="center">
  <a alt="Very Good Ventures" href="https://verygood.ventures">
    <img height=200 src="./assets/logo.png"/>
  </a>
</p>

<p align="center">
  Developed with 💙 by 
  <a alt="Very Good Ventures" href="https://verygood.ventures">
    Very Good Ventures
  </a>
   🦄
</p>

<p align="center">
<a href="https://github.com/VeryGoodOpenSource/very_good_coverage/actions"><img src="https://github.com/VeryGoodOpenSource/very_good_coverage/workflows/ci/badge.svg" alt="ci"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
</p>

---

<p align="center" style="font-size: 18px">
  <b>A Github Action which helps enforce a minimum code coverage threshold.</b>
</p>

## Inputs

### `path`

**Optional** The path to the `lcov.info` file.

**Default** `./coverage/lcov.info`

### `min_coverage`

**Optional** The minimum coverage percentage allowed.

**Default** 100

### `exclude`

**Optional** List of paths to exclude from the coverage report, separated by an empty space. Supports `globs` to describe file patterns.

## Example usage

```yaml
uses: VeryGoodOpenSource/very_good_coverage@v1.2.0
with:
  path: './coverage/lcov.info'
  min_coverage: 95
  exclude: '**/*_observer.dart **/change.dart'
```
