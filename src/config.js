const { clone } = require('ramda');
const { resolve } = require('path');
const Fs = require('fs-extra');

const CLI_ARGUMENTS = process.argv.slice(2);

const {
    version: SELF_VERSION,
    description: SELF_DESCRIPTION,
    homepage: SELF_URL,
} = require('../package');

const [PACKAGE_JSON_PATH, COMPOSER_JSON_PATH] = [
    resolve(process.cwd(), 'package.json'),
    resolve(process.cwd(), 'composer.json'),
];

const PACKAGE_JSON_DATA = Fs.existsSync(PACKAGE_JSON_PATH)
    ? JSON.parse(Fs.readFileSync(PACKAGE_JSON_PATH))
    : {};

const COMPOSER_JSON_DATA = Fs.existsSync(COMPOSER_JSON_PATH)
    ? JSON.parse(Fs.readFileSync(COMPOSER_JSON_PATH))
    : {};

const options = {
    syncPackageJson: false,
    allowDirty: false,
    branch: 'master',
    newVersion: null,
};

const argv = clone(CLI_ARGUMENTS);

while (argv.length) {

    let arg = argv.shift();
    const indexOfEqualSign = arg.indexOf('=');

    if (indexOfEqualSign !== -1) {
        arg = arg.slice(0, indexOfEqualSign);
        argv.unshift(arg.slice(indexOfEqualSign + 1));
    }

    switch (arg) {
        case '-d':
        case '--allow-dirty':
            options.allowDirty = true;
            break;

        case '-p':
        case '--sync-package-json':
            options.syncPackageJson = true;
            break;

        case '-b':
        case '--branch':
            options.branch = argv.shift();
            break;

        case '-V':
        case '--set-version':
            options.newVersion = argv.shift();
    }
}

exports.syncPackageJson    = options.syncPackageJson;
exports.allowDirty         = options.allowDirty;
exports.branch             = options.branch;
exports.newVersion         = options.newVersion;
exports.PACKAGE_JSON_PATH  = PACKAGE_JSON_PATH;
exports.PACKAGE_JSON_DATA  = PACKAGE_JSON_DATA;
exports.COMPOSER_JSON_PATH = COMPOSER_JSON_PATH;
exports.COMPOSER_JSON_DATA = COMPOSER_JSON_DATA;
exports.CLI_ARGUMENTS      = CLI_ARGUMENTS;
exports.SELF_VERSION       = SELF_VERSION;
exports.SELF_DESCRIPTION   = SELF_DESCRIPTION;
exports.SELF_URL           = SELF_URL;
exports.CURRENT_VERSION    = COMPOSER_JSON_DATA.version;
