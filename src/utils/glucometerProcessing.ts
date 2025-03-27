
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
    
    // The response might be formatted differently when in glucometer mode
    // Handle both potential formats
    
    // Format 1: Direct glucometer result format
    if (response.data && typeof response.data.reading === 'number') {
      return response.data.reading;
    }
    
    // Format 2: Food analysis format being used for glucometer
    // In this case, we need to check if there's an error about no food being detected
    // and treat it differently than a true error
    if (response.data && response.data.error && 
        response.data.error.includes('No food detected')) {
      // This isn't an actual error for glucometer - we need to do manual entry
      console.log('No reading detected automatically - user will need to enter manually');
      return null;
    }
    
    // If there's an actual error message, propagate it
    if (response.data && response.data.error) {
      throw new Error(response.data.error);
    }
    
    // Check for reading as a string and convert to number
    if (response.data && typeof response.data.reading === 'string') {
      const numReading = parseInt(response.data.reading, 10);
      if (!isNaN(numReading)) {
        return numReading;
      }
    }
    
    // If we reach here, no valid reading was found
    console.warn('No valid reading found in the analysis result:', response.data);
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
