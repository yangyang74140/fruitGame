import { _decorator, Component, Node, Prefab, instantiate, resources, JsonAsset } from 'cc';
import { FruitItem, FruitType } from '../entities/FruitItem';

const { ccclass, property } = _decorator;

/** 关卡数据中的水果定义 */
export interface LevelFruitData {
  type: FruitType;
  x: number;
  y: number;
  frozen?: boolean;
  layer?: number;
}

/** 关卡配置结构 */
export interface LevelConfig {
  level: number;
  name: string;
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

  /** 当前关卡配置 */
  private _currentConfig: LevelConfig | null = null;
  private _loadedCallback: (() => void) | null = null;

  /** 加载关卡（异步，通过 resources.load 加载 JSON） */
  public loadLevel(levelId: number, onComplete?: () => void): void {
    this._loadedCallback = onComplete || null;

    // 清空当前水果
    this.fruitContainer.removeAllChildren();

    // 异步加载关卡 JSON
    const path = `levels/level_${String(levelId).padStart(2, '0')}`;
    resources.load(path, JsonAsset, (err, asset) => {
      if (err) {
        console.error(`[LevelManager] 关卡 ${levelId} 加载失败:`, err);
        return;
      }

      this._currentConfig = asset.json as LevelConfig;
      this.spawnFruits(this._currentConfig.fruits);

      if (this._loadedCallback) {
        this._loadedCallback();
      }
    });
  }

  /** 生成水果实例 */
  private spawnFruits(fruits: LevelFruitData[]): void {
    // 按层级排序（底层先产生，放在上层之下）
    const sorted = [...fruits].sort((a, b) => (b.layer || 0) - (a.layer || 0));

    sorted.forEach(data => {
      if (!this.fruitPrefab) {
        console.warn('[LevelManager] fruitPrefab 未设置，跳过实例化');
        return;
      }

      const fruitNode = instantiate(this.fruitPrefab);
      fruitNode.setPosition(data.x, data.y, 0);
      fruitNode.setParent(this.fruitContainer);

      const fruitComp = fruitNode.getComponent(FruitItem);
      if (fruitComp) {
        fruitComp.init(data.type, data.frozen || false, data.layer || 0);
      }
    });

    // 生成后更新可点击状态
    this.scheduleOnce(() => this.updateClickableStates(), 0);
  }

  /** 更新所有水果的可点击状态（遮挡判断） */
  public updateClickableStates(): void {
    const allFruits = this.fruitContainer.getComponentsInChildren(FruitItem);

    allFruits.forEach(fruit => {
      // 冰冻的水果不可直接点击
      if (fruit.isFrozen && !fruit.isUnfreezing) {
        fruit.setClickable(false);
        return;
      }

      // 超出场景的水果不可点击
      if (fruit.state === 'inBasket' || fruit.state === 'matched') {
        fruit.setClickable(false);
        return;
      }

      // 检查是否被上层水果遮挡
      const fruitPos = fruit.node.position;
      const fruitLayer = fruit.layer;
      let blocked = false;

      for (const other of allFruits) {
        if (other === fruit) continue;
        if (other.layer >= fruitLayer) continue; // 下层不遮挡上层
        if (other.state === 'inBasket' || other.state === 'matched') continue;

        // 简单矩形碰撞检测判断遮挡
        const otherPos = other.node.position;
        const dist = Math.abs(fruitPos.x - otherPos.x) + Math.abs(fruitPos.y - otherPos.y);
        if (dist < 60) {
          blocked = true;
          break;
        }
      }

      fruit.setClickable(!blocked);
    });
  }

  /** 获取当前关卡可点击的水果 */
  public getClickableFruits(): FruitItem[] {
    return this.fruitContainer
      .getComponentsInChildren(FruitItem)
      .filter(f => f.isClickable);
  }

  /** 获取场景中剩余水果数量（不含已入篮和已消除的） */
  public getRemainingCount(): number {
    return this.fruitContainer
      .getComponentsInChildren(FruitItem)
      .filter(f => f.state === 'onBoard')
      .length;
  }

  /** 获取当前关卡配置 */
  public get currentConfig(): LevelConfig | null {
    return this._currentConfig;
  }
}
