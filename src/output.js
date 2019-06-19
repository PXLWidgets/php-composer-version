const chalk = require('chalk');
const config = require('./config');
const { resolve } = require('path');

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

// Vertical guides :)
// 8, 12, 16, 33, 37, 41, 88, 92, 96

/**
 *
 * @param status
 * @return {string}
 */
function changedFilesContent(status) {
    const files = status.files.map((file) => (
        `                    ${resolve(process.cwd(), file.path)}`
    ));

    return [
        '                    Files to be committed:',
        '                    ----------------------',
        ...files,
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

    gitBranchError(currentBranch) {
        error([
            `Git branch error:   Cannot create release on current branch (${currentBranch})`,
            `                    Checkout the master branch and try again.`,
        ].join(LF))
    },

    /**
     * @param {StatusResult} status
     */
    gitDirtyNotice(status) {

        gray([
            '',
            `Git status notice:  Working directory not clean. Local changes will`,
            `                    be committed along with the updated files.`,
            '',
        ].join(LF));


        gray(
            changedFilesContent(status)
        );
    },

    gitDirtyWarning(status) {
        warning([
            `Git status warning: Working directory not clean. Local changes will`,
            `                    be committed along with the updated files.`,
            '',
        ].join(LF));

        gray(
            changedFilesContent(status)
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
        log(`Enter new version number (current: ${config.CURRENT_VERSION})`);
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
                              
${chalk.yellow('Options:')}
    ${chalk.green('-h, --help')}               Display this help message.
    ${chalk.green('-v, --version')}            Show version number.
    ${chalk.green('-d, --allow-dirty')}        Allow additional changes to be committed with the version commit.
    ${chalk.green('-p, --sync-package-json')}  Toggle additional update of the version number in package.json.
`);
    }
});

