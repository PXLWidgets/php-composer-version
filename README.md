# php-composer-version

[![npm version](https://badge.fury.io/js/%40pxlwidgets%2Fphp-composer-version.svg)](https://badge.fury.io/js/%40pxlwidgets%2Fphp-composer-version)

Simple utility to bump versions of php-composer packages, 
similar to how `npm version` works. On input of a new version number:

1. The new version is written to the project's `package.json`
2. The new version is written to the project's `composer.json`
3. Above changes are committed with a message of the version number
4. The created commit is tagged with the version number

## Installation

1. Install the package from npm:
```bash
$ npm install --save-dev @pxlwidgets/php-composer-version
```

2. Add a script executing the installed binary to your project's `package.json`:

```json
{
    "scripts": {
        "bump-version": "php-composer-version"
    }
}
```
## Usage 

Run the script from the command line from your project root:

```bash
$ npm run bump-version
# or
$ yarn bump-version
``` 

This will start an interactive shell that will prompt you 
for the new version to write to the repository.
