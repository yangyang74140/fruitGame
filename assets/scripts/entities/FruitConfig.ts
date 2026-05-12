/** 水果种类 */
export enum FruitType {
  STRAWBERRY = 'strawberry',
  ORANGE = 'orange',
  GRAPE = 'grape',
  LEMON = 'lemon',
  WATERMELON = 'watermelon',
  BLUEBERRY = 'blueberry',
}

/** 水果颜色常量映射（来自 fruit-config.json） */
export const FRUIT_COLORS: Record<FruitType, string> = {
  [FruitType.STRAWBERRY]: '#FF4757',
  [FruitType.ORANGE]: '#FFA502',
  [FruitType.GRAPE]: '#7B68EE',
  [FruitType.LEMON]: '#FFE042',
  [FruitType.WATERMELON]: '#2ED573',
  [FruitType.BLUEBERRY]: '#5352ED',
};

/** 水果中文名 */
export const FRUIT_NAMES: Record<FruitType, string> = {
  [FruitType.STRAWBERRY]: '草莓',
  [FruitType.ORANGE]: '橙子',
  [FruitType.GRAPE]: '葡萄',
  [FruitType.LEMON]: '柠檬',
  [FruitType.WATERMELON]: '西瓜',
  [FruitType.BLUEBERRY]: '蓝莓',
};
