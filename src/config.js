const { version: CURRENT_VERSION } = require('../../composer');
const { resolve } = require('path');

const [PACKAGE_JSON, COMPOSER_JSON] = [
    require('../../package'),
    require('../../composer'),
];

const [PACKAGE_JSON_PATH, COMPOSER_JSON_PATH] = [
    resolve(process.cwd(), 'package.json'),
    resolve(process.cwd(), 'composer.json'),
];

Object.assign(exports, {
    CURRENT_VERSION,
    PACKAGE_JSON,
    COMPOSER_JSON,
    PACKAGE_JSON_PATH,
    COMPOSER_JSON_PATH,
});
