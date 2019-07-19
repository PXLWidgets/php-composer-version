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

const selfInfoFlags = {
    help:    ['-h', '--help'],
    version: ['-v', '--version'],
};

if (argsHasFlag(selfInfoFlags.version)) {
    console.log(config.SELF_VERSION);
    done();
}

output.heading();

if (argsHasFlag(selfInfoFlags.help)) {
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
        } catch (e) {
            output.error(e.message);
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

        output.done(newVersion);
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

function filesToCommit() {

    const files = [config.COMPOSER_JSON_PATH];

    if (config.syncPackageJson) {
        files.push(config.PACKAGE_JSON_PATH);
    }

    return files;
}

async function commitAndTag(version) {

    try {
        await git().add(filesToCommit());
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

    if (semver.valid(version) === null) {

        throw new Error(`Invalid version number '${version}'`);
    }

    if (config.CURRENT_VERSION && semver.lte(version, config.CURRENT_VERSION)) {

        throw new Error(`New version '${version}' must be greater than current version '${config.CURRENT_VERSION}'`);
    }

    if (await tagExists(version)) {

        throw new Error(`Tag '${version}' already exists`);
    }

    return version;
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
