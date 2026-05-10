# fruitGame

水果摊整理 + 收纳装箱 + 轻消除（Cocos 方案）

## 当前状态

此仓库已完成云端开发环境的第一步准备：

- 已拉取并连接 GitHub 仓库
- 已安装 `pnpm`
- 已整理项目开发约定与初始化说明
- 待本地或可视化环境中创建/打开 Cocos Creator 项目

## 游戏目标

- 竖屏休闲手游
- 核心玩法：点击水果入篮 → 3 个同类自动装箱消除 → 清空过关，篮筐满则失败
- 首版规格：6 种水果、6 格篮筐、3 消机制、10 个基础关卡、冰冻水果 + 扩容道具

## 建议技术方案

- 引擎：Cocos Creator 3.x
- 语言：TypeScript
- 包管理：pnpm

## 目录规划

```text
fruitGame/
├─ README.md
├─ .gitignore
├─ docs/
│  └─ setup.md
└─ project-plan/
   └─ milestone.md
```

## 下一步

1. 在本地安装 Cocos Creator 3.x
2. 用 Cocos Creator 打开本仓库目录，创建项目文件
3. 按 `docs/setup.md` 和 `project-plan/milestone.md` 开始搭建首版
