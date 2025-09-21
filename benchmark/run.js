// eslint-disable-next-line import/no-extraneous-dependencies
import Benchmark from 'benchmark';
import * as lib from '../lib/simpleflakes.js';
import * as wasm from '../lib/simpleflakes-wasm.js';

const suite = new Benchmark.Suite();

const SIMPLEFLAKE = '4242436206093260245';
const SIMPLEFLAKE_EPOCH = 946702800000;
const SIMPLEFLAKE_TIMESTAMP = 1452440606092;
const SIMPLEFLAKE_RANDOMBITS = 7460309;

suite.add('JS simpleflake()', () => {
  lib.simpleflake();
})
  .add('JS simpleflake(parameterization)', () => {
    lib.simpleflake(SIMPLEFLAKE_TIMESTAMP, SIMPLEFLAKE_RANDOMBITS, SIMPLEFLAKE_EPOCH);
  })
  .add('JS binary()', () => {
    lib.binary(64);
  })
  .add('JS parseSimpleflake()', () => {
    lib.parseSimpleflake(SIMPLEFLAKE);
  })
  .add('WASM simpleflake()', () => {
    wasm.simpleflake();
  })
  .add('WASM simpleflake(parameterization)', () => {
    wasm.simpleflake(SIMPLEFLAKE_TIMESTAMP, SIMPLEFLAKE_RANDOMBITS, SIMPLEFLAKE_EPOCH);
  })
  .add('WASM binary()', () => {
    wasm.binary(64);
  })
  .add('WASM parseSimpleflake()', () => {
    wasm.parseSimpleflake(SIMPLEFLAKE);
  })
  .add('BigInt()', () => {
    // eslint-disable-next-line no-undef
    BigInt('4242436206093260245');
  })

// add listeners
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
// .on('complete', function() {
//   console.log('Fastest is ' + this.filter('fastest').map('name'))
// })
// run async
  .run({ async: true });
