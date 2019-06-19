# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- This Changelog file  
- CLI option for displaying CLI help page. 
- CLI option to allow operating on a dirty working directory
    > When set, additional project changes may exist when running php-composer-version.
    This allows for combining the version commit's changes with a CHANGELOG update, for instance.  
- CLI option to toggle also updating the version in `package.json`
    > As of this release disabled by default - see 'Changed'


- Add CLI help page

### Changed
- Sync of package.json is now omitted by default
    > This allows users to do a global installation of this package, so that the PHP package 
under development does not have to have a `package.json` file in the repository.

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
