
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const fatSecretApiKey = Deno.env.get('FATSECRET_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FoodItem {
  name: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Image data received, length:', image.length);
    
    // Step 1: Analyze the image with OpenAI
    const foods = await analyzeImageWithOpenAI(image);
    console.log('Detected food items:', foods);
    
    if (!foods || foods.length === 0) {
      console.log('No foods detected in the image');
      return new Response(
        JSON.stringify({ 
          error: 'No food detected in the image. Please try again with a clearer photo.',
          foodItems: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Step 2: Get nutritional information for each food item
    const foodItems = await Promise.all(
      foods.map(async (food) => {
        try {
          const nutritionInfo = await getNutritionInfo(food);
          return nutritionInfo;
        } catch (err) {
          console.error(`Error getting nutrition for ${food}:`, err);
          // Return default placeholder data if we can't get nutrition info
          return createDefaultFoodItem(food);
        }
      })
    );

    console.log('Final food items with nutrition:', foodItems);

    return new Response(
      JSON.stringify({ foodItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-food-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message, foodItems: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeImageWithOpenAI(base64Image: string): Promise<string[]> {
  try {
    console.log('Sending image to OpenAI, base64 length:', base64Image.length);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a food recognition expert. Your task is to identify ALL food items visible in the image. Return ONLY a JSON array of food item names (strings), with no additional text or explanations. Example output format: ["grilled chicken", "brown rice", "broccoli"]. If no food is visible or you cannot identify any food with confidence, return an empty array [].'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'What food items are in this image?' },
              { 
                type: 'image_url', 
                image_url: { url: `data:image/jpeg;base64,${base64Image}` }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }
    
    console.log('Raw OpenAI response:', data.choices[0].message.content);
    
    try {
      const content = data.choices[0].message.content;
      // Parse the JSON response
      const parsedContent = JSON.parse(content);
      // Check if it's an array or an object with a foods array
      const foods = Array.isArray(parsedContent) ? parsedContent : parsedContent.foods || [];
      
      console.log('Parsed foods:', foods);
      
      // Ensure we have at least one food item
      if (foods.length === 0) {
        console.log('No foods found in the parsed response');
      }
      
      return foods;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Fallback: Try to extract food items using regex if JSON parsing fails
      const content = data.choices[0].message.content;
      const matches = content.match(/"([^"]+)"/g);
      const extracted = matches ? matches.map(m => m.replace(/"/g, '')) : [];
      console.log('Extracted via regex fallback:', extracted);
      return extracted;
    }
  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error);
    return [];
  }
}

async function getNutritionInfo(foodName: string): Promise<FoodItem> {
  try {
    const searchResponse = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(foodName)}&format=json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fatSecretApiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const searchData = await searchResponse.json();
    
    if (!searchData.foods || !searchData.foods.food || searchData.foods.food.length === 0) {
      return createDefaultFoodItem(foodName);
    }

    // Get the first food item
    const foodId = Array.isArray(searchData.foods.food) 
      ? searchData.foods.food[0].food_id 
      : searchData.foods.food.food_id;

    // Get detailed nutrition info
    const detailResponse = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=food.get&food_id=${foodId}&format=json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fatSecretApiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const detailData = await detailResponse.json();
    
    if (!detailData.food || !detailData.food.servings || !detailData.food.servings.serving) {
      return createDefaultFoodItem(foodName);
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
      calories: parseFloat(serving.calories) || 0
    };
  } catch (error) {
    console.error(`Error getting nutrition info for ${foodName}:`, error);
    return createDefaultFoodItem(foodName);
  }
}

function createDefaultFoodItem(foodName: string): FoodItem {
  // Return estimated values based on common foods
  // These are just placeholder values
  return {
    name: foodName,
    carbs: 15,
    protein: 5,
    fat: 3,
    calories: 100
  };
}
