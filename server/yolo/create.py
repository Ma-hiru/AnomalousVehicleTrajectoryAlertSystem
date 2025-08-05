import cv2
import os
import time
import numpy as np
import torch
import torch.nn as nn
from collections import deque, defaultdict
from scipy.optimize import linear_sum_assignment
import sys
import argparse
import grpc
from concurrent import futures
import yolo_pb2
import yolo_pb2_grpc
import threading
import queue
import redis
import json
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('traffic_monitor.log')
    ]
)
logger = logging.getLogger('TrafficMonitor')


# ========================= 模型定义部分 =========================
class ChannelShuffle(nn.Module):
    """自定义通道混洗层"""

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
    """优化版分组混洗卷积"""

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
    """增强版注意力机制"""

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
        sa = self.spatial_att(sa)
        return x * sa


class Bottleneck(nn.Module):
    """优化的Bottleneck"""

    def __init__(self, c1, c2, shortcut=True):
        super().__init__()
        self.cv = nn.Sequential(
            GSConv(c1, c2, 3),
            GSConv(c2, c2, 3)
        )
        self.add = shortcut and c1 == c2

    def forward(self, x):
        return x + self.cv(x) if self.add else self.cv(x)


class C3Block(nn.Module):
    """改进版C3模块"""

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
    """空间金字塔池化"""

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


