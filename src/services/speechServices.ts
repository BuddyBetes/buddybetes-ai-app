
import { supabase } from '@/integrations/supabase/client';

/**
 * Converts spoken audio to text using Supabase Edge Function
 * @param base64Audio - Base64 encoded audio data
 * @returns Promise with transcription result
 */
export async function convertSpeechToText(base64Audio: string): Promise<{ text: string } | null> {
  if (!base64Audio || base64Audio.length < 100) {
    console.error("Invalid base64 audio data");
    throw new Error("Invalid audio data provided");
  }
  
  console.log("Sending audio to speech-to-text function...");
  console.log("Base64 audio length:", base64Audio.length);
  
  try {
    const { data, error } = await supabase.functions.invoke('speech-to-text', {
      body: { 
        audio: base64Audio,
        language: 'en'  // Default to English
      }
    });
    
    if (error) {
      console.error("Speech-to-text function error:", error);
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
    
    if (!data.text) {
      console.log("No text returned from speech-to-text");
      return null;
    }
    
    console.log("Speech transcription result:", data.text);
    return data;
  } catch (error) {
    console.error("Error in convertSpeechToText:", error);
    throw error;
  }
}

/**
 * Helper function to convert Blob to base64
 * @param blob - Audio blob to convert
 * @returns Promise with base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!blob || blob.size === 0) {
      console.error("Empty blob provided to blobToBase64");
      reject(new Error("Empty audio data"));
      return;
    }
    
    console.log("Converting blob to base64, size:", blob.size, "type:", blob.type);
    
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    reader.onloadend = () => {
      try {
        const base64data = reader.result as string;
        if (!base64data) {
          throw new Error("Failed to convert audio to base64");
        }
        
        // Remove the data URL prefix
        const base64Audio = base64data.split(',')[1];
        if (!base64Audio) {
          throw new Error("Invalid base64 audio format");
        }
        
        console.log("Base64 conversion successful, length:", base64Audio.length);
        resolve(base64Audio);
      } catch (error) {
        console.error("Error in base64 conversion:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(error);
    };
  });
};
