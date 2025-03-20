
import { browserSpeechToText } from './browserSpeechServices';
import { supabaseSpeechToText, supabaseAudioFileToText } from './speech/supabaseSpeechServices';
import { blobToBase64 } from './speech/speechUtils';

/**
 * Converts spoken audio to text using Supabase Edge Function with browser fallback
 * @param base64Audio - Base64 encoded audio data
 * @param mimeType - Optional MIME type of the audio data
 * @param language - Optional language code (default: "en")
 * @returns Promise with transcription result
 */
export async function convertSpeechToText(
  base64Audio: string, 
  mimeType?: string, 
  language: string = "en"
): Promise<{ text: string } | null> {
  if (!base64Audio || base64Audio.length < 100) {
    console.error("Invalid base64 audio data");
    throw new Error("Invalid audio data provided");
  }
  
  console.log("Processing speech-to-text conversion...");
  console.log("Base64 audio length:", base64Audio.length);
  console.log("Language:", language);
  
  if (mimeType) {
    console.log("Audio MIME type:", mimeType);
  }
  
  try {
    // Try Supabase Edge Function first with enhanced payload
    const payload: any = { 
      audio: base64Audio, 
      language: language 
    };
    
    // Include MIME type if available
    if (mimeType) {
      payload.mimeType = mimeType;
    }
    
    return await supabaseSpeechToText(payload);
  } catch (supabaseError) {
    console.error("Supabase speech-to-text error:", supabaseError);
    console.log("Trying browser-based speech recognition as fallback...");
    
    // Try browser-based speech recognition as fallback
    try {
      const browserResult = await browserSpeechToText(undefined, language);
      if (browserResult && browserResult.text) {
        console.log("Browser speech recognition succeeded:", browserResult.text);
        return browserResult;
      } else {
        throw new Error("Browser speech recognition failed");
      }
    } catch (browserError) {
      console.error("Browser speech recognition error:", browserError);
      throw new Error(`Speech-to-text failed: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`);
    }
  }
}

/**
 * Sends audio file directly to speech-to-text function using FormData
 * with browser fallback
 * @param audioFile - Audio file to convert
 * @param language - Optional language code (default: "en")
 * @returns Promise with transcription result
 */
export async function convertAudioFileToText(
  audioFile: File, 
  language: string = "en"
): Promise<{ text: string } | null> {
  if (!audioFile || audioFile.size === 0) {
    console.error("Invalid audio file");
    throw new Error("Invalid audio file provided");
  }
  
  console.log("Processing audio file to text conversion...");
  console.log("Audio file size:", audioFile.size, "type:", audioFile.type);
  console.log("Language:", language);
  
  try {
    // Try Supabase Edge Function first
    return await supabaseAudioFileToText(audioFile, language);
  } catch (supabaseError) {
    console.error("Supabase audio file to text error:", supabaseError);
    console.log("Trying browser-based speech recognition as fallback...");
    
    // Try browser-based fallback
    try {
      const browserResult = await browserSpeechToText(audioFile, language);
      if (browserResult && browserResult.text) {
        console.log("Browser speech recognition succeeded:", browserResult.text);
        return browserResult;
      } else {
        throw new Error("Browser speech recognition failed");
      }
    } catch (browserError) {
      console.error("Browser speech recognition error:", browserError);
      throw new Error(`Audio file to text conversion failed: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`);
    }
  }
}

// Re-export the utility function for convenience
export { blobToBase64 } from './speech/speechUtils';
