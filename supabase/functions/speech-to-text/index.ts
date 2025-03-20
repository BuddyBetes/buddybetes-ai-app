
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ----- Audio Processing Utilities -----

/**
 * Process base64 in chunks to prevent memory issues
 * @param base64String - Base64 encoded string to process
 * @param chunkSize - Size of chunks to process at once
 * @returns Decoded Uint8Array
 */
function processBase64Chunks(base64String: string, chunkSize = 32768): Uint8Array {
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

/**
 * Validate if a string is valid base64
 * @param str - String to validate
 * @returns Boolean indicating if string is valid base64
 */
function isValidBase64(str: string): boolean {
  if (!str) return false;
  // Remove data URL prefix if present
  if (str.startsWith('data:')) {
    str = str.split(',')[1] || '';
  }
  return /^[A-Za-z0-9+/=]+$/.test(str);
}

// ----- Request Parsing -----

/**
 * Extract MIME type from a data URL
 * @param dataUrl - Data URL to extract MIME type from
 * @returns MIME type string or empty string
 */
function extractMimeTypeFromDataUrl(dataUrl: string): string {
  if (!dataUrl.startsWith("data:")) return "";
  
  const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
  return mimeMatch && mimeMatch[1] ? mimeMatch[1] : "";
}

/**
 * Process JSON request body
 * @param req - Request object
 * @returns Processed audio data and metadata
 */
async function processJsonRequest(req: Request): Promise<{
  audioData: Uint8Array;
  language: string;
  detectedMimeType: string;
  requestBody: any;
} | null> {
  console.log("📜 Processing request as JSON");
  
  try {
    let body;
    
    // Try to parse as JSON
    try {
      body = await req.json();
      console.log("📊 Request body keys:", Object.keys(body));
    } catch (jsonError) {
      console.warn("⚠️ Failed to parse as JSON, trying as text");
      const text = await req.text();
      
      try {
        body = JSON.parse(text);
        console.log("📊 Parsed text as JSON, keys:", Object.keys(body));
      } catch (parseError) {
        console.error("🚫 Failed to parse request as JSON:", parseError);
        return null;
      }
    }
    
    // Extract audio data and other parameters
    const { audio, language: reqLanguage, mimeType } = body;
    
    if (!audio) {
      console.error("🚫 No audio data in request");
      return null;
    }

    // Validate base64
    if (!isValidBase64(audio)) {
      console.error("🚫 Invalid base64 data");
      return null;
    }

    // Clean base64 data if it includes a data URL prefix
    let cleanBase64 = audio;
    let detectedMimeType = mimeType || "";
    
    if (audio.startsWith("data:")) {
      const extractedMimeType = extractMimeTypeFromDataUrl(audio);
      if (extractedMimeType) {
        detectedMimeType = extractedMimeType;
        console.log("🔍 Detected MIME type from data URL:", detectedMimeType);
      }
      cleanBase64 = audio.split(',')[1] || "";
    }
    
    // Process audio in chunks
    try {
      const audioData = processBase64Chunks(cleanBase64);
      return {
        audioData,
        language: reqLanguage || 'en',
        detectedMimeType,
        requestBody: body
      };
    } catch (processingError) {
      console.error("💥 Error processing audio data:", processingError);
      return null;
    }
  } catch (requestError) {
    console.error("🚫 Error processing request:", requestError);
    return null;
  }
}

/**
 * Process FormData request body
 * @param req - Request object
 * @returns Processed audio data and metadata
 */
async function processFormDataRequest(req: Request): Promise<{
  audioData: Uint8Array;
  language: string;
  detectedMimeType: string;
} | null> {
  console.log("📦 Processing multipart/form-data request");
  
  try {
    const formData = await req.formData();
    console.log("📊 FormData entries:", [...formData.entries()].map(e => e[0]));
    
    const audioFile = formData.get('file');
    const language = formData.get('language')?.toString() || 'en';
    
    if (!audioFile || !(audioFile instanceof File)) {
      console.error("🚫 No audio file in form data");
      return null;
    }
    
    // Convert the File to ArrayBuffer and then to Uint8Array
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioData = new Uint8Array(arrayBuffer);
    
    const detectedMimeType = audioFile.type;
    console.log("📊 Audio file received, size:", audioData.length, "type:", detectedMimeType);
    
    return { audioData, language, detectedMimeType };
  } catch (formError) {
    console.error("🚫 Error processing form data:", formError);
    return null;
  }
}

// ----- API Integration -----

/**
 * Map MIME type to file extension
 * @param mimeType - MIME type to map
 * @returns Appropriate file extension
 */
function getMimeTypeMapping(mimeType: string): string {
  // Define supported formats mapping
  const supportedFormats: Record<string, string> = {
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
  
  // Determine the best file extension based on MIME type
  let fileExtension = 'webm'; // Default fallback
  
  if (mimeType) {
    // Try to match the detected MIME type with supported formats
    for (const [mime, ext] of Object.entries(supportedFormats)) {
      if (mimeType.includes(mime)) {
        fileExtension = ext;
        console.log(`✅ Matched MIME type ${mimeType} to extension ${fileExtension}`);
        return fileExtension;
      }
    }
  }
  
  console.warn(`⚠️ Could not directly match MIME type ${mimeType}, using extension ${fileExtension}`);
  return fileExtension;
}

/**
 * Send audio data to OpenAI Whisper API
 * @param audioData - Audio data as Uint8Array
 * @param detectedMimeType - Detected MIME type
 * @param language - Language code
 * @returns Transcription result or error
 */
async function sendToWhisperAPI(
  audioData: Uint8Array, 
  detectedMimeType: string, 
  language: string
): Promise<{ text: string } | { error: string }> {
  // Check if we have an OpenAI API key
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    console.error("🔑 Missing OpenAI API key");
    return { error: 'OpenAI API key not configured' };
  }

  // Map MIME type to file extension
  const fileExtension = getMimeTypeMapping(detectedMimeType);
  
  // Set the proper MIME type for the Blob
  const mimeType = `audio/${fileExtension}`;
  console.log(`🔄 Using MIME type: ${mimeType} for file extension: ${fileExtension}`);
  
  // Create filename with proper extension
  const filename = `audio.${fileExtension}`;
  console.log(`📄 Using filename: ${filename}`);
  
  // Create a blob with the determined MIME type
  const blob = new Blob([audioData], { type: mimeType });
  console.log(`📏 Blob size: ${blob.size} bytes`);
  
  // Prepare form data with explicit MIME type and filename
  const formData = new FormData();
  formData.append('file', blob, filename);
  formData.append('model', 'whisper-1');
  formData.append('language', language);

  console.log(`🚀 Sending to OpenAI Whisper API...`);
  console.log(`📊 Using filename: ${filename}, MIME type: ${mimeType}, blob size: ${blob.size}`);
  
  // Send to OpenAI
  try {
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
      
      return {
        error: `OpenAI API error: ${errorText}`,
      };
    }

    const result = await response.json();
    console.log("✅ Transcription successful:", result.text);
    return { text: result.text };
  } catch (fetchError) {
    console.error("❌ Fetch error:", fetchError);
    return { error: `Fetch error: ${fetchError.message}` };
  }
}

