# simpleflakes

[![travis status][travis-badge]][travis-link]
[![npm][npm-badge]][npm-link]
<!-- [![codacy quality][codacy-quality-badge]][codacy-quality-link]
[![codacy coverage][codacy-coverage-badge]][codacy-coverage-link] -->
[![coveralls status][coveralls-badge]][coveralls-link] [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes?ref=badge_shield)
 
[![tonicdev demo][demo-tonicdev-badge]][demo-tonicdev-link]
[![david dep status][dependencies-badge]][dependencies-url]
[![david dev dep status][dependencies-dev-badge]][dependencies-dev-url]  

Simpleflake is the smartest way to generate a 64-bit + time-ordered + snowflake based ID. [See the presentation!](http://akmanalp.com/simpleflake_presentation/)

### Test-driven, pure JavaScript
This port is test-driven and no release goes out without tests.  
**Also, this library does not rely on low-level bindings, with OpenSSL, libgmp or anything beyond pure JavaScript.**

Assumes [original Python implementation](https://simpleflake.readthedocs.org/en/latest/) as reference and fixes epoch (starts on `2000-01-01T00:00:00.000Z` (UTC) while Python API v0.1.5 epoch starts on `2000-01-01T05:00:00.000Z`).  

**simpleflakes** uses the TC39 BigInt implementation when running on newer versions of Node.js. When BigInt is not available, [Fedor Indutny's big number library (bn.js)](https://github.com/indutny/bn.js) is used as the fastest fallback for big number calculations.

### How to Install:

```sh
npm install simpleflakes --save
```

### Usage:
```js
const { simpleflake } = require('simpleflakes');

const flakeBigInt = simpleflake()

// simpleflake(
//    timestamp = Date.now(), 
//    random_bits = 23-bit random, 
//     epoch = Date.UTC(2000, 0, 1)
// )
// returns BigInt on newer Node.js or bn.js BigNum on older engines.

flakeBigInt.toString();       // 4234673179811182512
flakeBigInt.toString(16);     // 3ac494d21e84f7b0
flakeBigInt.toString(2);      // 11101011000100...
flakeBigInt.toString(36);     // 20rfh5
```
You can check the [original Python API 0.1.5](https://simpleflake.readthedocs.org/en/latest/) documentation for more info.  


### Reference
```js
// Main flake function and its defaults
simpleflake(
    timestamp = Date.now(), 
    random_bits = 23-bit random, 
    epoch = Date.UTC(2000, 0, 1)
)

// Static constant epoch for simpleflake timestamps, starts at the year 2000  
simpleflake.SIMPLEFLAKE_EPOCH // const = 946702800

// Show binary digits of a number, pads to 64 bits unless specified.
simpleflake.binary(number, padding=true)

// Extract a portion of a bit string. Similar to substr().
simpleflake.extractBits(data, shift, length)

// Parses a simpleflake and returns a named tuple with the parts.
simpleflake.parseSimpleflake(flake)

// original API alias for SimpleFlake class, from the Python API
simpleflake.simpleflakeStruct

// same as simpleflake.simpleflakeStruct
SimpleFlake.SimpleFlakeStruct
```


### License:  
[MIT](https://raw.githubusercontent.com/leodutra/simpleflakes/master/LICENSE)

[npm-badge]: https://img.shields.io/npm/v/simpleflakes.svg?style=flat
[travis-badge]: http://img.shields.io/travis/leodutra/simpleflakes.svg?style=flat
[codacy-coverage-badge]: https://api.codacy.com/project/badge/Coverage/f71ef817e5f14a9ab3b8b2cb6fabf51a
[codacy-quality-badge]: https://api.codacy.com/project/badge/Grade/f71ef817e5f14a9ab3b8b2cb6fabf51a
[coveralls-badge]: https://img.shields.io/coveralls/leodutra/simpleflakes.svg?style=flat

[npm-link]: https://www.npmjs.com/package/simpleflakes
[travis-link]: https://travis-ci.org/leodutra/simpleflakes
[codacy-quality-link]: https://www.codacy.com/app/leodutra/simpleflakes

[codacy-coverage-link]: https://www.codacy.com/app/leodutra/simpleflakes?utm_source=github.com&utm_medium=referral&utm_content=leodutra/simpleflakes&utm_campaign=Badge_Coverage
[codacy-quality-link]: https://www.codacy.com/app/leodutra/simpleflakes?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=leodutra/simpleflakes&amp;utm_campaign=Badge_Grade
[coveralls-link]: https://coveralls.io/github/leodutra/simpleflakes
[demo-tonicdev-link]: https://tonicdev.com/leodutra/simpleflakes-demo/1.0.13

[dependencies-url]: https://david-dm.org/leodutra/simpleflakes
[dependencies-badge]: 	https://img.shields.io/david/leodutra/simpleflakes.svg?style=flat
[dependencies-dev-url]: https://david-dm.org/leodutra/simpleflakes#info=devDependencies&view=table
[dependencies-dev-badge]: 	https://img.shields.io/david/dev/leodutra/simpleflakes.svg?style=flat
[demo-tonicdev-badge]: https://img.shields.io/badge/demo-%40tonicdev-008bb8.svg?style=flat



[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes?ref=badge_large)
