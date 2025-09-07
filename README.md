# simpleflakes

[![CI](https://github.com/leodutra/simpleflakes/actions/workflows/ci.yml/badge.svg)](https://github.com/leodutra/simpleflakes/actions/workflows/ci.yml)
[![npm][npm-badge]][npm-link]
[![npm downloads](https://img.shields.io/npm/dm/simpleflakes.svg?style=flat)](https://www.npmjs.com/package/simpleflakes)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/simpleflakes?style=flat)](https://bundlephobia.com/package/simpleflakes)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg?style=flat)](https://nodejs.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-0-green.svg?style=flat)](https://www.npmjs.com/package/simpleflakes)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Last Commit](https://img.shields.io/github/last-commit/leodutra/simpleflakes.svg?style=flat)](https://github.com/leodutra/simpleflakes)
<!-- [![codacy quality][codacy-quality-badge]][codacy-quality-link]
[![codacy coverage][codacy-coverage-badge]][codacy-coverage-link] -->
[![coveralls status][coveralls-badge]][coveralls-link] [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes?ref=badge_shield)

Simpleflake is the smartest way to generate a 64-bit + time-ordered + snowflake based ID. [See the presentation!](http://akmanalp.com/simpleflake_presentation/)

### Test-driven, pure JavaScript
This port is test-driven and no release goes out without tests.
**Also, this library does not rely on low-level bindings, with OpenSSL, libgmp or anything beyond pure JavaScript.**

Assumes [original Python implementation](https://simpleflake.readthedocs.org/en/latest/) as reference and fixes epoch (starts on `2000-01-01T00:00:00.000Z` (UTC) while Python API v0.1.5 epoch starts on `2000-01-01T05:00:00.000Z`).

**simpleflakes** uses the TC39 BigInt implementation for fast and reliable 64-bit ID generation in pure JavaScript.

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
// returns BigInt

flakeBigInt.toString();       // 4234673179811182512
flakeBigInt.toString(16);     // 3ac494d21e84f7b0
flakeBigInt.toString(2);      // 11101011000100...
flakeBigInt.toString(36);     // 20rfh5
```

### TypeScript Support:
The library is written in TypeScript and includes full type definitions:

```typescript
import { simpleflake, SimpleFlakeStruct, parseSimpleflake } from 'simpleflakes';

// Generate a typed ID
const flakeId: bigint = simpleflake();

// Parse with full type safety
const parsed: SimpleFlakeStruct = parseSimpleflake(flakeId);
console.log(parsed.timestamp);   // string
console.log(parsed.randomBits);  // string

// All functions have proper type annotations
const binaryStr: string = binary(flakeId);
const bits: bigint = extractBits(flakeId, 23n, 41n);
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

### Development:

This project is written in TypeScript and includes comprehensive test coverage.

```sh
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run tests (automatically builds first)
npm test

# Run with coverage
npm run test:coverage

# Test module compatibility (CommonJS, ES Modules, TypeScript)
npm run test:compatibility

# Run all CI tests (coverage + compatibility)
npm run test:ci

# Type checking
npm run type-check

# Clean build artifacts
npm run clean
```

### License:

[MIT](https://raw.githubusercontent.com/leodutra/simpleflakes/master/LICENSE)

[npm-badge]: https://img.shields.io/npm/v/simpleflakes.svg?style=flat
[codacy-coverage-badge]: https://api.codacy.com/project/badge/Coverage/f71ef817e5f14a9ab3b8b2cb6fabf51a
[codacy-quality-badge]: https://api.codacy.com/project/badge/Grade/f71ef817e5f14a9ab3b8b2cb6fabf51a
[coveralls-badge]: https://img.shields.io/coveralls/leodutra/simpleflakes.svg?style=flat

[npm-link]: https://www.npmjs.com/package/simpleflakes
[codacy-quality-link]: https://www.codacy.com/app/leodutra/simpleflakes
[codacy-coverage-link]: https://www.codacy.com/app/leodutra/simpleflakes?utm_source=github.com&utm_medium=referral&utm_content=leodutra/simpleflakes&utm_campaign=Badge_Coverage
[coveralls-link]: https://coveralls.io/github/leodutra/simpleflakes


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes?ref=badge_large)
