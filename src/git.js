const git = require('simple-git/promise');

/**
 * @return {simplegit.SimpleGit}
 */
module.exports = () => git(process.cwd()).silent();
