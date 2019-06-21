# php-composer-version [![npm version](https://badge.fury.io/js/%40pxlwidgets%2Fphp-composer-version.svg)](https://badge.fury.io/js/%40pxlwidgets%2Fphp-composer-version)

This is a small CLI tool to bump versions of php-composer packages, 
similar to how `npm version` works. On input of a new version number:

1. If enabled through CLI option (`-p`), the new version is written to the project's `package.json`
2. The new version is written to the project's `composer.json`
3. Above changes are committed with a message of the version number
4. The created commit is tagged with the version number

[View changelog.][changelog]

## installation

Install the package from npm, either globally for your system, or locally in the project.
It depends on your needs which approach to take.

```bash
$ npm install --save-dev @pxlwidgets/php-composer-version
```

If you choose to install globally the script should be available under the name 
`php-composer-version`. Otherwise add an npm script that has access to the local 
version to `package.json`:

```json
{
    "scripts": {
        "bump-version": "php-composer-version"
    }
}
```
 
## Usage 

Run the script from the command line from your project root. 

```bash
# for global installations
$ php-composer-version
# for local installations
$ npm run bump-version
```

The script will then prompt you for the new version to write to the repository,
and then perform the steps mentioned above:

> ```
> Enter new version number (current: 0.2.3)
>     version >
> ```

## Checks

- **Version comparison**

  The entered version is compared against the current version to make sure that
  the new version is greater than the current.
  
- **Version availability check**
  
    The entered version is compared against all git tags to make sure that no
    tag already exists by the name of the version.
    
- **Git branch check**

  By default the branch name to commit on is fixed to `master`. Most of the times
  a new release should be a master revision. Exceptions might be revisions of 
  pre-release stages as `alpha`, `beta` or `rc`. To override the target branch
  use the `--branch` option.
  
- **Git status check**

  If the working directory is not clean, the user is asked to continue. To skip
  the prompt and always allow, use the `--allow-dirty` option.
  
### CLI Options
```text
-h, --help               Display this help content.
-v, --version            Show version number.
-b, --branch <name>      Set the branch for the version commit. If on any other branch, the process will fail. [default: 'master']
-d, --allow-dirty        Allow additional changes to be committed with the version commit.
-p, --sync-package-json  Toggle additional update of the version number in package.json.
```
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

[changelog]: https://github.com/PXLWidgets/php-composer-version/blob/master/CHANGELOG.md
