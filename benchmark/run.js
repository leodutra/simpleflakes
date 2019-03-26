const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()
const legacy = require('../lib/simpleflakes-legacy')
const lib = require('../lib/simpleflakes')
const BigNum = legacy.BigNum

const SIMPLEFLAKE = '4242436206093260245'
const SIMPLEFLAKE_EPOCH = 946702800000
const SIMPLEFLAKE_TIMESTAMP = 1452440606092
const SIMPLEFLAKE_RANDOMBITS = 7460309

suite.add('simpleflake()', function() {
  lib.simpleflake()
})
.add('simpleflake(parameterization)', function() {
  lib.simpleflake(SIMPLEFLAKE_TIMESTAMP, SIMPLEFLAKE_RANDOMBITS, SIMPLEFLAKE_EPOCH)
})
.add('binary()', function() {
  lib.binary(64)
})
.add('BigInt()', function() {
  BigInt('4242436206093260245')
})
.add('parseSimpleflake()', function() {
  lib.parseSimpleflake(SIMPLEFLAKE)
})


// legacy tests
suite.add('legacy simpleflake()', function() {
  legacy.simpleflake()
})
.add('legacy simpleflake(parameterization)', function() {
  legacy.simpleflake(SIMPLEFLAKE_TIMESTAMP, SIMPLEFLAKE_RANDOMBITS, SIMPLEFLAKE_EPOCH)
})
.add('legacy binary()', function() {
  legacy.binary(64)
})
.add('legacy new BigNum()', function() {
  new BigNum('4242436206093260245', 10)
})
.add('legacy parseSimpleflake()', function() {
  legacy.parseSimpleflake(SIMPLEFLAKE)
})



// add listeners
.on('cycle', function(event) {
  console.log(String(event.target))
})
// .on('complete', function() {
//   console.log('Fastest is ' + this.filter('fastest').map('name'))
// })
// run async
.run({ 'async': true })
