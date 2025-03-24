
// This file now uses FatSecret Image Recognition API instead of OpenAI
// FatSecret is used for direct image-to-food detection

const fatSecretApiKey = Deno.env.get('FATSECRET_API_KEY') || 'f2a13018f56748c59dd2050b8a9e3d19';
const fatSecretApiSecret = Deno.env.get('FATSECRET_API_SECRET') || '';  // Add support for API secret if available

/**
 * Uses FatSecret Image Recognition API to analyze food images
 * @param base64Image - Base64 encoded image data
 * @returns Array of detected food items
 */
export async function analyzeFoodImage(base64Image: string): Promise<string[]> {
  try {
    console.log('Using FatSecret Image Recognition API for food detection');
    
    if (!fatSecretApiKey) {
      console.error('FatSecret API key is not configured');
      throw new Error('FatSecret API key is not configured');
    }
    
    // First, get an OAuth token for the API request
    console.log('Requesting OAuth token from FatSecret');
    const tokenParams = new URLSearchParams({
      'grant_type': 'client_credentials',
      'scope': 'image-recognition',
      'client_id': fatSecretApiKey
    });
    
    if (fatSecretApiSecret) {
      // If we have a secret, use it (recommended auth method)
      tokenParams.append('client_secret', fatSecretApiSecret);
    }
    
    const tokenResponse = await fetch(
      "https://oauth.fatsecret.com/connect/token",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams
      }
    );

    // Check response status first
    console.log('OAuth token response status:', tokenResponse.status);
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get OAuth token. Status:', tokenResponse.status, 'Response:', errorText);
      throw new Error(`Failed to authenticate with FatSecret API: ${tokenResponse.status} ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Invalid OAuth token data:', tokenData);
      throw new Error('Failed to authenticate with FatSecret API: No access token received');
    }
    
    console.log('Successfully obtained OAuth token');
    
    // Now call the Image Recognition API
    console.log('Sending image to FatSecret Image Recognition API');
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

    console.log('FatSecret Image Recognition response status:', recognitionResponse.status);
    
    // Handle non-200 responses properly
    if (!recognitionResponse.ok) {
      const errorText = await recognitionResponse.text();
      console.error('FatSecret API error. Status:', recognitionResponse.status, 'Response:', errorText);
      throw new Error(`FatSecret API error: ${recognitionResponse.status} ${errorText}`);
    }
    
    const recognitionData = await recognitionResponse.json();
    console.log('FatSecret Image Recognition response data preview:', JSON.stringify(recognitionData).substring(0, 200) + '...');
    
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
