## "Baggage" loader for [webpack](https://webpack.github.io/)

[![npm](http://img.shields.io/npm/v/baggage-loader.svg?style=flat-square)](https://www.npmjs.org/package/baggage-loader)
[![travis](http://img.shields.io/travis/deepsweet/baggage-loader.svg?style=flat-square)](https://travis-ci.org/deepsweet/baggage-loader)
[![climate](http://img.shields.io/codeclimate/github/deepsweet/baggage-loader.svg?style=flat-square)](https://codeclimate.com/github/deepsweet/baggage-loader/code)
[![peer deps](http://img.shields.io/david/peer/deepsweet/baggage-loader.svg?style=flat-square)](https://david-dm.org/deepsweet/baggage-loader#info=peerDependencies)
[![gratipay](http://img.shields.io/gratipay/deepsweet.svg?style=flat-square)](https://gratipay.com/deepsweet/)

Automatically require any resources related to the required one. See example below.

[Documentation: Using loaders](https://webpack.github.io/docs/using-loaders.html).

### Install

```sh
$ npm i -S baggage-loader
```

### Usage

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

Now you have to stop and give it to `baggage-loader`, so:

```javascript
module: {
    preLoaders: [ {
        test: /\/components\/.+script\.js$/,
        // baggage?file=var&file-without-var&…
        loader: 'baggage?template.html=template&styles.css'
    } ]
}
```

will become the necessary requires with variables declarations if corresponding files exists:

```javascript
// injected by preloader at the top of script.js
var template = require('./template.html');
require('./styles.css');

// your code
var html = template({ foo: 'bar' };
```

Even more, there are placeholders `[dir]`, `[Dir]`, `[file]` and `[File]`, so you can use them in various tricky ways both with `file` and `var`:

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
