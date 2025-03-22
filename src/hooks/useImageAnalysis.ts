
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FoodItem } from '@/components/food/FoodAnalysisResult';

export interface AnalysisResult {
  foodItems: FoodItem[];
}

export function useImageAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Remove data URL prefix to get just the base64 data
      const base64Image = imageData.split(',')[1];
      
      const { data, error: apiError } = await supabase.functions.invoke('analyze-food-image', {
        body: { image: base64Image }
      });

      if (apiError) {
        throw new Error(apiError.message);
      }

      if (data && data.foodItems) {
        // If we got an empty array back, show a user-friendly message
        if (data.foodItems.length === 0) {
          throw new Error('No food detected in this image. Please try again with a clearer photo.');
        }
        setResult({ foodItems: data.foodItems });
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid response format from food analysis');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze food image');
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
