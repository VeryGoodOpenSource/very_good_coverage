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
