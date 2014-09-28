'use strict';

var capitalize = exports.capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

exports.applyPlaceholders = function(str, dirname, filename) {
    if (!str.length) {
        return str;
    }

    return str
            .split('[dir]').join(dirname)
            .split('[Dir]').join(capitalize(dirname))
            .split('[file]').join(filename)
            .split('[File]').join(capitalize(filename));
};
