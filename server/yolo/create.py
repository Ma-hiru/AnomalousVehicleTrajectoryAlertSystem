import cv2
import time
import numpy as np
import torch
import torch.nn as nn
from collections import deque, defaultdict
from scipy.optimize import linear_sum_assignment
import os
import sys
import grpc
from concurrent import futures
import yolo_pb2
import yolo_pb2_grac


class ChannelShuffle(nn.Module):
    def __init__(self, groups=2):
        super().__init__()
        self.groups = groups

    def forward(self, x):
        batch_size, num_channels, h, w = x.size()
        if num_channels % self.groups != 0:
            return x
        channels_per_group = num_channels // self.groups
        x = x.view(batch_size, self.groups, channels_per_group, h, w)
        x = x.permute(0, 2, 1, 3, 4).contiguous()
        return x.view(batch_size, num_channels, h, w)


class GSConv(nn.Module):
    def __init__(self, c1, c2, k=1, s=1, g=1, act=True):
        super().__init__()
        hidden_dim = c2 // 2
        self.conv1 = nn.Conv2d(c1, hidden_dim, k, s, k // 2, groups=g, bias=False)
        self.conv2 = nn.Conv2d(hidden_dim, hidden_dim, 5, 1, 2, groups=hidden_dim, bias=False)
        self.bn = nn.BatchNorm2d(c2)
        self.act = nn.SiLU() if act else nn.Identity()
        self.channel_shuffle = ChannelShuffle(groups=2)

    def forward(self, x):
        x = self.conv1(x)
        x = torch.cat([x, self.conv2(x)], 1)
        x = self.bn(x)
        return self.act(self.channel_shuffle(x))


class CBAM(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.channel_att = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(c, c // 8, 1),
            nn.ReLU(),
            nn.Conv2d(c // 8, c, 1),
            nn.Sigmoid()
        )
        self.spatial_att = nn.Sequential(
            nn.Conv2d(2, 1, 7, padding=3),
            nn.Sigmoid()
        )

    def forward(self, x):
        ca = self.channel_att(x)
        x = x * ca
        sa = torch.cat([torch.max(x, 1)[0].unsqueeze(1), torch.mean(x, 1).unsqueeze(1)], 1)
        return x * self.spatial_att(sa)


class C3Block(nn.Module):
    def __init__(self, c1, c2, n=1, shortcut=True):
        super().__init__()
        c_ = c2 // 2
        self.cv1 = GSConv(c1, c_, 1)
        self.cv2 = GSConv(c1, c_, 1)
        self.m = nn.Sequential(*[Bottleneck(c_, c_, shortcut) for _ in range(n)])
        self.cv3 = GSConv(2 * c_, c2)

    def forward(self, x):
        return self.cv3(torch.cat([self.m(self.cv1(x)), self.cv2(x)], 1))


class SPPF(nn.Module):
    def __init__(self, c1, c2, k=5):
        super().__init__()
        c_ = c1 // 2
        self.cv1 = GSConv(c1, c_, 1)
        self.cv2 = GSConv(c_ * 4, c2, 1)
        self.pool = nn.MaxPool2d(k, 1, k // 2)

    def forward(self, x):
        x = self.cv1(x)
        y1 = self.pool(x)
        y2 = self.pool(y1)
        return self.cv2(torch.cat([x, y1, y2, self.pool(y2)], 1))


class Bottleneck(nn.Module):
    def __init__(self, c1, c2, shortcut=True):
        super().__init__()
        self.cv = nn.Sequential(
            GSConv(c1, c2, 3),
            GSConv(c2, c2, 3)
        )
        self.add = shortcut and c1 == c2

    def forward(self, x):
        return x + self.cv(x) if self.add else self.cv(x)


class DynamicAnchorHead(nn.Module):
    def __init__(self, in_channels, num_anchors, num_classes):
        super().__init__()
        self.num_anchors = 3

        self.anchor_adjust = nn.Sequential(
            GSConv(in_channels, in_channels // 2),
            CBAM(in_channels // 2),
            nn.Conv2d(in_channels // 2, 2 * num_anchors, 1)
        )
        self.cls_head = nn.Sequential(
            GSConv(in_channels, in_channels // 2),
            nn.Conv2d(in_channels // 2, num_anchors * (5 + num_classes), 1)
        )

    def forward(self, x):
        scales = torch.sigmoid(self.anchor_adjust(x))
        cls_pred = self.cls_head(x)
        return scales, cls_pred


class EnhancedYOLOv8(nn.Module):
    def __init__(self, num_classes=80):
        super().__init__()
        self.stem = nn.Sequential(
            GSConv(3, 64, 3, 2),
            CBAM(64)
        )
        self.dark2 = nn.Sequential(
            GSConv(64, 128, 3, 2),
            CBAM(128),
            C3Block(128, 128, n=3)
        )
        self.dark3 = nn.Sequential(
            GSConv(128, 256, 3, 2),
            CBAM(256),
            C3Block(256, 256, n=6)
        )
        self.dark4 = nn.Sequential(
            GSConv(256, 512, 3, 2),
            CBAM(512),
            C3Block(512, 512, n=9)
        )
        self.dark5 = nn.Sequential(
            GSConv(512, 1024, 3, 2),
            CBAM(1024),
            C3Block(1024, 1024, n=3),
            SPPF(1024, 1024, k=5)
        )
        self.head = nn.ModuleList([
            DynamicAnchorHead(1024, 3, num_classes),
            DynamicAnchorHead(512, 3, num_classes),
            DynamicAnchorHead(256, 3, num_classes)
        ])

    def forward(self, x):
        x = self.stem(x)
        x = self.dark2(x)
        x3 = self.dark3(x)
        x4 = self.dark4(x3)
        x5 = self.dark5(x4)

        scales, cls_preds = [], []
        for i, head in enumerate(self.head):
            s, c = head([x5, x4, x3][i])
            scales.append(s)
            cls_preds.append(c)
        return scales, cls_preds


class TrafficMonitor:
    def __init__(self):
        # 为每个摄像头流维护独立的状态
        self.stream_states = defaultdict(lambda: {
            'track_history': {},
            'next_id': 0,
            'frame_width': 640,
            'frame_height': 640,
            'abnormal_behaviors': {}
        })

        # 修复sys未定义问题
        if 'DISPLAY' not in os.environ and 'WAYLAND_DISPLAY' not in os.environ:
            os.environ['QT_QPA_PLATFORM'] = 'offscreen'
            os.environ['PYOPENGL_PLATFORM'] = 'egl'

        try:
            cv2_qt_plugin_path = os.path.join(sys.prefix, "lib/python3.8/site-packages/cv2/qt/plugins")
            if os.path.exists(cv2_qt_plugin_path):
                os.environ['QT_QPA_PLATFORM_PLUGIN_PATH'] = cv2_qt_plugin_path
        except AttributeError as e:
            print(f"环境配置错误: {str(e)}")

        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = EnhancedYOLOv8(num_classes=2).to(self.device)
        self.headless_mode = 'DISPLAY' not in os.environ
        self.output_dir = "output"
        os.makedirs(self.output_dir, exist_ok=True)

        self.num_anchors = 3
        self.stride = [32, 16, 8]
        self.anchor_wh = [(116, 90), (156, 198), (373, 326)]
        self.num_classes = 2
        self._mean = torch.tensor([0.485, 0.456, 0.406], device=self.device).view(3, 1, 1)
        self._std = torch.tensor([0.229, 0.224, 0.225], device=self.device).view(3, 1, 1)

        self.max_history = 30
        self.speed_limit = 33.3
        self.abnormal_angle = 45
        self.hard_brake_accel = -9.8
        self._load_weights()

        # 异常行为到枚举值的映射
        self.behavior_enum_map = {
            "OVERSPEED": 3,
            "RETROGRADE": 1,
            "HARD_BRAKE": 2,
            "LANE_CHANGE": 4,
            "TAILGATING": 5,
            "RUN_RED_LIGHT": 6,
            "WRONG_LANE": 7,
            "INTERSECTION_BLOCK": 8,
            "FATIGUE_DRIVING": 9
        }

    def _load_weights(self):
        try:
            pretrained = torch.load('improved_yolov8.pth', map_location=self.device)
            current = self.model.state_dict()

            # 参数名称映射
            name_map = {
                'head.0.dynamic_scale.0.conv1.weight': 'head.0.anchor_adjust.0.conv1.weight',
                'head.0.dynamic_scale.0.conv2.weight': 'head.0.anchor_adjust.0.conv2.weight',
                'head.0.dynamic_scale.0.bn.weight': 'head.0.anchor_adjust.0.bn.weight',
                'head.0.dynamic_scale.0.bn.bias': 'head.0.anchor_adjust.0.bn.bias',
                'head.0.dynamic_scale.1.channel_att.1.weight': 'head.0.anchor_adjust.1.channel_att.1.weight',
                'head.0.dynamic_scale.1.channel_att.3.weight': 'head.0.anchor_adjust.1.channel_att.3.weight',
                'head.0.dynamic_scale.1.spatial_att.0.weight': 'head.0.anchor_adjust.1.spatial_att.0.weight',
                'head.0.dynamic_scale.2.weight': 'head.0.anchor_adjust.2.weight',
                'head.0.dynamic_scale.2.bias': 'head.0.anchor_adjust.2.bias',

                'head.1.dynamic_scale.0.conv1.weight': 'head.1.anchor_adjust.0.conv1.weight',
                'head.1.dynamic_scale.0.conv2.weight': 'head.1.anchor_adjust.0.conv2.weight',
                'head.1.dynamic_scale.0.bn.weight': 'head.1.anchor_adjust.0.bn.weight',
                'head.1.dynamic_scale.0.bn.bias': 'head.1.anchor_adjust.0.bn.bias',
                'head.1.dynamic_scale.1.channel_att.1.weight': 'head.1.anchor_adjust.1.channel_att.1.weight',
                'head.1.dynamic_scale.1.channel_att.3.weight': 'head.1.anchor_adjust.1.channel_att.3.weight',
                'head.1.dynamic_scale.1.spatial_att.0.weight': 'head.1.anchor_adjust.1.spatial_att.0.weight',
                'head.1.dynamic_scale.2.weight': 'head.1.anchor_adjust.2.weight',
                'head.1.dynamic_scale.2.bias': 'head.1.anchor_adjust.2.bias',

                'head.2.dynamic_scale.0.conv1.weight': 'head.2.anchor_adjust.0.conv1.weight',
                'head.2.dynamic_scale.0.conv2.weight': 'head.2.anchor_adjust.0.conv2.weight',
                'head.2.dynamic_scale.0.bn.weight': 'head.2.anchor_adjust.0.bn.weight',
                'head.2.dynamic_scale.0.bn.bias': 'head.2.anchor_adjust.0.bn.bias',
                'head.2.dynamic_scale.1.channel_att.1.weight': 'head.2.anchor_adjust.1.channel_att.1.weight',
                'head.2.dynamic_scale.1.channel_att.3.weight': 'head.2.anchor_adjust.1.channel_att.3.weight',
                'head.2.dynamic_scale.1.spatial_att.0.weight': 'head.2.anchor_adjust.1.spatial_att.0.weight',
                'head.2.dynamic_scale.2.weight': 'head.2.anchor_adjust.2.weight',
                'head.2.dynamic_scale.2.bias': 'head.2.anchor_adjust.2.bias',

                'head.0.cls_pred.0.conv1.weight': 'head.0.cls_head.0.conv1.weight',
                'head.0.cls_pred.0.conv2.weight': 'head.0.cls_head.0.conv2.weight',
                'head.0.cls_pred.0.bn.weight': 'head.0.cls_head.0.bn.weight',
                'head.0.cls_pred.0.bn.bias': 'head.0.cls_head.0.bn.bias',
                'head.0.cls_pred.1.weight': 'head.0.cls_head.1.weight',
                'head.0.cls_pred.1.bias': 'head.0.cls_head.1.bias',

                'head.1.cls_pred.0.conv1.weight': 'head.1.cls_head.0.conv1.weight',
                'head.1.cls_pred.0.conv2.weight': 'head.1.cls_head.0.conv2.weight',
                'head.1.cls_pred.0.bn.weight': 'head.1.cls_head.0.bn.weight',
                'head.1.cls_pred.0.bn.bias': 'head.1.cls_head.0.bn.bias',
                'head.1.cls_pred.1.weight': 'head.1.cls_head.1.weight',
                'head.1.cls_pred.1.bias': 'head.1.cls_head.1.bias',

                'head.2.cls_pred.0.conv1.weight': 'head.2.cls_head.0.conv1.weight',
                'head.2.cls_pred.0.conv2.weight': 'head.2.cls_head.0.conv2.weight',
                'head.2.cls_pred.0.bn.weight': 'head.2.cls_head.0.bn.weight',
                'head.2.cls_pred.0.bn.bias': 'head.2.cls_head.0.bn.bias',
                'head.2.cls_pred.1.weight': 'head.2.cls_head.1.weight',
                'head.2.cls_pred.1.bias': 'head.2.cls_head.1.bias',

                'head.0.fusion.0.conv1.weight': 'head.0.c2f_block.0.conv1.weight',
                'head.0.fusion.0.conv2.weight': 'head.0.c2f_block.0.conv2.weight',
                'head.0.fusion.0.bn.weight': 'head.0.c2f_block.0.bn.weight',
                'head.0.fusion.0.bn.bias': 'head.0.c2f_block.0.bn.bias',
                'head.0.fusion.1.0.cv1.weight': 'head.0.c2f_block.1.m.0.cv1.weight',
                'head.0.fusion.1.0.cv2.weight': 'head.0.c2f_block.1.m.0.cv2.weight',
                'head.0.fusion.1.0.bn.weight': 'head.0.c2f_block.1.m.0.bn.weight',
                'head.0.fusion.1.0.bn.bias': 'head.0.c2f_block.1.m.0.bn.bias',

                'head.1.fusion.0.conv1.weight': 'head.1.c2f_block.0.conv1.weight',
                'head.1.fusion.0.conv2.weight': 'head.1.c2f_block.0.conv2.weight',
                'head.1.fusion.0.bn.weight': 'head.1.c2f_block.0.bn.weight',
                'head.1.fusion.0.bn.bias': 'head.1.c2f_block.0.bn.bias',
                'head.1.fusion.1.0.cv1.weight': 'head.1.c2f_block.1.m.0.cv1.weight',
                'head.1.fusion.1.0.cv2.weight': 'head.1.c2f_block.1.m.0.cv2.weight',
                'head.1.fusion.1.0.bn.weight': 'head.1.c2f_block.1.m.0.bn.weight',
                'head.1.fusion.1.0.bn.bias': 'head.1.c2f_block.1.m.0.bn.bias',

                'head.2.fusion.0.conv1.weight': 'head.2.c2f_block.0.conv1.weight',
                'head.2.fusion.0.conv2.weight': 'head.2.c2f_block.0.conv2.weight',
                'head.2.fusion.0.bn.weight': 'head.2.c2f_block.0.bn.weight',
                'head.2.fusion.0.bn.bias': 'head.2.c2f_block.0.bn.bias',
                'head.2.fusion.1.0.cv1.weight': 'head.2.c2f_block.1.m.0.cv1.weight',
                'head.2.fusion.1.0.cv2.weight': 'head.2.c2f_block.1.m.0.cv2.weight',
                'head.2.fusion.1.0.bn.weight': 'head.2.c2f_block.1.m.0.bn.weight',
                'head.2.fusion.1.0.bn.bias': 'head.2.c2f_block.1.m.0.bn.bias',

                'head.0.fusion.concat.weight': 'head.0.c2f_block.2.weight',
                'head.1.fusion.concat.weight': 'head.1.c2f_block.2.weight',
                'head.2.fusion.concat.weight': 'head.2.c2f_block.2.weight'
            }
            matched = {}
            for pt_name, pt_tensor in pretrained.items():
                if pt_name in name_map:
                    curr_name = name_map[pt_name]
                    if current[curr_name].shape == pt_tensor.shape:
                        matched[curr_name] = pt_tensor

            self.model.load_state_dict(matched, strict=False)
            print('成功加载预训练权重')
        except Exception as e:
            print(f'权重加载失败: {str(e)}')
            self._initialize_weights()

    def _initialize_weights(self):
        for m in self.model.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)

    def preprocess(self, frame):
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        tensor = torch.from_numpy(frame).permute(2, 0, 1).float() / 255.0
        tensor = (tensor.to(self.device) - self._mean) / self._std
        return tensor.unsqueeze(0)

    def decode_predictions(self, scales_list, cls_list):
        boxes, scores, class_ids = [], [], []

        for scale_idx in range(3):
            stride = self.stride[scale_idx]
            anchor_w, anchor_h = self.anchor_wh[scale_idx]

            scales = scales_list[scale_idx]
            cls_pred = cls_list[scale_idx]

            B, _, H, W = scales.shape
            scales = scales.view(B, self.num_anchors, 2, H, W).permute(0, 3, 4, 1, 2)
            cls_pred = cls_pred.view(B, self.num_anchors, 5 + self.num_classes, H, W).permute(0, 3, 4, 1, 2)

            grid_y, grid_x = torch.meshgrid(
                torch.arange(H, device=self.device),
                torch.arange(W, device=self.device),
                indexing='ij'
            )

            for b in range(B):
                for h in range(H):
                    for w in range(W):
                        for a in range(self.num_anchors):
                            scale_w = scales[b, h, w, a, 0] * stride
                            scale_h = scales[b, h, w, a, 1] * stride

                            x_center = (w + 0.5) * stride
                            y_center = (h + 0.5) * stride

                            width = scale_w * anchor_w
                            height = scale_h * anchor_h

                            x1 = x_center - width / 2
                            y1 = y_center - height / 2
                            x2 = x_center + width / 2
                            y2 = y_center + height / 2

                            obj_score = torch.sigmoid(cls_pred[b, h, w, a, 0])
                            cls_scores = torch.sigmoid(cls_pred[b, h, w, a, 5:5 + self.num_classes])

                            if obj_score > 0.5:
                                boxes.append([x1, y1, x2, y2])
                                scores.append(obj_score.item())
                                class_ids.append(torch.argmax(cls_scores).item())
        return boxes, scores, class_ids

    def process_frame(self, stream_id, frame, timestamp_ms):
        """处理单帧图像，返回检测结果"""
        # 获取当前流的跟踪状态
        state = self.stream_states[stream_id]

        # 获取原始图像尺寸
        h_orig, w_orig = frame.shape[:2]
        state['frame_height'], state['frame_width'] = h_orig, w_orig

        # 调整帧尺寸并保持比例
        processed_frame, (scale, top, left) = self._resize_with_padding(frame, return_padding=True)

        # 预处理
        tensor = self.preprocess(processed_frame)

        # 推理
        with torch.no_grad():
            scales_list, cls_list = self.model(tensor)

        # 解码
        boxes, scores, class_ids = self.decode_predictions(scales_list, cls_list)

        # 转换边界框到原始图像坐标
        orig_boxes = []
        for box in boxes:
            x1, y1, x2, y2 = box
            # 减去填充并除以缩放因子
            x1 = max(0, (x1 - left) / scale)
            x2 = max(0, (x2 - left) / scale)
            y1 = max(0, (y1 - top) / scale)
            y2 = max(0, (y2 - top) / scale)
            orig_boxes.append([x1, y1, x2, y2])

        # 归一化边界框
        normalized_boxes = []
        for box in orig_boxes:
            x1, y1, x2, y2 = box
            x_center = ((x1 + x2) / 2) / w_orig
            y_center = ((y1 + y2) / 2) / h_orig
            width = (x2 - x1) / w_orig
            height = (y2 - y1) / h_orig
            normalized_boxes.append([x_center, y_center, width, height])

        # 更新跟踪
        track_ids = self.update_tracks(stream_id, orig_boxes, scores, timestamp_ms)

        # 检测异常行为
        for tid in state['track_history']:
            if behavior := self.detect_abnormal_behavior(stream_id, tid):
                state['abnormal_behaviors'][tid] = behavior

        # 准备检测结果
        detections = []
        for i in range(len(normalized_boxes)):
            tid = track_ids[i]
            behavior_enum = 0  # 默认正常
            if tid in state['abnormal_behaviors']:
                behavior_str = state['abnormal_behaviors'][tid]
                behavior_enum = self.behavior_enum_map.get(behavior_str, 0)

            detections.append({
                'track_id': str(tid),
                'bbox': normalized_boxes[i],
                'confidence': scores[i],
                'behavior': behavior_enum
            })

        return detections

    def _resize_with_padding(self, frame, return_padding=False):
        """保持长宽比的缩放，返回填充信息"""
        h, w = frame.shape[:2]
        scale = min(640 / w, 640 / h)
        new_w, new_h = int(w * scale), int(h * scale)
        resized = cv2.resize(frame, (new_w, new_h))

        # 添加黑边填充
        delta_w = 640 - new_w
        delta_h = 640 - new_h
        top, bottom = delta_h // 2, delta_h - delta_h // 2
        left, right = delta_w // 2, delta_w - delta_w // 2

        padded = cv2.copyMakeBorder(resized, top, bottom, left, right, cv2.BORDER_CONSTANT)

        if return_padding:
            return padded, (scale, top, left)
        return padded

    def update_tracks(self, stream_id, boxes, scores, timestamp_ms):
        """增强版多目标跟踪，返回每个检测框的跟踪ID"""
        state = self.stream_states[stream_id]
        current_time = timestamp_ms

        # 准备有效检测
        valid_detections = []
        for (x1, y1, x2, y2), score in zip(boxes, scores):
            if score >= 0.5:  # 置信度阈值
                cx = (x1 + x2) / 2
                cy = (y1 + y2) / 2
                width = x2 - x1
                height = y2 - y1
                valid_detections.append((cx, cy, width, height))

        # 初始化新轨迹
        track_ids = [-1] * len(valid_detections)  # -1表示未分配ID

        if not state['track_history']:
            for i, det in enumerate(valid_detections):
                tid = state['next_id']
                state['track_history'][tid] = deque([(*det[:2], current_time)], maxlen=self.max_history)
                track_ids[i] = tid
                state['next_id'] += 1
            return track_ids

        # 匈牙利算法匹配
        cost_matrix = np.zeros((len(state['track_history']), len(valid_detections)))
        track_keys = list(state['track_history'].keys())

        for i, tid in enumerate(track_keys):
            last_pos = state['track_history'][tid][-1]
            last_cx, last_cy, _ = last_pos
            last_box = (last_cx, last_cy, 0, 0)  # 使用中心点进行匹配

            for j, det in enumerate(valid_detections):
                det_box = (det[0], det[1], 0, 0)
                cost_matrix[i, j] = 1 - self._calculate_iou(last_box, det_box)

        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        # 处理匹配结果
        matched_detections = set()
        for i, j in zip(row_ind, col_ind):
            if cost_matrix[i, j] < 0.5:  # IoU阈值
                tid = track_keys[i]
                state['track_history'][tid].append((valid_detections[j][0], valid_detections[j][1], current_time))
                track_ids[j] = tid
                matched_detections.add(j)

        # 处理未匹配项
        for j in range(len(valid_detections)):
            if j not in matched_detections:
                tid = state['next_id']
                state['track_history'][tid] = deque([(valid_detections[j][0], valid_detections[j][1], current_time)],
                                                    maxlen=self.max_history)
                track_ids[j] = tid
                state['next_id'] += 1

        # 清理旧轨迹
        self._cleanup_lost_tracks(stream_id, current_time)

        return track_ids

    def _cleanup_lost_tracks(self, stream_id, current_time, max_age=3000):
        """清理丢失轨迹"""
        state = self.stream_states[stream_id]
        to_remove = []
        for tid, history in state['track_history'].items():
            if not history:
                continue
            last_time = history[-1][2]
            if (current_time - last_time) > max_age:
                to_remove.append(tid)

        for tid in to_remove:
            del state['track_history'][tid]
            if tid in state['abnormal_behaviors']:
                del state['abnormal_behaviors'][tid]

    def _calculate_iou(self, box1, box2):
        """计算IOU"""
        box1 = self._to_xyxy(box1)
        box2 = self._to_xyxy(box2)

        inter = (
            max(box1[0], box2[0]),
            max(box1[1], box2[1]),
            min(box1[2], box2[2]),
            min(box1[3], box2[3])
        )

        if inter[2] < inter[0] or inter[3] < inter[1]:
            return 0.0

        area_inter = (inter[2] - inter[0]) * (inter[3] - inter[1])
        area_total = self._box_area(box1) + self._box_area(box2) - area_inter
        return area_inter / (area_total + 1e-6)

    def _to_xyxy(self, box):
        """将中心点坐标转换为边界框坐标"""
        cx, cy, w, h = box
        w = max(w, 1)
        h = max(h, 1)
        x1 = max(0, cx - w / 2)
        y1 = max(0, cy - h / 2)
        x2 = min(self.stream_states['current_frame_width'], cx + w / 2)
        y2 = min(self.stream_states['current_frame_height'], cy + h / 2)
        return (x1, y1, x2, y2)

    def _box_area(self, box):
        """计算边界框面积"""
        return (box[2] - box[0]) * (box[3] - box[1])

    def detect_abnormal_behavior(self, stream_id, track_id):
        """改进版异常行为检测（含轨迹校验和时间差处理）"""
        state = self.stream_states[stream_id]
        history = state['track_history'].get(track_id)

        # 轨迹有效性校验
        if not history or len(history) < 5:
            return None

        try:
            # 时间差计算（毫秒转秒）
            time_diff = (history[-1][2] - history[-5][2])
            if time_diff <= 0:  # 异常时间差过滤
                return None

            dt = time_diff / 1000.0  # 转换为秒

            # 计算位移
            dx = history[-1][0] - history[-5][0]
            dy = history[-1][1] - history[-5][1]

            # 添加运动方向处理（处理零位移）
            if dx == 0 and dy == 0:
                return None

            # 速度计算（像素/秒）
            speed = np.sqrt(dx ** 2 + dy ** 2) / dt

            # 方向计算（角度规范化处理）
            direction = np.degrees(np.arctan2(dy, dx)) % 360

            # 异常判断（多条件分离处理）
            if speed > self.speed_limit:
                return "OVERSPEED"
            elif abs(direction - 180) < self.abnormal_angle:
                return "RETROGRADE"
            elif speed < 5 and abs(direction) > 160:  # 急刹模拟
                return "HARD_BRAKE"

        except (IndexError, ValueError) as e:
            print(f"轨迹分析异常：{str(e)}")

        return None


# gRPC 服务实现
class YoloServicer(yolo_pb2_grac.YoloServiceServicer):
    def __init__(self):
        self.monitor = TrafficMonitor()
        self.frame_count = 0

    def DetectSingle(self, request, context):
        # 记录开始处理时间
        start_time = time.time()

        # 将二进制数据转换为图像
        nparr = np.frombuffer(request.data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            print(f"错误: 无法解码图像数据 (流ID: {request.id})")
            return yolo_pb2.DetectionResult()

        # 转换时间戳为毫秒
        timestamp_ms = request.timestamp * 1000.0

        # 处理帧
        detections = self.monitor.process_frame(
            request.id,
            frame,
            timestamp_ms
        )

        # 构建响应
        result = yolo_pb2.DetectionResult()
        for det in detections:
            d = result.detections.add()
            d.car_id = det['track_id']
            d.confidence = det['confidence']
            d.behavior = det['behavior']

            bbox = det['bbox']
            d.bbox.x_center = bbox[0]
            d.bbox.y_center = bbox[1]
            d.bbox.width = bbox[2]
            d.bbox.height = bbox[3]

        # 更新帧计数
        self.frame_count += 1

        # 计算处理时间
        process_time = (time.time() - start_time) * 1000
        print(f"处理帧 {self.frame_count} (流ID: {request.id}, 索引: {request.index}) - "
              f"检测到 {len(detections)} 个目标 - "
              f"耗时: {process_time:.2f}ms")

        return result


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    yolo_pb2_grac.add_YoloServiceServicer_to_server(YoloServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("gRPC 服务已启动，监听端口 50051...")
    server.wait_for_termination()


if __name__ == "__main__":
    # 启动gRPC服务
    serve()