import { test } from "tape";
import {simpleflake, binary, parseSimpleFlake, SimpleFlakeStruct } from "../lib/simpleflakes-wasm.js";

// eslint-disable-next-line global-require
// eslint-disable-next-line global-require
const SIMPLEFLAKE_EPOCH = 946702800000;
const SIMPLEFLAKE_TIMESTAMP = 1452440606092;
const SIMPLEFLAKE_RANDOMBITS = 7460309;

test("testing simpleflake()", (t) => {
  // eslint-disable-next-line valid-typeof
  t.assert(typeof simpleflake() === "bigint", "returning BigInt?");
  t.equal(

      simpleflake(
        SIMPLEFLAKE_TIMESTAMP,
        SIMPLEFLAKE_RANDOMBITS,
        SIMPLEFLAKE_EPOCH
      )
      .toString(),
    "4242436206093260245",
    "right timestamp, random bits and epoch parameterization?"
  );
  t.end();
});

test("testing binary()", (t) => {
  t.equal(
    binary("83928382810918298"),
    "0000000100101010001011000110101101100100000001001000110110011010",
    "valid simpleflake.binary('83928382810918298') result?"
  );
  t.equal(
    binary("83928382810918298", false),
    "100101010001011000110101101100100000001001000110110011010",
    "valid simpleflake.binary('83928382810918298', false) result?"
  );
  t.equal(
    binary(7),
    "0000000000000000000000000000000000000000000000000000000000000111",
    "valid simpleflake.binary(7) result?"
  );
  t.equal(
    binary(7, false),
    "111",
    "valid simpleflake.binary(7, false) result?"
  );
  t.equal(
    binary(64),
    "0000000000000000000000000000000000000000000000000000000001000000",
    "valid simpleflake.binary(64) result?"
  );
  t.equal(
    binary(64, false),
    "1000000",
    "valid simpleflake.binary(64, false) result?"
  );
  t.end();
});

// TODO: move to WASM
// test("testing extractBits()", (t) => {
//   // eslint-disable-next-line valid-typeof
//   t.assert(typeof extractBits(7, 0, 1) === "bigint", "returns big int");
//   t.equal(extractBits(7, 0, 1).toString(), "1", "extractBits(7, 0, 1)");
//   t.equal(extractBits(7, 0, 2).toString(), "3", "extractBits(7, 0, 2)");
//   t.equal(extractBits(7, 0, 3).toString(), "7", "extractBits(7, 0, 3)");
//   t.equal(extractBits(7, 1, 2).toString(), "3", "extractBits(7, 1, 2)");
//   t.equal(extractBits(7, 2, 1).toString(), "1", "extractBits(7, 2, 1)");
//   t.equal(extractBits(7, 2, 2).toString(), "1", "extractBits(7, 2, 2)");
//   t.end();
// });

test("testing SimpleFlakeStruct()", (t) => {
  t.assert(
    SimpleFlakeStruct(
      SIMPLEFLAKE_TIMESTAMP.toString(),
      SIMPLEFLAKE_RANDOMBITS.toString()
    ) instanceof SimpleFlakeStruct,
    "returning new SimpleFlakeStruct() when calling SimpleFlakeStruct()?"
  );
  t.throws(() => {
    let undef;
    SimpleFlakeStruct(undef, "1");
  }, "throw typeError when timestamp arg is missing");

  t.throws(() => {
    SimpleFlakeStruct("1");
  }, "throw typeError when randomBits argument is missing");

  t.throws(() => {
    SimpleFlakeStruct();
  }, "throw typeError when arguments are missing");

  t.end();
});

test("testing parseSimpleflake()", (t) => {
  const flake = simpleflake(SIMPLEFLAKE_TIMESTAMP, SIMPLEFLAKE_RANDOMBITS);
  t.equal(
    parseSimpleFlake(flake).timestamp,
    SIMPLEFLAKE_TIMESTAMP.toString(),
    "correct timestamp parsing?"
  );
  t.equal(
    parseSimpleFlake(flake).randomBits,
    SIMPLEFLAKE_RANDOMBITS.toString(),
    "correct random bits parsing?"
  );
  t.end();
});
