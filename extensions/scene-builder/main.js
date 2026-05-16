/**
 * 水果消除游戏 — 场景生成器扩展（CC 3.8 兼容版）
 */
'use strict';

const SCENE_TREE = {
  name: 'GameManager',
  components: [
    { type: 'db://assets/scripts/core/GameManager' },
  ],
  children: [
    { name: 'fruitContainer', props: { _lpos: { x: 0, y: 0, z: 0 } } },
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
    { type: 'db://assets/scripts/ui/UIManager' },
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

function generateBasketSlots() {
  const slots = [];
  for (let i = 0; i < 6; i++) {
    slots.push({
      name: `BasketSlot_${i}`,
      props: { _lpos: { x: -300 + i * 120, y: 0, z: 0 } },
      components: [
        { type: 'db://assets/scripts/entities/BasketSlot' },
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
    ],
    children: [
      {
        name: `${name}_label`,
        components: [
          { type: 'cc.UITransform', props: { _contentSize: size } },
          { type: 'cc.Label', props: { _string: text, _fontSize: 28, _color: { r: 255, g: 255, b: 255, a: 255 } } },
        ],
      },
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

async function generateScene() {
  try {
    await Editor.Message.request('scene', 'execute-scene-script', {
      name: 'scene-builder',
      method: 'buildScene',
      args: [[SCENE_TREE, UI_TREE, POWER_UP_TREE]],
    });

    // 生成 FruitItem.prefab
    await Editor.Message.request('scene', 'execute-scene-script', {
      name: 'scene-builder',
      method: 'generateFruitPrefab',
      args: [],
    });

    Editor.Dialog.info('场景生成器', {
      detail: `场景生成完成！

已生成：
1. GameManager / fruitContainer / basketContainer
2. 6 个 BasketSlot
3. UIManager / TopBar / resultPanel / tipNode
4. PowerUpPanel / freshBoxButton / expandButton
5. LevelManager 节点
6. FruitItem.prefab

绑定引用和按钮事件已由代码自动完成。
直接运行即可测试。`,
      buttons: ['知道了'],
    });
  } catch (err) {
    Editor.Dialog.error('场景生成器', {
      detail: `生成失败：${err.message}\n\n${err.stack || ''}`,
    });
  }
}

module.exports = {
  load() {
    console.log('[scene-builder] 扩展已加载，菜单：扩展 → 水果消除 → 生成场景');
  },
  unload() {},
  methods: { generateScene },
};
