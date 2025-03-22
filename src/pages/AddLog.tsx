
import React, { useState } from 'react';
import Layout from '../components/Layout';
import AppHeader from '@/components/AppHeader';
import LogFormContainer from '@/components/log/LogFormContainer';
import CameraModal from '@/components/food/CameraModal';
import FoodAnalysisResult, { FoodItem } from '@/components/food/FoodAnalysisResult';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';

const AddLog: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { analyzeImage, resetAnalysis, isAnalyzing, result, error } = useImageAnalysis();
  const { addLog } = useLogContext();
  const { toast } = useToast();

  const handleImageCapture = (imageData: string) => {
    setShowResults(true);
    analyzeImage(imageData);
  };

  const handleSaveFood = async (foodItems: FoodItem[]) => {
    try {
      // Create a food log with the analyzed items
      await addLog({
        timestamp: new Date(),
        food: foodItems.map(item => item.name).join(', '),
        notes: `Carbs: ${foodItems.reduce((sum, item) => sum + item.carbs, 0)}g, ` +
               `Protein: ${foodItems.reduce((sum, item) => sum + item.protein, 0)}g, ` +
               `Fat: ${foodItems.reduce((sum, item) => sum + item.fat, 0)}g, ` +
               `Calories: ${foodItems.reduce((sum, item) => sum + item.calories, 0)}`
      });

      toast({
        title: "Food logged successfully",
        description: "Your food has been added to your logs",
      });

      // Reset UI state
      setShowResults(false);
      resetAnalysis();
    } catch (err) {
      toast({
        title: "Error saving food log",
        description: "There was a problem saving your food log",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setShowResults(false);
    resetAnalysis();
  };

  return (
    <Layout title="Add Glucose Log">
      <AppHeader />
      <div className="space-y-6">
        {!showResults && (
          <>
            <div className="flex justify-center mb-4">
              <Button 
                onClick={() => setShowCamera(true)}
                className="bg-buddy-500 hover:bg-buddy-600 rounded-full h-12 px-4"
              >
                <Camera className="h-5 w-5 mr-2" />
                Scan Food
              </Button>
            </div>
            <LogFormContainer />
          </>
        )}
        
        {showResults && (
          <FoodAnalysisResult
            isLoading={isAnalyzing}
            error={error || undefined}
            foodItems={result?.foodItems || []}
            onSave={handleSaveFood}
            onCancel={handleCancel}
          />
        )}
      </div>

      <CameraModal
        open={showCamera}
        onOpenChange={setShowCamera}
        onImageCapture={handleImageCapture}
      />
    </Layout>
  );
};

export default AddLog;
