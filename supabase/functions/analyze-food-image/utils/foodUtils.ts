
export interface FoodItem {
  name: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

/**
 * Creates a default food item with estimated nutritional values when actual data cannot be retrieved
 * @param foodName - Name of the food item
 * @returns FoodItem with default nutritional values
 */
export function createDefaultFoodItem(foodName: string): FoodItem {
  // Return estimated values based on common foods
  return {
    name: foodName,
    carbs: 15,
    protein: 5,
    fat: 3,
    calories: 100
  };
}