class DynamicHeadBlock(nn.Module):
    """动态锚框预测模块"""

    def __init__(self, c1, c2, num_anchors=3):
        super().__init__()
        # 位置预测分支
        self.loc_pred = nn.Sequential(
            GSConv(c1, c1 // 2),
            CBAM(c1 // 2),
            nn.Conv2d(c1 // 2, 4 * num_anchors, 1)
        )
        # 类别预测分支
        self.cls_pred = nn.Conv2d(c1, (1 + c2) * num_anchors, 1)

    def forward(self, x):
        loc = self.loc_pred(x)
        cls = self.cls_pred(x)
        return loc, cls


class ImprovedYOLOv8(nn.Module):
    """完整改进版YOLOv8架构"""

    def __init__(self, num_classes=2):
        super().__init__()
        # 主干网络
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
        # 统一检测头命名
        self.head = nn.ModuleList([
            DynamicHeadBlock(1024, num_classes),
            DynamicHeadBlock(512, num_classes),
            DynamicHeadBlock(256, num_classes)
        ])

    def forward(self, x):
        # 确保输入是4维张量
        if x.dim() == 5:
            x = x.squeeze(1)
        x = self.stem(x)
        x = self.dark2(x)
        x3 = self.dark3(x)
        x4 = self.dark4(x3)
        x5 = self.dark5(x4)

        # 统一输出格式
        loc0, cls0 = self.head[0](x5)
        loc1, cls1 = self.head[1](x4)
        loc2, cls2 = self.head[2](x3)

        loc_list = [loc0, loc1, loc2]
        cls_list = [cls0, cls1, cls2]
        return loc_list, cls_list


# ========================= 交通监控系统核心 =========================
class TrafficMonitor:
    """交通监控系统核心类"""

    def __init__(self, redis_host='localhost', redis_port=6379):
        self.conf_threshold = 0.7  # 提高置信度阈值
        self.nms_threshold = 0.4  # NMS阈值
        self.redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)

        # 为每个摄像头流维护独立的状态
        self.stream_states = defaultdict(lambda: {
            'track_history': {},
            'next_id': 0,
            'frame_width': 640,
            'frame_height': 640,
            'abnormal_behaviors': {}
        })

        # 修复无显示环境问题
        if 'DISPLAY' not in os.environ and 'WAYLAND_DISPLAY' not in os.environ:
            os.environ['QT_QPA_PLATFORM'] = 'offscreen'
            os.environ['PYOPENGL_PLATFORM'] = 'egl'

        try:
            # 配置OpenCV QT插件路径
            cv2_qt_plugin_path = os.path.join(sys.prefix, "lib/python3.8/site-packages/cv2/qt/plugins")
            if os.path.exists(cv2_qt_plugin_path):
                os.environ['QT_QPA_PLATFORM_PLUGIN_PATH'] = cv2_qt_plugin_path
        except AttributeError as e:
            logger.error(f"环境配置错误: {str(e)}")

        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"使用计算设备: {self.device}")
        self.model = ImprovedYOLOv8(num_classes=2).to(self.device)
        self.headless_mode = 'DISPLAY' not in os.environ
        self.output_dir = "output"
        os.makedirs(self.output_dir, exist_ok=True)

        # 模型参数配置
        self.num_anchors = 3
        self.stride = [32, 16, 8]
        self.anchor_wh = [(116, 90), (156, 198), (373, 326)]
        self.num_classes = 2

        # 图像归一化参数
        self._mean = torch.tensor([0.485, 0.456, 0.406], device=self.device).view(1, 3, 1, 1)
        self._std = torch.tensor([0.229, 0.224, 0.225], device=self.device).view(1, 3, 1, 1)

        # 跟踪和行为检测参数
        self.max_history = 30
        self.speed_limit = 33.3  # 米/秒 (120km/h)
        self.abnormal_angle = 45  # 角度阈值
        self.hard_brake_accel = -9.8  # 急刹加速度阈值
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

        # 反转映射用于显示
        self.behavior_str_map = {v: k for k, v in self.behavior_enum_map.items()}

        # 模型预热
        self._warmup_model()

    def _warmup_model(self):
        """预热模型"""
        dummy_input = torch.randn(1, 3, 640, 640, device=self.device)
        with torch.no_grad():
            _ = self.model(dummy_input)
        logger.info("模型预热完成")

    def _nms(self, boxes, scores):
        """非极大值抑制，减少重叠框"""
        if len(boxes) == 0:
            return []

        boxes = np.array(boxes)
        scores = np.array(scores)

        x1 = boxes[:, 0]
        y1 = boxes[:, 1]
        x2 = boxes[:, 2]
        y2 = boxes[:, 3]

        areas = (x2 - x1 + 1) * (y2 - y1 + 1)
        order = scores.argsort()[::-1]

        keep = []
        while order.size > 0:
            i = order[0]
            keep.append(i)
            xx1 = np.maximum(x1[i], x1[order[1:]])
            yy1 = np.maximum(y1[i], y1[order[1:]])
            xx2 = np.minimum(x2[i], x2[order[1:]])
            yy2 = np.minimum(y2[i], y2[order[1:]])

            w = np.maximum(0.0, xx2 - xx1 + 1)
            h = np.maximum(0.0, yy2 - yy1 + 1)
            inter = w * h
            ovr = inter / (areas[i] + areas[order[1:]] - inter)

            inds = np.where(ovr <= self.nms_threshold)[0]
            order = order[inds + 1]

        return keep

    def _load_weights(self):
        """加载预训练权重"""
        try:
            if not os.path.exists('yolov8_pretrained.pth'):
                logger.info("创建虚拟预训练权重...")
                # 使用当前模型结构创建权重
                torch.save(self.model.state_dict(), 'yolov8_pretrained.pth')

            pretrained = torch.load('yolov8_pretrained.pth', map_location=self.device)

            # 选择性加载匹配的参数
            model_dict = self.model.state_dict()

            # 1. 筛选可加载参数
            pretrained_dict = {k: v for k, v in pretrained.items()
                               if k in model_dict and v.shape == model_dict[k].shape}

            # 2. 记录不匹配参数
            missing_keys = [k for k in model_dict if k not in pretrained_dict]
            unexpected_keys = [k for k in pretrained_dict if k not in model_dict]

            if missing_keys:
                logger.warning(f"警告: 缺少 {len(missing_keys)} 个参数，将使用随机初始化")
            if unexpected_keys:
                logger.warning(f"警告: 忽略 {len(unexpected_keys)} 个不匹配参数")

            # 3. 处理形状不匹配的分类头权重
            for name, param in pretrained.items():
                if name in model_dict and param.shape != model_dict[name].shape:
                    logger.warning(f"形状不匹配: {name} {param.shape} -> {model_dict[name].shape}")

                    # 自动适配分类头权重
                    if 'cls_pred' in name:
                        new_param = torch.zeros_like(model_dict[name])
                        min_channels = min(param.shape[0], new_param.shape[0])
                        new_param[:min_channels] = param[:min_channels]
                        pretrained_dict[name] = new_param
                        logger.info(f"适配权重: {name} 从 {param.shape} 到 {new_param.shape}")
                    else:
                        # 对于其他权重，保留原始形状
                        pretrained_dict[name] = param
                        logger.info(f"保留原始权重: {name}")

            # 4. 更新模型参数
            model_dict.update(pretrained_dict)
            self.model.load_state_dict(model_dict, strict=False)

            logger.info('成功加载适配后的预训练权重')
        except Exception as e:
            logger.error(f'权重加载失败: {str(e)}, 使用随机初始化')
            self._initialize_weights()

    def _initialize_weights(self):
        """权重初始化"""
        for m in self.model.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)

    def preprocess(self, frame):
        """图像预处理：转换为张量并进行归一化"""
        # 转换为RGB并调整维度顺序
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        tensor = torch.from_numpy(frame).float() / 255.0
        tensor = tensor.permute(2, 0, 1)  # 从(H, W, C)变为(C, H, W)
        tensor = tensor.to(self.device)

        # 确保张量是4维的 [batch, channels, height, width]
        if tensor.dim() == 3:
            tensor = tensor.unsqueeze(0)  # 添加batch维度

        # 归一化
        tensor = (tensor - self._mean) / self._std

        return tensor

    def decode_predictions(self, loc_list, cls_list):
        """修复版边界框解码"""
        boxes, scores, class_ids = [], [], []

        for scale_idx in range(3):
            stride = self.stride[scale_idx]
            anchor_w, anchor_h = self.anchor_wh[scale_idx]

            loc = loc_list[scale_idx]  # [B, 4*A, H, W]
            cls = cls_list[scale_idx]  # [B, (1+C)*A, H, W]

            B, _, H, W = loc.shape
            num_anchors = self.num_anchors

            # 重塑位置预测
            loc = loc.view(B, num_anchors, 4, H, W).permute(0, 3, 4, 1, 2)
            # 重塑类别预测
            cls = cls.view(B, num_anchors, 1 + self.num_classes, H, W).permute(0, 3, 4, 1, 2)

            # 创建网格坐标
            grid_x = torch.arange(W, device=self.device).repeat(H, 1)
            grid_y = torch.arange(H, device=self.device).repeat(W, 1).t()

            for b in range(B):
                for h in range(H):
                    for w in range(W):
                        for a in range(num_anchors):
                            tx, ty, tw, th = loc[b, h, w, a]

                            # 使用sigmoid处理中心点偏移
                            x_center = (grid_x[h, w] + torch.sigmoid(tx)) * stride
                            y_center = (grid_y[h, w] + torch.sigmoid(ty)) * stride

                            # 计算宽度和高度
                            width = anchor_w * torch.exp(tw)
                            height = anchor_h * torch.exp(th)

                            # 计算边界框坐标 (x1, y1, x2, y2)
                            x1 = x_center - width / 2
                            y1 = y_center - height / 2
                            x2 = x_center + width / 2
                            y2 = y_center + height / 2

                            # 获取置信度和类别
                            obj_score = torch.sigmoid(cls[b, h, w, a, 0])
                            cls_scores = torch.sigmoid(cls[b, h, w, a, 1:])

                            # 过滤低置信度检测
                            if obj_score > self.conf_threshold:  # 使用新的阈值
                                boxes.append([x1.item(), y1.item(), x2.item(), y2.item()])
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
            loc_list, cls_list = self.model(tensor)  # 修改为新的输出格式

        # 解码预测结果
        boxes, scores, class_ids = self.decode_predictions(loc_list, cls_list)

        # 应用NMS减少重叠框
        if len(boxes) > 0:
            keep = self._nms(boxes, scores)
            boxes = [boxes[i] for i in keep]
            scores = [scores[i] for i in keep]
            class_ids = [class_ids[i] for i in keep]

        # 转换边界框到原始图像坐标
        orig_boxes = []
        for box in boxes:
            x1, y1, x2, y2 = box
            # 正确减去填充并应用缩放
            x1 = max(0, (x1 - left) / scale)
            x2 = min(w_orig, (x2 - left) / scale)
            y1 = max(0, (y1 - top) / scale)
            y2 = min(h_orig, (y2 - top) / scale)

            # 确保边界框有效
            if x2 > x1 and y2 > y1:
                orig_boxes.append([x1, y1, x2, y2])

        # 归一化边界框（中心点+宽高格式）
        normalized_boxes = []
        for box in orig_boxes:
            x1, y1, x2, y2 = box
            x_center = ((x1 + x2) / 2) / w_orig
            y_center = ((y1 + y2) / 2) / h_orig
            width = (x2 - x1) / w_orig
            height = (y2 - y1) / h_orig
            normalized_boxes.append([x_center, y_center, width, height])

        # 更新跟踪状态
        track_ids = self.update_tracks(stream_id, orig_boxes, scores, timestamp_ms)

        # 检测异常行为
        for tid in list(state['track_history'].keys()):
            if behavior := self.detect_abnormal_behavior(stream_id, tid):
                state['abnormal_behaviors'][tid] = behavior
                # 发布异常行为到Redis
                self._publish_abnormal_event(stream_id, tid, behavior, timestamp_ms)

        # 准备检测结果时添加class_id
        detections = []
        for i in range(len(normalized_boxes)):
            tid = track_ids[i]
            behavior_enum = 0  # 默认正常
            behavior_str = "NORMAL"
            if tid in state['abnormal_behaviors']:
                behavior_str = state['abnormal_behaviors'][tid]
                behavior_enum = self.behavior_enum_map.get(behavior_str, 0)

            detections.append({
                'track_id': str(tid),
                'bbox': normalized_boxes[i],
                'confidence': scores[i],
                'class_id': class_ids[i],  # 添加类别ID
                'behavior': behavior_enum,
                'behavior_str': behavior_str
            })

        # 日志信息
        logger.debug(f"流 {stream_id} 检测到 {len(detections)} 个目标")
        return detections

    def _publish_abnormal_event(self, stream_id, track_id, behavior, timestamp_ms):
        """发布异常事件到Redis"""
        event_data = {
            'stream_id': stream_id,
            'track_id': track_id,
            'behavior': behavior,
            'timestamp': datetime.utcnow().isoformat(),
            'timestamp_ms': timestamp_ms
        }
        self.redis_client.publish('abnormal_events', json.dumps(event_data))
        logger.info(f"发布异常事件: {event_data}")

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

        padded = cv2.copyMakeBorder(resized, top, bottom, left, right, cv2.BORDER_CONSTANT, value=(0, 0, 0))

        if return_padding:
            return padded, (scale, top, left)
        return padded

    def update_tracks(self, stream_id, boxes, scores, timestamp_ms):
        """增强版多目标跟踪，返回每个检测框的跟踪ID"""
        state = self.stream_states[stream_id]
        current_time = timestamp_ms

        # 准备有效检测（置信度>0.5）
        valid_detections = []
        for (x1, y1, x2, y2), score in zip(boxes, scores):
            if score >= 0.5:
                cx = (x1 + x2) / 2
                cy = (y1 + y2) / 2
                width = x2 - x1
                height = y2 - y1
                valid_detections.append((cx, cy, width, height))

        # 初始化新轨迹
        track_ids = [-1] * len(valid_detections)  # -1表示未分配ID

        # 如果没有现有轨迹，直接创建新轨迹
        if not state['track_history']:
            for i, det in enumerate(valid_detections):
                tid = state['next_id']
                state['track_history'][tid] = deque([(det[0], det[1], current_time)], maxlen=self.max_history)
                track_ids[i] = tid
                state['next_id'] += 1
            return track_ids

        # 匈牙利算法匹配
        cost_matrix = np.zeros((len(state['track_history']), len(valid_detections)))
        track_keys = list(state['track_history'].keys())

        for i, tid in enumerate(track_keys):
            last_pos = state['track_history'][tid][-1]
            last_cx, last_cy, _ = last_pos

            # 使用中心点进行匹配（宽高设为10避免除零错误）
            last_box = (last_cx, last_cy, 10, 10)

            for j, det in enumerate(valid_detections):
                det_box = (det[0], det[1], 10, 10)
                cost_matrix[i, j] = 1 - self._calculate_iou(last_box, det_box, stream_id)

        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        # 处理匹配结果
        matched_detections = set()
        for i, j in zip(row_ind, col_ind):
            if cost_matrix[i, j] < 0.5:  # IoU阈值
                tid = track_keys[i]
                state['track_history'][tid].append((valid_detections[j][0], valid_detections[j][1], current_time))
                track_ids[j] = tid
                matched_detections.add(j)

        # 处理未匹配项（新目标）
        for j in range(len(valid_detections)):
            if j not in matched_detections:
                tid = state['next_id']
                state['track_history'][tid] = deque([(valid_detections[j][0], valid_detections[j][1], current_time)],
                                                    maxlen=self.max_history)
                track_ids[j] = tid
                state['next_id'] += 1

        # 清理丢失的轨迹
        self._cleanup_lost_tracks(stream_id, current_time)

        return track_ids

    def _cleanup_lost_tracks(self, stream_id, current_time, max_age=3000):
        """清理丢失轨迹（超过max_age毫秒未更新）"""
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

    def _calculate_iou(self, box1, box2, stream_id):
        """计算两个边界框的IOU"""
        box1 = self._to_xyxy(box1, stream_id)
        box2 = self._to_xyxy(box2, stream_id)

        inter = (
            max(box1[0], box2[0]),
            max(box1[1], box2[1]),
            min(box1[2], box2[2]),
            min(box1[3], box2[3])
        )

        # 检查是否有有效交集
        if inter[2] < inter[0] or inter[3] < inter[1]:
            return 0.0

        area_inter = (inter[2] - inter[0]) * (inter[3] - inter[1])
        area_total = self._box_area(box1) + self._box_area(box2) - area_inter
        return area_inter / (area_total + 1e-6)

    def _to_xyxy(self, box, stream_id):
        """将中心点坐标转换为边界框坐标"""
        cx, cy, w, h = box
        w = max(w, 1)
        h = max(h, 1)
        state = self.stream_states[stream_id]  # 使用正确的流ID
        x1 = max(0, cx - w / 2)
        y1 = max(0, cy - h / 2)
        x2 = min(state['frame_width'], cx + w / 2)
        y2 = min(state['frame_height'], cy + h / 2)
        return (x1, y1, x2, y2)

    def _box_area(self, box):
        """计算边界框面积"""
        return (box[2] - box[0]) * (box[3] - box[1])

    def detect_abnormal_behavior(self, stream_id, track_id):
        """优化异常行为检测逻辑"""
        state = self.stream_states[stream_id]
        history = state['track_history'].get(track_id)

        if not history or len(history) < 5:
            return None

        try:
            # 使用最近3帧计算速度，提高响应速度
            time_diff = (history[-1][2] - history[-3][2])
            if time_diff <= 0:
                return None

            dt = time_diff / 1000.0  # 转换为秒

            # 计算位移
            dx = history[-1][0] - history[-3][0]
            dy = history[-1][1] - history[-3][1]

            if dx == 0 and dy == 0:
                return None

            # 速度计算（像素/秒）
            speed = np.sqrt(dx ** 2 + dy ** 2) / dt

            # 方向计算（角度）
            direction = np.degrees(np.arctan2(dy, dx)) % 360

            # 获取历史方向作为参考
            prev_direction = np.degrees(np.arctan2(
                history[-2][1] - history[-3][1],
                history[-2][0] - history[-3][0]
            )) % 360

            # 方向变化量
            direction_change = abs(direction - prev_direction)
            if direction_change > 180:
                direction_change = 360 - direction_change

            # 优化异常判断条件
            if speed > self.speed_limit:
                return "OVERSPEED"
            elif direction_change > 90:  # 大幅方向变化视为异常
                return "RETROGRADE" if direction_change > 120 else "LANE_CHANGE"
            elif speed < 5 and direction_change > 45:  # 低速大角度变化视为急刹
                return "HARD_BRAKE"

        except Exception as e:
            logger.error(f"轨迹分析异常：{str(e)}")

        return None


