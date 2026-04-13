const test = require("tape");
const lib = require("../dist/simpleflakes");

const LIB_PATH = require.resolve("../dist/simpleflakes");

function loadFreshLib() {
  delete require.cache[LIB_PATH];
  return require(LIB_PATH);
}

function restoreGlobalCrypto(descriptor) {
  if (descriptor) {
    Object.defineProperty(globalThis, "crypto", descriptor);
    return;
  }
  delete globalThis.crypto;
}

test("Integration - time ordering", (t) => {
  const flakes = [];
  const baseTime = Date.now();

  // Generate flakes with sequential timestamps
  for (let i = 0; i < 5; i++) {
    flakes.push(lib.simpleflake(baseTime + i, 0));
  }

  // Verify ascending order
  for (let i = 1; i < flakes.length; i++) {
    t.ok(flakes[i] > flakes[i-1], `flake ${i} > flake ${i-1}`);
  }

  t.end();
});

test("Integration - uniqueness", (t) => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const flakes = new Set();
  const iterations = 1000;
  const timestamp = Date.now();
  let nextRandomValue = 0;

  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      getRandomValues(array) {
        for (let i = 0; i < array.length; i++) {
          array[i] = nextRandomValue;
          nextRandomValue += 1;
        }
        return array;
      }
    }
  });

  try {
    const freshLib = loadFreshLib();

    for (let i = 0; i < iterations; i++) {
      flakes.add(freshLib.simpleflake(timestamp).toString());
    }
  } finally {
    restoreGlobalCrypto(originalDescriptor);
    delete require.cache[LIB_PATH];
  }

  t.equal(flakes.size, iterations, "all generated flakes are unique");
  t.end();
});

test("Integration - complete workflow", (t) => {
  const timestamp = Date.now();
  const randomBits = 12345;
  const epoch = lib.SIMPLEFLAKE_EPOCH;

  // Create flake
  const flake = lib.simpleflake(timestamp, randomBits, epoch);

  // Parse it back
  const parsed = lib.parseSimpleflake(flake);
  t.equal(parsed.timestamp, BigInt(timestamp), "timestamp survives round-trip");
  t.equal(parsed.randomBits, BigInt(randomBits), "randomBits survives round-trip");

  // Verify binary representation
  const binaryRep = lib.binary(flake);
  t.equal(binaryRep.length, 64, "binary representation is 64 bits");

  // Extract and verify components
  const extractedTimestamp = lib.extractBits(flake, 23, 41);
  const expectedTimestamp = BigInt(timestamp) - BigInt(epoch);
  t.equal(extractedTimestamp, expectedTimestamp, "extracted timestamp matches");

  const extractedRandom = lib.extractBits(flake, 0, 23);
  t.equal(extractedRandom, BigInt(randomBits), "extracted random bits match");

  t.end();
});
