const test = require("tape");
const lib = require("../dist/simpleflakes");
const { TEST_TIMESTAMP, TEST_RANDOM_BITS, MAX_23BIT } = require("./test-constants");

test("parseSimpleflake() - basic parsing", (t) => {
  const flake = lib.simpleflake(TEST_TIMESTAMP, TEST_RANDOM_BITS);
  const parsed = lib.parseSimpleflake(flake);

  t.ok(parsed instanceof lib.SimpleflakeStruct, "returns SimpleflakeStruct");
  t.equal(parsed.timestamp, BigInt(TEST_TIMESTAMP), "correct timestamp");
  t.equal(parsed.randomBits, BigInt(TEST_RANDOM_BITS), "correct random bits");

  t.end();
});

test("parseSimpleflake() - round-trip", (t) => {
  const timestamp = Date.now();
  const randomBits = 12345;
  const generated = lib.simpleflake(timestamp, randomBits, lib.SIMPLEFLAKE_EPOCH);
  const roundTrip = lib.parseSimpleflake(generated);

  t.equal(roundTrip.timestamp, BigInt(timestamp), "timestamp survives round-trip");
  t.equal(roundTrip.randomBits, BigInt(randomBits), "randomBits survives round-trip");

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
  t.equal(parsedZero.randomBits, 0n, "parses zero random bits");

  // Maximum random bits
  const flakeMax = lib.simpleflake(Date.now(), MAX_23BIT);
  const parsedMax = lib.parseSimpleflake(flakeMax);
  t.equal(parsedMax.randomBits, BigInt(MAX_23BIT), "parses max random bits");

  t.end();
});
