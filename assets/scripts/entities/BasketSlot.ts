import { _decorator, Component, Node, Sprite, Color, tween, Vec3 } from 'cc';
import { FruitItem, FruitType } from './FruitItem';

const { ccclass, property } = _decorator;

export type SlotState = 'empty' | 'occupied' | 'matching';

@ccclass('BasketSlot')
export class BasketSlot extends Component {
  @property(Sprite)
  bgSprite: Sprite = null!;

  @property(Node)
  fruitAnchor: Node = null!;

  // ---- 运行时 ----
  private _index: number = 0;
  private _currentFruit: FruitItem | null = null;
  private _state: SlotState = 'empty';

  public init(index: number): void {
    this._index = index;
    this._state = 'empty';
    this.ensurePlaceholderNodes();
    if (this.fruitAnchor) {
      this.fruitAnchor.removeAllChildren();
    }
    this.resetHighlight();
  }

  /** 放入水果 */
  public setFruit(fruit: FruitItem): void {
    this._currentFruit = fruit;
    this._state = 'occupied';

    if (this.fruitAnchor) {
      fruit.node.setParent(this.fruitAnchor);
      fruit.node.setPosition(0, 0, 0);
      fruit.node.setScale(1, 1, 1);
    }
  }

  /** 播放消除动画 */
  public playMatchAnimation(onComplete: () => void): void {
    if (!this._currentFruit) {
      onComplete();
      return;
    }

    this._state = 'matching';
    this._currentFruit.playMatchAnimation(() => {
      onComplete();
    });
  }

  /** 清空槽位 */
  public clear(): void {
    if (this._currentFruit) {
      if (this._currentFruit.node && this._currentFruit.node.isValid) {
        this._currentFruit.node.destroy();
      }
      this._currentFruit = null;
    }
    this._state = 'empty';

    if (this.fruitAnchor) {
      this.fruitAnchor.removeAllChildren();
    }
  }

  private ensurePlaceholderNodes(): void {
    if (!this.bgSprite) {
      this.bgSprite = this.getComponent(Sprite) || this.addComponent(Sprite);
    }
    if (!this.fruitAnchor) {
      const anchor = new Node('fruitAnchor');
      anchor.setParent(this.node);
      this.fruitAnchor = anchor;
    }
  }

  /** 危险提示（红色） */
  public setWarningHighlight(): void {
    if (this.bgSprite) {
      this.bgSprite.color = new Color(255, 100, 100, 255);
    }
  }

  /** 正常状态 */
  public resetHighlight(): void {
    if (this.bgSprite) {
      this.bgSprite.color = new Color(210, 180, 140, 255);
    }
  }

  // ---- getters ----
  public get index(): number { return this._index; }
  public get currentFruit(): FruitItem | null { return this._currentFruit; }
  public get isEmpty(): boolean { return this._state === 'empty'; }
  public get state(): SlotState { return this._state; }
  public get fruitType(): string | null {
    return this._currentFruit ? this._currentFruit.fruitType : null;
  }
}
