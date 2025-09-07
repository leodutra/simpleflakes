// Test CommonJS usage (traditional Node.js require)
const { simpleflake, SimpleFlakeStruct, parseSimpleflake, binary, extractBits, SIMPLEFLAKE_EPOCH } = require('./dist/simpleflakes');

console.log('🧪 Testing CommonJS require...');

// Test basic functionality
const flake = simpleflake();
console.log('✓ simpleflake() generated:', flake.toString());

// Test parsing
const parsed = parseSimpleflake(flake);
console.log('✓ parseSimpleflake() timestamp:', parsed.timestamp);
console.log('✓ parseSimpleflake() randomBits:', parsed.randomBits);

// Test binary conversion
const binaryStr = binary(flake);
console.log('✓ binary() length:', binaryStr.length);

// Test bit extraction
const bits = extractBits(flake, 0n, 23n);
console.log('✓ extractBits() result:', bits.toString());

// Test constants
console.log('✓ SIMPLEFLAKE_EPOCH:', SIMPLEFLAKE_EPOCH);

// Test constructor
const struct = new SimpleFlakeStruct('1234567890', '123456');
console.log('✓ SimpleFlakeStruct created:', struct.timestamp, struct.randomBits);

console.log('✅ CommonJS test completed successfully!\n');
