## "Baggage" loader for [webpack](https://webpack.github.io/)

[![npm](http://img.shields.io/npm/v/baggage-loader.svg?style=flat-square)](https://www.npmjs.org/package/baggage-loader)
[![travis](http://img.shields.io/travis/deepsweet/baggage-loader.svg?style=flat-square)](https://travis-ci.org/deepsweet/baggage-loader)
[![climate](http://img.shields.io/codeclimate/github/deepsweet/baggage-loader.svg?style=flat-square)](https://codeclimate.com/github/deepsweet/baggage-loader/code)
[![peer deps](http://img.shields.io/david/peer/deepsweet/baggage-loader.svg?style=flat-square)](https://david-dm.org/deepsweet/baggage-loader#info=peerDependencies)
[![gratipay](http://img.shields.io/gratipay/deepsweet.svg?style=flat-square)](https://gratipay.com/deepsweet/)

Automatically require any resources related to the required one. See example below.

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
var template = require('./template.html');
require('./styles.css');

var html = template({ foo: 'bar' });
```

Now you can stop and let `baggage-loader` handle those `require`s, like so:

```javascript
module: {
    loaders: [ {
        test: /\/components\/.+script\.js$/,
        loader: 'baggage?{"template.html":{"varName":"template"},"styles.css":{}}'
    } ]
}
```

The example above will become the necessary requires, with variable declarations, if the corresponding files exist:

```javascript
// injected by preloader at the top of script.js
var template = require('./template.html');
require('./styles.css');

// your code
var html = template({ foo: 'bar' };
```

## Usage
The 'baggage' -- the additional `require`s you want `baggage-loader` to insert -- is specified via the loader's query string. This query string must be written as a JSON string (see below for deprecated url-style query string syntax).

## Format
### Basic require (no options): 
`?{"filename.ext":{}}`

This will insert `require('./filename.ext');` into each module to which the loader is applied

### Require with variable name: 
`?{"filename.ext":{"varName":"foo"}}`

This will insert `var foo = require('./filename.ext');` 

### Require with 'inline' loaders:
`?{"filename.ext":{"loaders":"style*css*sass"}}`

This will insert `require('style!css!sass!./filename.ext');`. Note that asterisks are replaced with exclamation points; the loader will append the final exclamation point between your loaders and the file path. If you are overriding existing loader config, you will need to prefix your loader string with `*` so that the loader string begins with `!` (the leading exclamation point is webpack's syntax for overriding loaders).

### Combined
Any of the above can be combined, for example:

`?{"filename.ext":{"varName":"foo","loaders":"style*css*sass}}`

will insert `var foo = require('style!css!sass!./filename.ext');`. You can also have more than one baggage file in your params:

`?{"filename.js":{},"filename.scss":{}}`

The above will insert 

```javascript
require('./filename.js');
require('./filename.scss');
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
loader: 'baggage?template[Dir].html=[file]Template&[dir][File]Styles.css'
```

```javascript
var viewTemplate = require('./templateAlert.html');
require('./alertViewStyles.css');
```

## Pre-1.0 Usage
Before version 1.0, the loader supported both JSON-style query strings and url-style query strings, and the syntax was different. The breaking change for the loader's parameters was made to support a greater range of parmaters to control the loader's behavior. The older syntax is still supported, but **only** when params are specfied as a url-style query string. (In other words, all url-style params will be treated as the old syntax, all JSON-style params will be treated as the 1.x+ syntax.) In the future, support for the older styntax will likely be removed; users are encouraged to update to the 1.x syntax.

`?template.html=template&styles.css`

The above would insert

```
var template = require('./template.html');
require('./styles.css');
```

Note that the argument 'name' in this syntax is the file path, and if you assign a 'value', that value becomes the variable name. The file and directory placeholders may be used in this syntax just as in the 1.x+ syntax.

Note that the above example demonstrates all of the functionality of the legacy syntax. Newer features, such as specifying loaders, are not supported.