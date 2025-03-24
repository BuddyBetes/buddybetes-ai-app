
import { FoodItem } from "../utils/foodUtils.ts";

const fatSecretApiKey = Deno.env.get('FATSECRET_API_KEY') || 'f2a13018f56748c59dd2050b8a9e3d19';

/**
 * Retrieves nutritional information for a food item
 * This is a fallback implementation that generates plausible nutrition data
 * In production, you would use the actual FatSecret API with proper credentials
 * 
 * @param foodName - Name of the food item
 * @returns FoodItem with nutritional information
 */
export async function getFoodNutrition(foodName: string): Promise<FoodItem> {
  try {
    console.log(`Getting nutrition for: ${foodName}`);
    
    // This is a fallback implementation that generates plausible nutrition data
    // In production, you would use the actual FatSecret API with proper credentials
    
    // Common nutrition ranges by food type
    const nutritionRanges: Record<string, any> = {
      // Fruits
      "Apple": { carbs: [12, 15], protein: [0.2, 0.5], fat: [0.1, 0.4], calories: [50, 80] },
      "Banana": { carbs: [22, 25], protein: [1, 1.5], fat: [0.2, 0.4], calories: [90, 120] },
      "Orange": { carbs: [11, 15], protein: [0.8, 1.2], fat: [0.1, 0.3], calories: [45, 70] },
      
      // Vegetables
      "Broccoli": { carbs: [6, 7], protein: [2.5, 3.5], fat: [0.3, 0.5], calories: [30, 50] },
      "Carrot": { carbs: [9, 12], protein: [0.8, 1.2], fat: [0.1, 0.3], calories: [40, 50] },
      "Spinach": { carbs: [3, 4], protein: [2, 3], fat: [0.3, 0.5], calories: [20, 30] },
      
      // Proteins
      "Chicken": { carbs: [0, 1], protein: [25, 30], fat: [3, 10], calories: [120, 200] },
      "Beef": { carbs: [0, 0.5], protein: [25, 35], fat: [10, 20], calories: [200, 300] },
      "Fish": { carbs: [0, 0.5], protein: [20, 25], fat: [5, 10], calories: [100, 150] },
      
      // Grains
      "Rice": { carbs: [25, 30], protein: [2, 3], fat: [0.3, 0.6], calories: [130, 160] },
      "Pasta": { carbs: [30, 40], protein: [5, 7], fat: [1, 2], calories: [160, 200] },
      "Bread": { carbs: [12, 15], protein: [3, 4], fat: [1, 2], calories: [70, 100] },
      
      // Mixed/Other
      "Pizza": { carbs: [30, 40], protein: [10, 15], fat: [10, 15], calories: [250, 350] },
      "Salad": { carbs: [5, 10], protein: [1, 3], fat: [2, 5], calories: [40, 100] },
      "Sandwich": { carbs: [25, 35], protein: [10, 15], fat: [5, 15], calories: [200, 350] },
      "Coffee": { carbs: [0, 1], protein: [0, 0.3], fat: [0, 0.1], calories: [0, 5] },
    };
    
    // Generate plausible nutrition based on food name
    const foodNameLower = foodName.toLowerCase();
    let nutritionRange;
    
    // Look for exact match first
    for (const [key, value] of Object.entries(nutritionRanges)) {
      if (key.toLowerCase() === foodNameLower) {
        nutritionRange = value;
        break;
      }
    }
    
    // If no exact match, look for partial match
    if (!nutritionRange) {
      for (const [key, value] of Object.entries(nutritionRanges)) {
        if (foodNameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(foodNameLower)) {
          nutritionRange = value;
          break;
        }
      }
    }
    
    // Default fallback if no match found
    if (!nutritionRange) {
      nutritionRange = {
        carbs: [10, 20],
        protein: [2, 8],
        fat: [1, 5],
        calories: [80, 150]
      };
    }
    
    // Generate random values within the plausible ranges
    const getRandomInRange = (min: number, max: number) => {
      return parseFloat((Math.random() * (max - min) + min).toFixed(1));
    };
    
    const nutritionData = {
      name: foodName,
      carbs: getRandomInRange(nutritionRange.carbs[0], nutritionRange.carbs[1]),
      protein: getRandomInRange(nutritionRange.protein[0], nutritionRange.protein[1]),
      fat: getRandomInRange(nutritionRange.fat[0], nutritionRange.fat[1]),
      calories: Math.round(getRandomInRange(nutritionRange.calories[0], nutritionRange.calories[1])),
      serving_description: "100g serving"
    };
    
    console.log(`Generated nutrition data for ${foodName}:`, nutritionData);
    
    return nutritionData;
  } catch (error) {
    console.error(`Error getting nutrition info for ${foodName}:`, error);
    
    // Return default nutrition data on error
    return {
      name: foodName,
      carbs: 15,
      protein: 5,
      fat: 2,
      calories: 100,
      serving_description: "100g serving"
    };
  }
}
