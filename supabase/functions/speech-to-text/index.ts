
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  if (!base64String || base64String.length === 0) {
    console.error("🚫 Empty base64 string received");
    throw new Error("Empty audio data");
  }

  console.log(`🔄 Processing base64 string of length ${base64String.length} in chunks of ${chunkSize}`);
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  try {
    while (position < base64String.length) {
      const chunk = base64String.slice(position, position + chunkSize);
      const binaryChunk = atob(chunk);
      const bytes = new Uint8Array(binaryChunk.length);
      
      for (let i = 0; i < binaryChunk.length; i++) {
        bytes[i] = binaryChunk.charCodeAt(i);
      }
      
      chunks.push(bytes);
      position += chunkSize;
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    console.log(`📊 Processed ${chunks.length} chunks with total length ${totalLength}`);
    
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  } catch (error) {
    console.error("💥 Error processing base64 chunks:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📩 Received request to speech-to-text function");
    const body = await req.json();
    const { audio } = body;
    
    if (!audio) {
      console.error("🚫 No audio data received in request");
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (audio.length < 100) {
      console.error("🚫 Audio data too small, length:", audio.length);
      return new Response(
        JSON.stringify({ error: 'Audio data too small or empty' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log("🎤 Received audio data, processing...");
    console.log("📊 Audio data length:", audio.length);
    
    try {
      // Process audio in chunks
      const binaryAudio = processBase64Chunks(audio);
      console.log("✅ Audio data processed successfully, size:", binaryAudio.length);
      
      if (binaryAudio.length < 100) {
        console.error("🚫 Processed audio too small");
        return new Response(
          JSON.stringify({ error: 'Processed audio data too small' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Check if we have an OpenAI API key
      const apiKey = Deno.env.get('OPENAI_API_KEY');
      if (!apiKey) {
        console.error("🔑 Missing OpenAI API key");
        return new Response(
          JSON.stringify({ error: 'OpenAI API key not configured' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Prepare form data - explicitly use webm MIME type which is supported by Whisper API
      const formData = new FormData();
      const blob = new Blob([binaryAudio], { type: 'audio/webm' });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      console.log("🚀 Sending to OpenAI Whisper API...");
      console.log("📊 Blob size:", blob.size, "type:", blob.type);
      
      // Send to OpenAI
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      console.log("📥 OpenAI response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("⛔ OpenAI API error:", errorText);
        return new Response(
          JSON.stringify({ error: `OpenAI API error: ${errorText}` }),
          {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const result = await response.json();
      console.log("✅ Transcription successful:", result.text);

      return new Response(
        JSON.stringify({ text: result.text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (processingError) {
      console.error("💥 Audio processing error:", processingError);
      return new Response(
        JSON.stringify({ error: `Audio processing error: ${processingError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error("❌ Error in speech-to-text function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