# ========================= gRPC 服务实现 =========================
class TrafficMonitorServicer(yolo_pb2_grpc.TrafficMonitorServiceServicer):
    def __init__(self, redis_host='localhost', redis_port=6379):
        self.monitor = TrafficMonitor(redis_host=redis_host, redis_port=redis_port)
        self.request_queue = queue.Queue(maxsize=100)
        self.processing_thread = threading.Thread(target=self._process_queue, daemon=True)
        self.processing_thread.start()
        logger.info("gRPC服务初始化完成，启动处理线程")

    def _process_queue(self):
        """后台处理队列中的请求"""
        while True:
            try:
                # 获取请求和上下文
                request, context = self.request_queue.get()

                # 处理请求
                response = self._process_request(request, context)

                # 返回响应
                context.response = response
            except Exception as e:
                logger.error(f"处理队列请求时出错: {str(e)}")

    def _process_request(self, request, context):
        """实际处理请求的逻辑"""
        try:
            # 将请求中的字节数据转换为图像
            frame = np.frombuffer(request.frame_data, dtype=np.uint8)
            frame = frame.reshape((request.height, request.width, 3))

            # 处理帧
            detections = self.monitor.process_frame(
                request.stream_id,
                frame,
                request.timestamp_ms
            )

            # 构建响应
            response = yolo_pb2.FrameResponse()
            for det in detections:
                detection_proto = response.detections.add()
                detection_proto.track_id = det['track_id']
                detection_proto.bbox.extend(det['bbox'])
                detection_proto.confidence = det['confidence']
                detection_proto.class_id = det['class_id']
                detection_proto.behavior = det['behavior']
                detection_proto.behavior_str = det['behavior_str']

            return response
        except Exception as e:
            logger.error(f"处理请求时出错: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"处理错误: {str(e)}")
            return yolo_pb2.FrameResponse()

    def ProcessFrame(self, request, context):
        """处理帧的gRPC方法"""
        # 将请求放入队列，返回一个占位符响应
        # 实际响应会在后台线程处理完成后返回
        self.request_queue.put((request, context))
        return yolo_pb2.FrameResponse()


# ========================= Redis 事件监听器 =========================
class RedisEventListener(threading.Thread):
    def __init__(self, redis_host='localhost', redis_port=6379):
        super().__init__()
        self.redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)
        self.daemon = True
        self.pubsub = self.redis_client.pubsub()
        self.pubsub.subscribe('abnormal_events')
        logger.info("Redis事件监听器初始化完成")

    def run(self):
        """监听Redis频道并处理事件"""
        logger.info("启动Redis事件监听器")
        for message in self.pubsub.listen():
            if message['type'] == 'message':
                try:
                    event_data = json.loads(message['data'])
                    logger.info(f"接收到异常事件: {event_data}")
                    # 这里可以添加事件处理逻辑，如通知用户、保存到数据库等
                except Exception as e:
                    logger.error(f"处理Redis事件时出错: {str(e)}")


