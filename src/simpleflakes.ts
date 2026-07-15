export const SIMPLEFLAKE_EPOCH = 946684800000n; // Date.UTC(2000, 0, 1)
const UNSIGNED_23BIT_MAX = 8388607;
const RANDOM_BUFFER_SIZE = 1024;

const SIMPLEFLAKE_TIMESTAMP_LENGTH = 41n;
const SIMPLEFLAKE_RANDOM_LENGTH = 23n;
const SIMPLEFLAKE_TIMESTAMP_MAX = (1n << SIMPLEFLAKE_TIMESTAMP_LENGTH) - 1n;
const SIMPLEFLAKE_RANDOM_MAX = (1n << SIMPLEFLAKE_RANDOM_LENGTH) - 1n;
const UNSIGNED_64BIT_MAX = (1n << 64n) - 1n;

const SIMPLEFLAKE_RANDOM_SHIFT = 0n;
const SIMPLEFLAKE_TIMESTAMP_SHIFT = 23n;

interface RandomSource {
  getRandomValues<T extends ArrayBufferView>(array: T): T;
}

type NodeCryptoRequire = (moduleName: string) => { webcrypto: RandomSource };

declare const require: ((moduleName: string) => unknown) | undefined;

const randomBuffer = new Uint32Array(RANDOM_BUFFER_SIZE);
let randomBufferIndex = RANDOM_BUFFER_SIZE;

function toBigInt(value: bigint | number | string, label: string): bigint {
  try {
    return typeof value === "bigint" ? value : BigInt(value);
  } catch {
    throw new TypeError(`${label} must be an integer representable as a BigInt.`);
  }
}

function assertInRange(
  value: bigint,
  minValue: bigint,
  maxValue: bigint,
  label: string
): void {
  if (value < minValue || value > maxValue) {
    throw new RangeError(
      `${label} must be between ${minValue} and ${maxValue}.`
    );
  }
}

function getRandomSource(): RandomSource {
  const globalCrypto = (globalThis as { crypto?: RandomSource }).crypto;

  if (globalCrypto) return globalCrypto;

  try {
    return (require as NodeCryptoRequire)("node:crypto").webcrypto;
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
 * @param timestamp - Timestamp in milliseconds (defaults to current time)
 * @param randomBits - Random bits for the ID (defaults to a cryptographically secure random value)
 * @param epoch - Epoch timestamp in milliseconds (defaults to SIMPLEFLAKE_EPOCH)
 * @returns Generated simpleflake as a BigInt
 */
export function simpleflake(
  timestamp: number | bigint = Date.now(),
  randomBits?: number | bigint,
  epoch: number | bigint = SIMPLEFLAKE_EPOCH
): bigint {
  const timestampValue = toBigInt(timestamp, "timestamp");
  const epochValue = toBigInt(epoch, "epoch");
  const timestampOffset = timestampValue - epochValue;
  const resolvedRandomBits =
    randomBits == null ? random23() : toBigInt(randomBits, "randomBits");

  assertInRange(timestampOffset, 0n, SIMPLEFLAKE_TIMESTAMP_MAX, "timestamp - epoch");
  assertInRange(resolvedRandomBits, 0n, SIMPLEFLAKE_RANDOM_MAX, "randomBits");

  return (
    (timestampOffset << SIMPLEFLAKE_TIMESTAMP_SHIFT) |
    resolvedRandomBits
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
  const binValue = BigInt.asUintN(64, toBigInt(value, "value")).toString(2);
  return padding ? binValue.padStart(64, "0") : binValue;
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
  const shiftN = toBigInt(shift, "shift");
  const lengthN = toBigInt(length, "length");
  assertInRange(shiftN, 0n, 63n, "shift");
  assertInRange(lengthN, 0n, 63n, "length");
  // Optimize: shift right first, then mask (avoids creating large bitmask)
  return (toBigInt(data, "data") >> shiftN) & ((1n << lengthN) - 1n);
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
 * @param epoch - Epoch timestamp in milliseconds used to reconstruct the absolute timestamp
 * @returns SimpleflakeStruct containing timestamp and random bits
 */
export function parseSimpleflake(
  flake: bigint | number | string,
  epoch: bigint | number = SIMPLEFLAKE_EPOCH
): SimpleflakeStruct {
  const flakeValue = toBigInt(flake, "flake");
  const epochValue = toBigInt(epoch, "epoch");

  assertInRange(flakeValue, 0n, UNSIGNED_64BIT_MAX, "flake");

  return new SimpleflakeStruct(
    extractBits(
      flakeValue,
      SIMPLEFLAKE_TIMESTAMP_SHIFT,
      SIMPLEFLAKE_TIMESTAMP_LENGTH
    ) + epochValue,
    extractBits(
      flakeValue,
      SIMPLEFLAKE_RANDOM_SHIFT,
      SIMPLEFLAKE_RANDOM_LENGTH
    )
  );
}

export default {
  binary,
  extractBits,
  parseSimpleflake,
  SIMPLEFLAKE_EPOCH,
  simpleflake,
  SimpleflakeStruct,
};
