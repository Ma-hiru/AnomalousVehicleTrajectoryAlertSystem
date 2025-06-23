import torch
import torch.nn as nn


class GSConv(nn.Module):
    """优化版分组混洗卷积"""

    def __init__(self, c1, c2, k=1, s=1, g=1, act=True):
        super().__init__()
        hidden_dim = c2 // 2
        self.conv1 = nn.Conv2d(c1, hidden_dim, k, s, k // 2, groups=g, bias=False)
        self.conv2 = nn.Conv2d(hidden_dim, hidden_dim, 5, 1, 2, groups=hidden_dim, bias=False)
        self.bn = nn.BatchNorm2d(c2)
        self.act = nn.SiLU() if act else nn.Identity()
        self.channel_shuffle = nn.ChannelShuffle(groups=2)

    def forward(self, x):
        x = self.conv1(x)
        x = torch.cat([x, self.conv2(x)], 1)
        x = self.bn(x)
        x = self.channel_shuffle(x)
        return self.act(x)


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


class DynamicHeadBlock(nn.Module):
    """动态锚框预测模块"""

    def __init__(self, c1, c2, num_anchors=3):
        super().__init__()
        self.dynamic_scale = nn.Sequential(
            GSConv(c1, c1 // 2),
            CBAM(c1 // 2),
            nn.Conv2d(c1 // 2, 2 * num_anchors, 1)
        )
        self.cls_pred = nn.Conv2d(c1, num_anchors * c2, 1)

    def forward(self, x):
        scales = torch.sigmoid(self.dynamic_scale(x))  # [B, 2*A, H, W]
        cls = self.cls_pred(x)
        return scales, cls


class ImprovedYOLOv8(nn.Module):
    """完整改进版YOLOv8架构"""

    def __init__(self, num_classes=80):
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
        x = self.stem(x)
        x = self.dark2(x)
        x3 = self.dark3(x)
        x4 = self.dark4(x3)
        x5 = self.dark5(x4)
        return {
            'scales': [self.head[0](x5)[0], self.head[1](x4)[0], self.head[2](x3)[0]],
            'cls': [self.head[0](x5)[1], self.head[1](x4)[1], self.head[2](x3)[1]]
        }


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


if __name__ == "__main__":
    # 修正后的实例化调用
    model = ImprovedYOLOv8(num_classes=2)  # 统一类名
    torch.save(model.state_dict(), "improved_yolov8.pth")
    print("模型权重已成功生成")