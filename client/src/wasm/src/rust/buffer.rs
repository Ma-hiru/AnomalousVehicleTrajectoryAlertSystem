use js_sys::Uint8Array;
use std::collections::VecDeque;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct BufferManager {
    queue: VecDeque<Vec<u8>>,
    max_queue_length: usize,
}
#[wasm_bindgen]
impl BufferManager {
    fn is_overflow(&self) -> bool {
        self.queue.len() > self.max_queue_length
    }
    fn remove_overflow(&mut self) {
        let remove_count = self.queue.len() - self.max_queue_length;
        for _ in 0..remove_count {
            self.queue.pop_front();
        }
    }
    #[wasm_bindgen(constructor)]
    pub fn new(max_queue_length: usize) -> BufferManager {
        BufferManager {
            max_queue_length,
            queue: VecDeque::new(),
        }
    }
    #[wasm_bindgen]
    pub fn push_packet(&mut self, data: &[u8]) {
        if self.is_overflow() {
            self.remove_overflow();
        }
        self.queue.push_back(data.to_vec());
    }
    #[wasm_bindgen]
    pub fn pop_packet(&mut self) -> Option<Uint8Array> {
        if self.queue.len() > 0 {
            return self
                .queue
                .pop_front()
                .map(|data| Uint8Array::from(data.as_slice()));
        }
        None
    }
    #[wasm_bindgen]
    pub fn unshift_packet(&mut self, data: &[u8]) {
        if !self.is_overflow() {
            self.queue.push_front(data.to_vec());
        }
    }
    #[wasm_bindgen]
    pub fn is_ready(&self) -> bool {
        self.queue.len() > 0
    }
    #[wasm_bindgen]
    pub fn clear(&mut self) {
        self.queue.clear()
    }
}
