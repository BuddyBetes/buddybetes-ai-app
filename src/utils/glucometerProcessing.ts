
import { supabase } from '@/integrations/supabase/client';
import { detectGlucoseUnit, convertGlucoseValue } from '@/utils/glucoseUtils';
import { GlucoseUnit } from '@/types/global';

interface GlucometerAnalysisResult {
  reading?: number;
  confidence?: number;
  error?: string;
  detectedUnit?: GlucoseUnit;
}

/**
 * Processes a glucometer image to extract the glucose reading
 * This uses a dedicated Supabase Edge Function with AI to extract the number from the image
 */
export const processGlucometerImage = async (imageData: string): Promise<number | null> => {
  try {
    console.log('Processing glucometer image, data length:', imageData.length);
    
    // Remove data URL prefix to get just the base64 data
    const base64Image = imageData.split(',')[1];
    
    if (!base64Image || base64Image.length < 100) {
      throw new Error('Invalid image data. Please try taking another photo.');
    }
    
    // Call the dedicated Supabase edge function for glucometer OCR
    console.log('Calling glucometer-ocr edge function...');
    const response = await supabase.functions.invoke('glucometer-ocr', {
      body: { 
        image: base64Image
      }
    });
    
    console.log('Glucometer analysis response:', response);
    
    if (response.error) {
      console.error('Supabase function error:', response.error);
      throw new Error(response.error.message || 'Error analyzing glucometer image');
    }
    
    // If there's a direct reading in the response
    if (response.data && typeof response.data.reading === 'number') {
      console.log(`Successfully extracted reading: ${response.data.reading}`);
      
      // Get the user's preferred unit
      const preferredUnit = localStorage.getItem('glucoseUnit') as GlucoseUnit || 'mg/dL';
      
      // Detect the likely unit of the measurement based on the value
      const detectedUnit = response.data.detectedUnit || detectGlucoseUnit(response.data.reading);
      console.log(`Detected glucose unit: ${detectedUnit}, Preferred unit: ${preferredUnit}`);
      
      // Convert if necessary
      if (detectedUnit !== preferredUnit) {
        const convertedReading = convertGlucoseValue(
          response.data.reading, 
          detectedUnit, 
          preferredUnit
        );
        console.log(`Converted glucose reading from ${response.data.reading} ${detectedUnit} to ${convertedReading} ${preferredUnit}`);
        return convertedReading;
      }
      
      return response.data.reading;
    }
    
    // If there's an error about no reading detected
    if (response.data && response.data.error && 
        (response.data.error.includes('No glucose reading') || 
         response.data.error.includes('Unable to detect a valid glucose reading'))) {
      console.log('No valid glucose reading detected - user will need to try again or enter manually');
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
        console.log(`Successfully converted string reading "${response.data.reading}" to number: ${numReading}`);
        
        // Get the user's preferred unit
        const preferredUnit = localStorage.getItem('glucoseUnit') as GlucoseUnit || 'mg/dL';
        
        // Detect the likely unit of the measurement based on the value
        const detectedUnit = response.data.detectedUnit || detectGlucoseUnit(numReading);
        console.log(`Detected glucose unit: ${detectedUnit}, Preferred unit: ${preferredUnit}`);
        
        // Convert if necessary
        if (detectedUnit !== preferredUnit) {
          const convertedReading = convertGlucoseValue(
            numReading, 
            detectedUnit, 
            preferredUnit
          );
          console.log(`Converted glucose reading from ${numReading} ${detectedUnit} to ${convertedReading} ${preferredUnit}`);
          return convertedReading;
        }
        
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
