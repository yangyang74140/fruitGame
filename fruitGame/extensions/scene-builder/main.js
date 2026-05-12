/**
 * 水果消除游戏 — 场景生成器扩展
 * 
 * 在 Cocos Creator 中：菜单 → 扩展 → 水果消除 → 生成场景
 * 自动创建完整节点层级并挂载脚本组件
 */

'use strict';

// ===================== 节点树定义 =====================

const SCENE_TREE = {
  name: 'Canvas',
  component: { type: 'cc.Canvas' },
  children: [
    {
      name: 'Camera',
      component: { type: 'cc.Camera', props: { _clearFlags: 7 } },
    },
    {
      name: 'GameManager',
      component: { type: 'db://assets/scripts/core/GameManager' },
      children: [
        {
          name: 'fruitContainer',
          props: { _lpos: { x: 0, y: 0, z: 0 } },
        },
        {
          name: 'basketContainer',
          props: { _lpos: { x: 0, y: -520, z: 0 } },
          component: {
            type: 'cc.UITransform',
            props: { _contentSize: { width: 720, height: 120 } },
          },
          children: generateBasketSlots(),
        },
      ],
    },
    {
      name: 'UIManager',
      component: { type: 'db://assets/scripts/ui/UIManager' },
      children: [
        {
          name: 'TopBar',
          props: { _lpos: { x: 0, y: 580, z: 0 } },
          component: [
            { type: 'cc.UITransform', props: { _contentSize: { width: 750, height: 120 } } },
            { type: 'cc.Sprite', props: { _color: { r: 255, g: 248, b: 220, a: 255 } } },
          ],
          children: [
            {
              name: 'levelLabel',
              props: { _lpos: { x: 0, y: 20, z: 0 } },
              component: [
                { type: 'cc.UITransform', props: { _contentSize: { width: 400, height: 50 } } },
                { type: 'cc.Label', props: { _string: '第 1 关', _fontSize: 40, _color: { r: 93, g: 64, b: 55, a: 255 } } },
              ],
            },
            {
              name: 'taskLabel',
              props: { _lpos: { x: 0, y: -28, z: 0 } },
              component: [
                { type: 'cc.UITransform', props: { _contentSize: { width: 400, height: 36 } } },
                { type: 'cc.Label', props: { _string: '目标：清空全部水果', _fontSize: 28, _color: { r: 141, g: 110, b: 99, a: 255 } } },
              ],
            },
          ],
        },
        {
          name: 'resultPanel',
          active: false,
          props: { _lpos: { x: 0, y: 0, z: 0 } },
          component: [
            { type: 'cc.UITransform', props: { _contentSize: { width: 500, height: 400 } } },
            { type: 'cc.Sprite', props: { _color: { r: 255, g: 255, b: 255, a: 238 } } },
          ],
          children: [
            {
              name: 'resultTitle',
              props: { _lpos: { x: 0, y: 80, z: 0 } },
              component: [
                { type: 'cc.UITransform', props: { _contentSize: { width: 400, height: 60 } } },
                { type: 'cc.Label', props: { _string: '装箱完成!', _fontSize: 48, _color: { r: 255, g: 107, b: 53, a: 255 } } },
              ],
            },
            {
              name: 'resultSubtitle',
              props: { _lpos: { x: 0, y: 20, z: 0 } },
              component: [
                { type: 'cc.UITransform', props: { _contentSize: { width: 400, height: 40 } } },
                { type: 'cc.Label', props: { _string: '', _fontSize: 28, _color: { r: 102, g: 102, b: 102, a: 255 } } },
              ],
            },
            createButtonNode('restartButton', '重开', { x: -80, y: -80, z: 0 }, '#FFA502', { width: 160, height: 60 }),
            createButtonNode('nextLevelButton', '下一关', { x: 80, y: -80, z: 0 }, '#2ED573', { width: 160, height: 60 }),
          ],
        },
        {
          name: 'tipNode',
          active: false,
          props: { _lpos: { x: 0, y: 200, z: 0 } },
          component: [
            { type: 'cc.UITransform', props: { _contentSize: { width: 400, height: 50 } } },
            { type: 'cc.Label', props: { _string: '', _fontSize: 30, _color: { r: 255, g: 255, b: 255, a: 255 } } },
          ],
        },
      ],
    },
    {
      name: 'PowerUpPanel',
      props: { _lpos: { x: 320, y: 200, z: 0 } },
      component: { type: 'cc.UITransform', props: { _contentSize: { width: 100, height: 200 } } },
      children: [
        createPowerUpButton('freshBoxButton', { x: 0, y: 40, z: 0 }, '#87CEEB'),
        createPowerUpButton('expandButton', { x: 0, y: -40, z: 0 }, '#90EE90'),
      ],
    },
  ],
};

