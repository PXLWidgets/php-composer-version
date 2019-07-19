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

const config = {
    syncPackageJson: false,
    allowDirty: false,
    branch: 'master',
    newVersion: null,

    CURRENT_VERSION: COMPOSER_JSON_DATA.version,
    PACKAGE_JSON_PATH,
    PACKAGE_JSON_DATA,
    COMPOSER_JSON_PATH,
    COMPOSER_JSON_DATA,
    CLI_ARGUMENTS,
    SELF_VERSION,
    SELF_DESCRIPTION,
    SELF_URL,
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
            config.allowDirty = true;
            break;

        case '-p':
        case '--sync-package-json':
            config.syncPackageJson = true;
            break;

        case '-b':
        case '--branch':
            config.branch = argv.shift();
            break;

        case '-V':
        case '--set-version':
            config.newVersion = argv.shift();
    }
}

exports.syncPackageJson    = config.syncPackageJson;
exports.allowDirty         = config.allowDirty;
exports.branch             = config.branch;
exports.newVersion         = config.newVersion;
exports.PACKAGE_JSON_PATH  = config.PACKAGE_JSON_PATH;
exports.PACKAGE_JSON_DATA  = config.PACKAGE_JSON_DATA;
exports.COMPOSER_JSON_PATH = config.COMPOSER_JSON_PATH;
exports.COMPOSER_JSON_DATA = config.COMPOSER_JSON_DATA;
exports.CLI_ARGUMENTS      = config.CLI_ARGUMENTS;
exports.SELF_VERSION       = config.SELF_VERSION;
exports.SELF_DESCRIPTION   = config.SELF_DESCRIPTION;
exports.SELF_URL           = config.SELF_URL;
exports.CURRENT_VERSION    = COMPOSER_JSON_DATA.version;
