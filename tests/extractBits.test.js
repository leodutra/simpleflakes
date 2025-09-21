const test = require("tape");
const lib = require("../dist/simpleflakes");

test("extractBits() - basic functionality", (t) => {
  t.equal(typeof lib.extractBits(7, 0, 1), "bigint", "returns BigInt");

  // Single bit extraction
  t.equal(lib.extractBits(7, 0, 1).toString(), "1", "extract LSB");
  t.equal(lib.extractBits(7, 0, 3).toString(), "7", "extract 3 bits");

  // Nibble extraction from byte
  t.equal(lib.extractBits(255, 4, 4).toString(), "15", "extract upper nibble");
  t.equal(lib.extractBits(255, 0, 4).toString(), "15", "extract lower nibble");

  t.end();
});

test("extractBits() - edge cases", (t) => {
  // Zero cases
  t.equal(lib.extractBits(0, 0, 1).toString(), "0", "extract from zero");
  t.equal(lib.extractBits(255, 0, 0).toString(), "0", "zero length extraction");

  // Large number extraction
  const largeNum = BigInt("0xFFFFFFFFFFFFFFFF");
  t.equal(lib.extractBits(largeNum, 0, 32).toString(), "4294967295", "extract lower 32 bits");
  t.equal(lib.extractBits(largeNum, 32, 32).toString(), "4294967295", "extract upper 32 bits");

  t.end();
});

test("extractBits() - input types", (t) => {
  const expected = "15";
  t.equal(lib.extractBits("15", 0, 4).toString(), expected, "handles string input");
  t.equal(lib.extractBits(BigInt("15"), 0, 4).toString(), expected, "handles BigInt input");
  t.equal(lib.extractBits(15, 0, 4).toString(), expected, "handles number input");
  t.end();
});
