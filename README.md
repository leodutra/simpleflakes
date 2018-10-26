# simpleflakes

[![travis status][travis-badge]][travis-link]
[![npm][npm-badge]][npm-link]
[![codacy quality][codacy-badge]][codacy-link]
[![coveralls status][coveralls-badge]][coveralls-link]  
[![tonicdev demo][demo-tonicdev-badge]][demo-tonicdev-link]
[![david dep status][dependencies-badge]][dependencies-url]
[![david dev dep status][dependencies-dev-badge]][dependencies-dev-url]  
[![NSP Status](https://nodesecurity.io/orgs/leo-dutra-github/projects/d3e1cf82-c7fb-4cb4-a5c9-8a0c9440716f/badge)](https://nodesecurity.io/orgs/leo-dutra-github/projects/d3e1cf82-c7fb-4cb4-a5c9-8a0c9440716f)

Simpleflake is the smartest way to generate a 64-bit + time-ordered + snowflake based ID. [See the presentation!](http://akmanalp.com/simpleflake_presentation/)

This port is test driven and no release goes out without tests.

### Install:

```sh
npm install simpleflakes
```

### Implementation:  
Assumes [original Python implementation](https://simpleflake.readthedocs.org/en/latest/) as reference and fixes epoch (starts on `2000-01-01T00:00:00.000Z` (UTC) while Python API v0.1.5 epoch starts on `2000-01-01T05:00:00.000Z`).  

Uses and exposes [Fedor Indutny's big number library (bn.js)](https://github.com/indutny/bn.js) and does not rely on low level bindings, with OpenSSL, libgmp or anything beyond pure JavaScript.  

### API:

```js
const simpleflake = require('simpleflakes');

// Generate a 64 bit, roughly-ordered, globally-unique ID.
var flakeBigNum = simpleflake.simpleflake(timestamp=Date.now(), random_bits=23-bit random, epoch=Date.UTC(2000, 0, 1))

flakeBigNum.toString();       // '4234673179811182512'
flakeBigNum.toString(16);     // '3ac494d21e84f7b0'
flakeBigNum.toString(2);      // MIN BASE -> '11101011000100100101001101001000011110100001001111011110110000'
flakeBigNum.toString(36);     // MAX BASE
```
You can check the [original Python API 0.1.5](https://simpleflake.readthedocs.org/en/latest/) documentation for more info.  


#### More ports from the [original Python API 0.1.5](https://simpleflake.readthedocs.org/en/latest/):
```js
// Static constant epoch for simpleflake timestamps, starts at the year 2000  
simpleflake.SIMPLEFLAKE_EPOCH // const = 946702800

// Show binary digits of a number, pads to 64 bits unless specified.
simpleflake.binary(number, padding=true)

// Extract a portion of a bit string. Similar to substr().
simpleflake.extractBits(data, shift, length)

// Parses a simpleflake and returns a named tuple with the parts.
simpleflake.parseSimpleflake(flake)

// original API alias for SimpleFlake class
simpleflake.simpleflakeStruct
```


#### JavaScript API additions:
```js
simpleflake.BigNum // bn.js big number class

SimpleFlake.SimpleFlakeStruct // same as simpleflake.simpleflakeStruct
```


### License:  
[MIT](https://raw.githubusercontent.com/leodutra/simpleflakes/master/LICENSE)

[npm-badge]: https://img.shields.io/npm/v/simpleflakes.svg?style=flat
[travis-badge]: http://img.shields.io/travis/leodutra/simpleflakes.svg?style=flat
[codacy-badge]: 	https://img.shields.io/codacy/f71ef817e5f14a9ab3b8b2cb6fabf51a.svg?style=flat
[coveralls-badge]: https://img.shields.io/coveralls/leodutra/simpleflakes.svg?style=flat

[npm-link]: https://www.npmjs.com/package/simpleflakes
[travis-link]: https://travis-ci.org/leodutra/simpleflakes
[codacy-link]: https://www.codacy.com/app/leodutra/simpleflakes
[coveralls-link]: https://coveralls.io/github/leodutra/simpleflakes
[demo-tonicdev-link]: https://tonicdev.com/leodutra/simpleflakes-demo/1.0.13

[dependencies-url]: https://david-dm.org/leodutra/simpleflakes
[dependencies-badge]: 	https://img.shields.io/david/leodutra/simpleflakes.svg?style=flat
[dependencies-dev-url]: https://david-dm.org/leodutra/simpleflakes#info=devDependencies&view=table
[dependencies-dev-badge]: 	https://img.shields.io/david/dev/leodutra/simpleflakes.svg?style=flat
[demo-tonicdev-badge]: https://img.shields.io/badge/demo-%40tonicdev-008bb8.svg?style=flat
