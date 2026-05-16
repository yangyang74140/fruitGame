import { _decorator, Component, Node, find } from 'cc';
import { GameAudio } from '../GameAudio';
import { LevelManager } from './LevelManager';
import {
  findMatch,
  isWin,
  isLose,
  getBasketCapacity,
  RULES,
} from './RuleEngine';
import { BasketSlot } from '../entities/BasketSlot';
import { FruitItem } from '../entities/FruitItem';
import { UIManager } from '../ui/UIManager';

const { ccclass, property } = _decorator;

/** 游戏全局状态 */
export enum GameState {
  IDLE = 'idle',
  PLAYING = 'playing',
  WIN = 'win',
  LOSE = 'lose',
}

export enum PowerUpType {
  FRESH_BOX = 'freshBox',
  BASKET_EXPAND = 'expand',
}

@ccclass('GameManager')
export class GameManager extends Component {
  // ---- 单例 ----
  private static _instance: GameManager | null = null;
  public static get instance(): GameManager {
    return GameManager._instance!;
  }

  // ---- 属性绑定（在 Cocos Creator 编辑器中拖拽绑定） ----

  @property(LevelManager)
  levelManager: LevelManager = null!;

  @property(UIManager)
  uiManager: UIManager = null!;

  @property(Node)
  fruitContainer: Node = null!;

  @property(Node)
  basketContainer: Node = null!;

  // ---- 运行时状态 ----
  private _state: GameState = GameState.IDLE;
  private _currentLevel: number = 1;
  private _basketSlots: BasketSlot[] = [];
  private _expandCount: number = 0;
  private _isProcessing: boolean = false; // 防止快速连点
  private _freshBoxCount: number = 2;
  private _expandPowerCount: number = 1;

  // ---- 生命周期 ----

  onLoad() {
    GameManager._instance = this;
    this.autoBind();
  }

  private autoBind(): void {
    if (!this.levelManager) {
      const lm = find('LevelManager');
      if (lm) {
        this.levelManager = lm.getComponent(LevelManager);
      }
    }
    if (!this.uiManager) {
      const ui = find('Canvas/UIManager');
      if (ui) {
        this.uiManager = ui.getComponent(UIManager);
      }
    }
    if (!this.fruitContainer) {
      const fc = find('Canvas/GameManager/fruitContainer');
      if (fc) this.fruitContainer = fc;
    }
    if (!this.basketContainer) {
      const bc = find('Canvas/GameManager/basketContainer');
      if (bc) this.basketContainer = bc;
    }
  }

  start() {
    this.collectBasketSlots();
    // 自动开始第 1 关
    this.scheduleOnce(() => {
      this.startLevel(1);
    }, 0.1);
  }

  // ==================== 公开 API ====================

  /** 开始指定关卡 */
  public startLevel(levelId: number): void {
    if (levelId > RULES.MAX_LEVEL) {
      console.log('[GameManager] 已通关所有关卡');
      return;
    }

    this._currentLevel = levelId;
    this._state = GameState.PLAYING;
    this._expandCount = 0;
    this._isProcessing = false;
    this._freshBoxCount = 2;
    this._expandPowerCount = 1;

    this.resetBasket();
    this.updateBasketVisualState();
    this.uiManager.showLevel(levelId);
    this.uiManager.updatePowerUpState(this._freshBoxCount, this._expandPowerCount, getBasketCapacity(this._expandCount));
    this.levelManager.loadLevel(levelId, () => {
      console.log(`[GameManager] 第 ${levelId} 关加载完成`);
    });
  }

  /** 玩家点击水果 */
  public onFruitTapped(fruit: FruitItem): void {
    if (this._state !== GameState.PLAYING) return;
    if (this._isProcessing) return;
    if (!fruit.isClickable) return;

    if (fruit.isFrozen) {
      // 尝试解冻
      const unfrozen = fruit.tryUnfreeze();
      GameAudio.playClick();
      if (!unfrozen) {
        this.uiManager.showTip('再点一次解冻');
      } else {
        this.uiManager.showTip('解冻成功');
        this.levelManager.updateClickableStates();
      }
      return;
    }

    // 找到第一个空篮筐槽
    const slot = this.findEmptySlot();
    if (!slot) {
      this.onBasketFull();
      return;
    }

    // 水果入篮
    GameAudio.playClick();
    fruit.removeFromScene();
    slot.setFruit(fruit);

    // 更新遮挡关系
    this.levelManager.updateClickableStates();

    // 检测 3 消
    this._isProcessing = true;
    this.scheduleOnce(() => {
      this.checkMatch();
    }, 0.15);
  }

  /** 使用道具 */
  public usePowerUp(type: PowerUpType): void {
    if (this._state !== GameState.PLAYING) return;

    switch (type) {
      case PowerUpType.FRESH_BOX:
        if (this._freshBoxCount <= 0) {
          this.uiManager.showTip('保鲜盒已用完');
          return;
        }
        this._freshBoxCount--;
        this.unfreezeRandomFruit();
        break;
      case PowerUpType.BASKET_EXPAND:
        if (this._expandPowerCount <= 0) {
          this.uiManager.showTip('扩容道具已用完');
          return;
        }
        this._expandPowerCount--;
        this.expandBasket();
        break;
    }

    this.uiManager.updatePowerUpState(this._freshBoxCount, this._expandPowerCount, getBasketCapacity(this._expandCount));
  }

  // ==================== 内部逻辑 ====================

