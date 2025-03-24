
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
  const { toast } = useToast();

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('Starting image analysis, image data length:', imageData.length);
      
      // Remove data URL prefix to get just the base64 data
      const base64Image = imageData.split(',')[1];
      console.log('Base64 image length:', base64Image.length);
      
      // Handle possible empty or invalid base64 data
      if (!base64Image || base64Image.length < 100) {
        throw new Error('Invalid image data. Please try taking another photo.');
      }
      
      // Call the Supabase edge function
      const response = await supabase.functions.invoke('analyze-food-image', {
        body: { image: base64Image }
      });

      console.log('API response:', response);
      
      // Check if response has error property from Supabase Functions
      if (response.error) {
        console.error('Supabase function error:', response.error);
        throw new Error(response.error.message || 'Error analyzing food image');
      }

      const data = response.data;

      if (data && Array.isArray(data.foodItems) && data.foodItems.length > 0) {
        console.log('Food items detected:', data.foodItems);
        setResult({ foodItems: data.foodItems });
        
        // Display a success toast
        toast({
          title: "Food Detected",
          description: `Detected: ${data.foodItems.map(item => item.name).join(', ')}`,
          variant: "default"
        });
      } else if (data && data.foodItems && data.foodItems.length === 0) {
        // Handle empty food items array explicitly
        console.warn('No food items detected in the response');
        throw new Error('No food detected in this image. Please try again with a clearer photo.');
      } else if (data && data.error) {
        console.error('Error in response:', data.error);
        throw new Error(data.error);
      } else {
        console.error('Invalid response format or empty food items:', data);
        throw new Error('Invalid response format from food analysis or no food detected');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
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
