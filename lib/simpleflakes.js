const SIMPLEFLAKE_EPOCH = 946684800000; // Date.UTC(2000, 0, 1) == epoch ms, since 1 Jan 2000 00:00
const UNSIGNED_23BIT_MAX = 8388607; // (Math.pow(2, 23) - 1) >> 0

const SIMPLEFLAKE_TIMESTAMP_LENGTH = 41n;
const SIMPLEFLAKE_RANDOM_LENGTH = 23n;

const SIMPLEFLAKE_RANDOM_SHIFT = 0n;
const SIMPLEFLAKE_TIMESTAMP_SHIFT = 23n;

const CACHE_64_BIT_ZEROS = '0000000000000000000000000000000000000000000000000000000000000000';

function simpleflake(ts = Date.now(), randomBits, epoch = SIMPLEFLAKE_EPOCH) {
  return ((BigInt(ts) - BigInt(epoch)) << SIMPLEFLAKE_TIMESTAMP_SHIFT) +
    BigInt(randomBits || Math.round(Math.random() * UNSIGNED_23BIT_MAX));
}

function binary(value, padding = true) {
  const binValue = BigInt(value).toString(2);
  return padding && binValue.length < 64
    ? CACHE_64_BIT_ZEROS.substr(0, 64 - binValue.length) + binValue
    : binValue;
}

function extractBits(data, shift, length) {
  const shiftN = BigInt(shift);
  const bitmask = ((1n << BigInt(length)) - 1n) << shiftN;
  return (BigInt(data) & bitmask) >> shiftN;
}

function parseSimpleflake(flake) {
  return new SimpleFlakeStruct(
    // timestamp
    (extractBits(flake, SIMPLEFLAKE_TIMESTAMP_SHIFT, SIMPLEFLAKE_TIMESTAMP_LENGTH)
      + BigInt(SIMPLEFLAKE_EPOCH)).toString(10),
    // random bits
    extractBits(flake, SIMPLEFLAKE_RANDOM_SHIFT, SIMPLEFLAKE_RANDOM_LENGTH).toString(10)
  );
}

function SimpleFlakeStruct(timestamp, randomBits) {
  if (this instanceof SimpleFlakeStruct) {
    if (timestamp == null || randomBits == null) {
      throw new Error('Missing argument for SimpleFlakeStruct.');
    }
    this.timestamp = timestamp;
    this.randomBits = randomBits;
  }
  else {
    return new SimpleFlakeStruct(timestamp, randomBits);
  }
}

module.exports = {
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
