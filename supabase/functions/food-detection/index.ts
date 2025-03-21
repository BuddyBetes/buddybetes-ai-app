
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { imageData } = await req.json();
    
    if (!imageData || !imageData.startsWith('data:image/')) {
      return new Response(
        JSON.stringify({ 
          isFood: false, 
          message: "Invalid image data" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract base64 data from the data URL
    const base64Data = imageData.split(',')[1];
    
    // Use OpenAI API for food detection
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `You are a food detection and nutrition analysis system. Analyze the image and:
            1. Determine if this is a food item or not
            2. If it is food, identify what food it is
            3. Provide nutritional information (carbohydrates and calories)
            4. Reply in JSON format with the following fields: isFood (boolean), foodName (string), carbs (number), calories (number), message (string), confidence (number 0-1)
            If not food, just return isFood: false with a helpful message.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Is this a food item? If yes, what is it and what are its nutritional values?' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
            ],
          },
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    let foodAnalysis;
    
    try {
      // Parse the content as JSON
      foodAnalysis = JSON.parse(result.choices[0].message.content);
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      console.log('Raw response:', result.choices[0].message.content);
      // If parsing fails, create a default response
      foodAnalysis = {
        isFood: false,
        message: "Could not analyze image properly. Please try again with a clearer image."
      };
    }

    return new Response(
      JSON.stringify(foodAnalysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in food-detection function:', error);
    
    return new Response(
      JSON.stringify({ 
        isFood: false, 
        message: "Error processing image. Please try again." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
