
import { supabase } from '@/integrations/supabase/client';
import { browserSpeechToText, browserTextToSpeech } from './browserSpeechServices';

/**
 * Converts spoken audio to text using Supabase Edge Function with browser fallback
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
      console.log("Trying browser-based speech recognition as fallback...");
      
      // Try browser-based speech recognition as fallback
      try {
        const browserResult = await browserSpeechToText();
        if (browserResult && browserResult.text) {
          console.log("Browser speech recognition succeeded:", browserResult.text);
          return browserResult;
        } else {
          throw new Error("Browser speech recognition failed");
        }
      } catch (browserError) {
        console.error("Browser speech recognition error:", browserError);
        throw new Error(`Speech-to-text error: ${error.message}`);
      }
    }
    
    if (!data) {
      console.error("No data returned from speech-to-text function");
      throw new Error("Speech-to-text function returned no data");
    }
    
    if (data.error) {
      console.error("Speech-to-text function returned an error:", data.error);
      console.log("Trying browser-based speech recognition as fallback...");
      
      // Try browser fallback
      try {
        const browserResult = await browserSpeechToText();
        if (browserResult && browserResult.text) {
          console.log("Browser speech recognition succeeded:", browserResult.text);
          return browserResult;
        } else {
          throw new Error("Browser speech recognition failed");
        }
      } catch (browserError) {
        console.error("Browser speech recognition error:", browserError);
        throw new Error(`Speech-to-text API error: ${data.error}`);
      }
    }
    
    if (!data.text) {
      console.log("No text returned from speech-to-text");
      return null;
    }
    
    console.log("Speech transcription result:", data.text);
    return data;
  } catch (error) {
    console.error("Error in convertSpeechToText:", error);
    
    // Final attempt with browser API if everything else failed
    try {
      console.log("Making final attempt with browser speech recognition...");
      const browserResult = await browserSpeechToText();
      if (browserResult && browserResult.text) {
        console.log("Browser speech recognition succeeded:", browserResult.text);
        return browserResult;
      }
    } catch (browserError) {
      console.error("Final browser speech recognition attempt failed:", browserError);
    }
    
    throw error;
  }
}

/**
 * Sends audio file directly to speech-to-text function using FormData
 * with browser fallback
 * @param audioFile - Audio file to convert
 * @returns Promise with transcription result
 */
export async function convertAudioFileToText(audioFile: File): Promise<{ text: string } | null> {
  if (!audioFile || audioFile.size === 0) {
    console.error("Invalid audio file");
    throw new Error("Invalid audio file provided");
  }
  
  console.log("Sending audio file to speech-to-text function...");
  console.log("Audio file size:", audioFile.size, "type:", audioFile.type);
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('language', 'en');
    
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
      console.log("Trying browser-based speech recognition as fallback...");
      
      // Try browser-based fallback
      try {
        const browserResult = await browserSpeechToText(audioFile);
        if (browserResult && browserResult.text) {
          console.log("Browser speech recognition succeeded:", browserResult.text);
          return browserResult;
        } else {
          throw new Error("Browser speech recognition failed");
        }
      } catch (browserError) {
        console.error("Browser speech recognition error:", browserError);
        const errorText = await response.text();
        throw new Error(`Speech-to-text error: ${errorText}`);
      }
    }
    
    const data = await response.json();
    
    if (!data) {
      console.error("No data returned from speech-to-text function");
      throw new Error("Speech-to-text function returned no data");
    }
    
    if (data.error) {
      console.error("Speech-to-text function returned an error:", data.error);
      
      // Try browser fallback
      try {
        const browserResult = await browserSpeechToText(audioFile);
        if (browserResult && browserResult.text) {
          console.log("Browser speech recognition succeeded:", browserResult.text);
          return browserResult;
        } else {
          throw new Error("Browser speech recognition failed");
        }
      } catch (browserError) {
        console.error("Browser speech recognition error:", browserError);
        throw new Error(`Speech-to-text API error: ${data.error}`);
      }
    }
    
    if (!data.text) {
      console.log("No text returned from speech-to-text");
      return null;
    }
    
    console.log("Speech transcription result:", data.text);
    return data;
  } catch (error) {
    console.error("Error in convertAudioFileToText:", error);
    
    // Final attempt with browser API if everything else failed
    try {
      console.log("Making final attempt with browser speech recognition...");
      const browserResult = await browserSpeechToText(audioFile);
      if (browserResult && browserResult.text) {
        console.log("Browser speech recognition succeeded:", browserResult.text);
        return browserResult;
      }
    } catch (browserError) {
      console.error("Final browser speech recognition attempt failed:", browserError);
    }
    
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
