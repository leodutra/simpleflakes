const test = require("tape");
const lib = require("../dist/simpleflakes");
const { EPOCH_2000, TEST_TIMESTAMP, TEST_RANDOM_BITS, MAX_23BIT } = require("./test-constants");

test("simpleflake() - return type and deterministic behavior", (t) => {
  t.equal(typeof lib.simpleflake(), "bigint", "returns BigInt");

  const result = lib.simpleflake(TEST_TIMESTAMP, TEST_RANDOM_BITS, EPOCH_2000);
  t.equal(result.toString(), '4242587201037260245', 'deterministic result');

  t.end();
});

test("simpleflake() - randomness", (t) => {
  const flake1 = lib.simpleflake();
  const flake2 = lib.simpleflake();
  t.notEqual(flake1, flake2, "generates different flakes");
  t.ok(flake1 > 0n, "generates positive values");
  t.end();
});

test("simpleflake() - timestamp ordering", (t) => {
  const now = Date.now();
  const earlier = lib.simpleflake(now, 0);
  const later = lib.simpleflake(now + 1, 0);
  t.ok(later > earlier, "later timestamp generates larger flake");
  t.end();
});

test("simpleflake() - random bits impact", (t) => {
  const now = Date.now();
  const flakeMin = lib.simpleflake(now, 0);
  const flakeMax = lib.simpleflake(now, MAX_23BIT);
  t.ok(flakeMax > flakeMin, "max random bits generates larger flake");

  // Deterministic behavior with same inputs
  const zero1 = lib.simpleflake(now, 0);
  const zero2 = lib.simpleflake(now, 0);
  t.equal(zero1, zero2, "deterministic with same inputs");
  t.end();
});

test("simpleflake() - nullish coalescing", (t) => {
  const now = Date.now();

  // null/undefined should generate random values
  const nullFlake1 = lib.simpleflake(now, null);
  const nullFlake2 = lib.simpleflake(now, null);
  t.notEqual(nullFlake1, nullFlake2, "null generates random");

  const undefFlake1 = lib.simpleflake(now, undefined);
  const undefFlake2 = lib.simpleflake(now, undefined);
  t.notEqual(undefFlake1, undefFlake2, "undefined generates random");

  // Falsy non-nullish values should be used as-is
  const zeroFlake = lib.simpleflake(now, 0);
  t.equal(lib.simpleflake(now, false), zeroFlake, "false coerces to 0");
  t.equal(lib.simpleflake(now, ""), zeroFlake, "empty string coerces to 0");

  t.end();
});

test("simpleflake() - error handling", (t) => {
  t.throws(() => lib.simpleflake(Date.now(), NaN), "NaN throws error");
  t.end();
});

test("simpleflake() - edge cases", (t) => {
  t.doesNotThrow(() => lib.simpleflake(0, 0, 0), "handles zero timestamp");
  t.doesNotThrow(() => lib.simpleflake(Date.now(), 0, -1000), "handles negative epoch");

  const customEpoch = Date.UTC(2020, 0, 1);
  t.doesNotThrow(() => lib.simpleflake(Date.now(), 100, customEpoch), "handles custom epoch");
  t.end();
});