// ===================== 辅助函数 =====================

function generateBasketSlots() {
  const slots = [];
  for (let i = 0; i < 6; i++) {
    slots.push({
      name: `BasketSlot_${i}`,
      props: { _lpos: { x: -300 + i * 120, y: 0, z: 0 } },
      component: [
        { type: 'db://assets/scripts/entities/BasketSlot' },
        { type: 'cc.UITransform', props: { _contentSize: { width: 100, height: 100 } } },
        { type: 'cc.Sprite', props: { _color: { r: 210, g: 180, b: 140, a: 255 } } },
      ],
      children: [
        {
          name: 'fruitAnchor',
          props: { _lpos: { x: 0, y: 0, z: 0 } },
          component: { type: 'cc.UITransform', props: { _contentSize: { width: 80, height: 80 } } },
        },
      ],
    });
  }
  return slots;
}

function createButtonNode(name, text, pos, colorHex, size) {
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);
  return {
    name,
    props: { _lpos: pos },
    component: [
      { type: 'cc.UITransform', props: { _contentSize: size } },
      { type: 'cc.Sprite', props: { _color: { r, g, b, a: 255 } } },
      { type: 'cc.Button' },
      { type: 'cc.Label', props: { _string: text, _fontSize: 28, _color: { r: 255, g: 255, b: 255, a: 255 } } },
    ],
  };
}

function createPowerUpButton(name, pos, colorHex) {
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);
  return {
    name,
    props: { _lpos: pos },
    component: [
      { type: 'cc.UITransform', props: { _contentSize: { width: 80, height: 80 } } },
      { type: 'cc.Sprite', props: { _color: { r, g, b, a: 255 } } },
      { type: 'cc.Button' },
    ],
  };
}

// ===================== 编辑器扩展主逻辑 =====================

/**
 * 递归创建节点树
 */
async function createNodeTree(parentUuid, tree) {
  // 创建节点
  const nodeUuid = await Editor.Message.request('scene', 'create-node', {
    parent: parentUuid,
    name: tree.name,
  });

  // 设置初始属性
  if (tree.props) {
    for (const [key, value] of Object.entries(tree.props)) {
      await Editor.Message.request('scene', 'set-node-property', {
        uuid: nodeUuid,
        path: key,
        value: value,
      });
    }
  }

  // 设置 active
  if (tree.active === false) {
    await Editor.Message.request('scene', 'set-node-property', {
      uuid: nodeUuid,
      path: '_active',
      value: false,
    });
  }

  // 添加组件
  if (tree.component) {
    const comps = Array.isArray(tree.component) ? tree.component : [tree.component];
    for (const comp of comps) {
      const compUuid = await Editor.Message.request('scene', 'add-component', {
        uuid: nodeUuid,
        component: comp.type,
      });

      // 设置组件属性
      if (comp.props) {
        for (const [key, value] of Object.entries(comp.props)) {
          await Editor.Message.request('scene', 'set-component-property', {
            uuid: compUuid,
            path: key,
            value: value,
          });
        }
      }
    }
  }

  // 递归创建子节点
  if (tree.children) {
    for (const child of tree.children) {
      await createNodeTree(nodeUuid, child);
    }
  }

  return nodeUuid;
}

