/**
 * 场景脚本 — 在 Cocos Creator 场景进程中运行，可直接调用引擎 API
 * 用于批量创建节点、添加组件、设置属性
 */

'use strict';

const { join } = require('path');
module.paths.push(join(Editor.App.path, 'node_modules'));

const { director, Node, UITransform, Sprite, Label, Button, Canvas, Color, isValid } = require('cc');

/**
 * 递归通过名称路径查找节点
 * @param {string[]} pathParts - 从场景根开始的名称路径，如 ['Canvas', 'GameManager', 'fruitContainer']
 * @returns {Node|null}
 */
function findNodeByPath(pathParts) {
  let node = director.getScene();
  for (const part of pathParts) {
    if (!node) return null;
    node = node.getChildByName(part);
  }
  return node;
}

/**
 * 为节点添加组件
 * @param {string[]} pathParts - 节点路径
 * @param {string} componentType - 组件类型，如 'cc.UITransform' 或 'db://assets/scripts/core/GameManager'
 * @param {object} props - 可选，组件属性
 * @returns {object} { success: boolean, error?: string }
 */
function addComponent(pathParts, componentType, props) {
  const node = findNodeByPath(pathParts);
  if (!node) {
    return { success: false, error: `节点未找到: ${pathParts.join('/')}` };
  }

  // 将编辑器组件路径转换为引擎可识别的类
  let CompClass;
  if (componentType.startsWith('cc.')) {
    // 内置组件：cc.UITransform, cc.Sprite 等
    const name = componentType.replace('cc.', '');
    const ccGlobals = { UITransform, Sprite, Label, Button, Canvas };
    CompClass = ccGlobals[name];
  } else if (componentType.startsWith('db://')) {
    // 项目脚本：db://assets/scripts/core/GameManager
    CompClass = require(componentType);
    // require 返回的是模块对象，其中 default 或 module.exports 可能是组件类
    if (CompClass && CompClass.default) {
      CompClass = CompClass.default;
    }
    if (typeof CompClass !== 'function') {
      // 尝试获取模块导出的同名类
      for (const key of Object.keys(CompClass || {})) {
        if (typeof CompClass[key] === 'function') {
          CompClass = CompClass[key];
          break;
        }
      }
    }
  }

  if (!CompClass || typeof CompClass !== 'function') {
    return { success: false, error: `无法解析组件类型: ${componentType}` };
  }

  try {
    const comp = node.addComponent(CompClass);
    
    if (props && comp) {
      for (const [key, value] of Object.entries(props)) {
        _setProperty(comp, key, value);
      }
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 设置组件属性，兼容 Color 对象转换
 */
function _setProperty(comp, key, value) {
  if (key.startsWith('_')) {
    key = key.slice(1);
  }
  
  // 处理颜色对象
  if (value && typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
    const a = value.a !== undefined ? value.a : 255;
    comp[key] = new Color(value.r, value.g, value.b, a);
    return;
  }
  
  // 处理 _contentSize -> contentSize
  if (key === 'contentSize' && typeof value === 'object' && value.width !== undefined) {
    comp[key] = { width: value.width, height: value.height };
    return;
  }
  
  comp[key] = value;
}

/**
 * 设置节点属性
 */
function setNodeProperty(pathParts, key, value) {
  const node = findNodeByPath(pathParts);
  if (!node) return { success: false, error: `节点未找到: ${pathParts.join('/')}` };

  if (key.startsWith('_')) {
    key = key.slice(1);
  }
  
  // _lpos -> position
  if (key === 'lpos') {
    node.position = { x: value.x, y: value.y, z: value.z || 0 };
    return { success: true };
  }
  
  // active
  if (key === 'active') {
    node.active = !!value;
    return { success: true };
  }

  // 其他属性直接设置
  try {
    node[key] = value;
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ===================== 暴露给外部的方法 =====================

module.exports = {
  load() {},
  unload() {},

  methods: {
    /**
     * 批量添加组件
     * @param {Array} tasks - [{ path: ['Canvas','GameManager'], type: 'db://...', props: {...} }, ...]
     */
    batchAddComponents(tasks) {
      const results = [];
      for (const task of tasks) {
        const res = addComponent(task.path, task.type, task.props);
        if (!res.success) {
          results.push(res);
        }
      }
      return results;
    },

    /**
     * 设置节点属性
     * @param {string[]} path - 节点路径
     * @param {string} key - 属性名
     * @param {*} value - 属性值
     */
    setNodeProperty(path, key, value) {
      return setNodeProperty(path, key, value);
    },
  },
};
