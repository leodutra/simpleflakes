const test = require("tape");
const lib = require("../dist/simpleflakes");
const { MAX_23BIT } = require("./test-constants");

test("SimpleflakeStruct - construction and properties", (t) => {
  const struct = new lib.SimpleflakeStruct(123n, 456n);

  t.ok(struct instanceof lib.SimpleflakeStruct, "creates instance");
  t.equal(struct.timestamp, 123n, "timestamp property");
  t.equal(struct.randomBits, 456n, "randomBits property");

  // Properties can be assigned (they're writable despite being declared readonly)
  struct.timestamp = 999n;
  struct.randomBits = 888n;
  t.equal(struct.timestamp, 999n, "timestamp can be modified");
  t.equal(struct.randomBits, 888n, "randomBits can be modified");

  t.end();
});

test("SimpleflakeStruct - property descriptors", (t) => {
  const struct = new lib.SimpleflakeStruct(123n, 456n);
  const timestampDesc = Object.getOwnPropertyDescriptor(struct, 'timestamp');
  const randomBitsDesc = Object.getOwnPropertyDescriptor(struct, 'randomBits');

  t.ok(timestampDesc.writable, "timestamp is writable");
  t.ok(timestampDesc.enumerable, "timestamp is enumerable");
  t.ok(randomBitsDesc.writable, "randomBits is writable");
  t.ok(randomBitsDesc.enumerable, "randomBits is enumerable");

  t.end();
});

test("SimpleflakeStruct - error handling", (t) => {
  // Missing arguments
  t.throws(() => new lib.SimpleflakeStruct(), "throws when no arguments");
  t.throws(() => new lib.SimpleflakeStruct(1n), "throws when missing randomBits");

  // Null/undefined arguments
  t.throws(() => new lib.SimpleflakeStruct(null, 1n), "throws when timestamp is null");
  t.throws(() => new lib.SimpleflakeStruct(1n, null), "throws when randomBits is null");
  t.throws(() => new lib.SimpleflakeStruct(null, null), "throws when both are null");
  t.throws(() => new lib.SimpleflakeStruct(undefined, undefined), "throws when both are undefined");

  t.end();
});

test("SimpleflakeStruct - edge cases", (t) => {
  // Zero values
  const structZero = new lib.SimpleflakeStruct(0n, 0n);
  t.equal(structZero.timestamp, 0n, "accepts zero timestamp");
  t.equal(structZero.randomBits, 0n, "accepts zero randomBits");

  // Large values
  const structLarge = new lib.SimpleflakeStruct(999999999999999n, MAX_23BIT);
  t.equal(structLarge.timestamp, 999999999999999n, "accepts large timestamp");
  t.equal(structLarge.randomBits, MAX_23BIT, "accepts max 23-bit random");

  t.end();
});
