// eslint-disable-next-line global-require
const test = require("tape");
// eslint-disable-next-line global-require
const lib = require("../dist/simpleflakes");

// Test constants
const SIMPLEFLAKE_EPOCH = 946684800000;
const SIMPLEFLAKE_TIMESTAMP = 1452440606092;
const SIMPLEFLAKE_RANDOMBITS = 7460309;
const UNSIGNED_23BIT_MAX = 8388607; // (Math.pow(2, 23) - 1)
const YEAR_2000_EPOCH = 946684800000; // Date.UTC(2000, 0, 1)

// =============================================================================
// CONSTANTS AND API TESTS
// =============================================================================

test("Constants: SIMPLEFLAKE_EPOCH validation", (t) => {
  t.equal(lib.SIMPLEFLAKE_EPOCH, YEAR_2000_EPOCH, "SIMPLEFLAKE_EPOCH should be year 2000 epoch");
  t.equal(typeof lib.SIMPLEFLAKE_EPOCH, "number", "SIMPLEFLAKE_EPOCH should be a number");
  t.end();
});

test("API: module exports", (t) => {
  // Check all expected exports exist
  t.equal(typeof lib.simpleflake, "function", "simpleflake function exported");
  t.equal(typeof lib.binary, "function", "binary function exported");
  t.equal(typeof lib.extractBits, "function", "extractBits function exported");
  t.equal(typeof lib.parseSimpleflake, "function", "parseSimpleflake function exported");
  t.equal(typeof lib.SimpleFlakeStruct, "function", "SimpleFlakeStruct constructor exported");
  t.equal(typeof lib.simpleflakeStruct, "function", "simpleflakeStruct alias exported");
  t.equal(typeof lib.SIMPLEFLAKE_EPOCH, "number", "SIMPLEFLAKE_EPOCH constant exported");

  // Verify aliases work the same
  t.equal(lib.SimpleFlakeStruct, lib.simpleflakeStruct, "simpleflakeStruct is alias for SimpleFlakeStruct");

  t.end();
});

// =============================================================================
// SIMPLEFLAKE FUNCTION TESTS
// =============================================================================

test("simpleflake(): basic functionality", (t) => {
  // eslint-disable-next-line valid-typeof
  t.assert(typeof lib.simpleflake() === "bigint", "returns BigInt");

  // Known value test
  const result = lib.simpleflake(1452440606092, 7460309, SIMPLEFLAKE_EPOCH);
  t.equal(result.toString(), '4242587201037260245', 'should generate the expected flake for given parameters');

  t.end();
});

test("simpleflake(): default parameters", (t) => {
  const flake1 = lib.simpleflake();
  const flake2 = lib.simpleflake();
  t.assert(flake1 !== flake2, "generates different flakes");
  t.assert(flake1 > 0n, "generates positive values");
  t.assert(flake2 > 0n, "generates positive values");
  t.end();
});

test("simpleflake(): time ordering", (t) => {
  const now = Date.now();
  const earlier = lib.simpleflake(now, 0);
  const later = lib.simpleflake(now + 1, 0);
  t.assert(later > earlier, "later timestamp generates larger flake");
  t.end();
});

test("simpleflake(): random bits validation", (t) => {
  const now = Date.now();
  const flakeMin = lib.simpleflake(now, 0);
  const flakeMax = lib.simpleflake(now, UNSIGNED_23BIT_MAX);
  t.assert(flakeMax > flakeMin, "max random bits generates larger flake than min");

  // Test that zero random bits actually produces zero (not random)
  const flakeZeroRandom1 = lib.simpleflake(now, 0);
  const flakeZeroRandom2 = lib.simpleflake(now, 0);
  t.equal(flakeZeroRandom1, flakeZeroRandom2, "zero random bits produces deterministic result");

  t.end();
});

test("simpleflake(): nullish coalescing behavior", (t) => {
  const now = Date.now();

  // Test that 0 is treated as a valid value (not replaced with random)
  const flakeWithZero1 = lib.simpleflake(now, 0);
  const flakeWithZero2 = lib.simpleflake(now, 0);
  t.equal(flakeWithZero1, flakeWithZero2, "zero random bits produces consistent result");

  // Test that null generates random (different results)
  const flakeWithNull1 = lib.simpleflake(now, null);
  const flakeWithNull2 = lib.simpleflake(now, null);
  t.notEqual(flakeWithNull1, flakeWithNull2, "null random bits generates random values");

  // Test that undefined generates random (different results)
  const flakeWithUndefined1 = lib.simpleflake(now, undefined);
  const flakeWithUndefined2 = lib.simpleflake(now, undefined);
  t.notEqual(flakeWithUndefined1, flakeWithUndefined2, "undefined random bits generates random values");

  // Test that false (falsy but not nullish) is treated as 0
  const flakeWithFalse1 = lib.simpleflake(now, false);
  const flakeWithFalse2 = lib.simpleflake(now, false);
  t.equal(flakeWithFalse1, flakeWithFalse2, "false random bits produces consistent result (converted to 0)");
  t.equal(flakeWithFalse1, flakeWithZero1, "false and 0 produce same result");

  // Test that empty string (falsy but not nullish) is treated as 0
  const flakeWithEmptyString1 = lib.simpleflake(now, "");
  const flakeWithEmptyString2 = lib.simpleflake(now, "");
  t.equal(flakeWithEmptyString1, flakeWithEmptyString2, "empty string random bits produces consistent result (converted to 0)");
  t.equal(flakeWithEmptyString1, flakeWithZero1, "empty string and 0 produce same result");

  t.end();
});

