## "Baggage" loader for [webpack](https://webpack.github.io/)

[![npm](http://img.shields.io/npm/v/baggage-loader.svg?style=flat-square)](https://www.npmjs.org/package/baggage-loader)
[![travis](http://img.shields.io/travis/deepsweet/baggage-loader.svg?style=flat-square)](https://travis-ci.org/deepsweet/baggage-loader)
[![climate](http://img.shields.io/codeclimate/github/deepsweet/baggage-loader.svg?style=flat-square)](https://codeclimate.com/github/deepsweet/baggage-loader/code)
[![peer deps](http://img.shields.io/david/peer/deepsweet/baggage-loader.svg?style=flat-square)](https://david-dm.org/deepsweet/baggage-loader#info=peerDependencies)
[![gratipay](http://img.shields.io/gratipay/deepsweet.svg?style=flat-square)](https://gratipay.com/deepsweet/)

Automatically import any resources related to the importd one. See example below.

[Documentation: Using loaders](https://webpack.github.io/docs/using-loaders.html).

## Install

```sh
$ npm i -S baggage-loader
```

## Example

Imagine that you have project structure like this and you're using webpack:

```
components/
├── component-1/
│   ├── script.js
│   ├── styles.css
│   └── template.html
├── component-2/
│   ├── script.js
│   └── template.html
└── component-3/
    ├── script.js
    └── styles.css
```

and in each of component's `script.js` you're doing something like this:

```javascript
import template from './template.html';
import './styles.css';

var html = template({ foo: 'bar' });
```

Now you can stop and let `baggage-loader` handle those `import`s, like so:

```javascript
module: {
    loaders: [ {
        test: /\/components\/.+script\.js$/,
        loader: 'baggage-loader'
        options: {
          "template.html": {"varName":"template"},
          "styles.css": {}
        }
    } ]
}
```
or as json-query-string:
```javascript
module: {
    loaders: [ {
        test: /\/components\/.+script\.js$/,
        loader: 'baggage-loader?{"template.html":{"varName":"template"},"styles.css":{}}'
    } ]
}
```

The example above will become the necessary requires, with variable declarations, if the corresponding files exist:

```javascript
// injected by preloader at the top of script.js
import template from './template.html';
import './styles.css';

// your code
const html = template({ foo: 'bar' };
```

## Usage
The 'baggage' -- the additional `import`s you want `baggage-loader` to insert -- is specified via the loader's query string. This query string must be written as a JSON string (see below for deprecated url-style query string syntax).

## Format
### Basic import (no options):
```js
?{"filename.ext":{}}
```

This will insert `import './filename.ext';` into each module to which the loader is applied

### import with variable name:
```js
?{"filename.ext":{"varName":"foo"}}
```

This will insert `import foo from './filename.ext';`

### import with 'inline' loaders:
```js
?{"filename.ext":{"loaders":"style*css*sass"}}
```

This will insert `import 'style!css!sass!./filename.ext';`. Note that asterisks are replaced with exclamation points; the loader will append the final exclamation point between your loaders and the file path. If you are overriding existing loader config, you will need to prefix your loader string with `*` so that the loader string begins with `!` (the leading exclamation point is webpack's syntax for overriding loaders).

### Combined
Any of the above can be combined, for example:

```js
?{"filename.ext":{"varName":"foo","loaders":"style*css*sass"}}
```

will insert `import foo from 'style!css!sass!./filename.ext';`. You can also have more than one baggage file in your params:

```js
?{"filename.js":{},"filename.scss":{}}
```

The above will insert

```javascript
import './filename.js';
import './filename.scss';
```

When defining a large amount of loader parameters, you may find it easier to define the JSON object and then stringify it for use in your loader config.

### Supported placeholders

The placeholder strings `[dir]`, `[Dir]`, `[file]` and `[File]` can be used in the keys of the loader params object (the file path) or in the `varName` value. The values for file and directory are taken from the module being loaded. For example:

```
alert/
├── view.js
├── templateAlert.html
└── alertViewStyles.css
```

```javascript
{
  loader: "baggage-loader",
  options: {
    "template[Dir].html": {varName: "[file]Template"},
    "[dir][File]Styles.css":{}
  }
},
```

```javascript
import viewTemplate from './templateAlert.html';
import './alertViewStyles.css';
```
