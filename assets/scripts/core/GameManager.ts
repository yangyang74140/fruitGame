import { _decorator, Component, Node } from 'cc';
import { LevelManager } from './LevelManager';
import { RuleEngine } from './RuleEngine';
import { BasketSlot } from '../entities/BasketSlot';
import { FruitItem } from '../entities/FruitItem';
import { UIManager } from '../ui/UIManager';

const { ccclass, property } = _decorator;

/** 游戏全局状态枚举 */
export enum GameState {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  WIN = 'win',
  LOSE = 'lose',
}

/** 道具类型 */
export enum PowerUpType {
  FRESH_BOX = 'freshBox',    // 保鲜盒：解冻一个冰冻水果
  BASKET_EXPAND = 'expand',  // 扩容：篮筐临时+1格
}

@ccclass('GameManager')
export class GameManager extends Component {
  // ---- 单例 ----
  private static _instance: GameManager | null = null;
  public static get instance(): GameManager {
    return GameManager._instance!;
  }

  // ---- 子模块引用 ----
  @property(LevelManager)
  levelManager: LevelManager = null!;

  @property(RuleEngine)
  ruleEngine: RuleEngine = null!;

  @property(UIManager)
  uiManager: UIManager = null!;

  // ---- 场景节点引用 ----
  @property(Node)
  fruitContainer: Node = null!;   // 水果父节点

  @property(Node)
  basketContainer: Node = null!;  // 篮筐父节点

  // ---- 状态 ----
  private _state: GameState = GameState.IDLE;
  private _currentLevel: number = 1;
  private _basketSlots: BasketSlot[] = [];
  private _basketCapacity: number = 6;           // 基础容量
  private _expandCount: number = 0;               // 扩容使用次数

  // ---- 生命周期 ----
  onLoad() {
    GameManager._instance = this;
  }

  start() {
    this.initBasketSlots();
  }

  // ==================== 公开 API ====================

  /** 开始指定关卡 */
  public startLevel(levelId: number): void {
    this._currentLevel = levelId;
    this._state = GameState.PLAYING;
    this.resetBasket();
    this.levelManager.loadLevel(levelId);
    this.uiManager.showLevel(levelId);
  }

  /** 玩家点击水果 */
  public onFruitTapped(fruit: FruitItem): void {
    if (this._state !== GameState.PLAYING) return;
    if (!fruit.isClickable) return;
    if (fruit.isFrozen) {
      this.uiManager.showTip('需要先解冻');
      return;
    }

    // 找到第一个空篮筐槽
    const slot = this.findEmptySlot();
    if (!slot) {
      this.onBasketFull();
      return;
    }

    // 移出场景，放入篮筐
    fruit.removeFromScene();
    slot.setFruit(fruit);

    // 检测 3 消
    this.checkMatch();
  }

  /** 使用道具 */
  public usePowerUp(type: PowerUpType): void {
    switch (type) {
      case PowerUpType.FRESH_BOX:
        this.unfreezeRandomFruit();
        break;
      case PowerUpType.BASKET_EXPAND:
        this.expandBasket();
        break;
    }
  }

  // ==================== 内部逻辑 ====================

  /** 初始化篮筐槽位 */
  private initBasketSlots(): void {
    this._basketSlots = this.basketContainer.getComponentsInChildren(BasketSlot);
    // 初始只激活 6 个
    this._basketSlots.forEach((slot, i) => {
      slot.init(i);
      slot.node.active = i < this._basketCapacity;
    });
  }

  /** 查找第一个空槽 */
  private findEmptySlot(): BasketSlot | null {
    return this._basketSlots.find(s => s.isEmpty && s.node.active) || null;
  }

  /** 检测 3 消 */
  private checkMatch(): void {
    const occupied = this._basketSlots.filter(s => !s.isEmpty && s.node.active);
    const fruitTypeCount = new Map<string, BasketSlot[]>();

    occupied.forEach(slot => {
      const type = slot.currentFruit!.fruitType;
      if (!fruitTypeCount.has(type)) fruitTypeCount.set(type, []);
      fruitTypeCount.get(type)!.push(slot);
    });

    // 找到第一个满足 3 消的水果类型
    for (const [type, slots] of fruitTypeCount) {
      if (slots.length >= 3) {
        this.executeMatch(type, slots.slice(0, 3));
        return; // 一次只处理一组消除
      }
    }
  }

  /** 执行消除 */
  private executeMatch(fruitType: string, slots: BasketSlot[]): void {
    // 播放装箱动画，然后清空槽位
    slots.forEach(slot => {
      slot.playMatchAnimation(() => {
        slot.clear();
        // 动画结束后再次检测（连锁消除）
        this.checkMatch();
      });
    });

    // 检测是否全部清空
    this.scheduleOnce(() => {
      this.checkWinCondition();
    }, 0.5);
  }

  /** 篮筐满时的处理 */
  private onBasketFull(): void {
    // 检查是否还有可用的消除组合
    const occupied = this._basketSlots.filter(s => !s.isEmpty && s.node.active);
    const typeCount = new Map<string, number>();
    occupied.forEach(s => {
      const t = s.currentFruit!.fruitType;
      typeCount.set(t, (typeCount.get(t) || 0) + 1);
    });

    // 如果没有任何类型 >= 3，判定失败
    const canMatch = Array.from(typeCount.values()).some(c => c >= 3);
    if (!canMatch) {
      this.onGameLose();
    }
  }

  /** 检查胜利条件 */
  private checkWinCondition(): void {
    const remainingFruits = this.fruitContainer.getComponentsInChildren(FruitItem);
    const basketOccupied = this._basketSlots.some(s => !s.isEmpty && s.node.active);

    if (remainingFruits.length === 0 && !basketOccupied) {
      this.onGameWin();
    }
  }

  /** 胜利 */
  private onGameWin(): void {
    this._state = GameState.WIN;
    this.uiManager.showResult(true, this._currentLevel);
  }

  /** 失败 */
  private onGameLose(): void {
    this._state = GameState.LOSE;
    this.uiManager.showResult(false, this._currentLevel);
  }

  /** 解冻一个随机冰冻水果 */
  private unfreezeRandomFruit(): void {
    const frozen = this.fruitContainer
      .getComponentsInChildren(FruitItem)
      .filter(f => f.isFrozen);
    if (frozen.length > 0) {
      frozen[0].unfreeze();
    }
  }

  /** 扩容篮筐 */
  private expandBasket(): void {
    this._expandCount++;
    const totalCapacity = this._basketCapacity + this._expandCount;
    if (totalCapacity <= this._basketSlots.length) {
      this._basketSlots[totalCapacity - 1].node.active = true;
    }
  }

  /** 重置篮筐 */
  private resetBasket(): void {
    this._expandCount = 0;
    this._basketSlots.forEach((slot, i) => {
      slot.clear();
      slot.node.active = i < this._basketCapacity;
    });
  }

  /** 重开当前关卡 */
  public restartLevel(): void {
    this.startLevel(this._currentLevel);
  }

  /** 下一关 */
  public nextLevel(): void {
    if (this._currentLevel < 10) {
      this.startLevel(this._currentLevel + 1);
    }
  }

  // ---- getters ----
  public get state(): GameState { return this._state; }
  public get currentLevel(): number { return this._currentLevel; }
  public get basketSlots(): BasketSlot[] { return this._basketSlots; }
}