/**
 * 生成完整场景
 */
async function generateScene() {
  try {
    Editor.Dialog.info('场景生成器', {
      detail: '将清空当前场景并重新生成完整的游戏节点树，是否继续？',
      buttons: ['取消', '确定'],
      default: 1,
    });

    // 简单起见，直接在 Canvas 下创建
    // 获取当前场景根节点
    const sceneUuid = await Editor.Message.request('scene', 'query-node', {});
    // 查找 Canvas 节点
    const queryResult = await Editor.Message.request('scene', 'query-node', {
      name: 'Canvas',
    });

    let canvasUuid;
    if (queryResult && queryResult.length > 0) {
      canvasUuid = queryResult[0];
    } else {
      // 场景中没有 Canvas，创建一个
      canvasUuid = await Editor.Message.request('scene', 'create-node', {
        name: 'Canvas',
      });
      await Editor.Message.request('scene', 'add-component', {
        uuid: canvasUuid,
        component: 'cc.Canvas',
      });
      await Editor.Message.request('scene', 'add-component', {
        uuid: canvasUuid,
        component: 'cc.UITransform',
      });
      // 设置设计分辨率
      const comps = await Editor.Message.request('scene', 'query-node-component', {
        uuid: canvasUuid,
      });
      for (const c of comps) {
        if (c.type === 'cc.UITransform') {
          await Editor.Message.request('scene', 'set-component-property', {
            uuid: c.uuid,
            path: '_contentSize',
            value: { width: 750, height: 1334 },
          });
        }
      }
    }

    // 清除 Canvas 下现有子节点（保留 Camera）
    const children = await Editor.Message.request('scene', 'query-node-children', {
      uuid: canvasUuid,
    });
    for (const child of (children || [])) {
      if (child.name !== 'Camera') {
        await Editor.Message.request('scene', 'delete-node', { uuid: child });
      }
    }

    // 生成场景树
    await createNodeTree(canvasUuid, SCENE_TREE);

    // 保存场景
    await Editor.Message.request('scene', 'save-scene');

    Editor.Dialog.info('场景生成器', {
      detail: `场景生成完成！
      
节点列表：
  Canvas
  ├── Camera
  ├── GameManager → GameManager.ts ✓
  │   ├── fruitContainer
  │   └── basketContainer
  │       ├── BasketSlot_0 → BasketSlot.ts ✓
  │       ├── BasketSlot_1 → BasketSlot.ts ✓
  │       ├── BasketSlot_2 → BasketSlot.ts ✓
  │       ├── BasketSlot_3 → BasketSlot.ts ✓
  │       ├── BasketSlot_4 → BasketSlot.ts ✓
  │       └── BasketSlot_5 → BasketSlot.ts ✓
  ├── UIManager → UIManager.ts ✓
  │   ├── TopBar → levelLabel / taskLabel
  │   ├── resultPanel
  │   └── tipNode
  └── PowerUpPanel
      ├── freshBoxButton
      └── expandButton

下一步：在 GameManager 组件中手动拖拽引用绑定
  - fruitContainer
  - basketContainer
  - levelManager / ruleEngine / uiManager`,
      buttons: ['知道了'],
    });
  } catch (err) {
    Editor.Dialog.error('场景生成器', {
      detail: `生成失败：${err.message}\n\n${err.stack || ''}`,
    });
  }
}

// ===================== 扩展入口 =====================

module.exports = {
  /**
   * 扩展加载时
   */
  load() {
    Editor.Message.addBroadcastListener('scene-builder:generate-scene', generateScene);
    console.log('[scene-builder] 扩展已加载，菜单：扩展 → 水果消除 → 生成场景');
  },

  /**
   * 扩展卸载时
   */
  unload() {
    Editor.Message.removeBroadcastListener('scene-builder:generate-scene', generateScene);
  },

  /**
   * 对外暴露的方法（由 package.json 中的 contributions.messages 注册）
   */
  methods: {
    generateScene,
  },
};
