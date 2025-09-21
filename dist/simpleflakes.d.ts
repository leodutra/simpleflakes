declare const SIMPLEFLAKE_EPOCH = 946684800000;
/**
 * Generates a simpleflake ID
 * @param ts - Timestamp in milliseconds (defaults to current time)
 * @param randomBits - Random bits for the ID (defaults to a random value)
 * @param epoch - Epoch timestamp in milliseconds (defaults to SIMPLEFLAKE_EPOCH)
 * @returns Generated simpleflake as a BigInt
 */
export declare function simpleflake(ts?: number, randomBits?: number, epoch?: number): bigint;
/**
 * Converts a value to binary representation
 * @param value - The value to convert to binary
 * @param padding - Whether to pad to 64 bits (defaults to true)
 * @returns Binary string representation
 */
export declare function binary(value: bigint | number | string, padding?: boolean): string;
/**
 * Extracts bits from a data value
 * @param data - The data to extract bits from
 * @param shift - Number of bits to shift
 * @param length - Number of bits to extract
 * @returns Extracted bits as a BigInt
 */
export declare function extractBits(data: bigint | number | string, shift: bigint | number, length: bigint | number): bigint;
/**
 * Structure representing a parsed simpleflake
 */
export declare class SimpleFlakeStruct {
    readonly timestamp: string;
    readonly randomBits: string;
    constructor(timestamp: string, randomBits: string);
}
/**
 * Parses a simpleflake into its components
 * @param flake - The simpleflake to parse
 * @returns SimpleFlakeStruct containing timestamp and random bits
 */
export declare function parseSimpleflake(flake: bigint | number | string): SimpleFlakeStruct;
export declare const simpleflakeStruct: typeof SimpleFlakeStruct;
export { SIMPLEFLAKE_EPOCH };
declare const _default: {
    SimpleFlakeStruct: typeof SimpleFlakeStruct;
    simpleflakeStruct: typeof SimpleFlakeStruct;
    extractBits: typeof extractBits;
    parseSimpleflake: typeof parseSimpleflake;
    binary: typeof binary;
    SIMPLEFLAKE_EPOCH: number;
    simpleflake: typeof simpleflake;
};
export default _default;
//# sourceMappingURL=simpleflakes.d.ts.map