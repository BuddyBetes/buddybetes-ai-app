
export interface FoodItem {
  name: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  // FatSecret specific fields
  food_id?: string | number;
  serving_id?: string | number;
  serving_description?: string;
}

/**
 * Creates a default food item with estimated nutritional values when actual data cannot be retrieved
 * @param foodName - Name of the food item
 * @returns FoodItem with default nutritional values
 */
export function createDefaultFoodItem(foodName: string): FoodItem {
  // Return estimated values based on common foods, with carbs rounded up to whole number
  return {
    name: foodName,
    carbs: 15, // Already a whole number
    protein: 5,
    fat: 3,
    calories: 100,
    serving_description: "Estimated serving (actual data unavailable)"
  };
}

/**
 * Processes a food item to ensure carbs are rounded up to whole numbers
 * @param item - The food item to process
 * @returns Processed food item with rounded values
 */
export function processFoodItem(item: FoodItem): FoodItem {
  return {
    ...item,
    carbs: Math.ceil(item.carbs), // Round up carbs to whole number
    protein: Math.round(item.protein),
    fat: Math.round(item.fat),
    calories: Math.round(item.calories)
  };
}
