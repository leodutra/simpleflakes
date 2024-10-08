use getrandom::getrandom;
use js_sys::BigInt;
use wasm_bindgen::prelude::*;

const SIMPLEFLAKE_EPOCH: u64 = 946684800000;
const UNSIGNED_23BIT_MAX: u32 = 8388607;

const SIMPLEFLAKE_TIMESTAMP_LENGTH: u8 = 41;
const SIMPLEFLAKE_RANDOM_LENGTH: u8 = 23;

const SIMPLEFLAKE_RANDOM_SHIFT: u8 = 0;
const SIMPLEFLAKE_TIMESTAMP_SHIFT: u8 = 23;

#[wasm_bindgen]
pub struct SimpleFlakeStruct {
    timestamp: u64,
    random_bits: u64,
}

#[wasm_bindgen]
impl SimpleFlakeStruct {
    #[wasm_bindgen(constructor)]
    pub fn new(timestamp: JsValue, random_bits: JsValue) -> Result<SimpleFlakeStruct, JsValue> {
        let timestamp = js_value_to_u64(&timestamp)?;
        let random_bits = js_value_to_u64(&random_bits)?;
        Ok(SimpleFlakeStruct {
            timestamp,
            random_bits,
        })
    }

    #[wasm_bindgen(getter)]
    pub fn timestamp(&self) -> js_sys::BigInt {
        self.timestamp.into()
    }

    #[wasm_bindgen(getter)]
    pub fn random_bits(&self) -> js_sys::BigInt {
        self.random_bits.into()
    }
}

#[wasm_bindgen]
pub fn simpleflake(ts: JsValue, random_bits: JsValue, epoch: JsValue) -> Result<u64, JsValue> {
    let ts = js_value_to_u64(&ts).unwrap_or_else(|_| js_sys::Date::now() as u64);
    let epoch = js_value_to_u64(&epoch).unwrap_or(SIMPLEFLAKE_EPOCH);
    let random_bits = js_value_to_u64(&random_bits).unwrap_or_else(|_| {
        let mut buf = [0u8; 4]; // We need 4 bytes to cover a u32.
        getrandom(&mut buf).expect("Failed to get random data");
        let rand_num = u32::from_be_bytes(buf) & UNSIGNED_23BIT_MAX; // Mask with 23-bit max
        rand_num as u64
    });
    Ok((ts - epoch) << SIMPLEFLAKE_TIMESTAMP_SHIFT | random_bits)
}

#[wasm_bindgen]
pub fn binary(value: JsValue, padding: Option<bool>) -> Result<String, JsValue> {
    let value_u64 = js_value_to_u64(&value)?;
    let binary = format!("{:b}", value_u64);
    let padding = padding.unwrap_or(false);

    if padding {
        let pad_length = 64 - binary.len();
        Ok(format!(
            "{:0pad_length$b}",
            value_u64,
            pad_length = pad_length
        ))
    } else {
        Ok(binary)
    }
}

fn extract_bits(data: u64, shift: u8, length: u8) -> u64 {
    let mask = (1 << length) - 1;
    (data >> shift) & mask
}

#[wasm_bindgen(js_name = parseSimpleFlake)]
pub fn parse_simpleflake(flake: JsValue) -> Result<SimpleFlakeStruct, JsValue> {
    let flake = js_value_to_u64(&flake)?;

    let timestamp = JsValue::from(
        extract_bits(
            flake,
            SIMPLEFLAKE_TIMESTAMP_SHIFT,
            SIMPLEFLAKE_TIMESTAMP_LENGTH,
        ) + SIMPLEFLAKE_EPOCH as u64,
    );

    let random_bits = JsValue::from(extract_bits(
        flake,
        SIMPLEFLAKE_RANDOM_SHIFT,
        SIMPLEFLAKE_RANDOM_LENGTH,
    ));

    SimpleFlakeStruct::new(timestamp, random_bits)
}

