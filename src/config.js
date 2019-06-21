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
        case '-d': case '--allow-dirty':
            config.allowDirty = true;
            break;

        case '-p': case '--sync-package-json':
            config.syncPackageJson = true;
            break;

        case '-b': case '--branch':
            config.branch = argv.shift();
            break;
    }
}

Object.assign(exports, config);

