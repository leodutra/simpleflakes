const SIMPLEFLAKE_EPOCH = 946684800000n; // Date.UTC(2000, 0, 1) == epoch ms, since 1 Jan 2000 00:00
const UNSIGNED_23BIT_MAX = 8388607; // (Math.pow(2, 23) - 1) >> 0
const RANDOM_BUFFER_SIZE = 1024;

const SIMPLEFLAKE_TIMESTAMP_LENGTH = 41n;
const SIMPLEFLAKE_RANDOM_LENGTH = 23n;

const SIMPLEFLAKE_RANDOM_SHIFT = 0n;
const SIMPLEFLAKE_TIMESTAMP_SHIFT = 23n;

const CACHE_64_BIT_ZEROS =
  "0000000000000000000000000000000000000000000000000000000000000000";

interface RandomSource {
  getRandomValues<T extends ArrayBufferView>(array: T): T;
}

declare const require: ((moduleName: string) => unknown) | undefined;

let randomBuffer = new Uint32Array(RANDOM_BUFFER_SIZE);
let randomBufferIndex = RANDOM_BUFFER_SIZE;

function toBigInt(value: bigint | number | string): bigint {
  return typeof value === "bigint" ? value : BigInt(value);
}

function getRandomSource(): RandomSource {
  const globalCrypto = (globalThis as typeof globalThis & {
    crypto?: RandomSource;
  }).crypto;

  if (globalCrypto) return globalCrypto;

  try {
    return (require as (moduleName: string) => { webcrypto: RandomSource })(
      ["node", "crypto"].join(":")
    ).webcrypto;
  } catch {
    throw new Error(
      "Cryptographically secure random values are unavailable in this environment."
    );
  }
}

function refillRandomBuffer(): void {
  getRandomSource().getRandomValues(randomBuffer);
  randomBufferIndex = 0;
}

function random23(): bigint {
  if (randomBufferIndex >= RANDOM_BUFFER_SIZE) {
    refillRandomBuffer();
  }
  const value = randomBuffer[randomBufferIndex]!;

  randomBufferIndex += 1;
  return BigInt(value & UNSIGNED_23BIT_MAX);
}

/**
 * Generates a simpleflake ID
 * @param ts - Timestamp in milliseconds (defaults to current time)
 * @param randomBits - Random bits for the ID (defaults to a cryptographically secure random value)
 * @param epoch - Epoch timestamp in milliseconds (defaults to SIMPLEFLAKE_EPOCH)
 * @returns Generated simpleflake as a BigInt
 */
export function simpleflake(
  ts: number | bigint = Date.now(),
  randomBits?: number | bigint,
  epoch: number | bigint = SIMPLEFLAKE_EPOCH
): bigint {
  // Use bitwise OR instead of addition since bit ranges don't overlap

  return (
    ((toBigInt(ts) - toBigInt(epoch)) << SIMPLEFLAKE_TIMESTAMP_SHIFT) |
    (randomBits == null ? random23() : toBigInt(randomBits))
  );
}

/**
 * Converts a value to binary representation
 * @param value - The value to convert to binary
 * @param padding - Whether to pad to 64 bits (defaults to true)
 * @returns Binary string representation
 */
export function binary(
  value: bigint | number | string,
  padding: boolean = true
): string {
  const binValue = toBigInt(value).toString(2);
  return padding && binValue.length < 64
    ? CACHE_64_BIT_ZEROS.substr(0, 64 - binValue.length) + binValue
    : binValue;
}

/**
 * Extracts bits from a data value
 * @param data - The data to extract bits from
 * @param shift - Number of bits to shift
 * @param length - Number of bits to extract
 * @returns Extracted bits as a BigInt
 */
export function extractBits(
  data: bigint | number | string,
  shift: bigint | number,
  length: bigint | number
): bigint {
  const shiftN = toBigInt(shift);
  const lengthN = toBigInt(length);
  // Optimize: shift right first, then mask (avoids creating large bitmask)
  return (toBigInt(data) >> shiftN) & ((1n << lengthN) - 1n);
}

/**
 * Structure representing a parsed simpleflake
 */
export class SimpleflakeStruct {
  public declare readonly timestamp: bigint;
  public declare readonly randomBits: bigint;

  constructor(timestamp: bigint, randomBits: bigint) {
    if (timestamp == null || randomBits == null) {
      throw new Error("Missing argument for SimpleflakeStruct.");
    }
    this.timestamp = timestamp;
    this.randomBits = randomBits;
  }
}

/**
 * Parses a simpleflake into its components
 * @param flake - The simpleflake to parse
 * @returns SimpleflakeStruct containing timestamp and random bits
 */
export function parseSimpleflake(
  flake: bigint | number | string
): SimpleflakeStruct {
  return new SimpleflakeStruct(
    // timestamp
    extractBits(
      flake,
      SIMPLEFLAKE_TIMESTAMP_SHIFT,
      SIMPLEFLAKE_TIMESTAMP_LENGTH
    ) + SIMPLEFLAKE_EPOCH,
    // random bits
    extractBits(flake, SIMPLEFLAKE_RANDOM_SHIFT, SIMPLEFLAKE_RANDOM_LENGTH)
  );
}

// Export constants
export { SIMPLEFLAKE_EPOCH };

// Default export for CommonJS compatibility
export default {
  binary,
  extractBits,
  parseSimpleflake,
  SIMPLEFLAKE_EPOCH,
  simpleflake,
  SimpleflakeStruct,
};
