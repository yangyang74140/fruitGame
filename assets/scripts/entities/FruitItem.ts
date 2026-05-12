import { _decorator, Component, Sprite, SpriteFrame, Color, tween, Vec3, UIOpacity } from 'cc';

const { ccclass, property } = _decorator;

/** 水果种类枚举 */
export enum FruitType {
  STRAWBERRY = 'strawberry',
  ORANGE = 'orange',
  GRAPE = 'grape',
  LEMON = 'lemon',
  WATERMELON = 'watermelon',
  BLUEBERRY = 'blueberry',
}

/** 水果状态 */
export enum FruitState {
  ON_BOARD = 'onBoard',      // 在场景中
  IN_BASKET = 'inBasket',    // 在篮筐中
  MATCHED = 'matched',       // 已消除
}

@ccclass('FruitItem')
export class FruitItem extends Component {
  @property(Sprite)
  fruitSprite: Sprite = null!;

  @property(Node)
  frozenOverlay: Node | null = null;   // 冰冻覆盖层

  @property(Node)
  highlightRing: Node | null = null;   // 可选中高亮环

  // ---- 运行时数据 ----
  private _fruitType: FruitType = FruitType.STRAWBERRY;
  private _isFrozen: boolean = false;
  private _isClickable: boolean = true;
  private _layer: number = 0;
  private _state: FruitState = FruitState.ON_BOARD;
  private _unfreezeProgress: number = 0;  // 解冻进度（需要点 N 次）

  // ---- 外观资源映射 ----
  private static spriteMap: Record<FruitType, string> = {
    [FruitType.STRAWBERRY]: 'textures/fruit_strawberry/spriteFrame',
    [FruitType.ORANGE]: 'textures/fruit_orange/spriteFrame',
    [FruitType.GRAPE]: 'textures/fruit_grape/spriteFrame',
    [FruitType.LEMON]: 'textures/fruit_lemon/spriteFrame',
    [FruitType.WATERMELON]: 'textures/fruit_watermelon/spriteFrame',
    [FruitType.BLUEBERRY]: 'textures/fruit_blueberry/spriteFrame',
  };

  // ==================== 初始化 ====================

  public init(type: FruitType, frozen: boolean, layer: number): void {
    this._fruitType = type;
    this._isFrozen = frozen;
    this._layer = layer;
    this._state = FruitState.ON_BOARD;

    // 设置外观
    this.setSprite(type);
    this.updateFrozenVisual(frozen);
    this.updateClickable();
  }

  // ==================== 交互 ====================

  /** 从场景飞到篮筐的动画 */
  public flyToBasket(targetPos: Vec3, onComplete: () => void): void {
    this._state = FruitState.IN_BASKET;

    // 跳跃 + 飞行动画
    tween(this.node)
      .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
      .to(0.2, { position: targetPos, scale: new Vec3(0.8, 0.8, 1) })
      .to(0.1, { scale: new Vec3(1, 1, 1) })
      .call(onComplete)
      .start();
  }

  /** 被消除时的动画 */
  public playMatchAnimation(onComplete: () => void): void {
    this._state = FruitState.MATCHED;

    tween(this.node)
      .to(0.15, { scale: new Vec3(1.3, 1.3, 1) })
      .to(0.3, { scale: new Vec3(0, 0, 1) })
      .call(() => {
        this.node.destroy();
        onComplete();
      })
      .start();
  }

  /** 解冻 */
  public unfreeze(): void {
    this._isFrozen = false;
    this.updateFrozenVisual(false);
    this.updateClickable();
  }

  /** 尝试解冻（每次点击累计） */
  public tryUnfreeze(): boolean {
    if (!this._isFrozen) return true;
    this._unfreezeProgress++;
    if (this._unfreezeProgress >= 2) {
      this.unfreeze();
      return true;
    }
    return false;
  }

  // ==================== 视觉更新 ====================

  /** 设置精灵图 */
  private setSprite(type: FruitType): void {
    // 实际项目中通过 resources.load 加载 SpriteFrame
    // this.fruitSprite.spriteFrame = loadedFrame;
    console.log(`[FruitItem] 设置水果: ${type}`);
  }

  /** 更新冰冻视觉 */
  private updateFrozenVisual(frozen: boolean): void {
    if (this.frozenOverlay) {
      this.frozenOverlay.active = frozen;
    }
  }

  /** 更新可点击状态 */
  private updateClickable(): void {
    // 被遮挡（上层有水果）或已冰冻则不可直接点击
    this._isClickable = !this._isFrozen && this._layer <= 0;

    if (this.highlightRing) {
      this.highlightRing.active = this._isClickable;
    }
  }

  /** 移除出场景（进入篮筐后） */
  public removeFromScene(): void {
    this._state = FruitState.IN_BASKET;
    this.node.removeFromParent();
  }

  // ---- getters ----
  public get fruitType(): FruitType { return this._fruitType; }
  public get isFrozen(): boolean { return this._isFrozen; }
  public get isClickable(): boolean { return this._isClickable; }
  public get layer(): number { return this._layer; }
  public get state(): FruitState { return this._state; }

  // ---- setters ----
  public setClickable(val: boolean): void {
    this._isClickable = val;
    if (this.highlightRing) {
      this.highlightRing.active = val;
    }
  }
}
