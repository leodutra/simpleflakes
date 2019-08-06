

const test = require('tape');
const BigNum = require('bn.js');
const lib = require('../lib/simpleflakes-legacy');

const SIMPLEFLAKE = '4242436206093260245';
const SIMPLEFLAKE_EPOCH = 946702800000;
const SIMPLEFLAKE_TIMESTAMP = 1452440606092;
const SIMPLEFLAKE_RANDOMBITS = 7460309;

const SIMPLEFLAKE_2 = '11101011100000001010010100000010000110011100011101010111010101';
const SIMPLEFLAKE_16 = '3ae029408671d5d5';
const SIMPLEFLAKE_36 = 'w8cq4fjf37x1';

test('testing dependency bn.js', (t) => {
  const bignum = new BigNum(SIMPLEFLAKE);
  t.equal(bignum.toString(), SIMPLEFLAKE, 'bit number lib retrieves the right stored value?');
  t.equal(bignum.toString(), bignum.toString(10), '<big number>.toString() aliases .toString(10)?');
  t.equal(bignum.toString(2), SIMPLEFLAKE_2, 'big number as base 2?');
  t.equal(bignum.toString(16), SIMPLEFLAKE_16, 'big number as base 16?');
  t.equal(bignum.toString(36), SIMPLEFLAKE_36, 'big number as base 36?');
  t.end();
});

test('testing legacy simpleflake()', (t) => {
  t.assert(lib.simpleflake() instanceof BigNum, 'returning correct instance of big number lib?');
  t.equal(lib.simpleflake(SIMPLEFLAKE_TIMESTAMP, SIMPLEFLAKE_RANDOMBITS, SIMPLEFLAKE_EPOCH).toString(), '4242436206093260245', 'right timestamp, random bits and epoch parameterization?');
  t.end();
});

test('testing legacy binary()', (t) => {
  t.equal(lib.binary('83928382810918298'), '0000000100101010001011000110101101100100000001001000110110011010', 'valid simpleflake.binary(\'83928382810918298\') result?');
  t.equal(lib.binary('83928382810918298', false), '100101010001011000110101101100100000001001000110110011010', 'valid simpleflake.binary(\'83928382810918298\', false) result?');
  t.equal(lib.binary(7), '0000000000000000000000000000000000000000000000000000000000000111', 'valid simpleflake.binary(7) result?');
  t.equal(lib.binary(7, false), '111', 'valid simpleflake.binary(7, false) result?');
  t.equal(lib.binary(64), '0000000000000000000000000000000000000000000000000000000001000000', 'valid simpleflake.binary(64) result?');
  t.equal(lib.binary(64, false), '1000000', 'valid simpleflake.binary(64, false) result?');
  t.end();
});

test('testing legacy extractBits()', (t) => {
  t.assert(lib.extractBits(7, 0, 1) instanceof BigNum, 'returns big number object');
  t.equal(lib.extractBits(7, 0, 1).toString(), '1', 'extractBits(7, 0, 1)');
  t.equal(lib.extractBits(7, 0, 2).toString(), '3', 'extractBits(7, 0, 2)');
  t.equal(lib.extractBits(7, 0, 3).toString(), '7', 'extractBits(7, 0, 3)');
  t.equal(lib.extractBits(7, 1, 2).toString(), '3', 'extractBits(7, 1, 2)');
  t.equal(lib.extractBits(7, 2, 1).toString(), '1', 'extractBits(7, 2, 1)');
  t.equal(lib.extractBits(7, 2, 2).toString(), '1', 'extractBits(7, 2, 2)');
  t.end();
});

test('testing legacy SimpleFlakeStruct()', (t) => {
  t.assert(lib.SimpleFlakeStruct(SIMPLEFLAKE_TIMESTAMP.toString(), SIMPLEFLAKE_RANDOMBITS.toString()) instanceof lib.SimpleFlakeStruct, 'returning new SimpleFlakeStruct() when calling SimpleFlakeStruct()?');
  t.throws(() => {
    let undef;
    lib.SimpleFlakeStruct(undef, '1');
  }, 'throw typeError when timestamp arg is missing');

  t.throws(() => {
    lib.SimpleFlakeStruct('1');
  }, 'throw typeError when randomBits argument is missing');

  t.throws(() => {
    lib.SimpleFlakeStruct();
  }, 'throw typeError when arguments are missing');

  t.end();
});

test('testing legacy parseSimpleflake()', (t) => {
  const flake = lib.simpleflake(SIMPLEFLAKE_TIMESTAMP, SIMPLEFLAKE_RANDOMBITS);
  t.equal(lib.parseSimpleflake(flake).timestamp, SIMPLEFLAKE_TIMESTAMP.toString(), 'correct timestamp parsing?');
  t.equal(lib.parseSimpleflake(flake).randomBits, SIMPLEFLAKE_RANDOMBITS.toString(), 'correct random bits parsing?');
  t.end();
});
