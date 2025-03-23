
// This file now uses FatSecret Image Recognition API instead of OpenAI
// FatSecret is used for direct image-to-food detection

const fatSecretApiKey = Deno.env.get('FATSECRET_API_KEY');

/**
 * Uses FatSecret Image Recognition API to analyze food images
 * @param base64Image - Base64 encoded image data
 * @returns Array of detected food items
 */
export async function analyzeFoodImage(base64Image: string): Promise<string[]> {
  try {
    console.log('Using FatSecret Image Recognition API for food detection');
    
    // First, get an OAuth token for the API request
    const tokenResponse = await fetch(
      "https://oauth.fatsecret.com/connect/token",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'scope': 'image-recognition',
          'client_id': fatSecretApiKey
        })
      }
    );

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Failed to get OAuth token:', tokenData);
      throw new Error('Failed to authenticate with FatSecret API');
    }
    
    console.log('Successfully obtained OAuth token');
    
    // Now call the Image Recognition API
    const recognitionResponse = await fetch(
      "https://platform.fatsecret.com/rest/image-recognition/v1",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.access_token}`
        },
        body: JSON.stringify({
          image_b64: base64Image,
          region: "US",
          language: "en",
          include_food_data: true
        })
      }
    );

    const recognitionData = await recognitionResponse.json();
    console.log('FatSecret Image Recognition response status:', recognitionResponse.status);
    console.log('FatSecret Image Recognition response:', JSON.stringify(recognitionData).substring(0, 200) + '...');
    
    if (recognitionResponse.status !== 200) {
      console.error('FatSecret API error:', recognitionData);
      throw new Error(`FatSecret API error: ${recognitionData.message || 'Unknown error'}`);
    }
    
    if (!recognitionData.foods || !recognitionData.foods.length) {
      console.log('No food items detected in image');
      return [];
    }
    
    // Extract food names from the response
    const foods = recognitionData.foods.map(food => food.food_name);
    
    console.log('FatSecret Image Recognition detected foods:', foods);
    return foods;
  } catch (error) {
    console.error('Error analyzing image with FatSecret Image Recognition:', error);
    throw error; // Re-throw to handle in the main function
  }
}
