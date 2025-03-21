
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
          success: false, 
          message: "Invalid image data" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract base64 data from the data URL
    const base64Data = imageData.split(',')[1];
    
    // Use OpenAI API for OCR
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: `You are a specialized OCR system for glucose meters. Your task is to:
            1. Identify if the image shows a glucose meter display
            2. Extract the glucose reading (a number typically between 50-400)
            3. Return ONLY the glucose value as a number if found
            4. If multiple numbers are visible, identify which one is the current glucose reading
            5. Reply in JSON format with: glucoseValue (string or null), confidence (number 0-1), message (string)
            Be very strict - only return a glucose value if you are highly confident it is correct.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract the glucose reading from this glucose meter:' },
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
    let ocrResult;
    
    try {
      // Parse the content as JSON
      ocrResult = JSON.parse(result.choices[0].message.content);
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      console.log('Raw response:', result.choices[0].message.content);
      // If parsing fails, create a default response
      ocrResult = {
        glucoseValue: null,
        confidence: 0,
        message: "Could not extract glucose reading. Please try again with a clearer image."
      };
    }

    return new Response(
      JSON.stringify(ocrResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in glucometer-ocr function:', error);
    
    return new Response(
      JSON.stringify({ 
        glucoseValue: null, 
        confidence: 0,
        message: "Error processing image. Please try again." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
