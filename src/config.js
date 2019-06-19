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

for (const arg of CLI_ARGUMENTS) {

    switch (arg) {
        case '-d': case '--allow-dirty':
            config.allowDirty = true;
            break;

        case '-p': case '--sync-package-json':
            config.syncPackageJson = true;
            break;
    }
}

Object.assign(exports, config);

