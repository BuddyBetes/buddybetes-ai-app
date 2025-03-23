
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
    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Image data received, length:', image.length);
    
    // Step 1: Get food suggestions using FatSecret Image Recognition API
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
    const foodItems = await Promise.all(
      foods.map(async (food) => {
        try {
          const nutritionInfo = await getFoodNutrition(food);
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
