# simpleflakes

[![travis shield](http://img.shields.io/travis/leodutra/simpleflakes/master.svg?style=flat-square)](https://travis-ci.org/leodutra/simpleflakes) [![npm shield](https://img.shields.io/npm/v/simpleflakes.svg?style=flat-square)](https://www.npmjs.com/package/simpleflakes) [![npm shield](https://img.shields.io/coveralls/leodutra/simpleflakes/master.svg?style=flat-square)](https://coveralls.io/github/leodutra/simpleflakes)


**Fast 64-bit simpleflake ID generator, in _pure_ JavaScript, for Node.js.**  

Simpleflake is the smartest way to generate a 64-bit + time-ordered + snowflake based ID. [See the presentation!](http://akmanalp.com/simpleflake_presentation/)


### Install:

```sh
npm install simpleflakes
```

### Implementation:  
Assumes [original Python implementation](https://simpleflake.readthedocs.org/en/latest/) as reference and fixes epoch (starts on `2000-01-01T00:00:00.000Z` (UTC) while Python API v0.1.5 epoch starts on `2000-01-01T05:00:00.000Z`).  

All big integers are returned as a [bn.js](https://github.com/indutny/bn.js) v4 instance, we call `BigNum`. Some functions receive `BigNum` as well.

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