fn js_value_to_u64(value: &JsValue) -> Result<u64, JsValue> {
    if let Some(bigint) = value.dyn_ref::<BigInt>() {
        // Get the BigInt as a string in base 10, and handle the potential error
        let bigint_str = bigint
            .to_string(10)
            .map_err(|_| JsValue::from_str("Failed to convert BigInt to string"))?;

        // Convert JsString to Rust String and attempt to parse it as u64
        let bigint_str: String = bigint_str.into();
        match bigint_str.parse::<u64>() {
            Ok(num) => Ok(num),
            Err(_) => Err(JsValue::from_str("BigInt is out of u64 range")),
        }
    } else if let Some(number) = value.as_f64() {
        Ok(number as u64)
    } else if let Some(string) = value.as_string() {
        string
            .parse::<u64>()
            .map_err(|_| JsValue::from_str("Failed to parse string as BigInt"))
    } else {
        Err(JsValue::from_str(
            "Invalid input type: expected BigInt, Number, or String",
        ))
    }
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use std::str::FromStr;
    use wasm_bindgen::JsValue;
    use wasm_bindgen_test::wasm_bindgen_test;

    // Helper function to create a JsValue from a u64.
    fn js_value_from_u64(value: u64) -> JsValue {
        JsValue::from_str(&value.to_string())
    }

    #[wasm_bindgen_test]
    fn test_js_value_to_u64() {
        // Test converting BigInt JsValue to u64
        let bigint_js_value = JsValue::from(BigInt::from_str("9007199254740991").unwrap());
        assert_eq!(js_value_to_u64(&bigint_js_value).unwrap(), 9007199254740991);

        // Test converting f64 JsValue to u64
        let number_js_value = JsValue::from_f64(9007199254740991.0);
        assert_eq!(js_value_to_u64(&number_js_value).unwrap(), 9007199254740991);

        // Test converting String JsValue to u64
        let string_js_value = JsValue::from_str("123456789");
        assert_eq!(js_value_to_u64(&string_js_value).unwrap(), 123456789);

        // Test invalid BigInt string
        let invalid_string_js_value = JsValue::from_str("invalid");
        assert!(js_value_to_u64(&invalid_string_js_value).is_err());
    }

    #[wasm_bindgen_test]
    fn test_simpleflake() {
        let ts = js_value_from_u64(1452440606092);
        let random_bits = js_value_from_u64(7460309);
        let epoch = js_value_from_u64(SIMPLEFLAKE_EPOCH);

        // Test correct SimpleFlake generation
        let flake = simpleflake(ts.clone(), random_bits.clone(), epoch.clone()).unwrap();
        assert_eq!(flake, 4242436206093260245);

        // Test defaulting to current timestamp if no ts is provided
        let flake_default_ts = simpleflake(JsValue::UNDEFINED, random_bits, epoch.clone()).unwrap();
        assert!(flake_default_ts > 4242436206093260245); // Should be greater than a known timestamp due to time

        // Test random bits generation if none is provided
        let flake_default_random = simpleflake(ts, JsValue::UNDEFINED, epoch).unwrap();
        assert_ne!(flake_default_random, flake);
    }

    #[wasm_bindgen_test]
    fn test_binary() {
        // Test binary string representation of u64
        let value = js_value_from_u64(83928382810918298);
        assert_eq!(
            binary(value.clone(), Some(true)).unwrap(),
            "0000000100101010001011000110101101100100000001001000110110011010"
        );

        assert_eq!(
            binary(value, Some(false)).unwrap(),
            "100101010001011000110101101100100000001001000110110011010"
        );

        // Test smaller number
        let value = js_value_from_u64(7);
        assert_eq!(
            binary(value.clone(), Some(true)).unwrap(),
            "0000000000000000000000000000000000000000000000000000000000000111"
        );
        assert_eq!(binary(value, Some(false)).unwrap(), "111");

        // Test power of two
        let value = js_value_from_u64(64);
        assert_eq!(
            binary(value.clone(), Some(true)).unwrap(),
            "0000000000000000000000000000000000000000000000000000000001000000"
        );
        assert_eq!(binary(value, Some(false)).unwrap(), "1000000");
    }

    #[wasm_bindgen_test]
    fn test_extract_bits() {
        // Testing bit extraction for different cases
        assert_eq!(extract_bits(7, 0, 1), 1); // Extract 1 bit from position 0
        assert_eq!(extract_bits(7, 0, 2), 3); // Extract 2 bits from position 0
        assert_eq!(extract_bits(7, 0, 3), 7); // Extract 3 bits from position 0
        assert_eq!(extract_bits(7, 1, 2), 3); // Extract 2 bits from position 1
        assert_eq!(extract_bits(7, 2, 1), 1); // Extract 1 bit from position 2
        assert_eq!(extract_bits(7, 2, 2), 1); // Extract 2 bits from position 2
    }

    #[wasm_bindgen_test]
    fn test_simpleflake_struct() {
        // Test creating SimpleFlakeStruct with valid inputs
        let timestamp = js_value_from_u64(1452440606092);
        let random_bits = js_value_from_u64(7460309);
        let simpleflake = SimpleFlakeStruct::new(timestamp.clone(), random_bits.clone()).unwrap();
        assert_eq!(simpleflake.timestamp(), BigInt::from(1452440606092i64));
        assert_eq!(simpleflake.random_bits(), BigInt::from(7460309));

        // Test error when timestamp is invalid
        let invalid_timestamp = JsValue::from_str("invalid");
        assert!(SimpleFlakeStruct::new(invalid_timestamp, random_bits.clone()).is_err());

        // Test error when random_bits is invalid
        let invalid_random_bits = JsValue::from_str("invalid");
        assert!(SimpleFlakeStruct::new(timestamp, invalid_random_bits).is_err());
    }

    #[wasm_bindgen_test]
    fn test_parse_simpleflake() {
        // Test parsing a valid SimpleFlake
        let flake = js_value_from_u64(4242436206093260245);
        let parsed_flake = parse_simpleflake(flake).unwrap();

        assert_eq!(parsed_flake.timestamp(), BigInt::from(1452440606092i64));
        assert_eq!(parsed_flake.random_bits(), BigInt::from(7460309));

        // Test parsing an invalid SimpleFlake
        let invalid_flake = JsValue::from_str("invalid");
        assert!(parse_simpleflake(invalid_flake).is_err());
    }
}
