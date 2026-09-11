
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { geminiChat } from "../_shared/gemini.ts";

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

    console.log('Glucometer image received, length:', image.length);
    const requestId = crypto.randomUUID();
    
    try {
      // Process the image using OpenAI to recognize glucometer numbers
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';
      if (!openAIApiKey) {
        throw new Error('OpenAI API key is not configured');
      }
      
      console.log(`[${requestId}] Sending image to OpenAI for glucometer reading analysis`);
      
      // Prepare the API request to OpenAI with a specialized prompt for glucometer reading
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
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
          max_tokens: 50
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[${requestId}] OpenAI API error (${response.status}):`, errorData);
        throw new Error(`Failed to analyze glucometer image: ${response.status} ${errorData}`);
      }
      
      const data = await response.json();
      console.log(`[${requestId}] OpenAI response:`, data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        throw new Error('Invalid response format from OpenAI');
      }
      
      // Extract the reading from OpenAI's response
      const content = data.choices[0].message.content.trim();
      console.log(`[${requestId}] Raw content from OpenAI:`, content);
      
      if (content === 'NO_READING_DETECTED') {
        return new Response(
          JSON.stringify({ error: 'No glucose reading detected in the image' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Try to extract a number from the response
      const numbersOnly = content.replace(/[^\d.]/g, '');
      const reading = parseFloat(numbersOnly);
      
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
  } catch (error) {
    console.error('Error in glucometer-ocr function:', error);
    let errorMessage = 'Internal server error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
