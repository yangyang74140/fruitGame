/**
 * 场景脚本 — 在 Cocos Creator 场景进程中运行，可直接调用引擎 API
 */
'use strict';

const { join } = require('path');
module.paths.push(join(Editor.App.path, 'node_modules'));

const { director, Node, UITransform, Sprite, Label, Button, Canvas, Color, Vec3, js } = require('cc');

const ccGlobals = { UITransform, Sprite, Label, Button, Canvas };
const projectClassMap = {
  'db://assets/scripts/core/GameManager': 'GameManager',
  'db://assets/scripts/ui/UIManager': 'UIManager',
  'db://assets/scripts/entities/BasketSlot': 'BasketSlot',
  'db://assets/scripts/entities/FruitItem': 'FruitItem',
  'db://assets/scripts/core/LevelManager': 'LevelManager',
};

function findNodeByPath(pathParts) {
  let node = director.getScene();
  for (const part of pathParts) {
    if (!node) return null;
    node = node.getChildByName(part);
  }
  return node;
}

function ensureNode(pathParts) {
  let node = director.getScene();
  for (const part of pathParts) {
    let child = node.getChildByName(part);
    if (!child) {
      child = new Node(part);
      node.addChild(child);
    }
    node = child;
  }
  return node;
}

function setNodeProp(node, key, value) {
  if (key === '_lpos' && value) {
    node.setPosition(new Vec3(value.x || 0, value.y || 0, value.z || 0));
    return;
  }
  if (key === '_active') {
    node.active = !!value;
    return;
  }
  const cleanKey = key.startsWith('_') ? key.slice(1) : key;
  try { node[cleanKey] = value; } catch (_) {}
}

function resolveComponent(componentType) {
  if (componentType.startsWith('cc.')) {
    return ccGlobals[componentType.replace('cc.', '')];
  }
  const className = projectClassMap[componentType];
  if (className) {
    const cls = js.getClassByName(className);
    if (cls) return cls;
  }
  return null;
}

function findComponent(node, componentType) {
  const Comp = resolveComponent(componentType);
  if (!Comp) return null;
  try {
    return node.getComponent(Comp);
  } catch (e) {
    return null;
  }
}

function setComponentProp(comp, key, value) {
  const cleanKey = key.startsWith('_') ? key.slice(1) : key;
  if (value && typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
    comp[cleanKey] = new Color(value.r, value.g, value.b, value.a ?? 255);
    return;
  }
  if (cleanKey === 'contentSize' && value && typeof value === 'object') {
    comp[cleanKey] = { width: value.width, height: value.height };
    return;
  }
  try { comp[cleanKey] = value; } catch (_) {}
}

function applyTree(parentPath, tree) {
  const currentPath = [...parentPath, tree.name];
  const node = ensureNode(currentPath);

  if (tree.props) {
    for (const [k, v] of Object.entries(tree.props)) setNodeProp(node, k, v);
  }
  if (tree.active === false) node.active = false;

  const components = tree.components || tree.component || [];
  const list = Array.isArray(components) ? components : [components];
  for (const item of list) {
    if (!item || !item.type) continue;
    let comp = findComponent(node, item.type);
    if (!comp) {
      const Comp = resolveComponent(item.type);
      if (!Comp || typeof Comp !== 'function') {
        console.warn(`[scene-builder] 跳过无法解析的组件类型: ${item.type}`);
        continue;
      }
      try {
        comp = node.addComponent(Comp);
      } catch (e) {
        console.warn(`[scene-builder] addComponent 异常 (${item.type}):`, e);
        continue;
      }
    }
    if (item.props && comp) {
      for (const [k, v] of Object.entries(item.props)) setComponentProp(comp, k, v);
    }
  }

  if (tree.children) {
    for (const child of tree.children) applyTree(currentPath, child);
  }
}

function clearChildrenExcept(path, keepNames = []) {
  const node = findNodeByPath(path);
  if (!node) return;
  const keep = new Set(keepNames);
  for (const child of [...node.children]) {
    if (!keep.has(child.name)) child.destroy();
  }
}

module.exports = {
  load() {},
  unload() {},
  methods: {
    buildScene(trees) {
      const scene = director.getScene();
      if (!scene) throw new Error('当前没有已加载场景');
      const canvas = ensureNode(['Canvas']);
      if (!canvas.getComponent(Canvas)) canvas.addComponent(Canvas);
      let ui = canvas.getComponent(UITransform);
      if (!ui) ui = canvas.addComponent(UITransform);
      ui.contentSize = { width: 750, height: 1334 };

      clearChildrenExcept(['Canvas'], ['Camera']);

      for (const tree of trees) applyTree(['Canvas'], tree);

      // 创建 LevelManager（场景根级别，不在 Canvas 下）
      const lmNode = ensureNode(['LevelManager']);
      const LM = js.getClassByName('LevelManager');
      if (LM && !lmNode.getComponent(LM)) lmNode.addComponent(LM);

      return { success: true };
    },

    generateFruitPrefab() {
      // FruitItem.prefab 文件已生成在 assets/resources/prefabs/ 目录
      const { join } = require('path');
      const prefabPath = join(Editor.Project.path, 'assets', 'resources', 'prefabs', 'FruitItem.prefab');
      try {
        const fs = require('fs');
        if (fs.existsSync(prefabPath)) {
          console.log('[scene-builder] FruitItem.prefab 已存在:', prefabPath);
          return { success: true };
        }
      } catch (e) {
        // fs 不可用时忽略
      }

      Editor.Message.request('asset-db', 'refresh', 'db://assets/resources/prefabs');
      return { success: true };
    },
  },
};