test("simpleflake(): edge cases", (t) => {
  // Zero timestamp
  const flakeZeroTime = lib.simpleflake(0, 0, 0);
  t.assert(typeof flakeZeroTime === "bigint", "handles zero timestamp");

  // Negative epoch
  const now = Date.now();
  const flakeNegativeEpoch = lib.simpleflake(now, 0, -1000);
  t.assert(typeof flakeNegativeEpoch === "bigint", "handles negative epoch");

  // Custom epoch
  const customEpoch = Date.UTC(2020, 0, 1);
  const flakeCustom = lib.simpleflake(now, 100, customEpoch);
  t.assert(typeof flakeCustom === "bigint", "handles custom epoch");

  t.end();
});

// =============================================================================
// BINARY FUNCTION TESTS
// =============================================================================

test("binary(): known values", (t) => {
  t.equal(
    lib.binary("83928382810918298"),
    "0000000100101010001011000110101101100100000001001000110110011010",
    "converts large number correctly with padding"
  );
  t.equal(
    lib.binary("83928382810918298", false),
    "100101010001011000110101101100100000001001000110110011010",
    "converts large number correctly without padding"
  );
  t.end();
});

test("binary(): small numbers", (t) => {
  t.equal(
    lib.binary(7),
    "0000000000000000000000000000000000000000000000000000000000000111",
    "converts 7 with padding"
  );
  t.equal(
    lib.binary(7, false),
    "111",
    "converts 7 without padding"
  );
  t.equal(
    lib.binary(64),
    "0000000000000000000000000000000000000000000000000000000001000000",
    "converts 64 with padding"
  );
  t.equal(
    lib.binary(64, false),
    "1000000",
    "converts 64 without padding"
  );
  t.end();
});

test("binary(): edge cases", (t) => {
  t.equal(lib.binary(0), "0000000000000000000000000000000000000000000000000000000000000000", "binary(0) with padding");
  t.equal(lib.binary(0, false), "0", "binary(0) without padding");
  t.equal(lib.binary(1), "0000000000000000000000000000000000000000000000000000000000000001", "binary(1) with padding");
  t.equal(lib.binary(1, false), "1", "binary(1) without padding");

  // Large numbers (test with BigInt input)
  const largeBigInt = BigInt("18446744073709551615"); // 2^64 - 1
  const largeBinary = lib.binary(largeBigInt, false);
  t.equal(largeBinary, "1111111111111111111111111111111111111111111111111111111111111111", "binary of 2^64-1");

  // String input
  t.equal(lib.binary("255", false), "11111111", "handles string input");

  // Negative numbers should be handled by BigInt
  t.doesNotThrow(() => lib.binary(-1), "handles negative numbers");

  t.end();
});

// =============================================================================
// EXTRACTBITS FUNCTION TESTS
// =============================================================================

test("extractBits(): basic functionality", (t) => {
  // Type validation
  // eslint-disable-next-line valid-typeof
  t.assert(typeof lib.extractBits(7, 0, 1) === "bigint", "returns BigInt");

  // Basic bit extraction
  t.equal(lib.extractBits(7, 0, 1).toString(), "1", "extractBits(7, 0, 1)");
  t.equal(lib.extractBits(7, 0, 2).toString(), "3", "extractBits(7, 0, 2)");
  t.equal(lib.extractBits(7, 0, 3).toString(), "7", "extractBits(7, 0, 3)");
  t.equal(lib.extractBits(7, 1, 2).toString(), "3", "extractBits(7, 1, 2)");
  t.equal(lib.extractBits(7, 2, 1).toString(), "1", "extractBits(7, 2, 1)");
  t.equal(lib.extractBits(7, 2, 2).toString(), "1", "extractBits(7, 2, 2)");
  t.end();
});

