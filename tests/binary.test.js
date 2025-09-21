const test = require("tape");
const lib = require("../dist/simpleflakes");

test("binary() - basic conversion", (t) => {
  // Known large number
  t.equal(
    lib.binary("83928382810918298"),
    "0000000100101010001011000110101101100100000001001000110110011010",
    "large number with padding"
  );
  t.equal(
    lib.binary("83928382810918298", false),
    "100101010001011000110101101100100000001001000110110011010",
    "large number without padding"
  );

  // Small numbers
  t.equal(lib.binary(7), "0000000000000000000000000000000000000000000000000000000000000111", "7 with padding");
  t.equal(lib.binary(7, false), "111", "7 without padding");

  t.end();
});

test("binary() - edge cases", (t) => {
  // Zero
  t.equal(lib.binary(0), "0000000000000000000000000000000000000000000000000000000000000000", "0 with padding");
  t.equal(lib.binary(0, false), "0", "0 without padding");

  // Maximum 64-bit value
  const maxUint64 = BigInt("18446744073709551615"); // 2^64 - 1
  const result = lib.binary(maxUint64, false);
  t.equal(result, "1111111111111111111111111111111111111111111111111111111111111111", "2^64-1 binary");
  t.equal(result.length, 64, "exactly 64 bits");

  t.end();
});

test("binary() - input types", (t) => {
  const expected = "11111111";
  t.equal(lib.binary("255", false), expected, "handles string input");
  t.equal(lib.binary(BigInt("255"), false), expected, "handles BigInt input");
  t.equal(lib.binary(255, false), expected, "handles number input");
  t.end();
});

test("binary() - padding behavior", (t) => {
  // Verify padding adds zeros to reach 64 bits
  const small = lib.binary(1, true);
  t.equal(small.length, 64, "pads to 64 bits");
  t.ok(small.endsWith("1"), "preserves original bits");
  t.ok(small.startsWith("000"), "adds leading zeros");

  // No padding when disabled
  t.equal(lib.binary(1, false), "1", "no padding when disabled");

  // No extra padding for exactly 64 bits
  const exactly64Bits = BigInt('0b' + '1'.repeat(64));
  const padded = lib.binary(exactly64Bits, true);
  t.equal(padded.length, 64, "no extra padding for 64-bit numbers");

  t.end();
});