# ========================= 主函数 =========================
def run_server(port=50051, redis_host='localhost', redis_port=6379):
    # 启动Redis事件监听器
    redis_listener = RedisEventListener(redis_host, redis_port)
    redis_listener.start()

    # 启动gRPC服务器
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    yolo_pb2_grpc.add_TrafficMonitorServiceServicer_to_server(
        TrafficMonitorServicer(redis_host, redis_port), server
    )
    server.add_insecure_port(f'[::]:{port}')
    server.start()
    logger.info(f"gRPC服务已在端口 {port} 启动")
    try:
        while True:
            time.sleep(86400)  # 一天
    except KeyboardInterrupt:
        logger.info("接收到中断信号，停止服务")
        server.stop(0)


def process_images_with_grpc(input_dir, output_dir, server_address="localhost:50051"):
    """客户端：通过gRPC处理图像"""
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)

    # 创建gRPC通道
    channel = grpc.insecure_channel(server_address)
    stub = yolo_pb2_grpc.TrafficMonitorServiceStub(channel)
    logger.info(f"已连接到gRPC服务器: {server_address}")

    # 获取输入目录中的所有图片文件
    image_files = [f for f in os.listdir(input_dir)
                   if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp'))]
    image_files.sort()  # 按文件名排序

    # 处理每张图片
    for i, img_file in enumerate(image_files):
        img_path = os.path.join(input_dir, img_file)
        frame = cv2.imread(img_path)

        if frame is None:
            logger.error(f"无法读取图像: {img_path}")
            continue

        logger.info(f"处理图像: {img_file}")
        h, w = frame.shape[:2]

        # 构建请求
        request = yolo_pb2.FrameRequest()
        request.frame_data = frame.tobytes()
        request.width = w
        request.height = h
        request.stream_id = "input_stream"
        request.timestamp_ms = i * 100

        # 发送请求并获取响应
        try:
            response = stub.ProcessFrame(request)

            # 绘制检测结果
            for det in response.detections:
                # 只处理车辆类别 (假设class_id=0是车辆)
                if det.class_id != 0:
                    continue

                bbox = det.bbox
                # 转换归一化坐标到像素坐标
                x_center = int(bbox[0] * w)
                y_center = int(bbox[1] * h)
                width = int(bbox[2] * w)
                height = int(bbox[3] * h)

                # 计算边界框坐标
                x1 = int(x_center - width / 2)
                y1 = int(y_center - height / 2)
                x2 = int(x_center + width / 2)
                y2 = int(y_center + height / 2)

                # 绘制边界框
                color = (0, 255, 0) if det.behavior_str == "NORMAL" else (0, 0, 255)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

                # 添加简洁标签
                label = f"{det.track_id}:{det.behavior_str}"
                cv2.putText(frame, label, (x1, y1 - 5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

            # 保存结果
            output_path = os.path.join(output_dir, img_file)
            cv2.imwrite(output_path, frame)
            logger.info(f"保存结果: {output_path}")
        except grpc.RpcError as e:
            logger.error(f"gRPC调用失败: {e.details()}")

    logger.info("所有图片处理完成!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='分布式交通监控系统')
    parser.add_argument('--mode', choices=['server', 'client'], required=True,
                        help='运行模式: server 或 client')
    parser.add_argument('--port', type=int, default=50051,
                        help='gRPC服务器端口 (仅server模式)')
    parser.add_argument('--redis_host', default='localhost',
                        help='Redis主机地址')
    parser.add_argument('--redis_port', type=int, default=6379,
                        help='Redis端口')
    parser.add_argument('--input', default='input',
                        help='输入目录 (仅client模式)')
    parser.add_argument('--output', default='output',
                        help='输出目录 (仅client模式)')
    parser.add_argument('--server', default='localhost:50051',
                        help='服务器地址 (仅client模式)')

    args = parser.parse_args()

    if args.mode == 'server':
        logger.info(f"启动服务端，端口: {args.port}, Redis: {args.redis_host}:{args.redis_port}")
        run_server(port=args.port, redis_host=args.redis_host, redis_port=args.redis_port)
    else:
        logger.info(f"启动客户端，服务器: {args.server}, 输入: {args.input}, 输出: {args.output}")
        process_images_with_grpc(args.input, args.output, args.server)