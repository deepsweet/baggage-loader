'use strict';

const path = require('path');
const loaderUtils = require('loader-utils');
const SourceMap = require('source-map');

const { applyPlaceholders, stat } = require('./lib/util');

const HAS_COMMONJS = /(\s+require\s*\()|(module\.exports)/g;

module.exports = function(source, sourceMap) {
    this.cacheable(true);
    const callback = this.async();

    const query = loaderUtils.getOptions(this);

    // /foo/bar/file.js
    const srcFilepath = this.resourcePath;
    // /foo/bar/file.js -> file
    const srcFilename = path.basename(srcFilepath, path.extname(srcFilepath));
    // /foo/bar/file.js -> /foo/bar
    const srcDirpath = path.dirname(srcFilepath);
    // /foo/bar -> bar
    const srcDirname = srcDirpath.split(path.sep).pop();

    const sourceString = source.toString('utf8');

    const hasCommonJS = HAS_COMMONJS.test(sourceString);

    Promise.all(Object.keys(query)
        .map(filePath => {

            let varName;
            let loadersForFile = '';

            if (typeof query[filePath] === 'object') {
                const fileConfig = query[filePath];
                const loaderStringForFile = fileConfig.loaders || '';
                if (loaderStringForFile) {
                    loadersForFile = loaderStringForFile.replace(/\*/g, '!') + '!';
                }

                varName = applyPlaceholders(fileConfig.varName, srcDirname, srcFilename);
            }

            filePath = applyPlaceholders(filePath, srcDirname, srcFilename);

            // @todo support mandatory/optional requires via config

            // check if absoluted from srcDirpath + baggageFile path exists
            return stat(path.resolve(srcDirpath, filePath))
                .then(stats => {
                    if (!stats.isFile()) {
                        return;
                    }

                    if (hasCommonJS) {
                        let inject = '';
                        if (varName) {
                            inject = 'const ' + varName + ' = ';
                        }

                        return inject + 'require(\'' + loadersForFile + './' + filePath + '\');\n';
                    }

                    let inject = 'import ';
                    if (varName) {
                        inject = varName + ' from ';
                    }

                    return inject + '\'' + loadersForFile + './' + filePath + '\';\n';
                })
                // eslint-disable-next-line
                .catch((e) => {
                    // log a warning/error?
                });
        }))
        .then(results => {

            const injections = results.filter(x => typeof x === 'string');

            if (injections.length) {
                const srcInjection = injections.join('\n');

                // support existing SourceMap
                // https://github.com/mozilla/source-map#sourcenode
                // https://github.com/webpack/imports-loader/blob/master/index.js#L34-L44
                // https://webpack.github.io/docs/loaders.html#writing-a-loader
                if (sourceMap) {
                    const currentRequest = loaderUtils.getCurrentRequest(this);
                    const SourceNode = SourceMap.SourceNode;
                    const SourceMapConsumer = SourceMap.SourceMapConsumer;
                    const sourceMapConsumer = new SourceMapConsumer(sourceMap);
                    const node = SourceNode.fromStringWithSourceMap(sourceString, sourceMapConsumer);

                    node.prepend(srcInjection);

                    const result = node.toStringWithSourceMap({
                        file: currentRequest
                    });

                    callback(null, result.code, result.map.toJSON());
                    return;
                }

                // prepend collected inject at the top of file
                callback(null, srcInjection + sourceString);
                return;
            }

            // return the originals
            callback(null, source, sourceMap);
        });
};