// ----- Response Helpers -----

/**
 * Create an error response
 * @param message - Error message
 * @param status - HTTP status code
 * @param details - Additional error details
 * @returns Response object
 */
function createErrorResponse(message: string, status: number = 400, details?: any): Response {
  console.error(`❌ Error: ${message}`, details || '');
  return new Response(
    JSON.stringify({ error: message, details }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Create a success response
 * @param data - Response data
 * @returns Response object
 */
function createSuccessResponse(data: any): Response {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ----- Main Request Handler -----

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📩 Received request to speech-to-text function");
    const contentType = req.headers.get('content-type') || '';
    console.log("📥 Received Content-Type:", contentType);
    
    let audioData: Uint8Array | null = null;
    let language = 'en';
    let detectedMimeType = '';
    
    // Process the request based on content type
    if (contentType.includes('multipart/form-data')) {
      const formResult = await processFormDataRequest(req);
      if (!formResult) {
        return createErrorResponse('Failed to process form data');
      }
      
      audioData = formResult.audioData;
      language = formResult.language;
      detectedMimeType = formResult.detectedMimeType;
    } else {
      const jsonResult = await processJsonRequest(req);
      if (!jsonResult) {
        return createErrorResponse('Failed to process JSON request');
      }
      
      audioData = jsonResult.audioData;
      language = jsonResult.language;
      detectedMimeType = jsonResult.detectedMimeType;
    }
    
    // Validate audio data
    if (!audioData || audioData.length === 0) {
      return createErrorResponse('No valid audio data could be extracted');
    }
    
    console.log("✅ Audio data processed successfully, size:", audioData.length);
    
    // Send to OpenAI Whisper API
    const transcriptionResult = await sendToWhisperAPI(audioData, detectedMimeType, language);
    
    if ('error' in transcriptionResult) {
      return createErrorResponse(transcriptionResult.error, 500);
    }
    
    return createSuccessResponse({ text: transcriptionResult.text });
  } catch (error) {
    console.error("❌ Error in speech-to-text function:", error);
    return createErrorResponse(error.message, 500);
  }
});
