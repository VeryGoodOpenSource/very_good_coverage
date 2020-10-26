# 1.1.0

- feat: added support to exclude files

```yaml
uses: VGVentures/very-good-coverage@v1.1.0
with:
  path: "./coverage/lcov.info"
  min_coverage: 95
  exclude: "**/*_observer.dart **/change.dart"
```

# 1.0.0

- initial release 🎉
  - includes coverage comparison
  - `path` input override
  - `min_coverage` threshold override
