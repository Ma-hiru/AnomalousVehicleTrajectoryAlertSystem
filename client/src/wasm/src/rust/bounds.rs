use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct BoundingBox {
    x: f64,      // 中心点x坐标 (0-1)
    y: f64,      // 中心点y坐标 (0-1)
    width: f64,  // 框宽 (0-1)
    height: f64, // 框高 (0-1)
}

#[wasm_bindgen]
pub struct Frame {
    width: f64,  // 实际画面宽度
    height: f64, // 实际画面高度
}

#[wasm_bindgen]
pub struct Bounding {
    bounding_box: BoundingBox,
    frame: Frame,
}

#[derive(Debug, PartialEq)]
#[wasm_bindgen]
pub struct Position {
    x: f64,
    y: f64,
}

#[derive(Debug, PartialEq)]
#[wasm_bindgen]
pub struct ReallyPosition {
    left_top: Position,
    right_bottom: Position,
}

#[derive(Debug, PartialEq)]
#[wasm_bindgen]
pub enum Original {
    LeftTop,
    LeftBottom,
    RightTop,
    RightBottom,
}

#[derive(Debug, PartialEq)]
#[wasm_bindgen]
pub struct BoundingManager {
    original: Original,
}
#[wasm_bindgen]
impl BoundingManager {
    #[wasm_bindgen]
    pub fn new(original: Original) -> BoundingManager {
        BoundingManager { original }
    }

    #[wasm_bindgen]
    pub fn calculate_really_pos(&self, bounding: Bounding) -> ReallyPosition {
        let (box_really_center, box_really_size) = Self::calculate_size(bounding);
        let (left_top, right_bottom) = self.calculate_pos(box_really_center, box_really_size);
        ReallyPosition {
            left_top,
            right_bottom,
        }
    }
    fn calculate_size(bounding: Bounding) -> ((f64, f64), (f64, f64)) {
        let box_really_center = (
            bounding.bounding_box.x * bounding.frame.width,
            bounding.bounding_box.y * bounding.frame.height,
        );
        let box_really_size = (
            bounding.bounding_box.width * bounding.frame.width,
            bounding.bounding_box.height * bounding.frame.height,
        );
        (box_really_center, box_really_size)
    }

    fn calculate_pos(
        &self,
        box_really_center: (f64, f64),
        box_really_size: (f64, f64),
    ) -> (Position, Position) {
        match self.original {
            Original::LeftTop => (
                Position {
                    x: box_really_center.0 - box_really_size.0 / 2.0,
                    y: box_really_center.1 - box_really_size.1 / 2.0,
                },
                Position {
                    x: box_really_center.0 + box_really_size.0 / 2.0,
                    y: box_really_center.1 + box_really_size.1 / 2.0,
                },
            ),
            Original::LeftBottom => (
                Position {
                    x: box_really_center.0 - box_really_size.0 / 2.0,
                    y: box_really_center.1 + box_really_size.1 / 2.0,
                },
                Position {
                    x: box_really_center.0 + box_really_size.0 / 2.0,
                    y: box_really_center.1 - box_really_size.1 / 2.0,
                },
            ),
            Original::RightTop => (
                Position {
                    x: box_really_center.0 + box_really_size.0 / 2.0,
                    y: box_really_center.1 - box_really_size.1 / 2.0,
                },
                Position {
                    x: box_really_center.0 - box_really_size.0 / 2.0,
                    y: box_really_center.1 + box_really_size.1 / 2.0,
                },
            ),
            Original::RightBottom => (
                Position {
                    x: box_really_center.0 + box_really_size.0 / 2.0,
                    y: box_really_center.1 + box_really_size.1 / 2.0,
                },
                Position {
                    x: box_really_center.0 - box_really_size.0 / 2.0,
                    y: box_really_center.1 - box_really_size.1 / 2.0,
                },
            ),
        }
    }
}
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_really_pos() {
        let bounding = Bounding {
            bounding_box: BoundingBox {
                x: 0.5,
                y: 0.5,
                width: 0.5,
                height: 0.5,
            },
            frame: Frame {
                width: 1000.0,
                height: 1000.0,
            },
        };
        let bounding_manager = BoundingManager::new(Original::RightTop);
        let res = bounding_manager.calculate_really_pos(bounding);
        assert_eq!(
            res,
            ReallyPosition {
                left_top: Position { x: 750.0, y: 250.0 },
                right_bottom: Position { x: 250.0, y: 750.0 }
            }
        );
    }
}
