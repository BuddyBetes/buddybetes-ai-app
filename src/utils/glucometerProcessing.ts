
import { supabase } from '@/integrations/supabase/client';

interface GlucometerAnalysisResult {
  reading?: number;
  confidence?: number;
  error?: string;
}

/**
 * Processes a glucometer image to extract the glucose reading
 * This uses Supabase Edge Function with AI to extract the number from the image
 */
export const processGlucometerImage = async (imageData: string): Promise<number | null> => {
  try {
    console.log('Processing glucometer image, data length:', imageData.length);
    
    // Remove data URL prefix to get just the base64 data
    const base64Image = imageData.split(',')[1];
    
    if (!base64Image || base64Image.length < 100) {
      throw new Error('Invalid image data. Please try taking another photo.');
    }
    
    // Call Supabase edge function for glucometer OCR
    console.log('Calling analyze-food-image function with glucometer mode...');
    const response = await supabase.functions.invoke('analyze-food-image', {
      body: { 
        image: base64Image,
        mode: 'glucometer' // Specify we want glucometer reading mode
      }
    });
    
    console.log('Glucometer analysis response:', response);
    
    if (response.error) {
      console.error('Supabase function error:', response.error);
      throw new Error(response.error.message || 'Error analyzing glucometer image');
    }
    
    const result = response.data as GlucometerAnalysisResult;
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    if (typeof result.reading === 'number') {
      // Success - we have a reading
      return result.reading;
    }
    
    // Check for reading as a string and convert to number
    if (typeof result.reading === 'string') {
      const numReading = parseInt(result.reading, 10);
      if (!isNaN(numReading)) {
        return numReading;
      }
    }
    
    // If we reach here, no valid reading was found
    console.warn('No valid reading found in the analysis result:', result);
    return null;
    
  } catch (err) {
    console.error('Error in glucometer processing:', err);
    throw err;
  }
};

/**
 * Fallback function that runs client-side text extraction from an image
 * This is a simplified version that tries to find potential glucose readings
 * Not as accurate as server-side OCR but can work in a pinch
 */
export const extractNumbersFromImage = (imageData: string): Promise<number[]> => {
  return new Promise((resolve) => {
    // Create a temporary image element
    const img = new Image();
    img.src = imageData;
    
    img.onload = () => {
      // This is a simplified implementation
      // In a real app, you might use a client-side OCR library like Tesseract.js
      // or more advanced CV techniques
      // For now, we'll just return an empty array
      resolve([]);
    };
    
    img.onerror = () => {
      resolve([]);
    };
  });
};
