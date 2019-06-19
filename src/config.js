const { resolve } = require('path');
const Fs = require('fs-extra');

const [PACKAGE_JSON_PATH, COMPOSER_JSON_PATH] = [
    resolve(process.cwd(), 'package.json'),
    resolve(process.cwd(), 'composer.json'),
];

const [PACKAGE_JSON, COMPOSER_JSON] = [
    JSON.parse(Fs.readFileSync(PACKAGE_JSON_PATH)),
    JSON.parse(Fs.readFileSync(COMPOSER_JSON_PATH)),
];

Object.assign(exports, {
    CURRENT_VERSION: COMPOSER_JSON.version,
    PACKAGE_JSON,
    COMPOSER_JSON,
    PACKAGE_JSON_PATH,
    COMPOSER_JSON_PATH,
});
