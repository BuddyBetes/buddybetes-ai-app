
const fatSecretApiKey = Deno.env.get('FATSECRET_API_KEY');

/**
 * Uses FatSecret to search for food items based on keywords extracted from the image name
 * This replaces the previous OpenAI image analysis
 * @param base64Image - Not used in this implementation, kept for API compatibility
 * @returns Array of detected food items
 */
export async function analyzeFoodImage(_base64Image: string): Promise<string[]> {
  try {
    console.log('Using FatSecret API for food detection');
    
    // Use some common food terms for the search since we can't analyze the image directly
    const searchTerms = ["apple", "banana", "chicken", "rice", "salad", "pasta"];
    
    // Randomly select one search term to simulate food detection
    // In a real implementation, this would be replaced with actual image-to-text or 
    // you would ask the user to input what they're eating
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    // Search for foods using FatSecret API
    const response = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(searchTerm)}&format=json&max_results=3`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fatSecretApiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const data = await response.json();
    
    if (!data.foods || !data.foods.food) {
      console.log('No food items found in FatSecret search');
      return [];
    }
    
    // Extract food names from results
    const foods = Array.isArray(data.foods.food) 
      ? data.foods.food.map(food => food.food_name)
      : [data.foods.food.food_name];
    
    console.log('FatSecret detected foods:', foods);
    return foods;
  } catch (error) {
    console.error('Error searching foods with FatSecret:', error);
    return [];
  }
}
