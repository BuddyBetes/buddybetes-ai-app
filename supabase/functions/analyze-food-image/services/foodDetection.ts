
// This file implements food detection using Gemini's vision capability
// with FatSecret API as the nutrition data source

import { geminiChat } from '../../_shared/gemini.ts';

const fatSecretClientId = Deno.env.get('FATSECRET_API_KEY') || '';
const fatSecretClientSecret = Deno.env.get('FATSECRET_API_SECRET') || '';

/**
 * Uses OpenAI Vision API to analyze food images
 * @param base64Image - Base64 encoded image data
 * @returns Array of detected food items
 */
export async function analyzeFoodImage(base64Image: string): Promise<string[]> {
  try {
    console.log('Starting food image analysis with Gemini vision');

    const rawContent = await geminiChat({
      messages: [
        {
          role: 'system',
          content: 'You are a food identification specialist. Identify all food items visible in the image. Return only a JSON array of food names without descriptions or explanations. For example: ["Apple", "Chicken Sandwich"]. If no food is visible, return an empty array.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What food items do you see in this image? Return only a JSON array.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      maxTokens: 300
    });

    // Parse the JSON array from the response
    try {
      const content = rawContent.trim();
      console.log('Raw content from Gemini:', content);
      
      
      // Handle different response formats OpenAI might return
      let foodItems: string[] = [];
      
      if (content.startsWith('[') && content.endsWith(']')) {
        // Direct JSON array
        foodItems = JSON.parse(content);
      } else {
        // Extract JSON array if embedded in text
        const match = content.match(/\[.*\]/s);
        if (match) {
          foodItems = JSON.parse(match[0]);
        } else {
          // Split by commas or newlines if not proper JSON
          foodItems = content.split(/,|\n/).map(item => {
            return item.trim().replace(/^["'\s]+|["'\s]+$/g, '');
          }).filter(Boolean);
        }
      }
      
      console.log('Detected food items:', foodItems);
      
      if (foodItems.length === 0) {
        console.log('No food items detected in the image');
      }
      
      return foodItems;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError, 'Response was:', data.choices[0].message.content);
      
      // Fallback: Use a simple text parsing approach
      const content = data.choices[0].message.content;
      const foodItems = content.split(/,|\n/).map(item => item.trim()).filter(Boolean);
      
      console.log('Fallback parsing detected items:', foodItems);
      return foodItems;
    }
  } catch (error) {
    console.error('Error in food detection:', error);
    throw new Error(`Food detection error: ${error.message}`);
  }
}

/**
 * Gets an OAuth token from FatSecret API
 * @returns Access token for the FatSecret API
 */
export async function getFatSecretOAuthToken(): Promise<string> {
  try {
    console.log('Requesting OAuth token from FatSecret');
    
    if (!fatSecretClientId || !fatSecretClientSecret) {
      throw new Error('FatSecret API credentials are not configured');
    }
    
    const tokenUrl = 'https://oauth.fatsecret.com/connect/token';
    const authString = btoa(`${fatSecretClientId}:${fatSecretClientSecret}`);
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&scope=basic'
    });
    
    if (!response.ok) {
      const responseBody = await response.text();
      console.error(`Failed to get OAuth token. Status: ${response.status} Response: ${responseBody}`);
      throw new Error(`Failed to authenticate with FatSecret API: ${response.status} ${responseBody}`);
    }
    
    const data = await response.json();
    console.log('Successfully obtained OAuth token');
    return data.access_token;
  } catch (error) {
    console.error('Error getting OAuth token:', error);
    throw error;
  }
}
