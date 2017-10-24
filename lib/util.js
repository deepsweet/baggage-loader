'use strict';
const fs = require('fs');

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

module.exports = {
    stat: (path) => new Promise((fulfill, rej) => fs.stat(path, (er, data) => er ? rej(er) : fulfill(data))),

    applyPlaceholders(str, dirname, filename) {
        if (!str || !str.length) {
            return str;
        }

        return str
        .split('[dir]').join(dirname)
        .split('[Dir]').join(capitalize(dirname))
        .split('[file]').join(filename)
        .split('[File]').join(capitalize(filename));
    }
};
