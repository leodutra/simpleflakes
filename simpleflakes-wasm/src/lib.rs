use wasm_bindgen::prelude::*;
use getrandom::getrandom;

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
    pub fn new(timestamp: Option<u64>, random_bits: Option<u64>) -> SimpleFlakeStruct {
        if timestamp.is_none() || random_bits.is_none() {
            wasm_bindgen::throw_str("Both `timestamp` and `random_bits` are required");
        }
        SimpleFlakeStruct {
            timestamp: timestamp.unwrap(),
            random_bits: random_bits.unwrap(),
        }
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
pub fn simpleflake(ts: Option<u64>, random_bits: Option<u64>, epoch: Option<u64>) -> u64 {
    // shadowing the ts variables
    let ts = ts.unwrap_or_else(|| js_sys::Date::now() as u64);
    let epoch = epoch.unwrap_or(SIMPLEFLAKE_EPOCH);
    let random_bits = random_bits.unwrap_or_else(|| {
        let mut buf = [0u8; 4]; // We need 4 bytes to cover a u32.
        getrandom(&mut buf).expect("Failed to get random data");
        let rand_num = u32::from_be_bytes(buf) & UNSIGNED_23BIT_MAX; // Mask with 23-bit max
        rand_num as u64
    });
    let flake = (ts - epoch) << SIMPLEFLAKE_TIMESTAMP_SHIFT | random_bits;
    flake
}

#[wasm_bindgen]
pub fn binary(value: u64, padding: Option<bool>) -> String {
    let binary = format!("{:b}", value);
    let padding = padding.unwrap_or(false);
    if padding {
        let padding = 64 - binary.len();
        format!("{:0padding$b}", value, padding = padding)
    } else {
        binary
    }
}

fn extract_bits(data: u64, shift: u8, length: u8) -> u64 {
    let mask = (1 << length) - 1;
    (data >> shift) & mask
}

#[wasm_bindgen]
pub fn parse_simpleflake(flake: u64) -> SimpleFlakeStruct {
    let timestamp = extract_bits(
        flake,
        SIMPLEFLAKE_TIMESTAMP_SHIFT,
        SIMPLEFLAKE_TIMESTAMP_LENGTH,
    ) + SIMPLEFLAKE_EPOCH as u64;

    let random_bits = extract_bits(flake, SIMPLEFLAKE_RANDOM_SHIFT, SIMPLEFLAKE_RANDOM_LENGTH);

    SimpleFlakeStruct::new(Some(timestamp), Some(random_bits))
}
