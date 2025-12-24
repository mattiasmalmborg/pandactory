import { FoodId, FoodItem } from '../../types/game.types';

export const FOOD_ITEMS: Record<FoodId, FoodItem> = {
  berries: {
    id: 'berries',
    name: 'Berries',
    description: 'Quick energy! Not very filling but hey, they\'re everywhere.',
    flavorText: 'Tastes like survival!',
    nutritionValue: 3,
    icon: '🫐',
  },
  cactus_juice: {
    id: 'cactus_juice',
    name: 'Cactus Juice',
    description: 'Refreshing desert nectar squeezed from prickly plants. Hydrating and surprisingly tasty!',
    flavorText: 'It\'ll quench ya! Nothing\'s quenchier!',
    nutritionValue: 8,
    icon: '🧃',
  },
  smoked_fish: {
    id: 'smoked_fish',
    name: 'Smoked Fish',
    description: 'Preserved protein that tastes like campfire memories.',
    flavorText: 'That\'s the point of smoking it.',
    nutritionValue: 15,
    icon: '🐟',
  },
  greenhouse_veggies: {
    id: 'greenhouse_veggies',
    name: 'Greenhouse Veggies',
    description: 'Premium vegetables grown with care. Extra crispy, extra nutritious.',
    flavorText: 'Locally sourced from your own greenhouse. Very farm-to-table.',
    nutritionValue: 18,
    icon: '🥗',
  },
};

export function getNutritionValue(foodId: FoodId): number {
  return FOOD_ITEMS[foodId].nutritionValue;
}

export function calculateTotalNutrition(foods: { id: FoodId; amount: number }[]): number {
  return foods.reduce((total, food) => {
    return total + (getNutritionValue(food.id) * food.amount);
  }, 0);
}

/**
 * Optimizes food selection to meet nutrition requirement with minimal waste
 * Uses greedy algorithm: largest nutrition values first to minimize items used
 */
export function optimizeFoodSelection(
  targetNutrition: number,
  availableFood: Record<FoodId, number>
): { id: FoodId; amount: number }[] {
  const selection: { id: FoodId; amount: number }[] = [];
  let remaining = targetNutrition;

  // Sort food by nutrition value (highest first) for greedy optimization
  const sortedFoods = (Object.keys(FOOD_ITEMS) as FoodId[])
    .filter(id => availableFood[id] > 0)
    .sort((a, b) => FOOD_ITEMS[b].nutritionValue - FOOD_ITEMS[a].nutritionValue);

  for (const foodId of sortedFoods) {
    if (remaining <= 0) break;

    const nutritionValue = FOOD_ITEMS[foodId].nutritionValue;
    const available = availableFood[foodId];
    const needed = Math.ceil(remaining / nutritionValue);
    const toUse = Math.min(needed, available);

    if (toUse > 0) {
      selection.push({ id: foodId, amount: toUse });
      remaining -= nutritionValue * toUse;
    }
  }

  return selection;
}

/**
 * Calculates how much nutrition will be wasted with current selection
 */
export function calculateWastedNutrition(
  foods: { id: FoodId; amount: number }[],
  targetNutrition: number
): number {
  const total = calculateTotalNutrition(foods);
  return Math.max(0, total - targetNutrition);
}
