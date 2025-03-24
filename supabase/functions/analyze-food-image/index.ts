
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeFoodImage } from "./services/foodDetection.ts";
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
    const requestId = crypto.randomUUID();
    console.log(`[${requestId}] Starting food analysis`);
    
    // Step 1: Get food suggestions using OpenAI vision model
    try {
      const foods = await analyzeFoodImage(image);
      console.log(`[${requestId}] Detected food items:`, foods);
      
      if (!foods || foods.length === 0) {
        console.log(`[${requestId}] No foods detected`);
        return new Response(
          JSON.stringify({ 
            error: 'No food detected. Please try again with a clearer photo or enter food manually.',
            foodItems: [],
            status: 'complete' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Step 2: Get nutritional information for each food item IN PARALLEL
      console.log(`[${requestId}] Getting nutrition data for ${foods.length} items in parallel`);
      const foodItems = await Promise.all(
        foods.map(async (food) => {
          try {
            return await getFoodNutrition(food);
          } catch (err) {
            console.error(`[${requestId}] Error getting nutrition for ${food}:`, err);
            // Return default placeholder data if we can't get nutrition info
            return createDefaultFoodItem(food);
          }
        })
      );

      console.log(`[${requestId}] Final food items with nutrition:`, foodItems);

      // Always return a consistent structure with a foodItems array and completion status
      return new Response(
        JSON.stringify({ foodItems, status: 'complete' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error(`[${requestId}] API error:`, apiError);
      let errorMessage = 'Error analyzing food image';
      
      if (apiError instanceof Error) {
        errorMessage = apiError.message;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          foodItems: [],
          status: 'error' 
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
      JSON.stringify({ error: errorMessage, foodItems: [], status: 'error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
