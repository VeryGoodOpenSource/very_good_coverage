# Very Good Coverage

[![Very Good Ventures][logo_black]][very_good_ventures_link_light]
[![Very Good Ventures][logo_white]][very_good_ventures_link_dark]

Developed with 💙 by [Very Good Ventures][very_good_ventures_link] 🦄

[![ci][ci_badge]][ci_badge_link]
[![License: MIT][license_badge]][license_badge_link]

---

A GitHub Action which helps enforce a minimum code coverage threshold.

## Inputs

Very Good Coverage accepts the following configuration inputs:

| Input name   | Description                                                                                                                                                                     | Default value           | Optional |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------- |
| path         | The absolute path to the lcov.info file.                                                                                                                                        | `"/coverage/lcov.info"` | ✅       |
| min_coverage | The minimum coverage percentage allowed. Must be a number between 0 and 100.                                                                                                    | `100`                   | ✅       |
| exclude      | List of paths to exclude from the coverage report, separated by an empty space. Supports [globs](<https://en.wikipedia.org/wiki/Glob_(programming)>) to describe file patterns. | `""`                    | ✅       |

## Example usage

```yaml
uses: VeryGoodOpenSource/very_good_coverage@v2
with:
  path: '/coverage/lcov.info'
  min_coverage: 95
  exclude: '**/*_observer.dart **/change.dart'
```

## FAQs

#### How can I avoid Very Good Coverage reporting an empty or non-existent coverage file?

[Relevant issue](https://github.com/VeryGoodOpenSource/very_good_coverage/issues/167)

A failure for non-existent coverage file can be resolved by setting the path input to match the location of the already generated lcov file.

```yaml
uses: VeryGoodOpenSource/very_good_coverage@v2
with:
  path: 'my_project/coverage/lcov.info'
```

If your generated lcov file is empty this might be because you have no test files or your tests are not generating any coverage data.

If you wish to always bypass these warnings, we recommend using a conditional statement in your workflow to avoid running the Very Good Coverage action when the lcov file is empty or non-existent.

For example, if your non-existent or empty coverage file is meant to be located at `/coverage/lcov.info` you may do:

```yaml
- name: Check for existing and non-empty coverage file
  id: test_coverage_file
  run: if [ -s "/coverage/lcov.info" ]; then echo "result=true" >> $GITHUB_OUTPUT ; else echo "result=false" >> $GITHUB_OUTPUT; fi
- name: Very Good Coverage
  if: steps.test_coverage_file.outputs.result == 'true'
  uses: VeryGoodOpenSource/very_good_coverage@v2
  with:
    path: '/coverage/lcov.info'
```

#### Why is my input path not relative to the specified `working-directory`?

[Relevant issue](https://github.com/VeryGoodOpenSource/very_good_coverage/issues/35)

The input path must be absolute. The specified working directory is ignored by the input path. This is because it is [not possible](https://github.com/actions/runner/issues/467) to access the working directory from an action. In other words, Very Good Coverage always runs from the root of your repository.

For example, if your working directory is `my_project` and your file is at `/my_project/coverage/lcov.info` you must do:

```yaml
jobs:
  build:
    defaults:
      run:
        working-directory: my_project/
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Very Good Coverage
        uses: VeryGoodOpenSource/very_good_coverage@v2
        with:
          path: /my_project/coverage/lcov.info
```

[ci_badge]: https://github.com/VeryGoodOpenSource/very_good_coverage/workflows/ci/badge.svg
[ci_badge_link]: https://github.com/VeryGoodOpenSource/very_good_coverage/actions
[license_badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license_badge_link]: https://opensource.org/licenses/MIT
[logo_black]: https://raw.githubusercontent.com/VGVentures/very_good_brand/main/styles/README/vgv_logo_black.png#gh-light-mode-only
[logo_white]: https://raw.githubusercontent.com/VGVentures/very_good_brand/main/styles/README/vgv_logo_white.png#gh-dark-mode-onlyimages/vgv_logo_white.png#gh-dark-mode-only
[very_good_ventures_link]: https://verygood.ventures
[very_good_ventures_link_dark]: https://verygood.ventures#gh-dark-mode-only
[very_good_ventures_link_light]: https://verygood.ventures#gh-light-mode-only
