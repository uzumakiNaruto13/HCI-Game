# 地铁跑酷 - 完整素材方案

## 一、素材目录结构

```
games/subway/
├── assets/
│   ├── player/           # 玩家角色
│   │   ├── run/          # 跑步动画帧 (PNG, 透明背景)
│   │   ├── jump/         # 跳跃姿态
│   │   ├── slide/        # 滑铲姿态
│   │   └── board/        # 滑板姿态 (后期)
│   ├── obstacles/        # 障碍物
│   │   ├── boxes/        # 木箱/纸箱
│   │   ├── barriers/     # 栏杆/警告牌
│   │   └── trains/       # 火车/地铁车厢
│   ├── coins/            # 金币/收集品
│   │   ├── coin.png      # 单个金币 (旋转动画用帧)
│   │   └── powerup/      # 道具
│   ├── background/        # 背景素材
│   │   ├── sky/          # 天空/云层
│   │   ├── city/         # 城市建筑群
│   │   ├── ground/       # 地面/铁轨
│   │   └── decorations/  # 装饰元素
│   ├── effects/          # 特效
│   │   ├── particles/    # 粒子效果
│   │   ├── trails/       # 残影/速度线
│   │   └── explosions/   # 爆炸效果
│   └── ui/               # 界面元素
│       ├── icons/        # 图标
│       └── screens/      # 开始/结束界面
```

## 二、必需素材列表 (优先级排序)

### P0 - 核心素材 (无则无法达到基本要求)

#### 1. 玩家角色精灵
| 名称 | 规格 | 数量 | 说明 |
|------|------|------|------|
| player_run_01.png | 64x64 PNG | 8-12帧 | 跑步循环动画 |
| player_run_02.png | 64x64 PNG | ... | 第二套配色 |
| player_jump.png | 64x64 PNG | 1 | 起跳姿态 |
| player_slide.png | 64x64 PNG | 1 | 滑铲姿态 |

#### 2. 障碍物
| 名称 | 规格 | 说明 |
|------|------|------|
| obstacle_box.png | 48x48 PNG | 木箱，有碰撞感 |
| obstacle_barrier.png | 32x80 PNG | 栏杆/路障 |
| obstacle_train.png | 96x64 PNG | 地铁车厢 |

#### 3. 背景元素
| 名称 | 规格 | 说明 |
|------|------|------|
| building_1.png ~ building_5.png | 120x200 PNG | 不同风格建筑 |
| cloud_1.png, cloud_2.png | 150x80 PNG | 卡通云朵 |
| ground_track.png | 600x40 PNG | 铁轨地面 |

#### 4. 收集品
| 名称 | 规格 | 说明 |
|------|------|------|
| coin_00.png ~ coin_07.png | 32x32 PNG | 金币旋转8帧 |
| powerup_magnet.png | 32x32 PNG | 磁铁道具 |
| powerup_shield.png | 32x32 PNG | 护盾道具 |

### P1 - 增强素材 (大幅提升视觉效果)

#### 5. 环境装饰
| 名称 | 规格 | 说明 |
|------|------|------|
| poster_1.png ~ poster_3.png | 40x60 PNG | 墙上广告/海报 |
| graffiti_1.png ~ graffiti_2.png | 80x40 PNG | 涂鸦墙 |
| sign_warning.png | 40x30 PNG | 警告标识 |

#### 6. 粒子特效
| 名称 | 规格 | 说明 |
|------|------|------|
| sparkle.png | 16x16 PNG | 金币获取闪光 |
| dust.png | 8x8 PNG | 落地尘土 |

### P2 - UI素材
| 名称 | 规格 | 说明 |
|------|------|------|
| btn_start.png | 200x60 PNG | 开始按钮 |
| panel_score.png | 300x200 PNG | 分数面板 |

## 三、推荐素材获取渠道

### 免费素材网站

1. **OpenGameArt.org** - 开源游戏素材
   - 搜索: "subway surfers sprite", "running game assets"
   - 协议: CC0 / CC-BY

