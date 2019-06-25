#!/usr/bin/env node

const config = require('./config');
const output = require('./output');
const Fs = require('fs-extra');
const git = require('./git');
const promptVersion = require('./prompt/version');
const promptContinue = require('./prompt/continue');
const semver = require('semver');
const { mergeDeepRight } = require("ramda");
const { done, fail } = require('./helpers');

const cliFlags = {
    help: ['-h', '--help'],
    version: ['-v', '--version'],
};

if (argsHasFlag(cliFlags.version)) {
    console.log(config.SELF_VERSION);
    done();
}

output.heading();

if (argsHasFlag(cliFlags.help)) {
    output.help();
    done();
}

(async function main() {

    output.blankLine();

    try {

        const isRepository = await git().checkIsRepo();

        if ( ! isRepository) {
            output.gitRepoNotFound();
            return fail();
        }

        const branches = await git().branchLocal();

        if ( ! branches.all.includes(config.branch)) {
            output.notABranchError(config.branch);
            return fail();
        }

        const status = await git().status();

        if (status.current !== config.branch) {
            output.branchConflictError(status.current);
            return fail();
        }

        if ( ! status.isClean()) {

            if (config.allowDirty) {
                output.gitDirtyNotice(status);
            } else {

                output.gitDirtyWarning(status);

                if ( ! await promptContinue()) {
                    output.success('Aborting...');
                    return done();
                }
            }
        }

    } catch (e) {
        output.gitOperationError(e);
        return fail();
    }

    const version = await getNewVersionFromUser();

    try {
        if (config.syncPackageJson) {
            await writeVersionToPackageJson(version);
        }

        await writeVersionToComposerJson(version);
        await commitAndTag(version);

        output.done(version);
        done();

    } catch (e) {
        output.error('Error: ' + e + '. Rolling back package manager files');
        await rollbackComposerJson();

        if (config.syncPackageJson) {
            await rollbackPackageJson();
        }

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
        output.versionPromptMessage();
    }

    try {
        const version = await promptVersion();

        await expectValidVersion(version);
        output.bumpOK();
        output.blankLine();
        return semver.clean(version);

    } catch (error) {

        output.bumpError(error);
        return getNewVersionFromUser(attempt + 1);
    }
}

async function rollbackComposerJson() {
    await Fs.writeFile(config.COMPOSER_JSON_PATH, formatJSON(config.COMPOSER_JSON_DATA));
}

async function rollbackPackageJson() {
    await Fs.writeFile(config.PACKAGE_JSON_PATH, formatJSON(config.PACKAGE_JSON_DATA));
}

async function writeVersionToComposerJson(version) {

    const json = formatJSON(mergeDeepRight(config.COMPOSER_JSON_DATA, { version }));

    try {
        await Fs.writeFile(config.COMPOSER_JSON_PATH, json);
        output.composerVersionUpdateOK();

    } catch (error) {
        output.composerVersionUpdateError(error);
        throw error;
    }

    return version;
}

async function writeVersionToPackageJson(version) {

    const json = formatJSON(mergeDeepRight(config.PACKAGE_JSON_DATA, { version }));

    try {
        await Fs.writeFile(config.PACKAGE_JSON_PATH, json);
        output.packageVersionUpdateOK();

    } catch (error) {
        output.packageVersionUpdateError(error);
        throw error;
    }

    return version;
}

async function commitAndTag(version) {

    try {
        await git().add('./');
        await git().commit(version);
        output.gitCommitOK();

        await git().addTag(version);
        output.gitTagOK();

    } catch (e) {
        output.error('Git error: ', e);
        throw e;
    }
}

/**
 * @param {string} version
 * @return {version}
 */
async function expectValidVersion(version) {
    if (semver.valid(version) === null) throw `Invalid version number (https://semver.org/)`;
    if (config.CURRENT_VERSION && semver.lte(version, config.CURRENT_VERSION)) throw `New version must be greater than current version`;
    if (await tagExists(version)) throw `Tag '${version}' already exists`;
}

async function tagExists(version) {
    const tags = await git().tags();
    return tags.all.some((tag) => tag === semver.clean(version));
}

function formatJSON(object) {
    return JSON.stringify(object, null, 4) + '\n';
}

/**
 * @param {string[]} flags
 * @return {boolean}
 */
function argsHasFlag(flags) {
    for (const flag of flags) {
        if (config.CLI_ARGUMENTS.includes(flag)) {
            return true;
        }
    }
    return false;
}
