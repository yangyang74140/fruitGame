# 水果消除游戏 — 核心玩法模块拆解

## 模块总览

```
┌─────────────────────────────────────────┐
│              GameManager                │
│        (全局状态机 + 流程调度)           │
├─────────────────────────────────────────┤
│  LevelManager  │  RuleEngine  │ UIMgr   │
│  (关卡加载)     │  (规则判断)  │ (界面)  │
├─────────────────────────────────────────┤
│  FruitItem     │  BasketSlot           │
│  (水果实体)     │  (篮筐槽位)           │
└─────────────────────────────────────────┘
```

---

## M1: GameManager — 全局状态机

**职责：** 游戏主循环、状态切换、模块调度

**状态：**
- `IDLE` → `PLAYING` → `WIN` / `LOSE`

**核心流程：**
```
开始关卡 → 重置篮筐 → 加载关卡数据 → 等待点击
点击水果 → 找空槽 → 放入篮筐 → 检测3消 → 检查胜负
```

**关键方法：**
| 方法 | 说明 |
|------|------|
| `startLevel(id)` | 初始化并开始关卡 |
| `onFruitTapped(fruit)` | 处理点击入篮 |
| `checkMatch()` | 检测3消并执行 |
| `executeMatch()` | 执行消除动画 |
| `checkWinCondition()` | 判断是否胜利 |
| `onBasketFull()` | 篮筐满时的判定 |
| `usePowerUp(type)` | 使用道具 |

**依赖：** LevelManager, RuleEngine, UIManager, BasketSlot

---

## M2: LevelManager — 关卡管理

**职责：** 关卡数据加载、水果实例化

**关卡数据结构：**
```typescript
interface LevelConfig {
  level: number;
  name: string;
  target: string;
  fruits: { type, x, y, frozen?, layer? }[];
  frozenCount: number;
}
```

**层级规则：**
- `layer=0` 最上层，可直接点击
- `layer=1` 被上层遮挡，需先清掉上层水果
- 同层按 `zIndex` 控制渲染顺序

**关键方法：**
| 方法 | 说明 |
|------|------|
| `loadLevel(id)` | 加载关卡 JSON |
| `spawnFruits(data)` | 实例化所有水果 |
| `getClickableFruits()` | 获取当前可点击水果列表 |
| `getRemainingCount()` | 剩余水果数 |

---

## M3: RuleEngine — 规则引擎（纯逻辑）

**职责：** 消除判断、胜负判定，无 UI/场景依赖

**规则常量：**
| 常量 | 值 | 说明 |
|------|-----|------|
| `BASE_BASKET_SIZE` | 6 | 基础篮筐容量 |
| `MATCH_COUNT` | 3 | 消除所需数量 |
| `MAX_EXPAND` | 3 | 最大扩容次数 |
| `FRUIT_TYPE_COUNT` | 6 | 水果种类数 |
| `MAX_LEVEL` | 10 | 最大关卡数 |
| `UNFREEZE_TAPS` | 2 | 解冻所需点击 |

**关键方法：**
| 方法 | 说明 |
|------|------|
| `findMatch(basket)` | 检测篮筐中的可消除组合 |
| `canStillMatch(basket, remaining)` | 篮筐满时是否还有理论消除可能 |
| `isWin(remaining, occupied)` | 胜利判定 |
| `isLose(basket, occupied, max, remaining)` | 失败判定 |
| `getBasketCapacity(expand)` | 计算当前容量 |

---

## M4: FruitItem — 水果实体

**职责：** 水果的外观、状态、交互动画

**状态流转：**
```
ON_BOARD → (点击) → IN_BASKET → (3消) → MATCHED
                  ↓
              frozen: 需先解冻
```

**属性：**
| 属性 | 类型 | 说明 |
|------|------|------|
| `fruitType` | FruitType | 水果种类 |
| `isFrozen` | boolean | 是否冰冻 |
| `isClickable` | boolean | 是否可点击 |
| `layer` | number | 显示层级 |
| `state` | FruitState | 当前状态 |

**关键方法：**
| 方法 | 说明 |
|------|------|
| `init(type, frozen, layer)` | 初始化 |
| `flyToBasket(pos, cb)` | 飞入篮筐动画 |
| `playMatchAnimation(cb)` | 消除动画 |
| `tryUnfreeze()` | 尝试解冻 |
| `setClickable(val)` | 设置可点击状态 |

**水果种类枚举：**
- `STRAWBERRY` (草莓) — 红色
- `ORANGE` (橙子) — 橙色
- `GRAPE` (葡萄) — 紫色
- `LEMON` (柠檬) — 黄色
- `WATERMELON` (西瓜) — 绿色
- `BLUEBERRY` (蓝莓) — 蓝色

---

## M5: BasketSlot — 篮筐槽位

**职责：** 单个篮筐格子的状态管理

**状态：**
- `EMPTY` → `OCCUPIED` → `MATCHING` → `EMPTY`

**属性：**
| 属性 | 类型 | 说明 |
|------|------|------|
| `index` | number | 槽位序号 |
| `currentFruit` | FruitItem | 当前水果引用 |
| `isEmpty` | boolean | 是否为空 |
| `state` | SlotState | 当前状态 |
| `fruitType` | string | 当前水果类型 |

**关键方法：**
| 方法 | 说明 |
|------|------|
| `init(index)` | 初始化 |
| `setFruit(fruit)` | 放入水果 |
| `playMatchAnimation(cb)` | 消除动画 |
| `clear()` | 清空槽位 |

---

## M6: UIManager — 界面管理

**职责：** 顶部信息、结果弹窗、道具按钮、浮动提示

**UI 元素：**
- 关卡标签、任务提示
- 胜利/失败弹窗
- 保鲜盒按钮（数量显示）
- 扩容按钮（数量显示）
- 浮动文本提示

**关键方法：**
| 方法 | 说明 |
|------|------|
| `showLevel(id)` | 显示关卡信息 |
| `showResult(win, level)` | 显示结果弹窗 |
| `showTip(text)` | 浮动提示 |
| `updatePowerUpCount(type, count)` | 更新道具数量 |

---

## M7: 关卡数据（10关）

| 关卡 | 名称 | 水果数 | 冰冻 | 层级 | 难度特点 |
|------|------|--------|------|------|----------|
| 1 | 新手引导 | 9 (3种) | 0 | 1层 | 引导基本操作 |
| 2 | 多点花样 | 12 (4种) | 0 | 1层 | 增加种类 |
| 3 | 冷藏挑战 | 15 (5种) | 1 | 2层 | 首次冰冻 |
| 4 | 双层货架 | 15 (5种) | 1 | 2层 | 遮挡机制 |
| 5 | 水果大杂烩 | 18 (6种) | 2 | 2层 | 全部种类 |
| 6 | 紧凑摆放 | 18 (6种) | 2 | 2层 | 策略选择 |
| 7 | 冷藏抽屉 | 18 (6种) | 3 | 2层 | 多冰冻 |
| 8 | 满满当当 | 21 (6种) | 3 | 2层 | 高密度 |
| 9 | 橱窗陈列 | 21 (6种) | 3 | 2层 | 复杂分层 |
| 10 | 完美装箱 | 24 (6种) | 4 | 2层 | 综合考验 |

---

## 依赖关系

```
GameManager
  ├── LevelManager → FruitItem (实例化)
  ├── RuleEngine (纯逻辑，无依赖)
  ├── UIManager → ResultPopup
  └── BasketSlot[] → FruitItem (引用)
```
