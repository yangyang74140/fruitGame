import { _decorator } from 'cc';

const { ccclass } = _decorator;

/** 消除规则引擎 —— 纯逻辑，无 UI 依赖 */
@ccclass('RuleEngine')
export class RuleEngine {
  /** 基础篮筐容量 */
  static readonly BASE_BASKET_SIZE = 6;

  /** 消除所需数量 */
  static readonly MATCH_COUNT = 3;

  /** 最大扩容次数 */
  static readonly MAX_EXPAND = 3;

  /** 水果种类总数 */
  static readonly FRUIT_TYPE_COUNT = 6;

  /** 最大关卡数 */
  static readonly MAX_LEVEL = 10;

  /** 冰冻解锁条件（点击次数） */
  static readonly UNFREEZE_TAPS = 2;

  /**
   * 检测篮筐中是否存在可消除组合
   * @returns 可消除的水果类型，无则返回 null
   */
  public static findMatch(basket: string[]): string | null {
    const count = new Map<string, number>();
    basket.forEach(type => {
      if (type) count.set(type, (count.get(type) || 0) + 1);
    });
    for (const [type, c] of count) {
      if (c >= RuleEngine.MATCH_COUNT) return type;
    }
    return null;
  }

  /**
   * 检测篮筐满时是否还有理论消除可能
   * 条件：剩余水果种类 + 篮筐内水果种类 仍有 ≥3 个可能的组合
   */
  public static canStillMatch(
    basket: string[],
    remainingTypes: string[]
  ): boolean {
    const allTypes = [...basket.filter(Boolean), ...remainingTypes];
    const count = new Map<string, number>();
    allTypes.forEach(t => count.set(t, (count.get(t) || 0) + 1));
    return Array.from(count.values()).some(c => c >= RuleEngine.MATCH_COUNT);
  }

  /**
   * 判断关卡胜利
   * 条件：场景无水果 + 篮筐全空
   */
  public static isWin(
    remainingOnBoard: number,
    occupiedSlots: number
  ): boolean {
    return remainingOnBoard === 0 && occupiedSlots === 0;
  }

  /**
   * 判断关卡失败
   * 条件：篮筐满 + 篮筐内无 ≥3 组合 + 场景无可点击水果
   */
  public static isLose(
    basket: string[],
    occupiedSlots: number,
    maxSlots: number,
    remainingOnBoard: number
  ): boolean {
    if (occupiedSlots < maxSlots) return false;
    const hasMatch = RuleEngine.findMatch(basket) !== null;
    return !hasMatch && remainingOnBoard === 0;
  }

  /** 计算当前扩容后的容量 */
  public static getBasketCapacity(expandCount: number): number {
    return RuleEngine.BASE_BASKET_SIZE + Math.min(expandCount, RuleEngine.MAX_EXPAND);
  }
}
