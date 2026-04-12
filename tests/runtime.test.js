const test = require("tape");
const { EPOCH_2000, TEST_TIMESTAMP } = require("./test-constants");

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

test("simpleflake() - prefers global crypto when available", (t) => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");

  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      getRandomValues(array) {
        array.fill(0);
        return array;
      }
    }
  });

  try {
    const lib = loadFreshLib();
    const flake = lib.simpleflake(TEST_TIMESTAMP, undefined, EPOCH_2000);
    const expected = lib.simpleflake(TEST_TIMESTAMP, 0, EPOCH_2000);
    t.equal(flake, expected, "uses the global Web Crypto implementation");
  } finally {
    restoreGlobalCrypto(originalDescriptor);
    delete require.cache[LIB_PATH];
  }

  t.end();
});

test("simpleflake() - falls back to node webcrypto", (t) => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");

  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: undefined
  });

  try {
    const lib = loadFreshLib();
    t.doesNotThrow(
      () => lib.simpleflake(TEST_TIMESTAMP, undefined, EPOCH_2000),
      "uses node webcrypto when global crypto is unavailable"
    );
  } finally {
    restoreGlobalCrypto(originalDescriptor);
    delete require.cache[LIB_PATH];
  }

  t.end();
});
