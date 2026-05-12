/**
 * 消除规则引擎 —— 纯静态工具类，无 Cocos 依赖
 * 所有规则判定均为纯函数，可独立单元测试
 */

/** 规则常量 */
export const RULES = {
  BASE_BASKET_SIZE: 6,
  MATCH_COUNT: 3,
  MAX_EXPAND: 3,
  FRUIT_TYPE_COUNT: 6,
  MAX_LEVEL: 10,
} as const;

/**
 * 检测篮筐中是否存在可消除组合
 * @param basket 篮筐中的水果类型数组（空字符串表示空位）
 * @returns 可消除的水果类型，无则返回 null
 */
export function findMatch(basket: string[]): string | null {
  const count = new Map<string, number>();
  for (const type of basket) {
    if (!type) continue;
    count.set(type, (count.get(type) || 0) + 1);
  }
  for (const [type, c] of count) {
    if (c >= RULES.MATCH_COUNT) return type;
  }
  return null;
}

/**
 * 检测指定类型的消除组
 * @returns 匹配数量（>= MATCH_COUNT 时有效）
 */
export function countType(basket: string[], fruitType: string): number {
  return basket.filter(t => t === fruitType).length;
}

/**
 * 获取篮筐中某种水果的槽位索引
 */
export function getTypeIndices(basket: string[], fruitType: string): number[] {
  const indices: number[] = [];
  basket.forEach((t, i) => {
    if (t === fruitType) indices.push(i);
  });
  return indices;
}

/**
 * 判断关卡是否胜利
 */
export function isWin(remainingOnBoard: number, occupiedSlots: number): boolean {
  return remainingOnBoard === 0 && occupiedSlots === 0;
}

/**
 * 判断关卡是否失败
 * 条件：篮筐满 + 无可消除组合
 */
export function isLose(
  basket: string[],
  occupiedCount: number,
  maxSlots: number
): boolean {
  if (occupiedCount < maxSlots) return false;
  return findMatch(basket) === null;
}

/**
 * 计算当前篮筐容量（基础 + 扩容）
 */
export function getBasketCapacity(expandCount: number): number {
  return RULES.BASE_BASKET_SIZE + Math.min(expandCount, RULES.MAX_EXPAND);
}

/**
 * 获取篮筐中的水果类型分布
 */
export function getBasketDistribution(basket: string[]): Map<string, number> {
  const dist = new Map<string, number>();
  for (const type of basket) {
    if (!type) continue;
    dist.set(type, (dist.get(type) || 0) + 1);
  }
  return dist;
}
