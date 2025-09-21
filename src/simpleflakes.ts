// Re-export everything from WASM
export { default } from "simpleflakes-wasm"
export * from "simpleflakes-wasm"

// Add missing exports that the tests expect
export const SIMPLEFLAKE_EPOCH = 946684800000

// Export aliases as expected by tests
export { SimpleFlakeStruct as simpleflakeStruct } from "simpleflakes-wasm"
export { parseSimpleFlake as parseSimpleflake } from "simpleflakes-wasm"
