
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

// Validate if a string is valid base64
function isValidBase64(str: string): boolean {
  if (!str) return false;
  // Remove data URL prefix if present
  if (str.startsWith('data:')) {
    str = str.split(',')[1] || '';
  }
  return /^[A-Za-z0-9+/=]+$/.test(str);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📩 Received request to speech-to-text function");
    const contentType = req.headers.get('content-type') || '';
    console.log("📥 Received Content-Type:", contentType);
    
    let audioData;
    let language = 'en';
    let detectedMimeType = '';
    let requestBody: any = {};
    
    // Check if the request is FormData or JSON
    if (contentType.includes('multipart/form-data')) {
      console.log("📦 Processing multipart/form-data request");
      
      try {
        const formData = await req.formData();
        console.log("📊 FormData entries:", [...formData.entries()].map(e => e[0]));
        
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
      // For JSON and other content types
      console.log("📜 Processing request as JSON");
      
      try {
        let body;
        
        // Try to parse as JSON
        try {
          body = await req.json();
          requestBody = body; // Store the full body for logging
          console.log("📊 Request body keys:", Object.keys(body));
        } catch (jsonError) {
          console.warn("⚠️ Failed to parse as JSON, trying as text");
          const text = await req.text();
          
          try {
            body = JSON.parse(text);
            requestBody = body;
            console.log("📊 Parsed text as JSON, keys:", Object.keys(body));
          } catch (parseError) {
            console.error("🚫 Failed to parse request as JSON:", parseError);
            return new Response(
              JSON.stringify({ error: 'Invalid request format. Expected JSON.' }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
        }
        
        // Extract audio data and other parameters
        const { audio, language: reqLanguage, mimeType } = body;
        
        if (reqLanguage) {
          language = reqLanguage;
        }
        
        if (mimeType) {
          detectedMimeType = mimeType;
          console.log("🎵 Client provided MIME type:", detectedMimeType);
        }
        
        if (!audio) {
          console.error("🚫 No audio data in request");
          return new Response(
            JSON.stringify({ 
              error: 'No audio data provided',
              receivedKeys: Object.keys(body)
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Validate base64
        if (!isValidBase64(audio)) {
          console.error("🚫 Invalid base64 data");
          return new Response(
            JSON.stringify({ error: 'Invalid base64 audio data' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Clean base64 data if it includes a data URL prefix
        let cleanBase64 = audio;
        if (audio.startsWith("data:")) {
          const mimeMatch = audio.match(/^data:([^;]+);base64,/);
          if (mimeMatch && mimeMatch[1]) {
            detectedMimeType = mimeMatch[1];
            console.log("🔍 Detected MIME type from data URL:", detectedMimeType);
            cleanBase64 = audio.split(',')[1];
          }
        }
        
        // Process audio in chunks
        try {
          audioData = processBase64Chunks(cleanBase64);
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
      } catch (requestError) {
        console.error("🚫 Error processing request:", requestError);
        return new Response(
          JSON.stringify({ error: `Failed to process request: ${requestError.message}` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    // Validate audio data
    if (!audioData || audioData.length === 0) {
      console.error("🚫 No audio data after processing");
      return new Response(
        JSON.stringify({ error: 'No valid audio data could be extracted' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log("✅ Audio data processed successfully, size:", audioData.length);
    
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

    // Define supported formats for Whisper API
    const supportedFormats = ['audio/flac', 'audio/x-flac', 'audio/m4a', 'audio/mp3', 'audio/mp4', 
      'audio/mpeg', 'audio/mpga', 'audio/oga', 'audio/ogg', 'audio/wav', 'audio/webm'];
    
    // Normalize MIME type
    let mimeType = detectedMimeType;
    if (!mimeType || mimeType === '') {
      mimeType = 'audio/webm'; // Default if none provided
      console.log("ℹ️ No MIME type detected, using default:", mimeType);
    } else {
      console.log("🎵 Using detected MIME type:", mimeType);
    }
    
    // Check if MIME type is supported and normalize if needed
    let isSupported = false;
    for (const format of supportedFormats) {
      if (mimeType.includes(format) || format.includes(mimeType)) {
        isSupported = true;
        // Normalize to standard format
        for (const stdFormat of supportedFormats) {
          if (mimeType.includes(stdFormat)) {
            mimeType = stdFormat;
            break;
          }
        }
        console.log(`✅ Audio format ${mimeType} is supported`);
        break;
      }
    }
    
    if (!isSupported) {
      console.warn(`⚠️ MIME type ${mimeType} may not be supported by Whisper API`);
      // Use a safe default
      mimeType = 'audio/webm';
      console.log(`🔄 Using fallback MIME type: ${mimeType}`);
    }
    
    // Map MIME type to file extension
    const mimeToExtension: Record<string, string> = {
      'audio/flac': 'flac',
      'audio/x-flac': 'flac',
      'audio/m4a': 'm4a',
      'audio/mp3': 'mp3',
      'audio/mp4': 'mp4',
      'audio/mpeg': 'mp3',
      'audio/mpga': 'mp3',
      'audio/oga': 'ogg',
      'audio/ogg': 'ogg',
      'audio/wav': 'wav',
      'audio/webm': 'webm'
    };
    
    const extension = mimeToExtension[mimeType] || 'webm';
    const filename = `audio.${extension}`;
    
    // Prepare form data with explicit MIME type
    const formData = new FormData();
    const blob = new Blob([audioData], { type: mimeType });
    
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
      let errorText;
      try {
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
        console.error("⛔ OpenAI API error JSON:", errorJson);
      } catch (e) {
        errorText = await response.text();
        console.error("⛔ OpenAI API error text:", errorText);
      }
      
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${errorText}`,
          requestDetails: {
            mimeType,
            filename,
            blobSize: blob.size,
            audioDataSize: audioData.length
          }
        }),
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
