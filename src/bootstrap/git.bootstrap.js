const git = require('simple-git/promise');

/**
 * The basic promise-based SimpleGit setup used for Git operations throughout the codebase.
 *
 * @return {simplegit.SimpleGit}
 */
module.exports = () => git(process.cwd()).silent();
