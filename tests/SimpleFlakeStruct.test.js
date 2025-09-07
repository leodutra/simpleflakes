const test = require("tape");
const lib = require("../dist/simpleflakes");
const { MAX_23BIT } = require("./test-constants");

test("SimpleFlakeStruct - construction and properties", (t) => {
  const struct = new lib.SimpleFlakeStruct("123", "456");

  t.ok(struct instanceof lib.SimpleFlakeStruct, "creates instance");
  t.equal(struct.timestamp, "123", "timestamp property");
  t.equal(struct.randomBits, "456", "randomBits property");

  // Properties are mutable
  struct.timestamp = "modified";
  t.equal(struct.timestamp, "modified", "properties are mutable");

  t.end();
});

test("SimpleFlakeStruct - property descriptors", (t) => {
  const struct = new lib.SimpleFlakeStruct("123", "456");
  const desc = Object.getOwnPropertyDescriptor(struct, 'timestamp');

  t.ok(desc.writable, "properties are writable");
  t.ok(desc.enumerable, "properties are enumerable");

  t.end();
});

test("SimpleFlakeStruct - error handling", (t) => {
  // Missing arguments
  t.throws(() => new lib.SimpleFlakeStruct(), "throws when no arguments");
  t.throws(() => new lib.SimpleFlakeStruct("1"), "throws when missing randomBits");

  // Null/undefined arguments
  t.throws(() => new lib.SimpleFlakeStruct(null, "1"), "throws when timestamp is null");
  t.throws(() => new lib.SimpleFlakeStruct("1", null), "throws when randomBits is null");
  t.throws(() => new lib.SimpleFlakeStruct(null, null), "throws when both are null");
  t.throws(() => new lib.SimpleFlakeStruct(undefined, undefined), "throws when both are undefined");

  t.end();
});

test("SimpleFlakeStruct - edge cases", (t) => {
  // Zero values
  const structZero = new lib.SimpleFlakeStruct("0", "0");
  t.equal(structZero.timestamp, "0", "accepts zero timestamp");
  t.equal(structZero.randomBits, "0", "accepts zero randomBits");

  // Large values
  const structLarge = new lib.SimpleFlakeStruct("999999999999999", MAX_23BIT.toString());
  t.equal(structLarge.timestamp, "999999999999999", "accepts large timestamp");
  t.equal(structLarge.randomBits, MAX_23BIT.toString(), "accepts max 23-bit random");

  t.end();
});
