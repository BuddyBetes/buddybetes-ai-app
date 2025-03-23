
import { FoodItem } from "../utils/foodUtils.ts";

const fatSecretApiKey = Deno.env.get('FATSECRET_API_KEY');

/**
 * Retrieves nutritional information for a food item from FatSecret API
 * @param foodName - Name of the food item
 * @returns FoodItem with nutritional information
 */
export async function getFoodNutrition(foodName: string): Promise<FoodItem> {
  try {
    console.log(`Getting nutrition for: ${foodName}`);
    
    // First, get an OAuth token
    const tokenResponse = await fetch(
      "https://oauth.fatsecret.com/connect/token",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(fatSecretApiKey + ':' + 'no_secret_needed')}` // FatSecret API uses client_id:client_secret
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'scope': 'basic premier'
        })
      }
    );

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Failed to get OAuth token:', tokenData);
      throw new Error('Failed to authenticate with FatSecret API');
    }
    
    // Now search for the food
    const searchResponse = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(foodName)}&format=json`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const searchData = await searchResponse.json();
    
    if (!searchData.foods || !searchData.foods.food || searchData.foods.food.length === 0) {
      console.log(`No nutrition data found for ${foodName}`);
      throw new Error(`No nutrition data found for ${foodName}`);
    }

    // Get the first food item
    const foodId = Array.isArray(searchData.foods.food) 
      ? searchData.foods.food[0].food_id 
      : searchData.foods.food.food_id;

    // Get detailed nutrition info
    const detailResponse = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=food.get&food_id=${foodId}&format=json`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const detailData = await detailResponse.json();
    
    if (!detailData.food || !detailData.food.servings || !detailData.food.servings.serving) {
      console.log(`No serving data found for ${foodName}`);
      throw new Error(`No serving data found for ${foodName}`);
    }

    // Get nutrition from the first serving
    const serving = Array.isArray(detailData.food.servings.serving) 
      ? detailData.food.servings.serving[0] 
      : detailData.food.servings.serving;

    return {
      name: foodName,
      carbs: parseFloat(serving.carbohydrate) || 0,
      protein: parseFloat(serving.protein) || 0,
      fat: parseFloat(serving.fat) || 0,
      calories: parseFloat(serving.calories) || 0,
      // Add the FatSecret-specific IDs for future reference
      food_id: detailData.food.food_id,
      serving_id: serving.serving_id,
      serving_description: serving.serving_description || "Default serving"
    };
  } catch (error) {
    console.error(`Error getting nutrition info for ${foodName}:`, error);
    throw error;
  }
}
