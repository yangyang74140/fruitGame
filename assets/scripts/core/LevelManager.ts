import { _decorator, Component, Node, Prefab, instantiate, JsonAsset } from 'cc';
import { FruitItem, FruitType } from '../entities/FruitItem';

const { ccclass, property } = _decorator;

/** 关卡数据中的水果定义 */
interface LevelFruitData {
  type: FruitType;
  x: number;
  y: number;
  frozen?: boolean;
  layer?: number;  // 显示层级，0=最前
}

/** 关卡配置结构 */
interface LevelConfig {
  level: number;
  target: string;
  targetCount?: number;
  fruits: LevelFruitData[];
  frozenCount: number;
}

@ccclass('LevelManager')
export class LevelManager extends Component {
  @property(Node)
  fruitContainer: Node = null!;

  @property(Prefab)
  fruitPrefab: Prefab = null!;

  @property(Prefab)
  frozenOverlayPrefab: Prefab = null!;

  /** 当前关卡配置 */
  private _currentConfig: LevelConfig | null = null;

  /** 加载关卡 */
  public loadLevel(levelId: number): void {
    // 清空当前水果
    this.fruitContainer.removeAllChildren();

    // 加载关卡 JSON
    const path = `levels/level_${String(levelId).padStart(2, '0')}`;
    const asset = this._loadJsonAsset(path);
    if (!asset) {
      console.error(`[LevelManager] 关卡 ${levelId} 数据加载失败: ${path}`);
      return;
    }

    this._currentConfig = asset.json as LevelConfig;
    this.spawnFruits(this._currentConfig.fruits);
  }

  /** 生成水果 */
  private spawnFruits(fruits: LevelFruitData[]): void {
    // 按层级排序（高层先产生，放在底层）
    const sorted = [...fruits].sort((a, b) => (b.layer || 0) - (a.layer || 0));

    sorted.forEach(data => {
      const fruitNode = instantiate(this.fruitPrefab);
      fruitNode.setPosition(data.x, data.y, 0);
      fruitNode.setParent(this.fruitContainer);

      const fruitComp = fruitNode.getComponent(FruitItem);
      if (fruitComp) {
        fruitComp.init(data.type, data.frozen || false, data.layer || 0);
      }
    });
  }

  /** 获取当前关卡可点击的水果 */
  public getClickableFruits(): FruitItem[] {
    return this.fruitContainer
      .getComponentsInChildren(FruitItem)
      .filter(f => f.isClickable);
  }

  /** 获取剩余水果数量 */
  public getRemainingCount(): number {
    return this.fruitContainer.getComponentsInChildren(FruitItem).length;
  }

  /** 获取当前关卡配置 */
  public get currentConfig(): LevelConfig | null {
    return this._currentConfig;
  }

  /** 加载 JSON 资源（占位，实际项目中 Cocos 通过 resources.load 加载） */
  private _loadJsonAsset(path: string): any {
    // 实际 Cocos Creator 中应使用:
    // resources.load(path, JsonAsset, callback)
    // 此处为骨架代码，运行时由 Cocos 资源系统处理
    console.log(`[LevelManager] 请求加载: ${path}`);
    // 返回占位数据，实际运行时会由 Cocos 资源管道加载
    return null;
  }
}
