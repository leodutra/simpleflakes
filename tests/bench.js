var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
var lib = require('../lib/simpleflakes');
var BigNum = lib.BigNum;

var SIMPLEFLAKE = '4242436206093260245';
var SIMPLEFLAKE_EPOCH = 946702800000;
var SIMPLEFLAKE_TIMESTAMP = 1452440606092;
var SIMPLEFLAKE_RANDOMBITS = 7460309;


// add tests
suite.add('simpleflake()', function() {
  lib.simpleflake();
})
.add('simpleflake(parameterization)', function() {
  lib.simpleflake(SIMPLEFLAKE_TIMESTAMP, SIMPLEFLAKE_RANDOMBITS, SIMPLEFLAKE_EPOCH);
})
.add('binary()', function() {
  lib.binary(64);
})
.add('new BigNum()', function() {
  new BigNum('4242436206093260245', 10);
})
.add('parseSimpleflake()', function() {
  lib.parseSimpleflake(SIMPLEFLAKE);
})

// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
// .on('complete', function() {
//   console.log('Fastest is ' + this.filter('fastest').map('name'));
// })
// run async
.run({ 'async': true });
