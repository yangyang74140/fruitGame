# fruitGame

水果摊整理 + 收纳装箱 + 轻消除（Cocos 方案）

## 当前状态

代码骨架、关卡数据、模块拆解、开发规划已全部完成。

下一步：本地用 Cocos Creator 3.x 打开本项目，搭建场景并导入资源。

## 目录结构

```text
fruitGame/
├── README.md
├── .gitignore
├── docs/
│   ├── setup.md              # 开发环境准备
│   ├── module-breakdown.md   # 核心玩法模块拆解
│   └── dev-plan-v1.md        # 第一版开发规划
├── project-plan/
│   └── milestone.md          # 里程碑跟踪
└── assets/
    ├── scenes/               # 场景文件（待搭建）
    ├── prefabs/              # 预制体（待创建）
    ├── textures/             # 精灵图资源（待导入）
    ├── audios/               # 音效资源（待导入）
    ├── scripts/
    │   ├── core/
    │   │   ├── GameManager.ts   # 全局状态机 + 流程调度
    │   │   ├── LevelManager.ts  # 关卡加载 + 水果实例化
    │   │   └── RuleEngine.ts    # 规则引擎（纯逻辑）
    │   ├── entities/
    │   │   ├── FruitItem.ts     # 水果实体（状态/动画）
    │   │   └── BasketSlot.ts    # 篮筐槽位
    │   └── ui/
    │       ├── UIManager.ts     # 界面管理
    │       └── ResultPopup.ts   # 结果弹窗
    └── resources/
        ├── levels/
        │   ├── level_01.json ~ level_10.json  # 10 关关卡数据
        └── config/
            └── fruit-config.json              # 游戏配置
```

## 游戏目标

- 竖屏休闲手游
- 核心玩法：点击水果入篮 → 3 个同类自动装箱消除 → 清空过关，篮筐满则失败
- 首版规格：6 种水果、6 格篮筐、3 消机制、10 个基础关卡、冰冻水果 + 扩容道具

## 建议技术方案

- 引擎：Cocos Creator 3.x
- 语言：TypeScript
- 包管理：pnpm

## 下一步

1. 在本地安装 Cocos Creator 3.x
2. 用 Cocos Creator 打开本仓库目录，创建项目文件
3. 导入 6 种水果精灵图 + UI 素材
4. 创建 Main.scene 并挂载脚本组件
5. 按 `docs/dev-plan-v1.md` 阶段 1 开始开发
