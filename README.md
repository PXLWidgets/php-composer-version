# php-composer-version

[![npm version](https://badge.fury.io/js/%40pxlwidgets%2Fphp-composer-version.svg)](https://badge.fury.io/js/%40pxlwidgets%2Fphp-composer-version)

Simple utility to bump versions of php-composer packages, 
similar to how `npm version` works.

## Installation

1. Install the package from npm:
```bash
$ npm install --save-dev @pxlwidgets/php-composer-version
```

2. Add a script executing the installed binary to your project's `package.json`:

```json
{
    ...
    "scripts": {
        "bump-version": "php-composer-version"
    },
    ...
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
