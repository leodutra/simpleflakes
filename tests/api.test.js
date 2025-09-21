const test = require("tape");
const lib = require("../dist/simpleflakes");
const { EPOCH_2000 } = require("./test-constants");

test("API - core functions", (t) => {
  t.equal(typeof lib.simpleflake, "function", "simpleflake function");
  t.equal(typeof lib.binary, "function", "binary function");
  t.equal(typeof lib.extractBits, "function", "extractBits function");
  t.equal(typeof lib.parseSimpleflake, "function", "parseSimpleflake function");
  t.end();
});

test("API - constructors", (t) => {
  t.equal(typeof lib.SimpleflakeStruct, "function", "SimpleflakeStruct constructor");
  t.end();
});

test("API - constants", (t) => {
  t.equal(lib.SIMPLEFLAKE_EPOCH, EPOCH_2000, "SIMPLEFLAKE_EPOCH value");
  t.equal(typeof lib.SIMPLEFLAKE_EPOCH, "bigint", "SIMPLEFLAKE_EPOCH type");
  t.end();
});

test("API - default export", (t) => {
  t.ok(lib.default, "default export exists");
  t.ok(lib.default.simpleflake, "default export has simpleflake");
  t.end();
});
