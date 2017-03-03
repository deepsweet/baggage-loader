/* eslint-disable consistent-return */
'use strict';

var path = require('path');
var fs = require('fs');
var loaderUtils = require('loader-utils');
var SourceMap = require('source-map');

var legacyLoader = require('./compat/legacy-loader.js');
var util = require('./lib/util');

var injectBanner = '\n/* injects from baggage-loader */\n';

module.exports = function(source, sourceMap) {
    // parseQuery will always give us an object, for back-compat we
    // want to know if we're working with JSON query or query string
    if (!util.isJSONString(this.query.replace('?', ''))) {
        return legacyLoader.call(this, source, sourceMap);
    }

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

    var filePaths = Object.keys(query);
    var injections = [];
    if (filePaths.length) {
        injections = filePaths.map(function(filePath) {

            var varName;
            var loadersForFile = '';
            var inject = null;

            if (typeof query[filePath] === 'object') {
                var fileConfig = query[filePath];
                var loaderStringForFile = fileConfig.loaders || '';
                if (loaderStringForFile) {
                    loadersForFile = loaderStringForFile.replace(/\*/g, '!') + '!';
                }

                varName = fileConfig.varName;
            }

            filePath = util.applyPlaceholders(filePath, srcDirname, srcFilename);
            if (varName) {
                varName = util.applyPlaceholders(varName, srcDirname, srcFilename);
            }

            // @todo support mandatory/optional requires via config
            try {

                // check if absoluted from srcDirpath + baggageFile path exists
                var stats = fs.statSync(path.resolve(srcDirpath, filePath));

                if (stats.isFile()) {
                    inject = '';
                    if (varName) {
                        inject = 'var ' + varName + ' = ';
                    }

                    inject += 'require(\'' + loadersForFile + './' + filePath + '\');\n';
                }
            } catch (e) {}

            return inject;
        });

        injections.filter(function(inject) {
            return typeof inject === 'string';
        });

        if (injections.length) {
            var srcInjection = injectBanner + injections.join('\n');

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

                node.prepend(srcInjection);

                var result = node.toStringWithSourceMap({
                    file: currentRequest
                });

                this.callback(null, result.code, result.map.toJSON());

                return;
            }

            // prepend collected inject at the top of file
            return srcInjection + source;
        }

    }

    // return the original source and sourceMap
    if (sourceMap) {
        this.callback(null, source, sourceMap);
        return;
    }

    // return the original source
    return source;
};
