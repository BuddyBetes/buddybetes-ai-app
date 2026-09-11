
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

    const { image, mode } = reqBody;
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Image data received, length:', image.length);
    const requestId = crypto.randomUUID();
    
    // Check if we're in glucometer mode
    if (mode === 'glucometer') {
      console.log(`[${requestId}] Starting glucometer reading analysis`);
      
      try {
        const rawContent = await geminiChat({
          messages: [
            {
              role: 'system',
              content: 'You are a glucose meter reading specialist. Extract the glucose reading (numeric value only) from the image. Return ONLY the number. If no clear number is visible, respond with "NO_READING_DETECTED".'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'What is the glucose reading shown on this meter?'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${image}`
                  }
                }
              ]
            }
          ],
          maxTokens: 50
        });

        const content = rawContent.trim();
        console.log('Raw content from Gemini glucometer analysis:', content);
        
        if (content === 'NO_READING_DETECTED') {
          return new Response(
            JSON.stringify({ error: 'No glucose reading detected in the image' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Try to extract a number from the response
        const reading = parseFloat(content.replace(/[^\d.]/g, ''));
        
        if (isNaN(reading)) {
          return new Response(
            JSON.stringify({ error: 'Unable to detect a valid glucose reading' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`[${requestId}] Detected glucose reading: ${reading}`);
        
        return new Response(
          JSON.stringify({ reading, confidence: 0.9 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      } catch (error) {
        console.error(`[${requestId}] Glucometer analysis error:`, error);
        return new Response(
          JSON.stringify({ error: error.message || 'Error processing glucometer image' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Normal food analysis mode
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