test("extractBits(): edge cases", (t) => {
  t.equal(lib.extractBits(0, 0, 1).toString(), "0", "extracts from zero");
  t.equal(lib.extractBits(255, 0, 8).toString(), "255", "extracts full byte");
  t.equal(lib.extractBits(255, 4, 4).toString(), "15", "extracts upper nibble");
  t.equal(lib.extractBits(255, 0, 4).toString(), "15", "extracts lower nibble");

  // Zero length extraction should return 0
  t.equal(lib.extractBits(255, 0, 0).toString(), "0", "handles zero length");
  t.end();
});

test("extractBits(): large numbers and string input", (t) => {
  // Large numbers
  const largeNum = BigInt("0xFFFFFFFFFFFFFFFF"); // 64-bit max
  t.equal(lib.extractBits(largeNum, 0, 32).toString(), "4294967295", "extracts lower 32 bits");
  t.equal(lib.extractBits(largeNum, 32, 32).toString(), "4294967295", "extracts upper 32 bits");

  // String input
  t.equal(lib.extractBits("15", 0, 4).toString(), "15", "handles string input");
  t.end();
});

// =============================================================================
// SIMPLEFLAKESTRUCT TESTS
// =============================================================================

test("SimpleFlakeStruct(): constructor behavior", (t) => {
  t.assert(
    new lib.SimpleFlakeStruct(
      SIMPLEFLAKE_TIMESTAMP.toString(),
      SIMPLEFLAKE_RANDOMBITS.toString()
    ) instanceof lib.SimpleFlakeStruct,
    "creates instance when calling with new"
  );

  // Factory function behavior (without 'new')
  const struct1 = new lib.SimpleFlakeStruct("123456789", "987654");
  t.assert(struct1 instanceof lib.SimpleFlakeStruct, "works as constructor function");
  t.equal(struct1.timestamp, "123456789", "timestamp property set correctly");
  t.equal(struct1.randomBits, "987654", "randomBits property set correctly");

  // Constructor with 'new'
  const struct2 = new lib.SimpleFlakeStruct("111111111", "222222");
  t.assert(struct2 instanceof lib.SimpleFlakeStruct, "works with 'new' keyword");
  t.equal(struct2.timestamp, "111111111", "timestamp property set correctly with new");
  t.equal(struct2.randomBits, "222222", "randomBits property set correctly with new");
  t.end();
});

test("SimpleFlakeStruct(): error handling", (t) => {
  t.throws(() => {
    let undef;
    new lib.SimpleFlakeStruct(undef, "1");
  }, "throws when timestamp arg is missing");

  t.throws(() => {
    new lib.SimpleFlakeStruct("1");
  }, "throws when randomBits argument is missing");

  t.throws(() => {
    new lib.SimpleFlakeStruct();
  }, "throws when arguments are missing");

  t.throws(() => {
    new lib.SimpleFlakeStruct(null, "1");
  }, "throws when timestamp is null");

  t.throws(() => {
    new lib.SimpleFlakeStruct("1", null);
  }, "throws when randomBits is null");
  t.end();
});

test("SimpleFlakeStruct(): edge cases", (t) => {
  const structZero = new lib.SimpleFlakeStruct("0", "0");
  t.equal(structZero.timestamp, "0", "accepts zero timestamp");
  t.equal(structZero.randomBits, "0", "accepts zero randomBits");

  const structLarge = new lib.SimpleFlakeStruct("999999999999999", "8388607");
  t.equal(structLarge.timestamp, "999999999999999", "accepts large timestamp");
  t.equal(structLarge.randomBits, "8388607", "accepts max 23-bit random");
  t.end();
});

// =============================================================================
// PARSESIMPLEFLAKE FUNCTION TESTS
// =============================================================================

test("parseSimpleflake(): basic parsing", (t) => {
  const flake = lib.simpleflake(SIMPLEFLAKE_TIMESTAMP, SIMPLEFLAKE_RANDOMBITS);
  const parsed = lib.parseSimpleflake(flake);

  t.equal(
    parsed.timestamp,
    SIMPLEFLAKE_TIMESTAMP.toString(),
    "extracts correct timestamp"
  );
  t.equal(
    parsed.randomBits,
    SIMPLEFLAKE_RANDOMBITS.toString(),
    "extracts correct random bits"
  );

  // Verify parsed result is a SimpleFlakeStruct
  t.assert(parsed instanceof lib.SimpleFlakeStruct, "returns SimpleFlakeStruct instance");
  t.end();
});

test("parseSimpleflake(): round-trip parsing", (t) => {
  // Round-trip test: generate -> parse -> should match original values
  const timestamp = Date.now();
  const randomBits = 12345;
  const epoch = lib.SIMPLEFLAKE_EPOCH;
  const generatedFlake = lib.simpleflake(timestamp, randomBits, epoch);
  const parsedFlake = lib.parseSimpleflake(generatedFlake);

  t.equal(parsedFlake.timestamp, timestamp.toString(), "round-trip timestamp matches");
  t.equal(parsedFlake.randomBits, randomBits.toString(), "round-trip randomBits matches");
  t.end();
});

