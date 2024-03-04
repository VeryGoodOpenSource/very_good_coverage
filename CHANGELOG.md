# 3.0.0

- chore(deps): bump prettier from 3.1.0 to 3.2.5 ([#311](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/311))
- chore(deps): bump @eslint/eslintrc from 2.1.3 to 3.0.1 ([#312](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/312))
- chore!: update to node 20 ([#310](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/310))

# 2.2.0

- chore(deps): bump prettier from 2.7.1 to 2.8.0 ([#195](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/195))
- chore(deps): bump prettier from 2.8.0 to 2.8.1 ([#199](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/199))
- chore(deps): bump minimatch from 5.1.0 to 5.1.1 ([#196](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/196))
- chore(deps): bump json5 from 2.2.1 to 2.2.3 ([#206](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/206))
- chore(deps): bump minimatch from 5.1.1 to 5.1.2 ([#203](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/203))
- chore(deps): bump prettier from 2.8.1 to 2.8.2 ([#207](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/207))
- chore(deps): bump prettier from 2.8.2 to 2.8.3 ([#208](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/208))
- chore(deps): bump minimatch from 5.1.2 to 6.1.6 ([#213](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/213))
- chore(deps): bump prettier from 2.8.3 to 2.8.4 ([#219](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/219))
- chore(deps): bump minimatch from 6.1.6 to 7.0.0 ([#223](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/223))
- chore: repo maintenance ([#224](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/224))
- feat: include better error logging ([#235](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/235))
- fix: avoid reporting NaN coverage ([#237](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/237))
- docs: update README.md inputs and FAQ ([#236](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/236))
- docs: included documentation about absolute path ([#238](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/238))
- chore(deps): bump prettier from 2.8.4 to 2.8.5 ([#239](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/239))
- chore(deps): bump prettier from 2.8.5 to 2.8.6 ([#240](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/240))
- chore(deps): bump prettier from 2.8.6 to 3.0.3 ([#278](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/278))
- chore(deps): bump actions/checkout from 3 to 4 ([#279](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/279))
- chore(deps): bump @eslint/eslintrc from 1.4.1 to 2.1.2 ([#271](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/271))
- test: clean env variables after each ([#289](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/289))
- fix: min_coverage parsing with default to 100 ([#290](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/290))
- chore(deps): bump @eslint/eslintrc from 2.1.2 to 2.1.3 ([#294](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/294))
- chore(deps): bump prettier from 3.0.3 to 3.1.0 ([#297](https://github.com/VeryGoodOpenSource/very_good_coverage/pull/297))

# 2.1.0

- feat: always output coverage
- build(deps): various dependency updates

# 2.0.0

- build(deps): upgrade to node16

# 1.2.1

- fix: throw "lcov is empty" instead of "parsing error!"

# 1.2.0

- feat: show missing coverage lines
- ci: add prettier linting/formatting step

# 1.1.1

- docs: README and metadata updates
- feat: improve failure message

# 1.1.0

- feat: added support to exclude files

```yaml
uses: VeryGoodOpenSource/very_good_coverage@v1.1.0
with:
  path: './coverage/lcov.info'
  min_coverage: 95
  exclude: '**/*_observer.dart **/change.dart'
```

# 1.0.0

- initial release 🎉
  - includes coverage comparison
  - `path` input override
  - `min_coverage` threshold override
