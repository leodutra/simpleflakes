// eslint-disable-next-line import/no-extraneous-dependencies
const Benchmark = require("benchmark");

const lib = require("../dist/simpleflakes");
const suite = new Benchmark.Suite();

const SIMPLEFLAKE_TIMESTAMP = 1452440606092;
const SIMPLEFLAKE_RANDOM_BITS = 7460309;
const SIMPLEFLAKE_EPOCH = lib.SIMPLEFLAKE_EPOCH;
const SIMPLEFLAKE = lib
  .simpleflake(
    SIMPLEFLAKE_TIMESTAMP,
    SIMPLEFLAKE_RANDOM_BITS,
    SIMPLEFLAKE_EPOCH,
  )
  .toString();

function formatBenchmarkResult(target) {
  const hz = target.hz;
  const nsPerOp = 1e9 / hz;
  const usPerOp = nsPerOp / 1e3;

  return `${target.name} x ${Benchmark.formatNumber(
    hz.toFixed(0),
  )} ops/sec ±${target.stats.rme.toFixed(2)}% (${target.stats.sample.length} runs sampled) | ${nsPerOp.toFixed(2)} ns/op | ${usPerOp.toFixed(4)} us/op`;
}

suite
  .add("simpleflake()", () => {
    lib.simpleflake();
  })
  .add("simpleflake(timestamp, randomBits, epoch)", () => {
    lib.simpleflake(
      SIMPLEFLAKE_TIMESTAMP,
      SIMPLEFLAKE_RANDOM_BITS,
      SIMPLEFLAKE_EPOCH,
    );
  })
  .add("binary()", () => {
    lib.binary(64);
  })
  .add("BigInt()", () => {
    BigInt("4242436206093260245");
  })
  .add("parseSimpleflake()", () => {
    lib.parseSimpleflake(SIMPLEFLAKE);
  })
  .on("cycle", (event) => {
    console.log(formatBenchmarkResult(event.target));
  })
  .run({ async: true });
