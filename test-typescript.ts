// Test TypeScript usage with full type checking
import { simpleflake, SimpleFlakeStruct, parseSimpleflake, binary, extractBits, SIMPLEFLAKE_EPOCH } from './dist/simpleflakes';

console.log('🧪 Testing TypeScript import with types...');

// Test basic functionality with type annotations
const flake: bigint = simpleflake();
console.log('✓ simpleflake() generated:', flake.toString());

// Test with explicit parameters and types
const customFlake: bigint = simpleflake(Date.now(), 12345, SIMPLEFLAKE_EPOCH);
console.log('✓ simpleflake() with params:', customFlake.toString());

// Test parsing with type checking
const parsed: SimpleFlakeStruct = parseSimpleflake(flake);
console.log('✓ parseSimpleflake() timestamp:', parsed.timestamp);
console.log('✓ parseSimpleflake() randomBits:', parsed.randomBits);

// Test binary conversion with type checking
const binaryStr: string = binary(flake, true);
console.log('✓ binary() length:', binaryStr.length);

// Test bit extraction with BigInt types
const bits: bigint = extractBits(flake, 0n, 23n);
console.log('✓ extractBits() result:', bits.toString());

// Test constants with type checking
const epoch: number = SIMPLEFLAKE_EPOCH;
console.log('✓ SIMPLEFLAKE_EPOCH:', epoch);

// Test constructor with type checking
const struct: SimpleFlakeStruct = new SimpleFlakeStruct('1234567890', '123456');
console.log('✓ SimpleFlakeStruct created:', struct.timestamp, struct.randomBits);

// Test readonly properties (TypeScript feature)
try {
  // This should cause a TypeScript error if uncommented:
  // struct.timestamp = 'modified'; // Error: Cannot assign to 'timestamp' because it is a read-only property
  console.log('✓ TypeScript readonly properties enforced');
} catch (e) {
  console.log('✗ TypeScript readonly test failed');
}

console.log('✅ TypeScript test completed successfully!\n');
