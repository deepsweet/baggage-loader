'use strict';

var path = require('path');
var fs = require('fs');
var loaderUtils = require('loader-utils');

var util = require('./lib/util');

module.exports = function(source) {
    var query = loaderUtils.parseQuery(this.query);
    var inject = '';

    // /foo/bar/file.js
    var srcFilepath = this.resourcePath;
    // /foo/bar/file.js -> file
    var srcFilename = path.basename(srcFilepath, path.extname(srcFilepath));
    // /foo/bar/file.js -> /foo/bar
    var srcDirpath = path.dirname(srcFilepath);
    // /foo/bar -> bar
    var srcDirname = srcDirpath.split(path.sep).pop();

    if (this.cacheable) {
        this.cacheable();
    }

    for (var baggageFile in query) {
        if (query.hasOwnProperty(baggageFile)) {
            var baggageVar = query[baggageFile];

            // TODO: not so quick and dirty validation
            if (typeof baggageVar === 'string' || baggageVar === true) {
                // apply filename placeholders
                baggageFile = util.applyPlaceholders(baggageFile, srcDirname, srcFilename);

                // apply var placeholders
                if (baggageVar.length) {
                    baggageVar = util.applyPlaceholders(baggageVar, srcDirname, srcFilename);
                }

                try {
                    // check if absoluted from srcDirpath + baggageFile path exists
                    var stats = fs.statSync(path.resolve(srcDirpath, baggageFile));

                    if (stats.isFile()) {
                        // assign it to variable
                        if (baggageVar.length) {
                            inject += 'var ' + baggageVar + ' = ';
                        }

                        // and require
                        inject += 'require("./' + baggageFile + '");\n';
                    }
                } catch (e) {}
            }
        }
    }

    // inject collected string at the top of file
    if (inject) {
        return inject + '\n' + source;
    }

    return source;
};
