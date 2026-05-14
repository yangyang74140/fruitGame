/**
 * 水果消除游戏 — 场景生成器扩展（CC 3.8 兼容版）
 * 
 * 在 Cocos Creator 中：菜单 → 扩展 → 水果消除 → 生成场景
 * 
 * 策略：
 *   1. 通过 editor API (scene:create-node) 创建纯节点树
 *   2. 通过 scene script (execute-scene-script) 批量挂载组件
 *   3. 组件属性通过 editor API (set-component-property) 设置
 */

'use strict';

// ===================== 节点树定义 =====================

const SCENE_TREE = {
  name: 'GameManager',
  components: [
    { type: 'db://assets/scripts/core/GameManager', afterCreate: null },
  ],
  children: [
    {
      name: 'fruitContainer',
      props: { _lpos: { x: 0, y: 0, z: 0 } },
    },
    {
      name: 'basketContainer',
      props: { _lpos: { x: 0, y: -520, z: 0 } },
      components: [
        { type: 'cc.UITransform', props: { _contentSize: { width: 720, height: 120 } } },
      ],
      children: generateBasketSlots(),
    },
  ],
};

const UI_TREE = {
  name: 'UIManager',
  components: [
    { type: 'db://assets/scripts/ui/UIManager', afterCreate: null },
  ],
  children: [
    {
      name: 'TopBar',
      props: { _lpos: { x: 0, y: 560, z: 0 } },
      components: [
        { type: 'cc.UITransform', props: { _contentSize: { width: 750, height: 180 } } },
        { type: 'cc.Sprite', props: { _color: { r: 255, g: 248, b: 220, a: 255 } } },
      ],
      children: [
        {
          name: 'levelLabel',
          props: { _lpos: { x: 0, y: 45, z: 0 } },
          components: [
            { type: 'cc.UITransform', props: { _contentSize: { width: 400, height: 50 } } },
            { type: 'cc.Label', props: { _string: '第 1 关', _fontSize: 40, _color: { r: 93, g: 64, b: 55, a: 255 } } },
          ],
        },
        {
          name: 'taskLabel',
          props: { _lpos: { x: 0, y: 0, z: 0 } },
          components: [
            { type: 'cc.UITransform', props: { _contentSize: { width: 420, height: 36 } } },
            { type: 'cc.Label', props: { _string: '目标：清空全部水果', _fontSize: 28, _color: { r: 141, g: 110, b: 99, a: 255 } } },
          ],
        },
        {
          name: 'basketStatusLabel',
          props: { _lpos: { x: 0, y: -45, z: 0 } },
          components: [
            { type: 'cc.UITransform', props: { _contentSize: { width: 320, height: 32 } } },
            { type: 'cc.Label', props: { _string: '篮筐容量：6 格', _fontSize: 24, _color: { r: 120, g: 90, b: 80, a: 255 } } },
          ],
        },
      ],
    },
    {
      name: 'resultPanel',
      active: false,
      props: { _lpos: { x: 0, y: 0, z: 0 } },
      components: [
        { type: 'cc.UITransform', props: { _contentSize: { width: 500, height: 400 } } },
        { type: 'cc.Sprite', props: { _color: { r: 255, g: 255, b: 255, a: 238 } } },
      ],
      children: [
        {
          name: 'resultTitle',
          props: { _lpos: { x: 0, y: 80, z: 0 } },
          components: [
            { type: 'cc.UITransform', props: { _contentSize: { width: 400, height: 60 } } },
            { type: 'cc.Label', props: { _string: '装箱完成!', _fontSize: 48, _color: { r: 255, g: 107, b: 53, a: 255 } } },
          ],
        },
        {
          name: 'resultSubtitle',
          props: { _lpos: { x: 0, y: 20, z: 0 } },
          components: [
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
      components: [
        { type: 'cc.UITransform', props: { _contentSize: { width: 400, height: 50 } } },
        { type: 'cc.Label', props: { _string: '', _fontSize: 30, _color: { r: 255, g: 255, b: 255, a: 255 } } },
      ],
    },
  ],
};

const POWER_UP_TREE = {
  name: 'PowerUpPanel',
  props: { _lpos: { x: 300, y: 180, z: 0 } },
  components: [
    { type: 'cc.UITransform', props: { _contentSize: { width: 180, height: 260 } } },
  ],
  children: [
    createPowerUpButton('freshBoxButton', '保鲜盒', 'freshBoxCountLabel', { x: 0, y: 70, z: 0 }, '#87CEEB'),
    createPowerUpButton('expandButton', '扩容', 'expandCountLabel', { x: 0, y: -50, z: 0 }, '#90EE90'),
  ],
};

// ===================== 辅助函数 =====================

function generateBasketSlots() {
  const slots = [];
  for (let i = 0; i < 6; i++) {
    slots.push({
      name: `BasketSlot_${i}`,
      props: { _lpos: { x: -300 + i * 120, y: 0, z: 0 } },
      components: [
        { type: 'db://assets/scripts/entities/BasketSlot', afterCreate: null },
        { type: 'cc.UITransform', props: { _contentSize: { width: 100, height: 100 } } },
        { type: 'cc.Sprite', props: { _color: { r: 210, g: 180, b: 140, a: 255 } } },
      ],
      children: [
        {
          name: 'fruitAnchor',
          props: { _lpos: { x: 0, y: 0, z: 0 } },
          components: [
            { type: 'cc.UITransform', props: { _contentSize: { width: 80, height: 80 } } },
          ],
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
    components: [
      { type: 'cc.UITransform', props: { _contentSize: size } },
      { type: 'cc.Sprite', props: { _color: { r, g, b, a: 255 } } },
      { type: 'cc.Button' },
      { type: 'cc.Label', props: { _string: text, _fontSize: 28, _color: { r: 255, g: 255, b: 255, a: 255 } } },
    ],
  };
}

function createPowerUpButton(name, text, countLabelName, pos, colorHex) {
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);
  return {
    name,
    props: { _lpos: pos },
    components: [
      { type: 'cc.UITransform', props: { _contentSize: { width: 140, height: 100 } } },
      { type: 'cc.Sprite', props: { _color: { r, g, b, a: 255 } } },
      { type: 'cc.Button' },
    ],
    children: [
      {
        name: `${name}_text`,
        props: { _lpos: { x: 0, y: 16, z: 0 } },
        components: [
          { type: 'cc.UITransform', props: { _contentSize: { width: 120, height: 28 } } },
          { type: 'cc.Label', props: { _string: text, _fontSize: 24, _color: { r: 255, g: 255, b: 255, a: 255 } } },
        ],
      },
      {
        name: countLabelName,
        props: { _lpos: { x: 0, y: -20, z: 0 } },
        components: [
          { type: 'cc.UITransform', props: { _contentSize: { width: 120, height: 24 } } },
          { type: 'cc.Label', props: { _string: 'x0', _fontSize: 20, _color: { r: 255, g: 255, b: 255, a: 230 } } },
        ],
      },
    ],
  };
}

// ===================== 编辑器扩展主逻辑 =====================

/**
 * 收集整棵树的组件任务
 * @param {Array} pathSoFar - 当前名称路径
 * @param {object} tree - 节点定义
 * @param {Array} tasks - 收集到的任务列表
 */
function collectComponentTasks(pathSoFar, tree, tasks) {
  const currentPath = [...pathSoFar, tree.name];

  // 收集当前节点的组件任务
  if (tree.components) {
    for (const comp of tree.components) {
      tasks.push({
        path: currentPath,
        type: comp.type,
        props: comp.props || null,
      });
    }
  }

  // 递归收集子节点
  if (tree.children) {
    for (const child of tree.children) {
      collectComponentTasks(currentPath, child, tasks);
    }
  }
}

/**
 * 递归创建节点树（仅节点，不含组件）
 */
async function createNodeTree(parentUuid, tree) {
  const nodeUuid = await Editor.Message.request('scene', 'create-node', {
    parent: parentUuid,
    name: tree.name,
  });

  // 设置节点属性
  if (tree.props) {
    for (const [key, value] of Object.entries(tree.props)) {
      await Editor.Message.request('scene', 'set-node-property', {
        uuid: nodeUuid,
        path: key,
        value: value,
      });
    }
  }

  if (tree.active === false) {
    await Editor.Message.request('scene', 'set-node-property', {
      uuid: nodeUuid,
      path: '_active',
      value: false,
    });
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
 * 通过 scene script 为节点挂载组件
 */
async function addComponentsViaSceneScript(tasks) {
  if (tasks.length === 0) return;

  // 分批处理，标识哪些组件已经通过 create-node 挂载（自带 UITransform 等引擎内置组件）
  const gameScriptTasks = tasks.filter(t => t.type.startsWith('db://'));
  const builtinTasks = tasks.filter(t => t.type.startsWith('cc.'));

  // 用 scene script 批量挂载项目脚本组件
  if (gameScriptTasks.length > 0) {
    const results = await Editor.Message.request('scene', 'execute-scene-script', {
      name: 'scene-builder',
      method: 'batchAddComponents',
      args: [gameScriptTasks],
    });

    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
      throw new Error(`组件挂载失败:\n${errors.map(e => e.error).join('\n')}`);
    }
  }

  // 用 scene script 挂载内置组件（cc.UITransform, cc.Sprite, cc.Label, cc.Button）
  const batched = [];
  for (let i = 0; i < builtinTasks.length; i += 20) {
    batched.push(builtinTasks.slice(i, i + 20));
  }

  for (const batch of batched) {
    if (batch.length === 0) continue;
    const results = await Editor.Message.request('scene', 'execute-scene-script', {
      name: 'scene-builder',
      method: 'batchAddComponents',
      args: [batch],
    });

    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
      throw new Error(`内置组件挂载失败:\n${errors.map(e => e.error).join('\n')}`);
    }
  }
}

/**
 * 通过 editor API 设置组件属性
 * 使用 scene:execute-component-method 或 scene:set-component-property
 */
async function setComponentPropsViaEditor(tasks) {
  // 查询所有节点上的组件
  // 遍历 task，找到对应组件并设置属性
  // 这里简化处理：对每个有 props 的 task，需要找到对应的 component UUID

  // 收集所有需要设置属性且路径只有一级的节点（Canvas 下的直接子节点以及更深层的）
  // 遍历整棵树收集所有节点及其路径
  const allNodes = [];
  function collectNodes(tree, path) {
    const currentPath = [...path, tree.name];
    allNodes.push({ path: currentPath, tree });
    if (tree.children) {
      for (const child of tree.children) {
        collectNodes(child, currentPath);
      }
    }
  }
  collectNodes(SCENE_TREE, []);
  collectNodes(UI_TREE, []);
  collectNodes(POWER_UP_TREE, []);

  // 查询每个节点的组件，设置属性
  for (const nodeInfo of allNodes) {
    if (!nodeInfo.tree.components) continue;

    // 查询该节点的 UUID（通过 name 查询）
    // 由于 create-node 返回 UUID，我们需要跟踪 UUID
    // 这里采用 name 查询方式
    const queryResult = await Editor.Message.request('scene', 'query-node', {
      name: nodeInfo.tree.name,
    });

    // query-node 返回匹配的节点数组
    const nodeUuids = Array.isArray(queryResult) ? queryResult : (queryResult ? [queryResult] : []);
    
    for (const nodeUuid of nodeUuids) {
      const comps = await Editor.Message.request('scene', 'query-node-component', {
        uuid: nodeUuid,
      });

      if (!comps || comps.length === 0) continue;

      // 匹配组件类型并设置属性
      const definedComps = nodeInfo.tree.components;
      let compIdx = 0;

      for (const dc of definedComps) {
        if (!dc.props) continue;
        // 跳过不带 type 的
        if (!dc.type) continue;

        // 查找匹配的组件
        for (let i = compIdx; i < comps.length; i++) {
          const c = comps[i];
          if (c.type === dc.type || (dc.type.startsWith('db://') && c.type.includes(dc.type.replace('db://', '')))) {
            for (const [key, value] of Object.entries(dc.props)) {
              await Editor.Message.request('scene', 'set-component-property', {
                uuid: c.uuid,
                path: key,
                value: value,
              });
            }
            compIdx = i + 1;
            break;
          }
        }
      }
    }
  }
}

/**
 * 生成完整场景
 */
async function generateScene() {
  try {
    // 确认操作
    Editor.Dialog.info('场景生成器', {
      detail: '将在 Canvas 下重新生成完整的游戏节点树，是否继续？',
      buttons: ['取消', '确定'],
      default: 1,
    });

    // 获取或创建 Canvas
    const queryResult = await Editor.Message.request('scene', 'query-node', {
      name: 'Canvas',
    });

    let canvasUuid;
    if (queryResult && queryResult.length > 0) {
      canvasUuid = queryResult[0];
    } else {
      canvasUuid = await Editor.Message.request('scene', 'create-node', {
        name: 'Canvas',
      });
    }

    // 确保 Canvas 有 cc.Canvas 和 UITransform 组件（通过 scene script）
    const canvasComps = await Editor.Message.request('scene', 'query-node-component', {
      uuid: canvasUuid,
    });

    const hasCanvas = canvasComps.some(c => c.type === 'cc.Canvas');
    const hasUITransform = canvasComps.some(c => c.type === 'cc.UITransform');

    if (!hasCanvas || !hasUITransform) {
      const missingComps = [];
      if (!hasCanvas) missingComps.push({ path: ['Canvas'], type: 'cc.Canvas', props: null });
      if (!hasUITransform) missingComps.push({ path: ['Canvas'], type: 'cc.UITransform', props: { _contentSize: { width: 750, height: 1334 } } });

      await Editor.Message.request('scene', 'execute-scene-script', {
        name: 'scene-builder',
        method: 'batchAddComponents',
        args: [missingComps],
      });

      // 设置设计分辨率
      if (!hasUITransform) {
        const updatedComps = await Editor.Message.request('scene', 'query-node-component', { uuid: canvasUuid });
        const transformComp = updatedComps.find(c => c.type === 'cc.UITransform');
        if (transformComp) {
          await Editor.Message.request('scene', 'set-component-property', {
            uuid: transformComp.uuid,
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

    // ====== 阶段1: 创建纯节点树 ======
    await createNodeTree(canvasUuid, SCENE_TREE);
    await createNodeTree(canvasUuid, UI_TREE);
    await createNodeTree(canvasUuid, POWER_UP_TREE);

    // ====== 阶段2: 通过 scene script 挂载所有组件 ======
    const allTasks = [];
    collectComponentTasks([], SCENE_TREE, allTasks);
    collectComponentTasks([], UI_TREE, allTasks);
    collectComponentTasks([], POWER_UP_TREE, allTasks);

    await addComponentsViaSceneScript(allTasks);

    // ====== 阶段3: 设置组件属性（通过 editor API） ======
    await setComponentPropsViaEditor(allTasks);

    // 保存场景
    await Editor.Message.request('scene', 'save-scene');

    Editor.Dialog.info('场景生成器', {
      detail: `场景生成完成！

节点列表：
  Canvas
  ├── GameManager → GameManager.ts ✓
  │   ├── fruitContainer
  │   └── basketContainer
  │       ├── BasketSlot_0 → BasketSlot.ts ✓
  │       └── ... (6个)
  ├── UIManager → UIManager.ts ✓
  │   ├── TopBar → levelLabel / taskLabel
  │   ├── resultPanel
  │   └── tipNode
  └── PowerUpPanel
      ├── freshBoxButton
      └── expandButton

下一步：在 GameManager 组件中手动拖拽引用绑定
  - fruitContainer / basketContainer
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
  load() {
    console.log('[scene-builder] 扩展已加载，菜单：扩展 → 水果消除 → 生成场景');
  },

  unload() {},

  methods: {
    generateScene,
  },
};
