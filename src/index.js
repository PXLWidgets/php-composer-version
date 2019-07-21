#!/usr/bin/env node

const config = require('./config');
const Fs = require('fs-extra');
const git = require('./bootstrap/git.bootstrap');
const output = require('./output');
const semver = require('semver');
const { done, fail } = require('./helpers');
const { mergeDeepRight, intersection } = require("ramda");
const { promptVersion, promptContinue } = require('./prompt');

const selfInfoFlags = {
    help:    ['-h', '--help'],
    version: ['-v', '--version'],
};

if (argvContainsAny(...selfInfoFlags.version)) {
    console.log(config.SELF_VERSION);
    done();
}

output.heading();

if (argvContainsAny(...selfInfoFlags.help)) {
    output.help();
    done();
}

/**
 * Main function (IIFE)
 */
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

        const staged = await git().diff([
            '--name-status',
            '--cached',
        ]);

        if (staged !== '') {

            if (config.allowDirty) {
                output.gitDirtyNotice(staged);
            } else {

                output.gitDirtyWarning(staged);

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

    let newVersion;

    if (config.newVersion) {
        try {
            newVersion = await expectValidVersion(config.newVersion);
            output.bumpOK();
        } catch (e) {
            output.bumpError(e);
            fail();
        }
    } else {
        newVersion = await getNewVersionFromUser();
    }

    try {
        if (config.syncPackageJson) {
            await writeVersionToPackageJson(newVersion);
        }

        await writeVersionToComposerJson(newVersion);
        await commitAndTag(newVersion);

        output.updateDone(newVersion);
        done();

    } catch (e) {
        output.rollbackNotice();

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

/**
 * Reverts the package.json file to its state at the start of this process,
 * if it currently exists. No action is taken otherwise.
 *
 * @return {Promise<void>}
 */
async function rollbackComposerJson() {
    if ( ! Fs.existsSync(config.COMPOSER_JSON_PATH)) {
        return;
    }

    await Fs.writeFile(config.COMPOSER_JSON_PATH, formatJSON(config.COMPOSER_JSON_DATA));
}

/**
 * Reverts the package.json file to its state at the start of this process,
 * if it currently exists. No action is taken otherwise.
 *
 * @return {Promise<void>}
 */
async function rollbackPackageJson() {
    if ( ! Fs.existsSync(config.PACKAGE_JSON_PATH)) {
        return;
    }

    await Fs.writeFile(config.PACKAGE_JSON_PATH, formatJSON(config.PACKAGE_JSON_DATA));
}

/**
 * Writes given version to the project's composer.json file. If the file does not yet
 * exist, it is created with `"version"` as only key.
 *
 * @param version
 * @return {Promise<*>}
 */
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

/**
 * Writes given version to the project's package.json file. If the file does not yet
 * exist, it is created with `"version"` as only key.
 *
 * @param version
 * @return {Promise<*>}
 */
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

/**
 * Get the list of touched files add to the version commit.
 *
 * @return {*[]}
 */
function filesToCommit() {

    const files = [config.COMPOSER_JSON_PATH];

    if (config.syncPackageJson) {
        files.push(config.PACKAGE_JSON_PATH);
    }

    return files;
}

/**
 * Creates a commit named by given version, including all touched files, and
 * whatever was already staged. The commit is tagged with the version number
 * afterwards.
 *
 * @param version
 * @return {Promise<void>}
 */
async function commitAndTag(version) {

    const commitMessage = config.commitMessage
        ? config.commitMessage.replace(/%s/, version)
        : version;

    try {
        await git().add(filesToCommit());
        await git().commit(commitMessage);
        output.gitCommitOK();

        await git().addTag(version);
        output.gitTagOK();

    } catch (e) {
        output.error('Git error: ', e);
        throw e;
    }
}

/**
 * Asserts the validity of given version number as the new version for the
 * package: It must be a valid format, and a version greater than the
 * current version, if defined.
 *
 * @param {string} version
 * @return {version}
 */
async function expectValidVersion(version) {

    if (semver.valid(version) === null) {
        throw new Error(
            `Invalid version number '${version}'`
        );
    }

    if (config.CURRENT_VERSION && semver.lte(version, config.CURRENT_VERSION)) {
        throw new Error(
            `New version '${version}' must be greater than current version '${config.CURRENT_VERSION}'`
        );
    }

    if (await tagExists(version)) {
        throw new Error(
            `Tag '${version}' already exists`
        );
    }

    return version;
}

/**
 * Checks if a Git tag exists by the name of given version number.
 *
 * @param {string} version
 * @return {Promise<boolean>}
 */
async function tagExists(version) {
    const tags = await git().tags();
    return tags.all.some((tag) => tag === semver.clean(version));
}

/**
 * JSON stringify a given object in a readable way: with line breaks and indents.
 *
 * @param {object} object
 * @return {string}
 */
function formatJSON(object) {
    return JSON.stringify(object, null, 4) + '\n';
}

/**
 * Tests if any in the array of given CLI flags were actually given as argument(s)
 * to the current process.
 *
 * @param {...string} flags
 * @return {boolean}
 */
function argvContainsAny(...flags) {
    return intersection(flags, config.CLI_ARGUMENTS).length >= 1;
}
