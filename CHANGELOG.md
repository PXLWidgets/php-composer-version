# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- This Changelog file

## [1.0.0] - 2019-06-19 (Initial version)

### Added
- Prompt for new version number
- Write action to `composer.json`
- Write action to `package.json`
- Git commit action, saving the changes to version control
- Git tag action, tagging the new commit with the version number
- Git tag availability check
- Version compare check (a new version must be greater than the current)

[Unreleased]: https://github.com/PXLWidgets/php-composer-version/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/PXLWidgets/php-composer-version/tree/v1.0.0
