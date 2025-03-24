
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FoodItem } from '@/components/food/types';
import { useToast } from '@/hooks/use-toast';

export interface AnalysisResult {
  foodItems: FoodItem[];
}

export function useImageAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId] = useState(() => Math.random().toString(36).substring(2, 10));
  const { toast } = useToast();

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log(`[${requestId}] Starting image analysis, image data length:`, imageData.length);
      
      // Remove data URL prefix to get just the base64 data
      const base64Image = imageData.split(',')[1];
      console.log(`[${requestId}] Base64 image length:`, base64Image.length);
      
      // Handle possible empty or invalid base64 data
      if (!base64Image || base64Image.length < 100) {
        throw new Error('Invalid image data. Please try taking another photo.');
      }
      
      // Call the Supabase edge function
      console.log(`[${requestId}] Calling analyze-food-image function...`);
      const response = await supabase.functions.invoke('analyze-food-image', {
        body: { image: base64Image }
      });

      console.log(`[${requestId}] API response:`, response);
      
      // Check if response has error property from Supabase Functions
      if (response.error) {
        console.error(`[${requestId}] Supabase function error:`, response.error);
        throw new Error(response.error.message || 'Error analyzing food image');
      }

      const data = response.data;
      console.log(`[${requestId}] Response data (stringified):`, JSON.stringify(data, null, 2));

      if (!data) {
        throw new Error('No data returned from food analysis');
      }

      if (data.error) {
        console.error(`[${requestId}] Error in response data:`, data.error);
        throw new Error(data.error);
      }

      // Verify response is complete
      if (data.status !== 'complete') {
        console.warn(`[${requestId}] Food analysis incomplete or corrupted:`, data);
        throw new Error('Food analysis is not complete. Please try again.');
      }

      // Handle both direct food item or foodItems array
      let foodItems: FoodItem[] = [];
      
      if (data.foodItems) {
        // Case 1: Edge function returns { foodItems: [...] }
        if (Array.isArray(data.foodItems)) {
          console.log(`[${requestId}] Found foodItems array in response:`, data.foodItems);
          foodItems = data.foodItems;
        } else {
          console.error(`[${requestId}] data.foodItems exists but is not an array:`, data.foodItems);
          throw new Error('Invalid response format: foodItems is not an array');
        }
      } else if (Array.isArray(data)) {
        // Case 2: Edge function returns direct array [...]
        console.log(`[${requestId}] Response is a direct array of food items:`, data);
        foodItems = data;
      } else if (data.name && typeof data.calories !== 'undefined') {
        // Case 3: Edge function returns a single food item object
        console.log(`[${requestId}] Response is a single food item:`, data);
        foodItems = [data];
      } else {
        // No valid food data found
        console.error(`[${requestId}] No valid food data structure found in:`, data);
        throw new Error('Invalid response format from food analysis');
      }

      if (foodItems.length > 0) {
        console.log(`[${requestId}] Final processed food items:`, foodItems);
        setResult({ foodItems: foodItems });
        
        // Display a success toast
        toast({
          title: "Food Detected",
          description: `Detected: ${foodItems.map(item => item.name).join(', ')}`,
          variant: "default"
        });
      } else {
        // Handle empty food items array explicitly
        console.warn(`[${requestId}] No food items detected in the response`);
        throw new Error('No food detected in this image. Please try again with a clearer photo.');
      }
    } catch (err) {
      console.error(`[${requestId}] Error analyzing image:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze food image';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setError(null);
  };

  return {
    analyzeImage,
    resetAnalysis,
    isAnalyzing,
    result,
    error
  };
}
