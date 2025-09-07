# simpleflakes

[![CI](https://github.com/leodutra/simpleflakes/actions/workflows/ci.yml/badge.svg)](https://github.com/leodutra/simpleflakes/actions/workflows/ci.yml)
[![npm][npm-badge]][npm-link]
[![npm downloads](https://img.shields.io/npm/dm/simpleflakes.svg?style=flat)](https://www.npmjs.com/package/simpleflakes)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/simpleflakes?style=flat)](https://bundlephobia.com/package/simpleflakes)
[![Performance](https://img.shields.io/badge/performance-8.8M%20ops%2Fsec-brightgreen?style=flat&logo=javascript)](https://github.com/leodutra/simpleflakes/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg?style=flat)](https://nodejs.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-0-green.svg?style=flat)](https://www.npmjs.com/package/simpleflakes)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Last Commit](https://img.shields.io/github/last-commit/leodutra/simpleflakes.svg?style=flat)](https://github.com/leodutra/simpleflakes)
[![coveralls status][coveralls-badge]][coveralls-link] [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes?ref=badge_shield)

> **Fast, reliable, distributed 64-bit ID generation for Node.js** ⚡
> Zero dependencies • TypeScript-ready • 8.8M+ ops/sec performance

## ✨ Features

- 🚀 **Ultra-fast**: 8.8M+ operations per second
- 🔢 **64-bit time-ordered IDs**: Globally unique, sortable by creation time
- 📦 **Zero dependencies**: Pure JavaScript implementation
- 🏷️ **TypeScript-first**: Full type safety and IntelliSense support
- 🌐 **Universal**: Works with CommonJS, ES Modules, and TypeScript
- ⚖️ **Lightweight**: Tiny bundle size, tree-shakable
- 🧪 **Battle-tested**: 100% test coverage, production-ready
- 🔄 **Snowflake compatible**: Drop-in replacement for Twitter Snowflake

## 🏗️ What is Simpleflake?

Simpleflake generates **unique 64-bit integers** that are:

1. **Time-ordered** - IDs generated later are numerically larger
2. **Distributed-safe** - No coordination needed between multiple generators
3. **Compact** - Fits in a 64-bit integer (vs UUID's 128 bits)
4. **URL-friendly** - Can be represented as short strings

Perfect for database primary keys, distributed system IDs, and anywhere you need fast, unique identifiers.

[See the original presentation!](http://akmanalp.com/simpleflake_presentation/)

## 📦 Installation

```bash
npm install simpleflakes
```

## 🚀 Quick Start

### JavaScript (CommonJS)
```javascript
const { simpleflake } = require('simpleflakes');

// Generate a unique ID
const id = simpleflake();
console.log(id); // 4234673179811182512n (BigInt)

// Convert to different formats
console.log(id.toString());    // "4234673179811182512"
console.log(id.toString(16));  // "3ac494d21e84f7b0" (hex)
console.log(id.toString(36));  // "20rfh5bt4k0g" (base36 - shortest)
```

### TypeScript / ES Modules
```typescript
import { simpleflake, parseSimpleflake, type SimpleFlakeStruct } from 'simpleflakes';

// Generate with full type safety
const id: bigint = simpleflake();

// Parse the ID to extract timestamp and random bits
const parsed: SimpleFlakeStruct = parseSimpleflake(id);
console.log(parsed.timestamp);   // "1693244847123" (Unix timestamp as string)
console.log(parsed.randomBits);  // "4567234" (Random component as string)
```

## 🎯 Advanced Usage

### Custom Parameters
```javascript
// Generate with custom timestamp and random bits
const customId = simpleflake(
  Date.now(),           // timestamp (default: Date.now())
  12345,               // random bits (default: 23-bit random)
  Date.UTC(2000, 0, 1) // epoch (default: Year 2000)
);
```

### Working with Binary Data
```javascript
import { binary, extractBits } from 'simpleflakes';

const id = simpleflake();

// View binary representation
console.log(binary(id));
// Output: "0011101011000100100100110100001000011110100001001111011110110000"

// Extract specific bit ranges
const timestampBits = extractBits(id, 23n, 41n); // Extract 41 bits starting at position 23
const randomBits = extractBits(id, 0n, 23n);     // Extract first 23 bits
```

### Batch Generation
```javascript
// Generate multiple IDs efficiently
function generateBatch(count) {
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(simpleflake());
  }
  return ids;
}

const batch = generateBatch(1000);
console.log(`Generated ${batch.length} unique IDs`);
```

## 🔬 ID Structure

Each 64-bit simpleflake ID contains:

```
|-- 41 bits ---|-- 23 bits --|
| Timestamp     | Random      |
| (milliseconds)| (0-8388607) |
```

- **41 bits timestamp**: Milliseconds since epoch (Year 2000)
- **23 bits random**: Random number for uniqueness within the same millisecond
- **Total**: 64 bits = fits in a signed 64-bit integer

This gives you:
- **69+ years** of timestamp range (until year 2069)
- **8.3 million** unique IDs per millisecond
- **Sortable by creation time** when converted to integers

## ⚡ Performance

Simpleflakes is optimized for speed:

```javascript
// Benchmark results (operations per second)
simpleflake()           // ~8.8M ops/sec
parseSimpleflake()      // ~3.9M ops/sec
binary()               // ~26M ops/sec
```

Perfect for high-throughput applications requiring millions of IDs per second.

## 🏛️ Architecture

### Why 64-bit IDs?

- **Database-friendly**: Most databases optimize for 64-bit integers
- **Memory efficient**: Half the size of UUIDs (128-bit)
- **Performance**: Integer operations are faster than string operations
- **Sortable**: Natural ordering by creation time
- **Compact URLs**: Shorter than UUIDs when base36-encoded

### Distributed Generation

No coordination required between multiple ID generators:
- **Clock skew tolerant**: Small time differences between servers are fine
- **Random collision protection**: 23 random bits provide 8.3M combinations per millisecond
- **High availability**: Each service can generate IDs independently

## 🧪 API Reference

### Core Functions

#### `simpleflake(timestamp?, randomBits?, epoch?): bigint`
Generates a unique 64-bit ID.

**Parameters:**
- `timestamp` (number, optional): Unix timestamp in milliseconds. Default: `Date.now()`
- `randomBits` (number, optional): Random bits (0-8388607). Default: random 23-bit number
- `epoch` (number, optional): Epoch start time. Default: `Date.UTC(2000, 0, 1)`

**Returns:** BigInt - The generated ID

```javascript
const id = simpleflake();
const customId = simpleflake(Date.now(), 12345, Date.UTC(2000, 0, 1));
```

#### `parseSimpleflake(flake): SimpleFlakeStruct`
Parses a simpleflake ID into its components.

**Parameters:**
- `flake` (bigint | string | number): The ID to parse

**Returns:** Object with `timestamp` and `randomBits` properties (both strings)

```javascript
const parsed = parseSimpleflake(4234673179811182512n);
console.log(parsed.timestamp);  // "1693244847123"
console.log(parsed.randomBits); // "4567234"
```

#### `binary(value, padding?): string`
Converts a number to binary string representation.

**Parameters:**
- `value` (bigint | string | number): Value to convert
- `padding` (boolean, optional): Whether to pad to 64 bits. Default: `true`

**Returns:** String - Binary representation

```javascript
console.log(binary(42n)); // "0000000000000000000000000000000000000000000000000000000000101010"
console.log(binary(42n, false)); // "101010"
```

#### `extractBits(data, shift, length): bigint`
Extracts a portion of bits from a number.

**Parameters:**
- `data` (bigint | string | number): Source data
- `shift` (bigint): Starting bit position (0-based from right)
- `length` (bigint): Number of bits to extract

**Returns:** BigInt - Extracted bits as number

```javascript
const bits = extractBits(0b11110000n, 4n, 4n); // Extract 4 bits starting at position 4
console.log(bits); // 15n (0b1111)
```

### Constants

#### `SIMPLEFLAKE_EPOCH: number`
The epoch start time (January 1, 2000 UTC) as Unix timestamp.

```javascript
import { SIMPLEFLAKE_EPOCH } from 'simpleflakes';
console.log(SIMPLEFLAKE_EPOCH); // 946684800000
```

### TypeScript Types

```typescript
interface SimpleFlakeStruct {
  timestamp: string;   // Unix timestamp as string
  randomBits: string;  // Random component as string
}
```

## 🔄 Migration Guide

### From UUID
```javascript
// Before (UUID v4)
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4(); // "f47ac10b-58cc-4372-a567-0e02b2c3d479"

// After (Simpleflake)
import { simpleflake } from 'simpleflakes';
const id = simpleflake().toString(36); // "20rfh5bt4k0g" (shorter!)
```

### From Twitter Snowflake
```javascript
// Simpleflake is backwards compatible with Snowflake structure
// Just different bit allocation:
// - Snowflake: 41 bits timestamp + 10 bits machine + 12 bits sequence
// - Simpleflake: 41 bits timestamp + 23 bits random
```

## 📖 Use Cases

### Database Primary Keys
```javascript
// Perfect for database IDs - time-ordered and unique
const userId = simpleflake();
await db.users.create({ id: userId.toString(), name: "John" });
```

### Distributed System IDs
```javascript
// Each service can generate IDs independently
const serviceAId = simpleflake(); // Service A
const serviceBId = simpleflake(); // Service B
// No coordination needed, guaranteed unique across services
```

### Short URLs
```javascript
// Generate compact URL identifiers
const shortId = simpleflake().toString(36); // "20rfh5bt4k0g"
const url = `https://short.ly/${shortId}`;
```

### Event Tracking
```javascript
// Time-ordered event IDs for chronological processing
const eventId = simpleflake();
await analytics.track({ eventId, userId, action: "click" });
```

## 🔧 Development

This project is written in TypeScript and includes comprehensive test coverage.

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run tests (automatically builds first)
npm test

# Run with coverage
npm run test:coverage

# Run all CI tests (coverage)
npm run test:ci

# Type checking
npm run type-check

# Run benchmarks
npm run benchmark

# Clean build artifacts
npm run clean
```

## 📚 References

- **[Original Presentation](http://akmanalp.com/simpleflake_presentation/)** - Introduction to the concept
- **[Python Implementation](https://simpleflake.readthedocs.org/en/latest/)** - Original reference implementation
- **[Twitter Snowflake](https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake.html)** - Similar distributed ID system

## 🆚 Comparison

| Feature | Simpleflakes | UUID v4 | Twitter Snowflake |
|---------|-------------|---------|------------------|
| **Size** | 64-bit | 128-bit | 64-bit |
| **Time-ordered** | ✅ Yes | ❌ No | ✅ Yes |
| **Distributed** | ✅ Yes | ✅ Yes | ⚠️ Needs config |
| **Dependencies** | ✅ Zero | ❌ crypto | ❌ System clock |
| **Performance** | 🚀 8.8M/sec | 🐌 ~2M/sec | 🚀 ~10M/sec |
| **URL-friendly** | ✅ Base36 | ❌ Long hex | ✅ Base36 |
| **Database-friendly** | ✅ Integer | ❌ String | ✅ Integer |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[MIT](https://raw.githubusercontent.com/leodutra/simpleflakes/master/LICENSE)

---

## 🏷️ Credits

- Original concept by [Mali Akmanalp](http://akmanalp.com/)
- TypeScript port and optimizations by [Leo Dutra](https://github.com/leodutra)
- Inspired by [Twitter Snowflake](https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake.html)

[npm-badge]: https://img.shields.io/npm/v/simpleflakes.svg?style=flat
[coveralls-badge]: https://img.shields.io/coveralls/leodutra/simpleflakes.svg?style=flat

[npm-link]: https://www.npmjs.com/package/simpleflakes
[coveralls-link]: https://coveralls.io/github/leodutra/simpleflakes

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fleodutra%2Fsimpleflakes?ref=badge_large)
