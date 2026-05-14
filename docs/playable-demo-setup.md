# fruitGame 可玩 Demo 搭建说明

目标：在不依赖正式美术资源的前提下，用 Cocos Creator 3.8.8 跑通最小可玩版本。

## 当前可玩内容

1. 进入关卡后自动开始第 1 关
2. 点击水果入篮
3. 篮中 3 个同类自动消除
4. 冰冻水果需要点击两次解冻
5. 支持保鲜盒与篮筐扩容道具
6. 清空所有水果后胜利
7. 篮筐满且无可消除组合时失败
8. 支持重开与下一关

## 最少操作步骤

### 1. 打开项目

1. 用 Cocos Creator 3.8.8 打开 `fruitGame/`
2. 等待资源导入完成

### 2. 生成主场景骨架

1. 打开一个空场景或 `Main.scene`
2. 菜单进入：扩展 -> 水果消除 -> 生成场景
3. 执行后会自动生成：
   - `GameManager`
   - `fruitContainer`
   - `basketContainer`
   - 6 个 `BasketSlot`
   - `UIManager`
   - `TopBar / resultPanel / tipNode`
   - `PowerUpPanel`

### 3. 创建水果预制体

在 `assets/prefabs/` 下新建一个 `FruitItem.prefab`，结构建议：

```text
FruitItem
├── Sprite（主体颜色块即可）
├── HighlightRing（可选，占位高亮）
├── FrozenOverlay（可选，占位冰层）
└── FruitLabel（可选，文字）
```

要求：
1. 根节点挂 `FruitItem.ts`
2. 根节点加 `UITransform`，建议大小 `96 x 96`
3. 根节点上保留 `Sprite` 组件，脚本会自动染色
4. 如果不手动建子节点，脚本也会自动补齐占位节点
5. 给根节点加点击事件，调用 `FruitItem.onTouch()`

### 4. 创建 LevelManager 节点

场景中补一个空节点 `LevelManager`：

1. 挂载 `LevelManager.ts`
2. 绑定：
   - `fruitContainer` -> GameManager 下的 fruitContainer
   - `fruitPrefab` -> 刚创建的 FruitItem.prefab

### 5. 绑定 GameManager 引用

给 `GameManager` 节点绑定：

1. `levelManager` -> LevelManager 节点上的组件
2. `uiManager` -> UIManager 节点上的组件
3. `fruitContainer` -> GameManager/fruitContainer
4. `basketContainer` -> GameManager/basketContainer

### 6. 绑定 UIManager 引用

给 `UIManager` 组件绑定：

1. `levelLabel` -> TopBar/levelLabel
2. `taskLabel` -> TopBar/taskLabel
3. `basketStatusLabel` -> TopBar/basketStatusLabel
4. `resultPanel` -> resultPanel
5. `resultTitle` -> resultPanel/resultTitle
6. `resultSubtitle` -> resultPanel/resultSubtitle
7. `restartButton` -> resultPanel/restartButton
8. `nextLevelButton` -> resultPanel/nextLevelButton
9. `freshBoxButton` -> PowerUpPanel/freshBoxButton
10. `expandButton` -> PowerUpPanel/expandButton
11. `freshBoxCountLabel` -> PowerUpPanel/freshBoxButton/freshBoxCountLabel
12. `expandCountLabel` -> PowerUpPanel/expandButton/expandCountLabel
13. `tipNode` -> tipNode
14. `tipLabel` -> tipNode 上的 Label

### 7. 绑定按钮事件

1. `freshBoxButton` 点击 -> `UIManager.onFreshBoxClick`
2. `expandButton` 点击 -> `UIManager.onExpandClick`
3. `restartButton` 点击 -> `UIManager.onRestartClick`
4. `nextLevelButton` 点击 -> `UIManager.onNextLevelClick`

## 建议先验收的关卡

1. `level_01.json`：验证基础 3 消
2. `level_02.json`：验证更多水果混排
3. 含 frozen 的关卡：验证两次点击解冻与保鲜盒

## 当前仍然缺的部分

1. 真正的 `.scene` / `.prefab` 资源文件仍需在 Cocos GUI 中保存
2. 点击事件绑定需要在编辑器里确认
3. 没有正式美术与音效，仅为占位可玩版
4. 尚未做构建包验证

## 推荐验收标准

1. 能从第 1 关正常开始
2. 任意水果可以点击入篮
3. 出现 3 个同类时立即消除
4. 清空关卡后弹胜利面板
5. 篮筐满时弹失败面板
6. 重开和下一关按钮生效
