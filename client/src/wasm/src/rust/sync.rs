use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SyncManager {
    threshold: f64,
    max_time_can_ignore: f64,
    running_buffer_time: f64,
}

#[wasm_bindgen]
impl SyncManager {
    #[wasm_bindgen(constructor)]
    pub fn new(threshold: f64, max_time_can_ignore: f64, running_buffer_time: f64) -> SyncManager {
        SyncManager {
            threshold,
            max_time_can_ignore,
            running_buffer_time,
        }
    }
    #[wasm_bindgen]
    pub fn calculate_taget_time(
        &self,
        frame_timestamp: f64,
        current_time: f64,
        buffer_time: f64,
    ) -> Option<f64> {
        //最有可能的情况 延迟过大 放弃同步
        let frame_diff_time = buffer_time - frame_timestamp;
        if frame_diff_time > self.max_time_can_ignore {
            return None;
        }
        //normal case: frame_timestamp << current_time <= buffer_time
        if current_time >= buffer_time || frame_timestamp >= buffer_time {
            return Some(buffer_time);
        }
        let buffer_diff_time = buffer_time - current_time;
        //确保缓存时间维持在一定大小 不能无限增长
        if buffer_diff_time > self.max_time_can_ignore {
            let target = buffer_time - self.max_time_can_ignore + self.running_buffer_time;
            return Some(target);
        }
        let play_diff_time = current_time - frame_timestamp;
        if play_diff_time.abs() > self.threshold {
            let target;
            if play_diff_time >= 0.0 {
                target = frame_timestamp + self.running_buffer_time;
            } else {
                target = current_time + self.running_buffer_time;
            }
            return Some(target);
        }
        None
    }
}
