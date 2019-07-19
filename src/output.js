const chalk = require('chalk');
const config = require('./config');

const LF = '\n';
const TAB = '\t';

const log = (x) => console.log(x);

function blankLine() {
    log(' ');
}

function error(message) {
    console.error(chalk.red(message));
}

function warning(message) {
    console.warn(chalk.yellow(message));
}

function success(message) {
    log(chalk.green(message));
}

function gray(message) {
    log(chalk.gray(message));
}

const processLines = {
    versionBumpOK:
        'Version bump            =>   OK',
    gitTagOK:
        'Git tag                 =>   OK',
    gitCommitOK:
        'Git commit              =>   OK',
    packageOK:
        'Update package.json     =>   OK',
    composerOK:
        'Update composer.json    =>   OK',

};

// Vertical guides :)
// 8, 12, 16, 33, 37, 41, 88, 92, 96

/**
 *
 * @param {string} staged - raw output of `$ git diff --name-status --cached`
 * @return {string}
 */
function changedFilesContent(staged) {

    const fileLines = staged
        .replace(/^A\t/mg, 'Added:    ')
        .replace(/^M\t/mg, 'Modified: ')
        .replace(/^D\t/mg, 'Deleted:  ')
        .replace(/(\S+)$/mg, `${process.cwd()}/$1`)
        .split(LF)
        .map((line) => (
        `                    ${line}`
        ));

    return [
        '                    Changes to be committed:',
        '                    ------------------------',
        ...fileLines,
        '',
    ].join(LF);
}

Object.assign(exports, {

    success,
    error,
    warning,
    gray,
    blankLine,

    heading() {

        const title = chalk.bold.green(`php-composer-version @ ${config.SELF_VERSION}`);
        const url   = chalk.bold(config.SELF_URL);

        blankLine();

        log(`${title} | ${url}`);

        gray(config.SELF_DESCRIPTION);
    },

    gitRepoNotFound() {
        error(`Git error: not a repository (cwd: ${process.cwd()})`);
    },

    gitOperationError(e) {
        error('Git error: ' + e);
    },

    notABranchError(name) {
        error([
            `Git branch error:   Invalid branch name '${name}'.`,
            '',
        ].join(LF))
    },

    branchConflictError(currentBranch) {
        error([
            `Git branch error:   Cannot create release on current branch '${currentBranch}'`,
            `                    as the target branch is set to '${config.branch}'`,
            '',
        ].join(LF))
    },

    /**
     * @param {string} staged
     */
    gitDirtyNotice(staged) {

        gray([
            '',
            `Git status notice:  Git stage not clean. Staged changes will be committed along with the updated files.`,
            '',
        ].join(LF));


        gray(
            changedFilesContent(staged)
        );
    },

    /**
     * @param {string} staged
     */
    gitDirtyWarning(staged) {
        warning([
            `Git status warning: Git stage not clean. Staged changes will be committed along with the updated files.`,
            '',
        ].join(LF));

        gray(
            changedFilesContent(staged)
        );
    },

    gitCommitOK() {
        success(processLines.gitCommitOK);
    },

    gitTagOK() {
        success(processLines.gitTagOK);
    },

    bumpOK() {
        success(`${TAB}Version bump OK`);
    },

    bumpError(e) {
        error(`${TAB}Version bump Error: ${e}`);
    },

    versionPromptMessage() {
        log(`Enter new version number (current version: ${config.CURRENT_VERSION || 'none'})`);
    },

    composerVersionUpdateOK() {
        success(processLines.composerOK);
    },

    composerVersionUpdateError(message) {
        console.error(
            chalk.red('Failed to save new version to composer.json:'),
            LF + TAB + message
        );
    },

    packageVersionUpdateOK() {
        success(processLines.packageOK);
    },

    packageVersionUpdateError(message) {
        console.error(
            chalk.red('Failed to save new version to package.json:'),
            LF + TAB + message
        );
    },

    done(newVersion) {
        success(`Done. (${config.CURRENT_VERSION} => ${newVersion})${LF}`);
    },

    help() {

        log(`
        
  ....            ...........................          
 ....  .         ..........................  ..        
      ...                             ....  ....       
 ..... ....     .................... .... .....        
  ..... ....     .....              .... ....          
   ..... ....      ....  ...       .... ....           
    ..... ....      ....  ...     .... ....            
     .....  ...      ..... ....  ...  ....      ....   
      .....  ...      ..... .... ..  ....      .... .. 
        ....  ...      ..... ....   ....      .... ....
         ..... ....     .....  ...  ..      ....  .... 
          ..... ....      ....  ...        ....  ....  
           ..... ....      ....  ...      ....  ....   
            .....  ...      ..... ....   ....  ....    
              ....  ...  ... ..... .... .... .....     
               ....  ...  .   ..... .... .. ....       
                ..... ....  .. .....  ...  ....        
                 ..... ........ .....  .......         
                  ..... .....     ....  .....          
                   .....  ..       ..... ...
                           
Usage: php-composer-version [options]

${chalk.yellow('Self info:')}
    ${chalk.green('-h, --help')}                   Display this help message.
    ${chalk.green('-v, --version')}                Show current version of php-composer-version.
    
${chalk.yellow('Options:')}
    ${chalk.green('-V, --set-version <version>')}  The new package version to write. If not provided, php-composer-version will prompt interactively.
    ${chalk.green('-b, --branch <name>')}          Set the branch for the version commit. If on any other branch, the process will fail. ${chalk.yellow('[default: "master"]')} 
    ${chalk.green('-d, --allow-dirty')}            Allow additional changes to be committed with the version commit.
    ${chalk.green('-p, --sync-package-json')}      Toggle additional update of the version number in package.json.
`);
    }
});

