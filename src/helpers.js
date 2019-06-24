/**
 * @return never
 */
function done() {
    process.exit(0);
}

/**
 * @return never
 */
function fail() {
    process.exit(1);
}

module.exports = {
    done, fail,
};
