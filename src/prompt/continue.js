const readline = require('readline');
const output = require('../output');

module.exports = () => {

    const reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });

    let question = `Do you want to continue? (y/n) > `;

    return new Promise((fulfill, reject) => reader.question(question, (answer) => {

        output.blankLine();

        answer = (answer || '').toLowerCase();

        reader.close();

        switch (answer) {
            case 'y': case 'yes':
                return fulfill();

            case 'n': case 'no': default:
                return reject();
        }
    }));
};
