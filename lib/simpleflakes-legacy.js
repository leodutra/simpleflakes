const BigNum = require('bn.js');

const SIMPLEFLAKE_EPOCH = 946684800000; // Date.UTC(2000, 0, 1) == epoch ms, since 1 Jan 2000 00:00
const SIMPLEFLAKE_EPOCH_BIGNUM = new BigNum(SIMPLEFLAKE_EPOCH, 10);
const UNSIGNED_23BIT_MAX = 8388607; // (Math.pow(2, 23) - 1) >> 0

const SIMPLEFLAKE_TIMESTAMP_LENGTH = 41;
const SIMPLEFLAKE_RANDOM_LENGTH = 23;

const SIMPLEFLAKE_RANDOM_SHIFT = 0;
const SIMPLEFLAKE_TIMESTAMP_SHIFT = 23;

const CACHE_64_BIT_ZEROS = '0000000000000000000000000000000000000000000000000000000000000000';
const CACHE_64_BIT_ONES = '1111111111111111111111111111111111111111111111111111111111111111';

// cache
const dateNow = Date.now || function now() { return new Date().getTime(); };

function simpleflake(ts, randomBits, epoch) {
  return new BigNum((ts || dateNow()) - (epoch == null ? SIMPLEFLAKE_EPOCH : epoch), 10)
    .shln(23).add(new BigNum(randomBits || Math.round(Math.random() * UNSIGNED_23BIT_MAX), 10));
}

function binary(value, padding) {
  const bignum = new BigNum(value, 10).toString(2);
  return padding !== false && bignum.length < 64
    ? CACHE_64_BIT_ZEROS.substr(0, 64 - bignum.length) + bignum
    : bignum;
}

function extractBits(data, shift, length) {
  // return new BigNum(CACHE_64_BIT_ONES.substr(0, length), 2)
  //   .shln(shift).and(new BigNum(data, 10)).shrn(shift);
  return (new BigNum(data, 10)).shrn(shift).and(new BigNum(CACHE_64_BIT_ONES.substr(0, length), 2));
}

function SimpleFlakeStruct(timestamp, randomBits) {
  if (this instanceof SimpleFlakeStruct) {
    if (timestamp == null || randomBits == null) {
      throw new Error('Missing argument for SimpleFlakeStruct.');
    }
    this.timestamp = timestamp;
    this.randomBits = randomBits;
  } else {
    return new SimpleFlakeStruct(timestamp, randomBits);
  }
}

function parseSimpleflake(flake) {
  return new SimpleFlakeStruct(
    // timestamp
    extractBits(flake, SIMPLEFLAKE_TIMESTAMP_SHIFT, SIMPLEFLAKE_TIMESTAMP_LENGTH)
      .add(SIMPLEFLAKE_EPOCH_BIGNUM).toString(10),
    // random bits
    extractBits(flake, SIMPLEFLAKE_RANDOM_SHIFT, SIMPLEFLAKE_RANDOM_LENGTH).toString(10)
  );
}

module.exports = {
  // Enhancements
  SimpleFlakeStruct,

  // original API
  simpleflakeStruct: SimpleFlakeStruct,
  extractBits,
  parseSimpleflake,
  binary,
  SIMPLEFLAKE_EPOCH,
  simpleflake
};
