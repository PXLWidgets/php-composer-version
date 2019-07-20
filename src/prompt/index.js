const promptVersion  = require('./version');
const promptContinue = require('./continue');

module.exports = Object.assign({}, exports, {
    promptVersion,
    promptContinue,
});
