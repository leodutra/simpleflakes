module.exports = typeof BigInt === 'function'
  ? require('./lib/simpleflakes')
  : require('./lib/simpleflakes-legacy');