2. ** itch.io ** - Indie Game Resources
   - 分类: Game Assets > Platformer > Pixel Art
   - 价格: 免费/付费

3. **Kenney.nl** - 知名开源素材库
   - 优点: 高质量、CC0许可、种类齐全
   - 缺点: 需自行裁剪组合

4. **GameDev Market** - 付费但高质量
   - 价格: $1-5/素材包

### 自行制作建议

#### 使用工具:
- **Aseprite** - 像素艺术编辑器 (付费 $20, Steam)
- **Piskell** - 免费在线像素艺术工具
- **Photoshop** - 通用图像处理
- **Canva** - 快速制作简单UI元素

#### 角色绘制指南:

```
┌─────────────────────────────┐
│  地铁跑酷角色绘制规范        │
├─────────────────────────────┤
│  尺寸: 64x64 px (可缩放)     │
│  格式: PNG, 透明背景         │
│  风格: 卡通/像素风均可       │
│                             │
│  跑步动画: 8帧循环          │
│  帧速: 10-12 FPS            │
│                             │
│  角色特征:                   │
│  - 明亮配色(蓝/紫/橙)        │
│  - 圆润外形                  │
│  - 大眼睛                    │
│  - 背包/配件                │
└─────────────────────────────┘
```

### 替代方案: 使用emoji/SVG

如果暂时无法获取素材，可用以下方案过渡:

```javascript
// 使用 emoji 渲染玩家
const playerEmoji = {
  run: ['🏃'],
  jump: ['🧗'],
  slide: ['🦵']
};

// 使用 Canvas 绘制卡通角色
// (已有代码可进一步美化)
```

## 四、素材命名规范

```
{type}_{variant}_{frame}.png

示例:
player_run_01.png    - 玩家跑步第1帧
player_run_02.png    - 玩家跑步第2帧
player_jump.png      - 玩家跳跃
coin_00.png          - 金币第0帧(旋转)
obstacle_box.png     - 箱型障碍物
building_city_01.png - 城市建筑1
```

## 五、素材加载示例代码

```javascript
// 素材预加载管理器
class AssetManager {
  constructor() {
    this.images = {};
    this.loaded = false;
  }

  async loadAll() {
    const assets = [
      { name: 'player_run', path: 'assets/player/run.png', frames: 8 },
      { name: 'coin', path: 'assets/coins/coin.png', frames: 8 },
      // ... more assets
    ];

    const promises = assets.map(a => this.loadAsset(a));
    await Promise.all(promises);
    this.loaded = true;
  }

  loadAsset({ name, path, frames }) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images[name] = img;
        resolve();
      };
      img.onerror = reject;
      img.src = path;
    });
  }

  get(name) {
    return this.images[name];
  }
}
```

## 六、素材检查清单

- [ ] 玩家跑步动画 (至少4帧)
- [ ] 玩家跳跃状态
- [ ] 玩家滑铲状态
- [ ] 障碍物(箱子、栏杆、火车)
- [ ] 金币动画(至少4帧)
- [ ] 建筑背景(至少3种)
- [ ] 地面/铁轨纹理
- [ ] 云朵装饰
- [ ] 开始界面背景
- [ ] 游戏结束界面

## 七、快速预览模式 (无素材时)

在素材未备齐前，可使用增强版 Canvas 绘制:

```javascript
// 增强版角色渲染
function drawEnhancedPlayer(ctx, x, y, state) {
  // 使用渐变和阴影模拟立体感
  ctx.save();

  // 发光效果
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 20;

  // 身体渐变
  const bodyGrad = ctx.createLinearGradient(x-20, y, x+20, y);
  bodyGrad.addColorStop(0, '#7c3aed');
  bodyGrad.addColorStop(1, '#5b21b6');

  // ... 绘制代码

  ctx.restore();
}
```

---

**下一步行动:**
1. 优先获取 P0 素材(玩家+障碍物+背景)
2. 修改 game.js 集成素材加载系统
3. 保留 Canvas 降级绘制作为后备
4. 逐步完善每个模块