  private collectBasketSlots(): void {
    if (!this.basketContainer) {
      this._basketSlots = [];
      return;
    }
    this._basketSlots = this.basketContainer.getComponentsInChildren(BasketSlot);
    this._basketSlots.forEach((slot, i) => {
      if (!slot || !slot.node || !slot.node.isValid) return;
      slot.init(i);
      slot.node.active = true;
    });
    this.updateBasketVisualState();
  }

  private findEmptySlot(): BasketSlot | null {
    const maxSlots = getBasketCapacity(this._expandCount);
    for (let i = 0; i < maxSlots && i < this._basketSlots.length; i++) {
      const slot = this._basketSlots[i];
      if (slot && slot.node && slot.node.isValid && slot.isEmpty) {
        return slot;
      }
    }
    return null;
  }

  /** 检测 3 消 */
  private checkMatch(): void {
    const basketTypes = this.getBasketTypes();
    const matchType = findMatch(basketTypes);

    if (matchType) {
      this.executeMatch(matchType);
    } else {
      this._isProcessing = false;
      // 检测胜利条件
      this.checkWinCondition();
    }
  }

  /** 执行消除 */
  private executeMatch(fruitType: string): void {
    // 找到前 3 个该类型的槽位
    const slotsToClear: BasketSlot[] = [];
    for (const slot of this._basketSlots) {
      if (!slot || !slot.node || !slot.node.isValid) continue;
      if (!slot.isEmpty && slot.fruitType === fruitType) {
        slotsToClear.push(slot);
        if (slotsToClear.length >= RULES.MATCH_COUNT) break;
      }
    }

    let completedCount = 0;
    const onSlotComplete = () => {
      completedCount++;
      if (completedCount >= slotsToClear.length) {
        // 所有消除动画完成
        GameAudio.playMatch();
        this._isProcessing = false;
        this.updateBasketVisualState();
        // 再次检测（连锁消除）
        this.scheduleOnce(() => this.checkMatch(), 0.1);
      }
    };

    slotsToClear.forEach(slot => {
      slot.playMatchAnimation(() => {
        slot.clear();
        onSlotComplete();
      });
    });
  }

  /** 篮筐满时的处理 */
  private onBasketFull(): void {
    const maxSlots = getBasketCapacity(this._expandCount);
    const basketTypes = this.getBasketTypes();
    const occupiedCount = basketTypes.filter(Boolean).length;

    if (isLose(basketTypes, occupiedCount, maxSlots)) {
      this.updateBasketVisualState(true);
      this.uiManager.showTip('篮筐满了，快想办法消除');
      this.onGameLose();
    }
  }

  /** 检查胜利条件 */
  private checkWinCondition(): void {
    const remaining = this.levelManager.getRemainingCount();
    const occupiedCount = this._basketSlots.filter(s => s && s.node && s.node.isValid && !s.isEmpty).length;

    if (isWin(remaining, occupiedCount)) {
      this.onGameWin();
    }
  }

  private onGameWin(): void {
    this._state = GameState.WIN;
    GameAudio.playWin();
    this.uiManager.showResult(true, this._currentLevel);
    console.log(`[GameManager] 第 ${this._currentLevel} 关 胜利!`);
  }

  private onGameLose(): void {
    this._state = GameState.LOSE;
    GameAudio.playLose();
    this.uiManager.showResult(false, this._currentLevel);
    console.log(`[GameManager] 第 ${this._currentLevel} 关 失败`);
  }

  private unfreezeRandomFruit(): void {
    if (!this.fruitContainer || !this.fruitContainer.isValid) return;
    const frozen = this.fruitContainer
      .getComponentsInChildren(FruitItem)
      .filter(f => f && f.node && f.node.isValid && f.isFrozen);
    if (frozen.length > 0) {
      frozen[0].unfreeze();
      this.levelManager.updateClickableStates();
      this.uiManager.showTip('已解冻一个水果');
    } else {
      this.uiManager.showTip('没有冰冻水果');
    }
  }

  private expandBasket(): void {
    const maxCapacity = RULES.BASE_BASKET_SIZE + RULES.MAX_EXPAND;
    const currentCapacity = getBasketCapacity(this._expandCount);

    if (currentCapacity >= maxCapacity) {
      this.uiManager.showTip('已达最大扩容');
      return;
    }

    this._expandCount++;
    this.updateBasketVisualState();
    this.uiManager.showTip(`篮筐扩容至 ${getBasketCapacity(this._expandCount)} 格`);
  }

  private resetBasket(): void {
    this._expandCount = 0;
    this._basketSlots.forEach(slot => {
      if (!slot || !slot.node || !slot.node.isValid) return;
      slot.clear();
      slot.node.active = true;
    });
  }

  /** 获取篮筐中的水果类型数组 */
  private getBasketTypes(): string[] {
    const maxSlots = getBasketCapacity(this._expandCount);
    return this._basketSlots
      .slice(0, maxSlots)
      .map(s => s.fruitType || '');
  }

  private updateBasketVisualState(forceWarning: boolean = false): void {
    const capacity = getBasketCapacity(this._expandCount);
    this._basketSlots.forEach((slot, index) => {
      if (!slot || !slot.node || !slot.node.isValid) return;
      slot.node.active = index < capacity;
      if (forceWarning) {
        slot.setWarningHighlight();
      } else {
        slot.resetHighlight();
      }
    });
  }

  /** 重开当前关卡 */
  public restartLevel(): void {
    this.startLevel(this._currentLevel);
  }

  /** 下一关 */
  public nextLevel(): void {
    this.startLevel(this._currentLevel + 1);
  }

  // ---- getters ----
  public get state(): GameState { return this._state; }
  public get currentLevel(): number { return this._currentLevel; }
}
