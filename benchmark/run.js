// eslint-disable-next-line import/no-extraneous-dependencies
const Benchmark = require('benchmark');

const suite = new Benchmark.Suite();
const lib = require('../dist/simpleflakes');

const SIMPLEFLAKE = '4242436206093260245';
const SIMPLEFLAKE_EPOCH = 946702800000;
const SIMPLEFLAKE_TIMESTAMP = 1452440606092;
const SIMPLEFLAKE_RANDOMBITS = 7460309;

function formatBenchmarkResult(target) {
  const hz = target.hz;
  const nsPerOp = 1e9 / hz;
  const usPerOp = nsPerOp / 1e3;

  return `${target.name} x ${Benchmark.formatNumber(hz.toFixed(0))} ops/sec ±${target.stats.rme.toFixed(2)}% (${target.stats.sample.length} runs sampled) | ${nsPerOp.toFixed(2)} ns/op | ${usPerOp.toFixed(4)} us/op`;
}

suite.add('simpleflake()', () => {
  lib.simpleflake();
})
  .add('simpleflake(parameterization)', () => {
    lib.simpleflake(SIMPLEFLAKE_TIMESTAMP, SIMPLEFLAKE_RANDOMBITS, SIMPLEFLAKE_EPOCH);
  })
  .add('binary()', () => {
    lib.binary(64);
  })
  .add('BigInt()', () => {
    // eslint-disable-next-line no-undef
    BigInt('4242436206093260245');
  })
  .add('parseSimpleflake()', () => {
    lib.parseSimpleflake(SIMPLEFLAKE);
  })
// add listeners
  .on('cycle', (event) => {
    console.log(formatBenchmarkResult(event.target));
  })
// .on('complete', function() {
//   console.log('Fastest is ' + this.filter('fastest').map('name'))
// })
// run async
  .run({ async: true });
