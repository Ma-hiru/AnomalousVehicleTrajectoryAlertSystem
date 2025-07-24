use crate::js::{console, window};
use wasm_bindgen::prelude::wasm_bindgen;
#[wasm_bindgen]
pub fn greet(name: &str) {
    console::log(&format!(
        "Hello, {name}. This is a message from webassembly."
    ));
    window::alert(name);
}
