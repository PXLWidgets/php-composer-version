const chalk = require('chalk');
const { CURRENT_VERSION } = require('./config');

const LF = '\n';
const TAB = '\t';

const log = console.log;

function error(message) {
    console.error(chalk.red(message));
}

function success(message) {
    log(chalk.green(message));
}

function dim(message) {
    log(chalk.dim(message));
}

Object.assign(exports, {

    success,
    error,
    dim,

    gitRepoNotFound() {
        error(`Git error: not a repository (cwd: ${process.cwd()})`);
    },

    gitOperationError(e) {
        error('Git error: ' + e);
    },

    gitBranchError(currentBranch) {
        error(''
            + `Git branch error: Cannot create release on current branch (${currentBranch})` + LF
            + `                  Checkout the master branch and try again.` + LF
        )
    },

    gitDirtyError() {
        error(''
            + `Git status error: Working directory not clean.` + LF
            + `                  Commit your changes and try again.` + LF
        );
    },

    gitCommitOK() {
        success(`Git commit OK`);
    },

    gitTagOK() {
        success(`Git tag OK`);
    },

    bumpOK() {
        success(`${TAB}Version bump OK`);
    },

    bumpError(e) {
        error(`${TAB}Version bump Error: ${e}`);
    },

    versionPromptMessage() {
        log(
            chalk.green(`Enter new version number`),
            chalk.italic(`(Current version: ${CURRENT_VERSION})`),
        );
    },

    composerVersionUpdateOK() {
        success('Update composer.json OK');
    },

    composerVersionUpdateError(message) {
        console.error(
            chalk.red('Failed to save new version to composer.json:'),
            LF + TAB + message
        );
    },

    packageVersionUpdateOK() {
        success('Update package.json OK');
    },

    packageVersionUpdateError(message) {
        console.error(
            chalk.red('Failed to save new version to package.json:'),
            LF + TAB + message
        );
    },

    done(newVersion) {
        success(`Done. (${CURRENT_VERSION} => ${newVersion})${LF}`);
    },
});

