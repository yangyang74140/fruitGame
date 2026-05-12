import { _decorator, Component, Node, Sprite, tween, Vec3 } from 'cc';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

/** 水果种类 */
export enum FruitType {
  STRAWBERRY = 'strawberry',
  ORANGE = 'orange',
  GRAPE = 'grape',
  LEMON = 'lemon',
  WATERMELON = 'watermelon',
  BLUEBERRY = 'blueberry',
}

/** 水果状态（字符串枚举，方便序列化） */
export type FruitState = 'onBoard' | 'inBasket' | 'matched';

@ccclass('FruitItem')
export class FruitItem extends Component {
  @property(Sprite)
  fruitSprite: Sprite = null!;

  @property(Node)
  frozenOverlay: Node | null = null;

  @property(Node)
  highlightRing: Node | null = null;

  // ---- 运行时数据 ----
  private _fruitType: FruitType = FruitType.STRAWBERRY;
  private _isFrozen: boolean = false;
  private _isClickable: boolean = true;
  private _layer: number = 0;
  private _state: FruitState = 'onBoard';
  private _unfreezeProgress: number = 0;

  /** 水果颜色映射 */
  private static COLOR_MAP: Record<FruitType, string> = {
    [FruitType.STRAWBERRY]: '#FF4757',
    [FruitType.ORANGE]: '#FFA502',
    [FruitType.GRAPE]: '#7B68EE',
    [FruitType.LEMON]: '#FFE042',
    [FruitType.WATERMELON]: '#2ED573',
    [FruitType.BLUEBERRY]: '#5352ED',
  };

  /** 水果中文名 */
  private static NAME_MAP: Record<FruitType, string> = {
    [FruitType.STRAWBERRY]: '草莓',
    [FruitType.ORANGE]: '橙子',
    [FruitType.GRAPE]: '葡萄',
    [FruitType.LEMON]: '柠檬',
    [FruitType.WATERMELON]: '西瓜',
    [FruitType.BLUEBERRY]: '蓝莓',
  };

  // ==================== 初始化 ====================

  public init(type: FruitType, frozen: boolean, layer: number): void {
    this._fruitType = type;
    this._isFrozen = frozen;
    this._layer = layer;
    this._state = 'onBoard';
    this._unfreezeProgress = 0;

    this.updateFrozenVisual(frozen);
    this.updateClickableVisual();
    this.setPlaceholderColor(type);
  }

  /** 用纯色占位 Sprite（无贴图时显示颜色方块） */
  private setPlaceholderColor(type: FruitType): void {
    if (!this.fruitSprite) return;

    const hex = FruitItem.COLOR_MAP[type];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    this.fruitSprite.color = { r, g, b, a: 255 } as any;
  }

  // ==================== 交互 ====================

  /** 点击事件入口（在 Cocos Creator 中绑定到 Button 或 Node 的点击事件） */
  public onTouch(): void {
    GameManager.instance.onFruitTapped(this);
  }

  /** 尝试解冻：每次点击累计进度，2 次解冻 */
  public tryUnfreeze(): boolean {
    if (!this._isFrozen) return true;
    this._unfreezeProgress++;
    if (this._unfreezeProgress >= 2) {
      this.unfreeze();
      return true;
    }
    return false;
  }

  /** 解冻 */
  public unfreeze(): void {
    this._isFrozen = false;
    this._unfreezeProgress = 0;
    this.updateFrozenVisual(false);
    this.updateClickableVisual();
  }

  /** 离开场景（被放入篮筐） */
  public removeFromScene(): void {
    this._state = 'inBasket';
    this.node.removeFromParent();
  }

  /** 消除动画 */
  public playMatchAnimation(onComplete: () => void): void {
    this._state = 'matched';

    tween(this.node)
      .to(0.15, { scale: new Vec3(1.3, 1.3, 1) })
      .to(0.3, { scale: new Vec3(0, 0, 1) })
      .call(() => {
        onComplete();
      })
      .start();
  }

  // ==================== 视觉更新 ====================

  private updateFrozenVisual(frozen: boolean): void {
    if (this.frozenOverlay) {
      this.frozenOverlay.active = frozen;
    }
  }

  private updateClickableVisual(): void {
    if (this.highlightRing) {
      this.highlightRing.active = this._isClickable;
    }
  }

  public setClickable(val: boolean): void {
    this._isClickable = val;
    this.updateClickableVisual();
  }

  // ---- getters ----
  public get fruitType(): FruitType { return this._fruitType; }
  public get fruitTypeName(): string { return FruitItem.NAME_MAP[this._fruitType]; }
  public get isFrozen(): boolean { return this._isFrozen; }
  public get isUnfreezing(): boolean { return this._isFrozen && this._unfreezeProgress > 0; }
  public get isClickable(): boolean { return this._isClickable; }
  public get layer(): number { return this._layer; }
  public get state(): FruitState { return this._state; }
}
