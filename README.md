## "Baggage" loader for [webpack](https://webpack.github.io/)

[![travis](http://img.shields.io/travis/deepsweet/baggage-loader.svg?style=flat-square)](https://travis-ci.org/deepsweet/baggage-loader)
[![npm](http://img.shields.io/npm/v/baggage-loader.svg?style=flat-square)](https://www.npmjs.org/package/baggage-loader)
[![peer deps](http://img.shields.io/david/peer/deepsweet/baggage-loader.svg?style=flat-square)](https://david-dm.org/deepsweet/baggage-loader#info=peerDependencies)
[![dev deps](http://img.shields.io/david/dev/deepsweet/baggage-loader.svg?style=flat-square)](https://david-dm.org/deepsweet/baggage-loader#info=devDependencies)
![unicorn approved](http://img.shields.io/badge/unicorn-approved-ff69b4.svg?style=flat-square)

Automatically `require()` any resources related to the `require()`d one. See example below.

[Documentation: Using loaders](https://webpack.github.io/docs/using-loaders.html).

### Install

```sh
npm i -S baggage-loader
```

### Usage

Imagine that you have project structure like this and you're using webpack:

```
components/
├── component-1
│   ├── script.js
│   ├── styles.css
│   └── template.html
├── component-2
│   ├── script.js
│   └── template.html
└── component-3
    ├── script.js
    └── styles.css
```

and in each of component's `script.js` you're doing something like this:

```javascript
var template = require('./template.html');
require('./styles.css');

var html = template({ foo: 'bar' };
```

Now you have to stop and give it to `baggage-loader`, so:

```javascript
module: {
    preLoaders: [ {
        test: /\/components\/.+script\.js$/,
        // baggage?file=var&file-without-var&…
        loader: 'baggage?template.html=template&styles.css'
    } ],
}
```

will become the necessary `require()`s with variables declarations if corresponding files exists:

```javascript
// injected by preloader at the top of script.js
var template = require('./template.html');
require('./styles.css');

// your code
var html = template({ foo: 'bar' };
```

Even more, there are placeholders `[dir]`, `[Dir]`, `[file]` and `[File]`, so you can use them in various tricky ways both with `file` and `var`:

```
└── alert
    ├── view.js
    ├── templateAlert.html
    └── alertViewStyles.css
```

```javascript
loader: 'baggage?template[Dir].html=[file]Template&[dir][File].css'
```

```javascript
var viewTemplate = require('./templateAlert.html');
require('./alertViewStyles.css');
```

### Test

Soon.

`npm test`

### License
[WTFPL](http://www.wtfpl.net/wp-content/uploads/2012/12/wtfpl-strip.jpg)
