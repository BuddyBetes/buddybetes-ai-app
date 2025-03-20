
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
    
    let audioData;
    let language = 'en';
    let detectedMimeType = '';
    
    // Check if the request is FormData or JSON
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      console.log("📦 Processing multipart/form-data request");
      // Handle FormData request
      try {
        const formData = await req.formData();
        const audioFile = formData.get('file');
        language = formData.get('language')?.toString() || 'en';
        
        if (!audioFile || !(audioFile instanceof File)) {
          console.error("🚫 No audio file in form data");
          return new Response(
            JSON.stringify({ error: 'No audio file provided' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Convert the File to ArrayBuffer and then to Uint8Array
        const arrayBuffer = await audioFile.arrayBuffer();
        audioData = new Uint8Array(arrayBuffer);
        
        detectedMimeType = audioFile.type;
        console.log("📊 Audio file received, size:", audioData.length, "type:", detectedMimeType);
      } catch (formError) {
        console.error("🚫 Error processing form data:", formError);
        return new Response(
          JSON.stringify({ error: `Error processing form data: ${formError.message}` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      // Handle JSON request (existing implementation)
      const body = await req.json();
      const { audio, language: reqLanguage } = body;
      
      if (reqLanguage) {
        language = reqLanguage;
      }
      
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
      
      // Try to detect MIME type from base64 prefix
      if (audio.startsWith("data:")) {
        const mimeMatch = audio.match(/^data:([^;]+);base64,/);
        if (mimeMatch && mimeMatch[1]) {
          detectedMimeType = mimeMatch[1];
          console.log("🔍 Detected MIME type from prefix:", detectedMimeType);
        }
      } else {
        // If no MIME type detected, use a default supported format
        detectedMimeType = 'audio/webm';
        console.log("⚠️ No MIME type detected from prefix, using default:", detectedMimeType);
      }
      
      // Process audio in chunks
      try {
        audioData = processBase64Chunks(audio);
      } catch (processingError) {
        console.error("💥 Error processing audio data:", processingError);
        return new Response(
          JSON.stringify({ error: `Audio processing error: ${processingError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    console.log("✅ Audio data processed successfully, size:", audioData.length);
    
    if (audioData.length < 100) {
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

    // Check supported formats
    const supportedFormats = ['audio/flac', 'audio/x-flac', 'audio/m4a', 'audio/mp3', 'audio/mp4', 
      'audio/mpeg', 'audio/mpga', 'audio/oga', 'audio/ogg', 'audio/wav', 'audio/webm'];
    
    // Ensure we have a valid MIME type for Whisper API
    let mimeType = detectedMimeType;
    if (!supportedFormats.includes(mimeType)) {
      console.warn(`⚠️ Detected MIME type ${mimeType} may not be supported by Whisper API`);
      
      // Try to convert to a more standard MIME type if possible
      if (mimeType.includes('webm')) {
        mimeType = 'audio/webm';
      } else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) {
        mimeType = 'audio/mp3';
      } else if (mimeType.includes('wav')) {
        mimeType = 'audio/wav';
      } else if (mimeType.includes('ogg')) {
        mimeType = 'audio/ogg';
      } else {
        // Default to webm as last resort
        mimeType = 'audio/webm';
      }
      console.log(`🔄 Using normalized MIME type: ${mimeType}`);
    }
    
    // Prepare form data with explicit MIME type
    const formData = new FormData();
    const blob = new Blob([audioData], { type: mimeType });
    
    // Use file extension that matches the MIME type
    let filename = 'audio.webm';
    if (mimeType.includes('mp3')) {
      filename = 'audio.mp3';
    } else if (mimeType.includes('wav')) {
      filename = 'audio.wav';
    } else if (mimeType.includes('ogg')) {
      filename = 'audio.ogg';
    } else if (mimeType.includes('flac')) {
      filename = 'audio.flac';
    }
    
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');
    formData.append('language', language);

    console.log(`🚀 Sending to OpenAI Whisper API...`);
    console.log(`📊 Using filename: ${filename}, MIME type: ${mimeType}, blob size: ${blob.size}`);
    
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
