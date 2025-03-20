
import { supabase } from '@/integrations/supabase/client';
import { browserSpeechToText } from '../browserSpeechServices';

/**
 * Sends audio to Supabase Edge Function for speech-to-text conversion
 * @param payload - Object containing base64 encoded audio data and options
 * @returns Promise with transcription result
 */
export async function supabaseSpeechToText(payload: { 
  audio: string; 
  language: string; 
  mimeType?: string;
}): Promise<{ text: string } | null> {
  console.log("Sending audio to Supabase speech-to-text function...", {
    audioLength: payload.audio.length,
    language: payload.language,
    mimeType: payload.mimeType || 'not specified'
  });
  
  // Validate base64 data before sending
  if (!payload.audio || !/^[A-Za-z0-9+/=]+$/.test(payload.audio)) {
    console.error("Invalid base64 audio data");
    throw new Error("Invalid base64 audio format");
  }
  
  const { data, error } = await supabase.functions.invoke('speech-to-text', {
    body: payload
  });
  
  if (error) {
    console.error("Supabase speech-to-text function error:", error);
    throw new Error(`Speech-to-text error: ${error.message}`);
  }
  
  if (!data) {
    console.error("No data returned from speech-to-text function");
    throw new Error("Speech-to-text function returned no data");
  }
  
  if (data.error) {
    console.error("Speech-to-text function returned an error:", data.error);
    throw new Error(`Speech-to-text API error: ${data.error}`);
  }
  
  console.log("Supabase speech transcription result:", data.text);
  return data;
}

/**
 * Sends audio file directly to Supabase speech-to-text function using FormData
 * @param audioFile - Audio file to convert
 * @param language - Language code (default: "en")
 * @returns Promise with transcription result
 */
export async function supabaseAudioFileToText(
  audioFile: File, 
  language: string = "en"
): Promise<{ text: string } | null> {
  console.log("Sending audio file to Supabase speech-to-text function...");
  console.log("Audio file details:", {
    name: audioFile.name,
    type: audioFile.type,
    size: audioFile.size,
    language: language
  });
  
  // Validate audio file before sending
  const supportedTypes = [
    'audio/flac', 'audio/m4a', 'audio/mp3', 'audio/mp4', 
    'audio/mpeg', 'audio/mpga', 'audio/oga', 'audio/ogg', 
    'audio/wav', 'audio/webm'
  ];
  
  let fileType = audioFile.type;
  // If the file type isn't in supported list, use a default
  if (!supportedTypes.some(type => fileType.includes(type))) {
    console.warn(`File type ${fileType} may not be supported. Will be normalized by the server.`);
  }
  
  // Create form data
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('language', language);
  
  // Get the Supabase URL and key
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key not configured");
  }
  
  // Make a direct fetch request with FormData
  const response = await fetch(`${supabaseUrl}/functions/v1/speech-to-text`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey
    },
    body: formData
  });
  
  if (!response.ok) {
    console.error("Speech-to-text function error response:", response.status);
    const errorText = await response.text();
    throw new Error(`Speech-to-text error: ${errorText}`);
  }
  
  const data = await response.json();
  
  if (!data) {
    console.error("No data returned from speech-to-text function");
    throw new Error("Speech-to-text function returned no data");
  }
  
  if (data.error) {
    console.error("Speech-to-text function returned an error:", data.error);
    throw new Error(`Speech-to-text API error: ${data.error}`);
  }
  
  console.log("Speech transcription result:", data.text);
  return data;
}
