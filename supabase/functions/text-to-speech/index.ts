
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { text, voice } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }
    
    // Limit text length to prevent potential issues
    const truncatedText = text.substring(0, 1000);
    console.log("Processing text-to-speech request with text length:", truncatedText.length);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Generate speech from text
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: truncatedText,
        voice: voice || 'nova', // Using 'nova' as default for a natural, friendly voice
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI TTS API error:", errorData);
      throw new Error(errorData.error?.message || 'Failed to generate speech');
    }

    console.log("Speech generation successful");

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer();
    
    // Process the binary data in chunks to avoid stack overflow
    const chunks = [];
    const uint8Array = new Uint8Array(arrayBuffer);
    const chunkSize = 32768; // Process in smaller chunks
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      chunks.push(
        String.fromCharCode.apply(
          null, 
          uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
        )
      );
    }
    
    const base64Audio = btoa(chunks.join(''));
    console.log("Audio converted to base64, length:", base64Audio.length);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error("Error in text-to-speech function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
