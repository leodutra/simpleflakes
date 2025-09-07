const test = require("tape");
const lib = require("../dist/simpleflakes");
const { TEST_TIMESTAMP, TEST_RANDOM_BITS, MAX_23BIT } = require("./test-constants");

test("parseSimpleflake() - basic parsing", (t) => {
  const flake = lib.simpleflake(TEST_TIMESTAMP, TEST_RANDOM_BITS);
  const parsed = lib.parseSimpleflake(flake);

  t.ok(parsed instanceof lib.SimpleFlakeStruct, "returns SimpleFlakeStruct");
  t.equal(parsed.timestamp, TEST_TIMESTAMP.toString(), "correct timestamp");
  t.equal(parsed.randomBits, TEST_RANDOM_BITS.toString(), "correct random bits");

  t.end();
});

test("parseSimpleflake() - round-trip", (t) => {
  const timestamp = Date.now();
  const randomBits = 12345;
  const generated = lib.simpleflake(timestamp, randomBits, lib.SIMPLEFLAKE_EPOCH);
  const roundTrip = lib.parseSimpleflake(generated);

  t.equal(roundTrip.timestamp, timestamp.toString(), "timestamp survives round-trip");
  t.equal(roundTrip.randomBits, randomBits.toString(), "randomBits survives round-trip");

  t.end();
});

test("parseSimpleflake() - input types", (t) => {
  const testFlake = "4242436206093260245";
  t.doesNotThrow(() => lib.parseSimpleflake(testFlake), "handles string input");
  t.doesNotThrow(() => lib.parseSimpleflake(BigInt(testFlake)), "handles BigInt input");

  t.end();
});

test("parseSimpleflake() - edge cases", (t) => {
  // Zero random bits
  const flakeZero = lib.simpleflake(lib.SIMPLEFLAKE_EPOCH, 0, lib.SIMPLEFLAKE_EPOCH);
  const parsedZero = lib.parseSimpleflake(flakeZero);
  t.equal(parsedZero.randomBits, "0", "parses zero random bits");

  // Maximum random bits
  const flakeMax = lib.simpleflake(Date.now(), MAX_23BIT);
  const parsedMax = lib.parseSimpleflake(flakeMax);
  t.equal(parsedMax.randomBits, MAX_23BIT.toString(), "parses max random bits");

  t.end();
});
