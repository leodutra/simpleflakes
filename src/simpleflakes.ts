const SIMPLEFLAKE_EPOCH = 946684800000; // Date.UTC(2000, 0, 1) == epoch ms, since 1 Jan 2000 00:00
const UNSIGNED_23BIT_MAX = 8388607; // (Math.pow(2, 23) - 1) >> 0

const SIMPLEFLAKE_TIMESTAMP_LENGTH = 41n;
const SIMPLEFLAKE_RANDOM_LENGTH = 23n;

const SIMPLEFLAKE_RANDOM_SHIFT = 0n;
const SIMPLEFLAKE_TIMESTAMP_SHIFT = 23n;

const CACHE_64_BIT_ZEROS = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Generates a simpleflake ID
 * @param ts - Timestamp in milliseconds (defaults to current time)
 * @param randomBits - Random bits for the ID (defaults to a random value)
 * @param epoch - Epoch timestamp in milliseconds (defaults to SIMPLEFLAKE_EPOCH)
 * @returns Generated simpleflake as a BigInt
 */
export function simpleflake(ts: number = Date.now(), randomBits?: number, epoch: number = SIMPLEFLAKE_EPOCH): bigint {
  return ((BigInt(ts) - BigInt(epoch)) << SIMPLEFLAKE_TIMESTAMP_SHIFT) +
    BigInt(randomBits ?? Math.round(Math.random() * UNSIGNED_23BIT_MAX));
}

/**
 * Converts a value to binary representation
 * @param value - The value to convert to binary
 * @param padding - Whether to pad to 64 bits (defaults to true)
 * @returns Binary string representation
 */
export function binary(value: bigint | number | string, padding: boolean = true): string {
  const binValue = BigInt(value).toString(2);
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
export function extractBits(data: bigint | number | string, shift: bigint | number, length: bigint | number): bigint {
  const shiftN = BigInt(shift);
  const bitmask = ((1n << BigInt(length)) - 1n) << shiftN;
  return (BigInt(data) & bitmask) >> shiftN;
}

/**
 * Structure representing a parsed simpleflake
 */
export class SimpleFlakeStruct {
  public readonly timestamp: string;
  public readonly randomBits: string;

  constructor(timestamp: string, randomBits: string) {
    if (timestamp == null || randomBits == null) {
      throw new Error('Missing argument for SimpleFlakeStruct.');
    }
    this.timestamp = timestamp;
    this.randomBits = randomBits;
  }
}

/**
 * Parses a simpleflake into its components
 * @param flake - The simpleflake to parse
 * @returns SimpleFlakeStruct containing timestamp and random bits
 */
export function parseSimpleflake(flake: bigint | number | string): SimpleFlakeStruct {
  return new SimpleFlakeStruct(
    // timestamp
    (extractBits(flake, SIMPLEFLAKE_TIMESTAMP_SHIFT, SIMPLEFLAKE_TIMESTAMP_LENGTH)
      + BigInt(SIMPLEFLAKE_EPOCH)).toString(10),
    // random bits
    extractBits(flake, SIMPLEFLAKE_RANDOM_SHIFT, SIMPLEFLAKE_RANDOM_LENGTH).toString(10)
  );
}

// Legacy function alias for backwards compatibility
export const simpleflakeStruct = SimpleFlakeStruct;

// Export constants
export { SIMPLEFLAKE_EPOCH };

// Default export for CommonJS compatibility
export default {
  // Enhancements
  SimpleFlakeStruct: SimpleFlakeStruct,

  // original API
  simpleflakeStruct: SimpleFlakeStruct,
  extractBits: extractBits,
  parseSimpleflake: parseSimpleflake,
  binary: binary,
  SIMPLEFLAKE_EPOCH: SIMPLEFLAKE_EPOCH,
  simpleflake: simpleflake
};
