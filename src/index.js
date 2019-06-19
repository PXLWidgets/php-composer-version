#!/usr/bin/env node

const config = require('./config');
const feedback = require('./feedback');
const Fs = require('fs-extra');
const git = require('./git');
const promptVersion = require('./prompt-version');
const semver = require('semver');
const { mergeDeepRight } = require("ramda");



(async function main() {

    try {
        if (!await git().checkIsRepo()) {
            feedback.gitRepoNotFound();
            return fail();
        }

        const status = await git().status();

        if (status.current !== 'master') {
            feedback.gitBranchError(status.current);
            return fail();
        }

        if ( ! status.isClean()) {
            feedback.gitDirtyError();
            return fail();
        }

    } catch (e) {
        feedback.gitOperationError(e);
        return fail();
    }

    const version = await getNewVersionFromUser();

    try {
        await writeVersionToPackageJson(version);
        await writeVersionToComposerJson(version);
        await commitAndTag(version);

        throw 'OOOPS';

        feedback.done(version);
        done();

    } catch (e) {
        feedback.error('Error: ' + e + '. Rolling back package manager files');
        await rollbackComposerJson();
        await rollbackPackageJson();

        fail();
    }
})();

/**
 * Function to recursively prompt the user for a new version number, until
 * a valid string is supplied.
 *
 * @param {number} attempt
 * @return {Promise<string>}
 */
async function getNewVersionFromUser(attempt = 1) {

    if (attempt === 1) {
        feedback.versionPromptMessage();
    }

    try {
        const version = await promptVersion();

        await expectValidVersion(version);
        feedback.bumpOK();
        return semver.clean(version);

    } catch (error) {

        feedback.bumpError(error);
        return getNewVersionFromUser(attempt + 1);
    }
}

async function rollbackComposerJson() {
    await Fs.writeFile(config.COMPOSER_JSON_PATH, formatJSON(config.COMPOSER_JSON));
}

async function rollbackPackageJson() {
    await Fs.writeFile(config.PACKAGE_JSON_PATH, formatJSON(config.PACKAGE_JSON));
}

async function writeVersionToComposerJson(version) {

    const json = formatJSON(mergeDeepRight(config.COMPOSER_JSON, { version }));

    try {
        await Fs.writeFile(__dirname + '/../../composer.json', json);
        feedback.composerVersionUpdateOK();

    } catch (error) {
        feedback.composerVersionUpdateError(error);
        throw error;
    }

    return version;
}

async function writeVersionToPackageJson(version) {

    const json = formatJSON(mergeDeepRight(config.PACKAGE_JSON, { version }));

    try {
        await Fs.writeFile(__dirname + '/../../package.json', json);
        feedback.packageVersionUpdateOK();

    } catch (error) {
        feedback.packageVersionUpdateError(error);
        throw error;
    }

    return version;
}

async function commitAndTag(version) {

    try {
        await git().add('./');
        await git().commit(version);
        feedback.gitCommitOK();

        await git().addTag(version);
        feedback.gitTagOK();

    } catch (e) {
        feedback.error('Git error: ', e);
        throw e;
    }
}

/**
 * @param {string} version
 * @return {version}
 */
async function expectValidVersion(version) {
    if (semver.valid(version) === null) throw `Invalid version number (https://semver.org/)`;
    if (semver.lte(version, config.CURRENT_VERSION)) throw `New version must be greater than current version`;
    if (await tagExists(version)) throw `Tag '${version}' already exists`;
}

async function tagExists(version) {
    const tags = await git().tags();
    return tags.all.some((tag) => semver.clean(tag) === semver.clean(version));
}

function formatJSON(object) {
    return JSON.stringify(object, null, 4) + '\n';
}

function done() {
    process.exit(0);
}

function fail() {
    process.exit(1);
}
