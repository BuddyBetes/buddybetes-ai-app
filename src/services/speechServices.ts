
import { supabase } from '@/integrations/supabase/client';

/**
 * Converts spoken audio to text using Supabase Edge Function
 * @param base64Audio - Base64 encoded audio data
 * @returns Promise with transcription result
 */
export async function convertSpeechToText(base64Audio: string): Promise<{ text: string } | null> {
  console.log("Sending audio to speech-to-text function...");
  
  const { data, error } = await supabase.functions.invoke('speech-to-text', {
    body: { audio: base64Audio }
  });
  
  if (error) {
    console.error("Speech-to-text function error:", error);
    throw new Error(`Speech-to-text error: ${error.message}`);
  }
  
  if (!data || !data.text) {
    console.log("No text returned from speech-to-text");
    return null;
  }
  
  console.log("Speech transcription result:", data.text);
  return data;
}

/**
 * Helper function to convert Blob to base64
 * @param blob - Audio blob to convert
 * @returns Promise with base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    reader.onloadend = () => {
      try {
        const base64data = reader.result as string;
        // Remove the data URL prefix
        const base64Audio = base64data.split(',')[1];
        resolve(base64Audio);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
};