test("parseSimpleflake(): edge cases", (t) => {
  // Test flake with zero random bits (now works properly)
  const flakeZero = lib.simpleflake(lib.SIMPLEFLAKE_EPOCH, 0, lib.SIMPLEFLAKE_EPOCH);
  const parsedZero = lib.parseSimpleflake(flakeZero);
  t.equal(parsedZero.timestamp, lib.SIMPLEFLAKE_EPOCH.toString(), "parses flake with zero timestamp offset");
  t.equal(parsedZero.randomBits, "0", "parses flake with zero random bits");

  // Test with max random bits
  const flakeMax = lib.simpleflake(Date.now(), UNSIGNED_23BIT_MAX);
  const parsedMax = lib.parseSimpleflake(flakeMax);
  t.equal(parsedMax.randomBits, UNSIGNED_23BIT_MAX.toString(), "parses flake with max random bits");
  t.end();
});

test("parseSimpleflake(): input types", (t) => {
  // String input
  const parsedString = lib.parseSimpleflake("4242436206093260245");
  t.assert(parsedString instanceof lib.SimpleFlakeStruct, "parses string input");
  t.equal(typeof parsedString.timestamp, "string", "timestamp is string");
  t.equal(typeof parsedString.randomBits, "string", "randomBits is string");

  // BigInt input
  const parsedBigInt = lib.parseSimpleflake(BigInt("4242436206093260245"));
  t.assert(parsedBigInt instanceof lib.SimpleFlakeStruct, "parses BigInt input");

  t.end();
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("Integration: time ordering", (t) => {
  const flakes = [];
  const baseTime = Date.now();

  // Generate flakes with increasing timestamps
  for (let i = 0; i < 10; i++) {
    flakes.push(lib.simpleflake(baseTime + i, 0));
  }

  // Verify they are in ascending order
  for (let i = 1; i < flakes.length; i++) {
    t.assert(flakes[i] > flakes[i-1], `flake ${i} should be greater than flake ${i-1}`);
  }

  t.end();
});

test("Integration: uniqueness", (t) => {
  const flakes = new Set();
  const iterations = 1000;

  // Generate many flakes quickly
  for (let i = 0; i < iterations; i++) {
    flakes.add(lib.simpleflake().toString());
  }

  t.equal(flakes.size, iterations, "all generated flakes should be unique");
  t.end();
});

test("Integration: full round-trip workflow", (t) => {
  // Generate a flake with known parameters
  const timestamp = Date.now();
  const randomBits = 12345;
  const epoch = lib.SIMPLEFLAKE_EPOCH;

  // Create flake
  const flake = lib.simpleflake(timestamp, randomBits, epoch);

  // Parse it back
  const parsed = lib.parseSimpleflake(flake);

  // Verify all data matches
  t.equal(parsed.timestamp, timestamp.toString(), "timestamp survives round-trip");
  t.equal(parsed.randomBits, randomBits.toString(), "randomBits survives round-trip");

  // Verify binary representation
  const binaryRep = lib.binary(flake);
  t.equal(binaryRep.length, 64, "binary representation is 64 bits");

  // Extract and verify timestamp bits
  const extractedTimestamp = lib.extractBits(flake, 23, 41);
  const expectedTimestamp = BigInt(timestamp) - BigInt(epoch);
  t.equal(extractedTimestamp, expectedTimestamp, "extracted timestamp matches");

  // Extract and verify random bits
  const extractedRandom = lib.extractBits(flake, 0, 23);
  t.equal(extractedRandom, BigInt(randomBits), "extracted random bits match");

  t.end();
});

test("API: module exports and compatibility", (t) => {
  // Check all expected exports exist
  t.equal(typeof lib.simpleflake, "function", "simpleflake function exported");
  t.equal(typeof lib.binary, "function", "binary function exported");
  t.equal(typeof lib.extractBits, "function", "extractBits function exported");
  t.equal(typeof lib.parseSimpleflake, "function", "parseSimpleflake function exported");
  t.equal(typeof lib.SimpleFlakeStruct, "function", "SimpleFlakeStruct constructor exported");
  t.equal(typeof lib.simpleflakeStruct, "function", "simpleflakeStruct alias exported");
  t.equal(typeof lib.SIMPLEFLAKE_EPOCH, "number", "SIMPLEFLAKE_EPOCH constant exported");

  // Verify aliases work the same
  t.equal(lib.SimpleFlakeStruct, lib.simpleflakeStruct, "simpleflakeStruct is alias for SimpleFlakeStruct");

  t.end();
});
