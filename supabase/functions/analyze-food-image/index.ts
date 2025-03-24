
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeFoodImage } from "./services/openai.ts";
import { getFoodNutrition } from "./services/nutrition.ts";
import { createDefaultFoodItem, FoodItem } from "./utils/foodUtils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let reqBody;
    try {
      reqBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { image } = reqBody;
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Image data received, length:', image.length);
    
    // Step 1: Get food suggestions using our food detection service
    try {
      const foods = await analyzeFoodImage(image);
      console.log('Detected food items:', foods);
      
      if (!foods || foods.length === 0) {
        console.log('No foods detected');
        return new Response(
          JSON.stringify({ 
            error: 'No food detected. Please try again with a clearer photo or enter food manually.',
            foodItems: [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Step 2: Get nutritional information for each food item
      const foodItems: FoodItem[] = [];
      for (const food of foods) {
        try {
          const nutritionInfo = await getFoodNutrition(food);
          foodItems.push(nutritionInfo);
        } catch (err) {
          console.error(`Error getting nutrition for ${food}:`, err);
          // Return default placeholder data if we can't get nutrition info
          foodItems.push(createDefaultFoodItem(food));
        }
      }

      console.log('Final food items with nutrition:', foodItems);

      return new Response(
        JSON.stringify({ foodItems }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('API error:', apiError);
      let errorMessage = 'Error analyzing food image';
      
      if (apiError instanceof Error) {
        errorMessage = apiError.message;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          foodItems: [] 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in analyze-food-image function:', error);
    let errorMessage = 'Internal server error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage, foodItems: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
