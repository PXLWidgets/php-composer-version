# php-composer-version [![npm version](https://badge.fury.io/js/%40pxlwidgets%2Fphp-composer-version.svg)](https://badge.fury.io/js/%40pxlwidgets%2Fphp-composer-version)

This is a small node utility to bump versions of php-composer packages, 
similar to how `npm version` works. On input of a new version number:

1. The new version is written to the project's `package.json`
2. The new version is written to the project's `composer.json`
3. Above changes are committed with a message of the version number
4. The created commit is tagged with the version number

## Installation

- Install the package from npm:
```bash
$ npm install --save-dev @pxlwidgets/php-composer-version
```
- Add a script executing the installed executable to your project's `package.json`:

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
```
The script will then prompt you for the new version to write to the repository,
and then perform the steps mentioned above:

> ```text
> > composer-package@0.2.4 bump-version /Users/johndoe/dev/packages/composer-package
> > php-composer-version
>
> Enter new version number (Current version: 0.2.4)
>     version > |
> ``` 

## License

Copyright (c) 2019 PXL.Widgets B.V.

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
