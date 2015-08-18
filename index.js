'use strict';

var path = require('path');
var fs = require('fs');
var loaderUtils = require('loader-utils');
var SourceMap = require('source-map');
var util = require('./lib/util');

module.exports = function(source, sourceMap) {
    var query = loaderUtils.parseQuery(this.query);

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

    if (Object.keys(query).length) {
        var inject = '\n/* injects from baggage-loader */\n';

        Object.keys(query).forEach(function(baggageFile) {
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
                        inject += 'require(\'./' + baggageFile + '\');\n';
                    }
                } catch (e) {}
            }
        });

        inject += '\n';

        // support existing SourceMap
        // https://github.com/mozilla/source-map#sourcenode
        // https://github.com/webpack/imports-loader/blob/master/index.js#L34-L44
        // https://webpack.github.io/docs/loaders.html#writing-a-loader
        if (sourceMap) {
            var currentRequest = loaderUtils.getCurrentRequest(this);
            var SourceNode = SourceMap.SourceNode;
            var SourceMapConsumer = SourceMap.SourceMapConsumer;
            var sourceMapConsumer = new SourceMapConsumer(sourceMap);
            var node = SourceNode.fromStringWithSourceMap(source, sourceMapConsumer);

            node.prepend(inject);

            var result = node.toStringWithSourceMap({
                file: currentRequest
            });

            this.callback(null, result.code, result.map.toJSON());

            return;
        }

        // prepend collected inject at the top of file
        return inject + source;
    }

    // return the original source and sourceMap
    if (sourceMap) {
        this.callback(null, source, sourceMap);
        return;
    }

    // return the original source
    return source;
};
