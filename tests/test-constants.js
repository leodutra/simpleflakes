// Shared test constants - using bigint for consistency with the main API
const EPOCH_2000 = 946684800000n; // Date.UTC(2000, 0, 1)
const TEST_TIMESTAMP = 1452440606092n;
const TEST_RANDOM_BITS = 7460309n;
const MAX_23BIT = 8388607n; // (Math.pow(2, 23) - 1)

module.exports = {
  EPOCH_2000,
  TEST_TIMESTAMP,
  TEST_RANDOM_BITS,
  MAX_23BIT
};
