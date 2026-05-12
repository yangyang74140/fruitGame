import { _decorator, Component, Node, Sprite, Label, tween, Vec3, Color } from 'cc';
import { FruitItem, FruitType } from './FruitItem';

const { ccclass, property } = _decorator;

/** 篮筐槽位状态 */
export enum SlotState {
  EMPTY = 'empty',
  OCCUPIED = 'occupied',
  MATCHING = 'matching',  // 正在执行消除动画
}

@ccclass('BasketSlot')
export class BasketSlot extends Component {
  @property(Sprite)
  bgSprite: Sprite = null!;

  @property(Node)
  fruitAnchor: Node = null!;  // 水果挂载点

  // ---- 运行时数据 ----
  private _index: number = 0;
  private _currentFruit: FruitItem | null = null;
  private _state: SlotState = SlotState.EMPTY;

  /** 初始化槽位 */
  public init(index: number): void {
    this._index = index;
    this._state = SlotState.EMPTY;
    if (this.fruitAnchor) {
      this.fruitAnchor.removeAllChildren();
    }
  }

  /** 放入水果 */
  public setFruit(fruit: FruitItem): void {
    this._currentFruit = fruit;
    this._state = SlotState.OCCUPIED;

    // 挂载水果节点到槽位下
    if (this.fruitAnchor) {
      fruit.node.setParent(this.fruitAnchor);
      fruit.node.setPosition(0, 0, 0);
    }
  }

  /** 播放消除动画 */
  public playMatchAnimation(onComplete: () => void): void {
    if (!this._currentFruit) {
      onComplete();
      return;
    }

    this._state = SlotState.MATCHING;
    this._currentFruit.playMatchAnimation(() => {
      this._state = SlotState.EMPTY;
      this._currentFruit = null;
      onComplete();
    });
  }

  /** 清空槽位 */
  public clear(): void {
    if (this._currentFruit) {
      this._currentFruit.node.destroy();
      this._currentFruit = null;
    }
    this._state = SlotState.EMPTY;

    if (this.fruitAnchor) {
      this.fruitAnchor.removeAllChildren();
    }
  }

  /** 设置高亮（满/危险提示） */
  public setHighlight(color: Color): void {
    if (this.bgSprite) {
      this.bgSprite.color = color;
    }
  }

  /** 重置高亮 */
  public resetHighlight(): void {
    if (this.bgSprite) {
      this.bgSprite.color = Color.WHITE;
    }
  }

  // ---- getters ----
  public get index(): number { return this._index; }
  public get currentFruit(): FruitItem | null { return this._currentFruit; }
  public get isEmpty(): boolean { return this._state === SlotState.EMPTY; }
  public get state(): SlotState { return this._state; }
  public get fruitType(): string | null {
    return this._currentFruit ? this._currentFruit.fruitType : null;
  }
}
